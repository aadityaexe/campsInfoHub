import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/api';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';

const AlumniNetwork = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      const alumniUsers = (response.data || []).filter((user) => user.role === 'alumni');
      setAlumni(alumniUsers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch alumni network');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alumni Network</h1>
        <p className="mt-2 text-gray-600">Connect with fellow alumni</p>
      </div>

      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {alumni.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No alumni found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((alumnus) => (
            <Card key={alumnus._id || alumnus.id}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{alumnus.name}</h2>
              <p className="text-gray-600 mb-2">{alumnus.email}</p>
              {alumnus.batch && (
                <p className="text-sm text-gray-500">Batch: {alumnus.batch}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniNetwork;

