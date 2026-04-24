import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { pagesAPI } from '../utils/api';
import 'grapesjs/dist/css/grapes.min.css';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

function GrapesJSEditor() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const [editor, setEditor] = useState(null);
    const [pageData, setPageData] = useState(null);
    const [pages, setPages] = useState([]);
    const [media, setMedia] = useState([]);
    const [siteId, setSiteId] = useState(searchParams.get('siteId'));
    const [siteSlug, setSiteSlug] = useState('');
    const [uploading, setUploading] = useState(false);
    const isNewPage = !id;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [pageType, setPageType] = useState('post');

    useEffect(() => {
        const loadEverything = async () => {
            try {
                if (id) {
                    const page = await loadPage();
                    if (page && page.site_id) {
                        setSiteId(page.site_id);
                        await Promise.all([
                            loadPagesForLinking(page.site_id),
                            loadSiteInfo(page.site_id),
                            loadMediaGallery(page.site_id)
                        ]);
                    }
                } else if (siteId) {
                    await Promise.all([
                        loadPagesForLinking(siteId),
                        loadSiteInfo(siteId),
                        loadMediaGallery(siteId)
                    ]);
                }
                setLoading(false);
            } catch (err) {
                console.error('Error:', err);
                setLoading(false);
            }
        };
        loadEverything();
    }, [id]);

    useEffect(() => {
        if (!loading && editorRef.current && !editor && siteSlug) {
            initEditor();
        }
    }, [loading, editor, pages, siteSlug]);

    const loadSiteInfo = async (currentSiteId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/sites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const sites = await response.json();
                const site = sites.find(s => s.id === currentSiteId);
                if (site) setSiteSlug(site.slug);
            }
        } catch (err) {
            console.error('Error loading site info:', err);
        }
    };

    const loadMediaGallery = async (currentSiteId) => {
        if (!currentSiteId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/media/site/${currentSiteId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMedia(data);
            }
        } catch (err) {
            console.error('Error loading media:', err);
        }
    };

    const loadPagesForLinking = async (currentSiteId) => {
        if (!currentSiteId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/pages/site/${currentSiteId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPages(data);
            }
        } catch (err) {
            console.error('Error loading pages:', err);
        }
    };

    const loadPage = async () => {
        try {
            const page = await pagesAPI.getById(id);
            setPageData(page);
            setTitle(page.title);
            setSlug(page.slug);
            setPageType(page.page_type || 'post');
            return page;
        } catch (err) {
            setError(err.message);
            return null;
        }
    };

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files?.length) return;

        setUploading(true);

        for (let file of files) {
            try {
                const formData = new FormData();
                formData.append('siteId', siteId);
                formData.append('file', file);

                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/media', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                if (response.ok) {
                    const data = await response.json();
                    setMedia(prev => [data, ...prev]);
                    if (editor) {
                        editor.AssetManager.add({ src: data.file_path, name: file.name });
                    }
                }
            } catch (err) {
                console.error('Upload failed:', err);
            }
        }

        setUploading(false);
        e.target.value = '';
    };

    const insertImageToEditor = (url) => {
        if (!editor) return;
        const selected = editor.getSelected();
        if (selected && selected.is('image')) {
            selected.set('src', url);
        } else {
            editor.getWrapper().append(`<img src="${url}" class="w-full" />`);
        }
    };

    const initEditor = () => {
        if (editor) return;
        const grapesEditor = grapesjs.init({
            container: editorRef.current,
            fromElement: false,
            height: 'calc(100vh - 120px)',
            width: 'auto',
            storageManager: false,
            plugins: [gjsPresetWebpage],
            pluginsOpts: { [gjsPresetWebpage]: { blocksBasicOpts: { flexGrid: true } } },
            assetManager: { upload: false },
            canvas: { scripts: ['https://cdn.tailwindcss.com'] }
        });

        media.forEach(item => grapesEditor.AssetManager.add(item.file_path));

        const bm = grapesEditor.BlockManager;
        bm.add('text', { label: 'Text', category: 'Basic', content: '<div class="p-4">Text</div>' });
        bm.add('heading', { label: 'Heading', category: 'Basic', content: '<h1 class="text-4xl font-bold mb-4">Heading</h1>' });
        bm.add('button', { label: 'Button', category: 'Basic', content: '<a href="#" class="inline-block bg-blue-500 text-white px-6 py-2 rounded">Button</a>' });
        bm.add('link-to-page', { label: '🔗 Link to Page', category: 'Navigation', content: '<a href="#" class="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg">Go to Page</a>' });
        bm.add('columns2', { label: '2 Columns', category: 'Layout', content: '<div class="flex gap-4 p-4"><div class="flex-1 p-8 border-2 border-dashed">Col 1</div><div class="flex-1 p-8 border-2 border-dashed">Col 2</div></div>' });
        bm.add('hero', { label: 'Hero', category: 'Components', content: '<section class="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-4 text-center"><h1 class="text-5xl font-bold mb-4">Welcome</h1><p class="text-xl mb-8">Description</p><a href="#" class="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold">Get Started</a></section>' });
        bm.add('card', { label: 'Card', category: 'Components', content: '<div class="max-w-sm rounded-lg shadow-lg bg-white"><img src="https://picsum.photos/400/200" class="w-full"><div class="p-6"><h3 class="font-bold text-xl mb-2">Title</h3><p class="text-gray-700 mb-4">Description</p><a href="#" class="bg-blue-500 text-white px-4 py-2 rounded">Read More</a></div></div>' });
        bm.add('picsum', { label: 'Random Photo', category: 'External API', content: `<img src="https://picsum.photos/800/600?random=${Math.random()}" class="w-full rounded" />` });

        const opts = [
            { value: '#', name: '-- Select Page --' },
            ...pages.map(p => ({
                value: `/sites/${siteSlug}/${p.slug}`,
                name: p.title
            }))
        ];

        grapesEditor.DomComponents.addType('link', {
            isComponent: el => el.tagName === 'A',
            model: {
                defaults: {
                    traits: [
                        { type: 'select', label: 'Link To', name: 'href', options: opts },
                        { type: 'text', label: 'Text', name: 'innerText' }
                    ]
                }
            }
        });

        if (pageData && !isNewPage && pageData.draft_data) {
            try { grapesEditor.loadProjectData(JSON.parse(pageData.draft_data)); }
            catch (e) { if (pageData.content) grapesEditor.setComponents(pageData.content); }
        } else if (pageData?.content) grapesEditor.setComponents(pageData.content);

        setEditor(grapesEditor);
    };

    const handleSave = async (shouldPublish = false) => {
        if (!editor) return;
        const finalTitle = title.trim() || pageData?.title || '';
        const finalSlug = slug.trim() || pageData?.slug || '';
        if (!finalTitle) { setError('Title required'); return; }
        setSaving(true);
        setError('');
        try {
            const html = editor.getHtml();
            const css = editor.getCss();
            const projectData = editor.getProjectData();
            const fullHtml = `<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"><style>${css}</style>${html}`;
            const payload = {
                title: finalTitle,
                slug: finalSlug,
                page_type: pageType,
                content: fullHtml,
                draft_data: JSON.stringify(projectData),
                status: shouldPublish ? 'published' : pageData?.status || 'draft'
            };
            if (isNewPage) {
                payload.site_id = siteId;
                await pagesAPI.create(payload);
                alert('Created!');
                navigate(`/sites/${siteId}/pages`);
            } else {
                await pagesAPI.update(id, payload);
                alert(shouldPublish ? 'Published!' : 'Saved!');
                const updated = await pagesAPI.getById(id);
                setPageData(updated);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTitleChange = (e) => {
        const t = e.target.value;
        setTitle(t);
        setSlug(t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const isPublished = pageData?.status === 'published';

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-4">
                        {isNewPage ? (
                            <div className="space-y-3">
                                <div><label className="block text-sm font-bold mb-1">Title *</label><input type="text" value={title} onChange={handleTitleChange} placeholder="Title..." className="w-full text-xl font-bold border-2 border-blue-300 focus:border-blue-500 outline-none px-3 py-2 rounded" /></div>
                                <div className="flex gap-3">
                                    <div className="flex-1"><label className="block text-sm font-medium mb-1">Slug *</label><input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full text-sm border px-3 py-2 rounded" /></div>
                                    <div><label className="block text-sm font-medium mb-1">Type</label><select value={pageType} onChange={(e) => setPageType(e.target.value)} className="text-sm border px-3 py-2 rounded h-[42px]"><option value="post">Post</option><option value="home">Home</option><option value="about">About</option><option value="contact">Contact</option></select></div>
                                </div>
                            </div>
                        ) : (
                            <><h1 className="text-xl font-bold">{pageData?.title}</h1><span className={`text-sm px-2 py-1 rounded ${isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{isPublished ? 'Published' : 'Draft'}</span></>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSave(false)} disabled={saving} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">{saving ? 'Saving...' : 'Save as Draft'}</button>
                        <button onClick={() => handleSave(true)} disabled={saving} className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400">{isPublished ? 'Update & Publish' : 'Publish'}</button>
                        <button onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                    </div>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">⚠️ {error}</div>}
            </div>

            {/* Main Content: Gallery LEFT + Editor RIGHT */}
            <div className="flex flex-1 overflow-hidden">
                {/* MEDIA GALLERY - LEFT SIDEBAR */}
                <div className="w-80 bg-gray-50 border-r p-4 overflow-y-auto">
                    <div className="mb-4">
                        <label className="block w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg cursor-pointer hover:from-purple-600 hover:to-purple-700 transition text-center font-bold">
                            {uploading ? 'Uploading...' : '📤 Upload Images'}
                            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
                        </label>
                    </div>

                    <h3 className="text-sm font-bold text-gray-700 mb-3">Your Images ({media.length})</h3>

                    <div className="space-y-2">
                        {media.map(item => (
                            <div key={item.id} className="relative group cursor-pointer" onClick={() => insertImageToEditor(item.file_path)}>
                                <img src={item.file_path} alt={item.filename} className="w-full h-40 object-cover rounded border-2 border-gray-200 group-hover:border-purple-500 transition" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition flex items-center justify-center rounded">
                                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-bold">Click to Insert</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1 truncate">{item.filename}</p>
                            </div>
                        ))}
                        {media.length === 0 && !uploading && (
                            <div className="text-center text-gray-500 py-8 text-sm">
                                <p className="mb-2">📸</p>
                                <p>No images yet.</p>
                                <p>Upload your first image!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* EDITOR - RIGHT SIDE */}
                <div className="flex-1">
                    <div ref={editorRef} style={{height: '100%'}} />
                </div>
            </div>
        </div>
    );
}

export default GrapesJSEditor;