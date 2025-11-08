/**
 * Utility helper functions
 */

// Format date to readable string
export const formatDate = (date, format = "short") => {
  if (!date) return "N/A";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return "Invalid Date";

  const options = {
    short: { year: "numeric", month: "2-digit", day: "2-digit" },
    long: { year: "numeric", month: "long", day: "numeric" },
    datetime: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  };

  return dateObj.toLocaleDateString("en-US", options[format] || options.short);
};

export const formatDateTime = (date) => formatDate(date, "datetime");

// Get item ID
export const getItemId = (item) => {
  if (!item) return null;
  return item._id || item.id || null;
};

// Truncate text
export const truncateText = (text, length = 100, suffix = "...") => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

// Badge classes
export const getStatusBadgeClasses = (status) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    submitted: "bg-green-100 text-green-800",
    open: "bg-blue-100 text-blue-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return statusClasses[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

export const getRoleBadgeClasses = (role) => {
  const roleClasses = {
    admin: "bg-red-100 text-red-800",
    teacher: "bg-blue-100 text-blue-800",
    student: "bg-green-100 text-green-800",
    cr: "bg-purple-100 text-purple-800",
    alumni: "bg-yellow-100 text-yellow-800",
  };

  return roleClasses[role?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

// Debounce
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executed(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Group items
export const groupBy = (array, key, fallback = "Other") => {
  if (!Array.isArray(array)) return {};

  return array.reduce((result, item) => {
    const groupKey = item?.[key] || fallback;
    if (!result[groupKey]) result[groupKey] = [];
    result[groupKey].push(item);
    return result;
  }, {});
};

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Unique ID
export const generateId = (prefix = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/* ---------------------------------------------------------
   ✅ FIXED TARGET LOCATION (Converted from DMS)
   28°37'13.2"N 77°22'04.1"E → Decimal
--------------------------------------------------------- */

export const FIXED_TARGET = {
  latitude: 28.620333,
  longitude: 77.367806,
};

/* ---------------------------------------------------------
   ✅ GEO + DISTANCE UTILITIES
--------------------------------------------------------- */

// Degrees → radians
const toRad = (v) => (v * Math.PI) / 180;

// Haversine distance in meters
export const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * ✅ Check if user is within range of target
 * Default limit: **100 meters**
 */
export const isInRange = (
  userLat,
  userLon,
  targetLat = FIXED_TARGET.latitude,
  targetLon = FIXED_TARGET.longitude,
  limit = 100 // ✅ Updated default
) => {
  const distance = getDistanceInMeters(userLat, userLon, targetLat, targetLon);
  if (Number.isNaN(distance)) return false;

  console.log(
    distance <= limit ? "✅ In range:" : "❌ Not in range:",
    distance.toFixed(2),
    "m"
  );

  return distance <= limit;
};

/**
 * ✅ Shortcut to check only the fixed location
 * Default limit: **100 meters**
 */
export const isInRangeToFixedPoint = (userLat, userLon, limit = 100) => {
  return isInRange(
    userLat,
    userLon,
    FIXED_TARGET.latitude,
    FIXED_TARGET.longitude,
    limit
  );
};

/**
 * ✅ High-accuracy geolocation wrapper
 */
export const getLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || Date.now(),
        });
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  });

/**
 * ✅ Google Maps link for fixed target
 */
export const fixedLocationMapLink = `https://www.google.com/maps?q=${FIXED_TARGET.latitude},${FIXED_TARGET.longitude}`;

/**
 * ✅ Backward-compatible old utility (used in AttendanceRecords.jsx)
 */
export const mapsLinkFor = (lat, lon) =>
  `https://www.google.com/maps?q=${lat},${lon}`;
