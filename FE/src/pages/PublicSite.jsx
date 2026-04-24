import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sitesAPI, pagesAPI } from '../utils/api';

function PublicSite() {
    const { slug } = useParams();
    const [site, setSite] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSite();
    }, [slug]);

    const loadSite = async () => {
        try {
            const siteData = await sitesAPI.getBySlug(slug);
            setSite(siteData);

            const pagesData = await pagesAPI.getPublished(slug);
            setPages(pagesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg text-center">
                        <p className="font-bold text-lg mb-2">Site Not Found</p>
                        <p>{error}</p>
                    </div>
                    <Link to="/" className="block text-center text-blue-500 hover:underline mt-6">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <Link to="/" className="inline-flex items-center text-white/90 hover:text-white mb-6 transition">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>

                    <h1 className="text-5xl font-bold mb-4">{site.name}</h1>

                    <div className="flex items-center gap-6 text-white/90">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Created by <strong>{site.owner_name || 'Anonymous'}</strong></span>
                        </div>

                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="capitalize">{site.template} Template</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(site.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {pages.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-7xl mb-6">📄</div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-2">No published pages yet</h3>
                        <p className="text-gray-600">Check back soon for new content!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {pages.map((page) => (
                            <article
                                key={page.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
                            >
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        {page.page_type && (
                                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                        {page.page_type}
                      </span>
                                        )}
                                        <span className="text-gray-500 text-sm">
                      {new Date(page.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                      })}
                    </span>
                                    </div>

                                    <h2 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition">
                                        {page.title}
                                    </h2>

                                    <div
                                        className="prose max-w-none mb-6 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: page.content || '<p>No content</p>' }}
                                    />

                                    <Link
                                        to={`/sites/${slug}/${page.slug}`}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group-hover:gap-3 gap-2 transition-all"
                                    >
                                        <span>Read more</span>
                                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PublicSite;