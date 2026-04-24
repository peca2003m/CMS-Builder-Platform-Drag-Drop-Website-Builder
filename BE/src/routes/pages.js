const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Pages
 *   description: Page management
 */

/**
 * @swagger
 * /api/pages/site/{siteId}:
 *   get:
 *     tags: [Pages]
 *     summary: Get all pages for a site
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/site/:siteId', authMiddleware, pageController.getPagesBySite);

/**
 * @swagger
 * /api/pages/{id}:
 *   get:
 *     tags: [Pages]
 *     summary: Get page by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', authMiddleware, pageController.getPageById);

/**
 * @swagger
 * /api/pages:
 *   post:
 *     tags: [Pages]
 *     summary: Create new page
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_id:
 *                 type: string
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               content:
 *                 type: string
 */
router.post('/', authMiddleware, pageController.createPage);

/**
 * @swagger
 * /api/pages/{id}:
 *   put:
 *     tags: [Pages]
 *     summary: Update page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', authMiddleware, pageController.updatePage);

/**
 * @swagger
 * /api/pages/{id}:
 *   delete:
 *     tags: [Pages]
 *     summary: Delete page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', authMiddleware, pageController.deletePage);

/**
 * @swagger
 * /api/pages/{id}/publish:
 *   post:
 *     tags: [Pages]
 *     summary: Publish page
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.post('/:id/publish', authMiddleware, pageController.publishPage);

/**
 * @swagger
 * /api/pages/public/{siteSlug}:
 *   get:
 *     tags: [Pages]
 *     summary: Get published pages for a site
 *     parameters:
 *       - in: path
 *         name: siteSlug
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/public/:siteSlug', pageController.getPublishedPages);

/**
 * @swagger
 * /api/pages/{siteSlug}/{pageSlug}:
 *   get:
 *     tags: [Pages]
 *     summary: Get page by slug
 *     parameters:
 *       - in: path
 *         name: siteSlug
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: pageSlug
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:siteSlug/:pageSlug', pageController.getPageBySlug);

module.exports = router;