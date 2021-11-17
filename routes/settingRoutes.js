// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const fileUploadMiddleware = require('../middlewares/fileUploadMiddleware');

// Controllers
const settingController = require('../controllers/settingController');

const router = express.Router();

//////////////// Admin routes ////////////////

router.use(authMiddleware.checkLoggedAdmin);

router
  .route('/')
  .get(settingController.getSettings)
  .post(settingController.createSettings)
  .patch(
    fileUploadMiddleware.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'icon', maxCount: 1 },
    ]),
    settingController.upload,
    settingController.updateSettings
  );

module.exports = router;
