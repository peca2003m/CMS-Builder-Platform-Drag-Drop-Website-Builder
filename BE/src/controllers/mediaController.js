const pool = require('../config/database');
const cloudinary = require('../config/cloudinary');

exports.getMediaBySite = async (req, res) => {
    try {
        const { siteId } = req.params;
        console.log(`Fetching media for site: ${siteId}`);

        const result = await pool.query(
            'SELECT * FROM media WHERE site_id = $1 ORDER BY created_at DESC',
            [siteId]
        );

        console.log(`Found ${result.rows.length} media files`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting media:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getMediaById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM media WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Media not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting media:', error);
        res.status(500).json({ error: error.message });
    }
};

// Upload media to Cloudinary and save to DB
exports.uploadMedia = async (req, res) => {
    try {
        console.log('==========================================');
        console.log('UPLOAD REQUEST STARTED');
        console.log('==========================================');

        // Check if file exists
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File received:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path
        });

        const { siteId } = req.body;
        console.log('Site ID:', siteId);
        console.log('User ID:', req.user?.userId);

        if (!siteId) {
            console.error('No siteId provided');
            return res.status(400).json({ error: 'siteId is required' });
        }

        // Upload to Cloudinary
        console.log('Uploading to Cloudinary...');
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `cms/${siteId}`,
            resource_type: 'auto'
        });

        console.log('Cloudinary upload successful:', {
            public_id: result.public_id,
            url: result.secure_url,
            format: result.format
        });

        // Save to database
        console.log('Saving to database...');
        const dbResult = await pool.query(
            `INSERT INTO media (site_id, filename, file_path, mime_type, uploaded_by)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                siteId,
                req.file.originalname,
                result.secure_url,
                req.file.mimetype,
                req.user.userId
            ]
        );

        console.log('Database save successful:', dbResult.rows[0].id);
        console.log('==========================================');
        console.log('UPLOAD COMPLETED SUCCESSFULLY');
        console.log('==========================================');

        res.status(201).json(dbResult.rows[0]);
    } catch (error) {
        console.error('==========================================');
        console.error('UPLOAD FAILED');
        console.error('==========================================');
        console.error('Error details:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: error.message,
            details: 'Check server logs for more information'
        });
    }
};

// Delete media
exports.deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Deleting media: ${id}`);

        // Get media info first
        const media = await pool.query('SELECT * FROM media WHERE id = $1', [id]);

        if (media.rows.length === 0) {
            return res.status(404).json({ error: 'Media not found' });
        }

        // Extract public_id from Cloudinary URL
        const urlParts = media.rows[0].file_path.split('/');
        const publicId = urlParts[urlParts.length - 1].split('.')[0];

        // Delete from Cloudinary
        console.log(`Deleting from Cloudinary: ${publicId}`);
        await cloudinary.uploader.destroy(publicId);

        // Delete from database
        console.log('Deleting from database...');
        await pool.query('DELETE FROM media WHERE id = $1', [id]);

        console.log('Media deleted successfully');
        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ error: error.message });
    }
};