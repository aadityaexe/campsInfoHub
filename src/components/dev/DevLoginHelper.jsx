import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginCredentials } from '../../data/mockUsers';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Development helper component for quick login
// Only show in development mode
const DevLoginHelper = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  // Only show in development and when not authenticated
  if (import.meta.env.PROD || isAuthenticated) {
    return null;
  }

  const handleQuickLogin = (role) => {
    const credentials = loginCredentials[role];
    if (!credentials) return;

    // Simulate login with mock user data
    const mockUser = {
      _id: `${role}1`,
      id: `${role}1`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: credentials.email,
      role: role,
    };

    const mockToken = `mock_token_${role}_${Date.now()}`;

    login(mockUser, mockToken);

    // Redirect based on role
    const roleRoutes = {
      admin: '/admin',
      teacher: '/teacher',
      student: '/student',
      cr: '/cr',
      alumni: '/alumni',
    };

    navigate(roleRoutes[role] || '/');
  };

  const roles = [
    { value: 'admin', label: 'Admin', color: 'bg-red-500' },
    { value: 'teacher', label: 'Teacher', color: 'bg-blue-500' },
    { value: 'student', label: 'Student', color: 'bg-green-500' },
    { value: 'cr', label: 'Class Rep', color: 'bg-purple-500' },
    { value: 'alumni', label: 'Alumni', color: 'bg-yellow-500' },
  ];

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm shadow-2xl border-2 border-primary-300">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          🚀 Dev Quick Login
        </h3>
        <p className="text-xs text-gray-600">
          Click a role to login instantly (Dev Mode Only)
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {roles.map((role) => (
          <Button
            key={role.value}
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRole(role.value);
              handleQuickLogin(role.value);
            }}
            className="text-xs"
          >
            {role.label}
          </Button>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Test Credentials:</p>
        <div className="space-y-1 text-xs">
          {Object.entries(loginCredentials).map(([role, creds]) => (
            <div key={role} className="bg-gray-50 p-1.5 rounded">
              <span className="font-medium capitalize text-primary-600">{role}:</span>{' '}
              <span className="text-gray-600">{creds.email}</span> /{' '}
              <span className="text-gray-600">{creds.password}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default DevLoginHelper;

