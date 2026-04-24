import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sitesAPI } from '../utils/api';

function Home() {
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSites();
    }, []);

    const loadSites = async () => {
        try {
            const data = await sitesAPI.getAll();
            setSites(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading sites...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-4">Explore Amazing Sites</h1>
                    <p className="text-xl opacity-90">
                        Discover websites created by our community
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {sites.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🌍</div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No sites yet</h3>
                        <p className="text-gray-600 mb-6">Be the first to create a site!</p>
                        <Link
                            to="/register"
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                        >
                            Get Started
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sites.map((site) => (
                            <Link
                                key={site.id}
                                to={`/sites/${site.slug}`}
                                className="group"
                            >
                                <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
                                    {/* Card Header with Gradient */}
                                    <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                                        <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                        {site.template}
                      </span>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                                                <p className="text-xs text-gray-600">Created by</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {site.owner_name || 'Anonymous'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                                            {site.name}
                                        </h2>
                                        <p className="text-gray-500 text-sm mb-4">
                                            📅 {new Date(site.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        </p>
                                        <div className="flex items-center text-blue-500 font-semibold group-hover:text-blue-700 transition">
                                            <span>View Site</span>
                                            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;