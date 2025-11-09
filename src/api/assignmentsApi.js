// src/mockApi/assignmentsApi.js
// Standalone mock API for assignments + submissions + similarity reporting

import { mockAssignments } from "../mockData/assignments";
import { mockUsers } from "../mockData/users";
import { mockCourses } from "../mockData/courses";

// ----------------------
// helpers
// ----------------------
const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const findById = (arr, id) => arr.find((i) => (i._id || i.id) === id);
const generateId = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const normalizeAttachments = (list, prefix) =>
  (list || []).map((f) => ({ ...f, id: f.id || generateId(prefix) }));

// deterministic pseudo random (stable similarity numbers by pair)
function prng(seedStr) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    // xorshift
    h ^= h << 13;
    h >>>= 0;
    h ^= h >>> 17;
    h >>>= 0;
    h ^= h << 5;
    h >>>= 0;
    return (h >>> 0) / 0xffffffff;
  };
}

// compute a stable "similarity" percent for a pair based on ids + first filenames
function pairSimilarity(assignmentId, a, b) {
  const aName = a.attachments?.[0]?.name || "";
  const bName = b.attachments?.[0]?.name || "";
  const seed = `${assignmentId}|${[a.studentId, b.studentId]
    .sort()
    .join("-")}|${aName}|${bName}`;
  const rnd = prng(seed)();
  // skew towards low-mid but allow high tails
  const sim = Math.round(rnd ** 0.6 * 100);
  return sim;
}

// Build high-similarity pairs and cluster them into groups
function buildSimilarityReport(assignment) {
  const subs = assignment.submissions || [];
  const pairs = [];
  const n = subs.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = pairSimilarity(
        assignment._id || assignment.id,
        subs[i],
        subs[j]
      );
      pairs.push({
        a: { id: subs[i].studentId, name: subs[i].studentName },
        b: { id: subs[j].studentId, name: subs[j].studentName },
        percent: s,
      });
    }
  }

  // threshold for "high similarity"
  const THRESH = 70;
  const highPairs = pairs.filter((p) => p.percent >= THRESH);

  // cluster by union-find
  const parent = new Map();
  function find(x) {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
    return parent.get(x);
  }
  function unite(x, y) {
    const rx = find(x),
      ry = find(y);
    if (rx !== ry) parent.set(rx, ry);
  }
  highPairs.forEach(({ a, b }) => unite(a.id, b.id));

  const comp = new Map();
  for (const s of subs) {
    const r = find(s.studentId);
    if (!comp.has(r)) comp.set(r, []);
    comp.get(r).push({ id: s.studentId, name: s.studentName });
  }
  // groups that have 2+ members and at least one high pair inside
  const groups = Array.from(comp.values()).filter((g) => g.length >= 2);

  const flaggedIds = new Set();
  highPairs.forEach((p) => {
    flaggedIds.add(p.a.id);
    flaggedIds.add(p.b.id);
  });

  return {
    pairs, // all pairs with % (for debugging/expansion)
    highPairs, // only >= THRESH
    groups, // clusters of 2+ with high similarity edges
    flaggedStudentIds: Array.from(flaggedIds),
    threshold: THRESH,
  };
}

// ----------------------
// API
// ----------------------
export const mockAssignmentsAPI = {
  getAll: async () => {
    await delay(400);
    return {
      data: mockAssignments.map((a) => ({
        ...a,
        attachments: normalizeAttachments(a.attachments, "assignmentFile"),
        submissionCount: a.submissions?.length || 0,
      })),
    };
  },

  getById: async (id) => {
    await delay(200);
    const a = findById(mockAssignments, id);
    if (!a) throw { response: { data: { message: "Assignment not found" } } };
    return { data: a };
  },

  create: async (payload) => {
    await delay(300);
    const a = {
      _id: generateId("assignment"),
      id: generateId("assignment"),
      title: payload.title,
      description: payload.description,
      courseId: payload.courseId,
      courseName: payload.courseName,
      dueDate: payload.dueDate,
      attachments: normalizeAttachments(payload.attachments, "assignmentFile"),
      submissions: [],
      createdAt: new Date().toISOString(),
    };
    mockAssignments.push(a);
    return { data: a };
  },

  update: async (id, payload) => {
    await delay(250);
    const a = findById(mockAssignments, id);
    if (!a) throw { response: { data: { message: "Assignment not found" } } };
    Object.assign(a, payload, {
      attachments: normalizeAttachments(
        payload.attachments ?? a.attachments,
        "assignmentFile"
      ),
      updatedAt: new Date().toISOString(),
    });
    return { data: a };
  },

  delete: async (id) => {
    await delay(250);
    const idx = mockAssignments.findIndex((x) => (x._id || x.id) === id);
    if (idx === -1)
      throw { response: { data: { message: "Assignment not found" } } };
    mockAssignments.splice(idx, 1);
    return { data: { message: "Deleted" } };
  },

  submit: async (id, data, studentId) => {
    await delay(400);
    const a = findById(mockAssignments, id);
    if (!a) throw { response: { data: { message: "Assignment not found" } } };
    const user = findById(mockUsers, studentId);
    if (!user) throw { response: { data: { message: "Student not found" } } };

    const sub = {
      id: generateId("submission"),
      studentId,
      studentName: user.name,
      submittedAt: new Date().toISOString(),
      graded: false,
      score: null,
      notes: data?.notes || "",
      attachments: normalizeAttachments(data?.attachments, "submissionFile"),
    };

    a.submissions = a.submissions || [];
    const prevIdx = a.submissions.findIndex((s) => s.studentId === studentId);
    if (prevIdx >= 0) a.submissions[prevIdx] = sub;
    else a.submissions.push(sub);

    return { data: { message: "Submitted", submission: sub } };
  },

  getSubmissions: async (id) => {
    await delay(300);
    const a = findById(mockAssignments, id);
    if (!a) throw { response: { data: { message: "Assignment not found" } } };
    return {
      data: (a.submissions || []).map((s) => ({
        ...s,
        attachments: normalizeAttachments(s.attachments, "submissionFile"),
      })),
    };
  },

  // single-score (kept for button on submission cards)
  checkPlagiarism: async (assignmentId, studentId) => {
    await delay(250);
    const a = findById(mockAssignments, assignmentId);
    if (!a) throw { response: { data: { message: "Assignment not found" } } };
    // derive deterministic similarity vs best match
    const me = (a.submissions || []).find((s) => s.studentId === studentId);
    if (!me) return { data: { similarityPercent: 0 } };
    let best = 0;
    for (const other of a.submissions || []) {
      if (other.studentId === studentId) continue;
      best = Math.max(best, pairSimilarity(assignmentId, me, other));
    }
    return { data: { similarityPercent: best } };
  },

  // NEW: full report (pairs + clustered groups + flagged ids)
  getSimilarityReport: async (assignmentId) => {
    await delay(350);
    const a = findById(mockAssignments, assignmentId);
    if (!a) throw { response: { data: { message: "Assignment not found" } } };
    const report = buildSimilarityReport(a);
    return { data: report };
  },
};

// also expose minimal courses API for student lists
export const mockCoursesAPI = {
  getAll: async () => {
    await delay(250);
    return { data: mockCourses };
  },
  getById: async (id) => {
    await delay(250);
    const c = findById(mockCourses, id);
    if (!c) throw { response: { data: { message: "Course not found" } } };
    const students = (c.enrolledStudents || [])
      .map((sid) => findById(mockUsers, sid))
      .filter(Boolean)
      .map((u) => ({ id: u._id || u.id, name: u.name }));
    return { data: { ...c, students } };
  },
};
