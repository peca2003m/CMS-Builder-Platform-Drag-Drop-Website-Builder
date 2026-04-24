const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', authMiddleware, isAdmin, adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/users/:id', authMiddleware, isAdmin, adminController.deleteUser);

/**
 * @swagger
 * /api/admin/sites:
 *   get:
 *     tags: [Admin]
 *     summary: Get all sites (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all sites
 */
router.get('/sites', authMiddleware, isAdmin, adminController.getAllSites);

/**
 * @swagger
 * /api/admin/sites/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete site (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/sites/:id', authMiddleware, isAdmin, adminController.deleteSite);

module.exports = router;