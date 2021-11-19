// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const pageController = require('../controllers/pageController');

const router = express.Router();

router.get('/slug/:id', pageController.getPageBySlug); // id = slug

router.get('/', pageController.getAllPages);

router.use(authMiddleware.checkLoggedAdmin);
router.use(authMiddleware.routeGuard('super_admin', 'admin'));

router.post('/', pageController.createPage);

router
  .route('/:id')
  .get(pageController.getPage)
  .patch(pageController.updatePage)
  .delete(pageController.deletePage);

module.exports = router;
