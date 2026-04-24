import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pagesAPI, commentsAPI } from '../utils/api';

function PublicPage() {
    const { siteSlug, pageSlug } = useParams();
    const [page, setPage] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const [commentForm, setCommentForm] = useState({
        author_name: '',
        author_email: '',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        loadPage();
    }, [siteSlug, pageSlug]);

    const loadPage = async () => {
        try {
            const pageData = await pagesAPI.getBySlug(siteSlug, pageSlug);
            setPage(pageData);

            const commentsData = await commentsAPI.getByPage(pageData.id);
            setComments(commentsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentChange = (e) => {
        setCommentForm({
            ...commentForm,
            [e.target.name]: e.target.value
        });
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await commentsAPI.create({
                page_id: page.id,
                ...commentForm
            });

            const commentsData = await commentsAPI.getByPage(page.id);
            setComments(commentsData);

            setCommentForm({
                author_name: '',
                author_email: '',
                content: ''
            });

            alert('Comment added successfully!');
        } catch (err) {
            alert('Error adding comment: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await commentsAPI.delete(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            alert('Error deleting comment: ' + err.message);
        }
    };

    if (loading) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
                <Link to={`/sites/${siteSlug}`} className="text-blue-500 hover:underline mt-4 inline-block">
                    ← Back to site
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <article className="mb-12">
                <Link to={`/sites/${siteSlug}`} className="text-blue-500 hover:underline mb-4 inline-block">
                    ← Back to site
                </Link>

                <h1 className="text-4xl font-bold mb-4 mt-4">{page.title}</h1>

                <div className="text-gray-600 text-sm mb-8">
                    Published on {new Date(page.created_at).toLocaleDateString()}
                </div>

                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </article>

            {}
            <div className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

                <div className="space-y-4 mb-8">
                    {comments.length === 0 ? (
                        <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-4 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold">{comment.author_name}</span>
                                        <span className="text-gray-600 text-sm ml-2">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                                    </div>
                                    {}
                                    {user && user.role === 'admin' && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Comment Form */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Leave a Comment</h3>
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Name</label>
                                <input
                                    type="text"
                                    name="author_name"
                                    value={commentForm.author_name}
                                    onChange={handleCommentChange}
                                    required
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Email</label>
                                <input
                                    type="email"
                                    name="author_email"
                                    value={commentForm.author_email}
                                    onChange={handleCommentChange}
                                    required
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Comment</label>
                            <textarea
                                name="content"
                                value={commentForm.content}
                                onChange={handleCommentChange}
                                required
                                rows="4"
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        >
                            {submitting ? 'Submitting...' : 'Submit Comment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PublicPage;