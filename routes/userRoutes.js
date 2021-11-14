// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');
const fileUploadMiddleware = require('../middlewares/fileUploadMiddleware');

// Controllers
const userAuthController = require('../controllers/userAuthController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Authentication for users -- ability to logout, register, login, and account activation.
router.post('/register', userAuthController.signup);
router.post('/login', userAuthController.login);

router.post('/forgotpassword', authController.sendResetPassToken);

router.post('/verification/number', authController.verifTokenRestPass);

router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authMiddleware.checkLoggedUser);

router.get('/logout', userAuthController.logout);

router.get('/me', userMiddleware.getMe, userController.getUser);

router.patch(
  '/update-me',
  fileUploadMiddleware.single('image'),
  userController.uploadUserImage,
  userController.updateProfile
);
router.patch('/update-password', userController.updatePassword);

// Routes below are restricted for super admins
router.use(authMiddleware.checkLoggedAdmin);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    fileUploadMiddleware.single('image'),
    userController.uploadUserImage,
    userController.createUser
  );

router
  .route('/:id')
  .get(userController.getUser)
  .patch(
    userController.updateUser,
    fileUploadMiddleware.single('image'),
    userController.uploadUserImage
  )
  .delete(userController.deleteUser);

module.exports = router;
