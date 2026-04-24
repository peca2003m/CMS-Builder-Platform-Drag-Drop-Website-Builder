const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media/image management
 */

/**
 * @swagger
 * /api/media/site/{siteId}:
 *   get:
 *     tags: [Media]
 *     summary: Get all media for a site
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/site/:siteId', mediaController.getMediaBySite);

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     tags: [Media]
 *     summary: Get media by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', mediaController.getMediaById);

/**
 * @swagger
 * /api/media:
 *   post:
 *     tags: [Media]
 *     summary: Upload media file
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               siteId:
 *                 type: string
 */
router.post('/', authMiddleware, upload.single('file'), (req, res, next) => {
    console.log('Upload request received');
    console.log('File:', req.file ? req.file.originalname : 'NO FILE');
    console.log('Site ID:', req.body.siteId);
    console.log('User:', req.user?.userId);
    next();
}, mediaController.uploadMedia);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     tags: [Media]
 *     summary: Delete media
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', authMiddleware, mediaController.deleteMedia);

module.exports = router;