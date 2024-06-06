const express = require('express');
const router = express.Router();
const postsController = require('../controllers/PostsController');



router.post('/', postsController.store);

router.get('/', postsController.index);

router.get('/:slug', postsController.show);

router.put('/:slug', postsController.update);

router.delete('/:slug', postsController.destroy);

module.exports = router;