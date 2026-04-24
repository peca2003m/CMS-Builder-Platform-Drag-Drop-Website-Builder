const pool = require('../config/database');

exports.getAllUsers = async (req, res) => {
    try {
        console.log('Admin fetching all users');

        const result = await pool.query(`
            SELECT id, username, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);

        console.log(`Found ${result.rows.length} users`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Admin deleting user: ${id}`);

        // Prevent self-deletion
        if (id === req.user.userId) {
            console.log('User tried to delete themselves');
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        console.log('User deleted successfully');
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSites = async (req, res) => {
    try {
        console.log('Admin fetching all sites');

        const result = await pool.query(`
            SELECT s.*, u.username as owner_name
            FROM sites s
            LEFT JOIN users u ON s.owner_id = u.id
            ORDER BY s.created_at DESC
        `);

        console.log(`Found ${result.rows.length} sites`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching sites:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSite = async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`Admin deleting site: ${id}`);

        await pool.query('DELETE FROM sites WHERE id = $1', [id]);

        console.log('Site deleted successfully');
        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Error deleting site:', error);
        res.status(500).json({ error: error.message });
    }
};