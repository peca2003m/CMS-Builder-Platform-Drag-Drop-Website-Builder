import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminPanel({ user }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        loadData();
    }, [user, navigate, activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (activeTab === 'users') {
                const response = await fetch('http://localhost:5000/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                setUsers(data);
            } else {
                const response = await fetch('http://localhost:5000/api/admin/sites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch sites');
                const data = await response.json();
                setSites(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === user.id) {
            alert("You can't delete yourself!");
            return;
        }

        if (!window.confirm('Delete this user? All their sites will be deleted!')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete user');

            setUsers(users.filter(u => u.id !== userId));
            setSuccess('User deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteSite = async (siteId) => {
        if (!window.confirm('Delete this site? This cannot be undone!')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/sites/${siteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete site');

            setSites(sites.filter(s => s.id !== siteId));
            setSuccess('Site deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Panel</h1>
                    <p className="text-gray-600">Manage users and sites</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex-1 px-6 py-4 font-semibold transition ${
                                activeTab === 'users'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Users ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('sites')}
                            className={`flex-1 px-6 py-4 font-semibold transition ${
                                activeTab === 'sites'
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            All Sites ({sites.length})
                        </button>
                    </div>
                </div>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                        ✓ {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {u.username[0].toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {u.role}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {u.id === user.id ? (
                                            <span className="text-gray-400">You</span>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="text-red-600 hover:text-red-900 transition"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'sites' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sites.map((site) => (
                            <div
                                key={site.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                            >
                                <div className={`h-32 ${
                                    site.template === 'blog'
                                        ? 'bg-gradient-to-br from-green-400 to-blue-500'
                                        : 'bg-gradient-to-br from-purple-400 to-pink-500'
                                }`}>
                                    <div className="p-4 flex justify-between items-start">
                    <span className="bg-white/90 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                      {site.template}
                    </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{site.name}</h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>Owner:</strong> {site.owner_name || 'Unknown'}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Created {new Date(site.created_at).toLocaleDateString()}
                                    </p>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/sites/${site.slug}`}
                                            className="flex-1 text-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition text-sm"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteSite(site.id)}
                                            className="flex-1 text-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;