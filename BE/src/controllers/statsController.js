const pool = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // 1. Pages per site (Bar Chart)
        const pagesBySite = await pool.query(`
            SELECT s.name as site_name, COUNT(p.id) as page_count
            FROM sites s
            LEFT JOIN pages p ON s.id = p.site_id
            WHERE s.owner_id = $1
            GROUP BY s.id, s.name
            ORDER BY page_count DESC
        `, [userId]);

        // 2. Pages over time (Line Chart) - Last 6 months
        const pagesOverTime = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon YYYY') as month,
                COUNT(*) as count
            FROM pages
            WHERE created_by = $1
              AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at)
        `, [userId]);

        // 3. Draft vs Published (Pie Chart)
        const statusBreakdown = await pool.query(`
            SELECT status, COUNT(*) as count
            FROM pages
            WHERE created_by = $1
            GROUP BY status
        `, [userId]);

        const statusData = {
            draft: 0,
            published: 0
        };
        statusBreakdown.rows.forEach(row => {
            statusData[row.status] = parseInt(row.count);
        });

        // 4. Page types breakdown
        const pageTypes = await pool.query(`
            SELECT page_type, COUNT(*) as count
            FROM pages
            WHERE created_by = $1
            GROUP BY page_type
        `, [userId]);

        res.json({
            pagesBySite: pagesBySite.rows,
            pagesOverTime: pagesOverTime.rows,
            statusBreakdown: statusData,
            pageTypes: pageTypes.rows
        });
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
};