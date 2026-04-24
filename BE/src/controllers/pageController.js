const Page = require('../models/Page');

exports.getPublishedPages = async (req, res) => {
    try {
        const { siteSlug } = req.params;
        const pages = await Page.getPublishedPages(siteSlug);
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPageBySlug = async (req, res) => {
    try {
        const { siteSlug, pageSlug } = req.params;
        const page = await Page.getPageBySlug(siteSlug, pageSlug);
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPagesBySite = async (req, res) => {
    try {
        const { siteId } = req.params;
        const pages = await Page.getPagesBySiteId(siteId);
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPageById = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await Page.getPageById(id);
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPage = async (req, res) => {
    try {
        const pageData = {
            ...req.body,
            created_by: req.user.userId
        };
        const page = await Page.createPage(pageData);
        res.status(201).json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePage = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPage = await Page.getPageById(id);
        if (!existingPage) {
            return res.status(404).json({ error: 'Page not found' });
        }

        if (existingPage.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this page' });
        }

        const page = await Page.updatePage(id, req.body);
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePage = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPage = await Page.getPageById(id);
        if (!existingPage) {
            return res.status(404).json({ error: 'Page not found' });
        }

        if (existingPage.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this page' });
        }

        await Page.deletePage(id);
        res.json({ message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.publishPage = async (req, res) => {
    try {
        const { id } = req.params;

        const existingPage = await Page.getPageById(id);
        if (!existingPage) {
            return res.status(404).json({ error: 'Page not found' });
        }

        if (existingPage.created_by !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to publish this page' });
        }

        const page = await Page.publishPage(id);
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};