const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Sites
 *   description: Site management
 */

/**
 * @swagger
 * /api/sites:
 *   get:
 *     tags: [Sites]
 *     summary: Get all public sites
 *     responses:
 *       200:
 *         description: List of sites
 */
router.get('/', siteController.getAllSites);

/**
 * @swagger
 * /api/sites/{slug}:
 *   get:
 *     tags: [Sites]
 *     summary: Get site by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:slug', siteController.getSiteBySlug);

/**
 * @swagger
 * /api/sites:
 *   post:
 *     tags: [Sites]
 *     summary: Create new site
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               template:
 *                 type: string
 */
router.post('/', authMiddleware, siteController.createSite);

/**
 * @swagger
 * /api/sites/{id}:
 *   put:
 *     tags: [Sites]
 *     summary: Update site
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id', authMiddleware, siteController.updateSite);

/**
 * @swagger
 * /api/sites/{id}:
 *   delete:
 *     tags: [Sites]
 *     summary: Delete site
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', authMiddleware, siteController.deleteSite);

module.exports = router;