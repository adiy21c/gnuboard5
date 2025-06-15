const db = require('../models');
const { Op } = require('sequelize'); // For query conditions

// Helper function to get the Write model for a given board table name
// This should align with how models are named (e.g., G5WriteFree for 'free' board)
function getWriteModel(bo_table) {
    const modelName = `G5Write${bo_table.charAt(0).toUpperCase() + bo_table.slice(1)}`;
    return db[modelName];
}

// List posts in a board
exports.listPosts = async (req, res, next) => {
    try {
        const { bo_table } = req.params;
        const page = parseInt(req.query.page) || 1;

        // 1. Fetch board settings
        const board = await db.G5Board.findOne({ where: { bo_table } });
        if (!board) {
            const err = new Error('Board not found');
            err.status = 404;
            return next(err);
        }

        const writeModel = getWriteModel(bo_table);
        if (!writeModel) {
            const err = new Error(`Write model for board ${bo_table} not found.`);
            err.status = 500;
            return next(err);
        }

        // 2. Fetch posts with pagination
        const limit = board.bo_page_rows || 15; // Number of posts per page
        const offset = (page - 1) * limit;

        const { count, rows: posts } = await writeModel.findAndCountAll({
            where: { wr_is_comment: 0 }, // Exclude comments from post list
            order: [
                // GNUBoard has complex notice handling (sticky posts) then regular order
                // For simplicity, basic ordering by wr_num (which usually handles notice) and wr_reply
                ['wr_num', 'ASC'],
                ['wr_reply', 'ASC']
            ],
            limit,
            offset,
        });

        const totalPages = Math.ceil(count / limit);

        // 3. Render view
        res.render('board/list', {
            title: `${board.bo_subject} - 목록`,
            board,
            posts,
            currentPage: page,
            totalPages,
            bo_table,
            g5_title: board.bo_subject, // For layout title
            // Common layout variables are now in res.locals via middleware
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

// View a specific post
exports.viewPost = async (req, res, next) => {
    try {
        const { bo_table, wr_id } = req.params;

        // 1. Fetch board settings
        const board = await db.G5Board.findOne({ where: { bo_table } });
        if (!board) {
            const err = new Error('Board not found');
            err.status = 404;
            return next(err);
        }

        const writeModel = getWriteModel(bo_table);
        if (!writeModel) {
            const err = new Error(`Write model for board ${bo_table} not found.`);
            err.status = 500;
            return next(err);
        }

        // 2. Fetch the post
        const post = await writeModel.findOne({ where: { wr_id, wr_is_comment: 0 } });
        if (!post) {
            const err = new Error('Post not found');
            err.status = 404;
            return next(err);
        }

        // 3. Increment hit count (view count)
        // GNUBoard's original logic for hit count is complex (e.g., no hit for own posts, cookie based for guests)
        // Simplified version:
        if (req.cookies[`board_${bo_table}_${wr_id}_hit`] !== '1') {
            await writeModel.increment('wr_hit', { where: { wr_id } });
            res.cookie(`board_${bo_table}_${wr_id}_hit`, '1', { maxAge: 3600 * 1000 * 24 }); // Mark as hit for 24 hours
        }

        // 4. Fetch previous and next posts
        // This is a simplified version. GNUBoard's prev/next logic also considers wr_reply.
        const prevPost = await writeModel.findOne({
            where: {
                wr_is_comment: 0,
                wr_num: { [Op.lt]: post.wr_num }, // Find post with smaller wr_num (older)
                 // For more accurate prev/next, you might need to order by wr_num DESC, wr_reply DESC
                 // and then pick the one immediately before/after current post's wr_num, wr_reply combo.
                 // This simplified version just looks for any post with a smaller wr_num.
            },
            order: [['wr_num', 'DESC'], ['wr_reply', 'DESC']],
            attributes: ['wr_id', 'wr_subject', 'wr_datetime']
        });

        const nextPost = await writeModel.findOne({
            where: {
                wr_is_comment: 0,
                wr_num: { [Op.gt]: post.wr_num }, // Find post with larger wr_num (newer)
            },
            order: [['wr_num', 'ASC'], ['wr_reply', 'ASC']],
            attributes: ['wr_id', 'wr_subject', 'wr_datetime']
        });


        // 5. Fetch comments
        let comments = [];
        if (db.G5Comment) {
             comments = await db.G5Comment.findAll({
                where: {
                    bo_table: bo_table,
                    wr_id: wr_id
                },
                // GNUBoard orders comments by co_comment_reply (length), then co_id
                // For simplicity, using co_id or co_datetime.
                // A proper threaded view would require more complex query or processing.
                order: [['co_parent', 'ASC'],['co_depth', 'ASC'], ['co_id', 'ASC']],
            });
        } else {
            console.warn("G5Comment model not found. Comments will not be loaded.");
        }

        // 6. Render view
        res.render('board/view', {
            title: `${post.wr_subject} - ${board.bo_subject}`,
            board,
            post,
            comments,
            prev_post: prevPost,
            next_post: nextPost,
            bo_table,
            wr_id,
            g5_title: post.wr_subject,
            // Common layout variables are now in res.locals via middleware
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};
