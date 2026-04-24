const pool = require('../config/database');

async function getPagesBySiteId(siteId) {
    const result = await pool.query(
        'SELECT * FROM pages WHERE site_id = $1 ORDER BY created_at DESC',
        [siteId]
    );
    return result.rows;
}

async function getPublishedPages(siteSlug) {
    const result = await pool.query(
        `SELECT p.* FROM pages p
     JOIN sites s ON p.site_id = s.id
     WHERE s.slug = $1 AND p.status = 'published'
     ORDER BY p.created_at DESC`,
        [siteSlug]
    );
    return result.rows;
}

async function getPageById(id) {
    const result = await pool.query('SELECT * FROM pages WHERE id = $1', [id]);
    return result.rows[0];
}

async function getPageBySlug(siteSlug, pageSlug) {
    const result = await pool.query(
        `SELECT p.* FROM pages p
     JOIN sites s ON p.site_id = s.id
     WHERE s.slug = $1 AND p.slug = $2 AND p.status = 'published'`,
        [siteSlug, pageSlug]
    );
    return result.rows[0];
}

async function createPage(pageData) {
    const { site_id, created_by, title, slug, content, draft_data, status, page_type } = pageData;
    const result = await pool.query(
        `INSERT INTO pages (site_id, created_by, title, slug, content, draft_data, status, page_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [site_id, created_by, title, slug, content, draft_data, status || 'draft', page_type]
    );
    return result.rows[0];
}

async function updatePage(id, pageData) {
    const { title, slug, content, draft_data, status } = pageData;
    const result = await pool.query(
        `UPDATE pages 
     SET title = $1, slug = $2, content = $3, draft_data = $4, status = $5, updated_at = NOW()
     WHERE id = $6 RETURNING *`,
        [title, slug, content, draft_data, status, id]
    );
    return result.rows[0];
}

async function deletePage(id) {
    await pool.query('DELETE FROM pages WHERE id = $1', [id]);
}

async function publishPage(id) {
    const result = await pool.query(
        `UPDATE pages SET status = 'published', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
    );
    return result.rows[0];
}

module.exports = {
    getPagesBySiteId,
    getPublishedPages,
    getPageById,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    publishPage
};