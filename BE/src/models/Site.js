const pool = require('../config/database');

async function getAllSites() {
    const result = await pool.query(
        `SELECT s.*, u.username as owner_name 
         FROM sites s
         LEFT JOIN users u ON s.owner_id = u.id
         ORDER BY s.created_at DESC`
    );
    return result.rows;
}

async function getSiteById(id) {
    const result = await pool.query(
        `SELECT s.*, u.username as owner_name 
         FROM sites s
         LEFT JOIN users u ON s.owner_id = u.id
         WHERE s.id = $1`,
        [id]
    );
    return result.rows[0];
}

async function getSiteBySlug(slug) {
    const result = await pool.query(
        `SELECT s.*, u.username as owner_name 
         FROM sites s
         LEFT JOIN users u ON s.owner_id = u.id
         WHERE s.slug = $1`,
        [slug]
    );
    return result.rows[0];
}

async function createSite(siteData) {
    const { owner_id, name, slug, template } = siteData;
    const result = await pool.query(
        `INSERT INTO sites (owner_id, name, slug, template)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [owner_id, name, slug, template]
    );
    return result.rows[0];
}

async function updateSite(id, siteData) {
    const { name, slug, template } = siteData;
    const result = await pool.query(
        `UPDATE sites 
         SET name = $1, slug = $2, template = $3
         WHERE id = $4 RETURNING *`,
        [name, slug, template, id]
    );
    return result.rows[0];
}

async function deleteSite(id) {
    await pool.query('DELETE FROM sites WHERE id = $1', [id]);
}

module.exports = {
    getAllSites,
    getSiteById,
    getSiteBySlug,
    createSite,
    updateSite,
    deleteSite
};