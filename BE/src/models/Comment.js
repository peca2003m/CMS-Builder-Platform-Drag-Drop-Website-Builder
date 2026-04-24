const pool = require('../config/database');

async function getCommentsByPageId(pageId) {
  const result = await pool.query(
    'SELECT * FROM comments WHERE page_id = $1 ORDER BY created_at DESC',
    [pageId]
  );
  return result.rows;
}

async function getCommentById(id) {
  const result = await pool.query('SELECT * FROM comments WHERE id = $1', [id]);
  return result.rows[0];
}

async function createComment(commentData) {
  const { page_id, author_name, author_email, content } = commentData;
  const result = await pool.query(
    `INSERT INTO comments (page_id, author_name, author_email, content)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [page_id, author_name, author_email, content]
  );
  return result.rows[0];
}

async function deleteComment(id) {
  await pool.query('DELETE FROM comments WHERE id = $1', [id]);
}

module.exports = {
  getCommentsByPageId,
  getCommentById,
  createComment,
  deleteComment
};