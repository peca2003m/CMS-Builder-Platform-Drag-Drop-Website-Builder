const pool = require('../config/database');

exports.getAllSites = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, u.username as owner_name 
             FROM sites s 
             LEFT JOIN users u ON s.owner_id = u.id 
             ORDER BY s.created_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getSiteBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(
            'SELECT * FROM sites WHERE slug = $1',
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Site not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching site:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.createSite = async (req, res) => {
    try {
        const { name, slug, template } = req.body;

        // FIXED: Get owner_id from JWT token
        const ownerId = req.user.userId;

        console.log('📝 Creating site:', { name, slug, template, ownerId });

        const result = await pool.query(
            `INSERT INTO sites (name, slug, template, owner_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, slug, template, ownerId]
        );

        console.log('Site created:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating site:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateSite = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, template } = req.body;

        const result = await pool.query(
            `UPDATE sites 
             SET name = $1, slug = $2, template = $3
             WHERE id = $4 AND owner_id = $5
             RETURNING *`,
            [name, slug, template, id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Site not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating site:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSite = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM sites WHERE id = $1 AND owner_id = $2',
            [id, req.user.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Site not found or unauthorized' });
        }

        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ error: error.message });
    }
};