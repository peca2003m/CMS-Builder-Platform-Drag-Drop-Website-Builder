const pool = require('../config/database');

async function getMediaBySiteId(siteId) {
  const result = await pool.query(
    'SELECT * FROM media WHERE site_id = $1 ORDER BY created_at DESC',
    [siteId]
  );
  return result.rows;
}

async function getMediaById(id) {
  const result = await pool.query('SELECT * FROM media WHERE id = $1', [id]);
  return result.rows[0];
}

async function createMedia(mediaData) {
  const { site_id, uploaded_by, filename, file_path, mime_type} = mediaData;
  const result = await pool.query(
    `INSERT INTO media (site_id, uploaded_by, filename, file_path, mime_type)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [site_id, uploaded_by, filename, file_path, mime_type]
  );
  return result.rows[0];
}

async function deleteMedia(id) {
  await pool.query('DELETE FROM media WHERE id = $1', [id]);
}

module.exports = {
  getMediaBySiteId,
  getMediaById,
  createMedia,
  deleteMedia
};