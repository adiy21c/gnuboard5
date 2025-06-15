const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');

// List posts in a board
router.get('/:bo_table', boardController.listPosts);

// View a specific post
router.get('/:bo_table/:wr_id', boardController.viewPost);

// Add more routes for write, update, delete, comment later

module.exports = router;
