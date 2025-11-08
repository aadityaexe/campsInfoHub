import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/api';
import { getItemId } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import PageHeader from '../../components/common/PageHeader';
import LoadingWrapper from '../../components/common/LoadingWrapper';
import ErrorAlert from '../../components/common/ErrorAlert';
import StatusBadge from '../../components/common/StatusBadge';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user deletion with confirmation
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersAPI.delete(id);
      setUsers(users.filter((u) => getItemId(u) !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const headers = ['Name', 'Email', 'Role', 'Actions'];

  const renderRow = (user) => {
    const userId = getItemId(user);
    return (
      <tr key={userId}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {user.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {user.email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={user.role} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <Button variant="danger" size="sm" onClick={() => handleDelete(userId)}>
            Delete
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <LoadingWrapper loading={loading}>
      <div className="container-custom py-8">
        <PageHeader
          title="Manage Users"
          description="View and manage all users in the system"
        />

        <ErrorAlert message={error} onDismiss={() => setError('')} />

        <Card>
          <Table headers={headers} data={users} renderRow={renderRow} />
        </Card>
      </div>
    </LoadingWrapper>
  );
};

export default ManageUsers;

