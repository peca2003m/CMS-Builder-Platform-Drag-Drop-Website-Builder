import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function MediaLibrary({ onSelectImage }) {
    const [searchParams] = useSearchParams();
    const siteId = searchParams.get('siteId');

    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (siteId) {
            loadMedia();
        }
    }, [siteId]);

    const loadMedia = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/media/site/${siteId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setMedia(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('siteId', siteId);

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/media', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const newMedia = await response.json();
            setMedia([newMedia, ...media]);

            if (onSelectImage) {
                onSelectImage(newMedia.file_path);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this image?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/media/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMedia(media.filter(m => m.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center py-8">Loading media...</div>;

    return (
        <div className="p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Media Library</h2>

                <label className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
                    {uploading ? 'Uploading...' : '+ Upload Image'}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {media.length === 0 ? (
                <p className="text-gray-600">No images yet. Upload your first one!</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {media.map((item) => (
                        <div key={item.id} className="border rounded-lg p-2 bg-white">
                            <img
                                src={item.file_path}
                                alt={item.filename}
                                className="w-full h-32 object-cover rounded cursor-pointer"
                                onClick={() => onSelectImage && onSelectImage(item.file_path)}
                            />
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-xs text-gray-600 truncate">{item.filename}</span>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MediaLibrary;