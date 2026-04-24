import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
                            Simple CMS
                        </Link>
                    </div>
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`font-medium transition ${
                                        isActive('/dashboard')
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    My Sites
                                </Link>

                                {}
                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className={`font-medium transition ${
                                            isActive('/admin')
                                                ? 'text-purple-600'
                                                : 'text-purple-500 hover:text-purple-700'
                                        }`}
                                    >
                                        Admin Panel
                                    </Link>
                                )}

                                <div className="flex items-center gap-3">
                  <span className="text-gray-600 text-sm">
                    👤 {user.username}
                  </span>
                                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                        user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                    {user.role}
                  </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`font-medium transition ${
                                        isActive('/login')
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition font-medium"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;