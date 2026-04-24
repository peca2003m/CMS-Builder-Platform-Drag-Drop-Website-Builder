import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sitesAPI, pagesAPI } from '../utils/api';

function SitePages({ user }) {
    const { siteId } = useParams();
    const navigate = useNavigate();
    const [site, setSite] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadSiteAndPages();
    }, [siteId]);

    const loadSiteAndPages = async () => {
        try {
            setLoading(true);
            const pagesData = await pagesAPI.getBySite(siteId);
            setPages(pagesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSite = async () => {
        if (!window.confirm('⚠️ Delete this entire site? This cannot be undone!')) {
            return;
        }

        try {
            await sitesAPI.delete(siteId);
            setSuccess('Site deleted successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeletePage = async (pageId) => {
        if (!window.confirm('Delete this page?')) {
            return;
        }

        try {
            await pagesAPI.delete(pageId);
            setPages(pages.filter(p => p.id !== pageId));
            setSuccess('Page deleted!');
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
                    <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Manage Pages</h1>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to={`/pages/new?siteId=${siteId}`}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                            >
                                + Create Page
                            </Link>
                            <button
                                onClick={handleDeleteSite}
                                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                            >
                                Delete Site
                            </button>
                        </div>
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

                {pages.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-7xl mb-6">📄</div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No pages yet</h3>
                        <p className="text-gray-600 mb-6">Create your first page to get started!</p>
                        <Link
                            to={`/pages/new?siteId=${siteId}`}
                            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
                        >
                            Create Your First Page
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pages.map((page) => (
                            <div
                                key={page.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
                            >
                                <div className={`h-24 ${
                                    page.status === 'published'
                                        ? 'bg-gradient-to-br from-green-400 to-blue-500'
                                        : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                } relative flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg capitalize">
                    {page.status}
                  </span>
                                    {page.page_type && (
                                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {page.page_type}
                    </span>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                                        {page.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm mb-1">
                                        <strong>Slug:</strong> {page.slug}
                                    </p>
                                    <p className="text-gray-400 text-xs mb-4">
                                        Updated {new Date(page.updated_at).toLocaleDateString()}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/pages/${page.id}/edit`}
                                            className="flex-1 text-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeletePage(page.id)}
                                            className="flex-1 text-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition font-medium text-sm"
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

export default SitePages;