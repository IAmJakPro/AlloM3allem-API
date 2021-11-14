// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

// Controllers
const contractController = require('../controllers/contractController');

const router = express.Router();

router.use(authMiddleware.checkLoggedUser);

// To accept the appointment, Employee should create a contract and the appointment related to this contracr will automatically set as accepted
router.post(
  '/',
  authMiddleware.routeGuard('employee'),
  userMiddleware.getMeInBody,
  contractController.createContract
);

// Employee Updates the contract if client requested changes
router.patch(
  '/update/:id',
  authMiddleware.routeGuard('employee'),
  contractController.updateMyContract
);

// Client accepts the contract
router.patch(
  '/accept/:id',
  authMiddleware.routeGuard('client'),
  contractController.acceptContract
);

router.get(
  '/my-contracts',
  userMiddleware.getMeInQuery,
  contractController.getMyContract
);

router.use(authMiddleware.checkLoggedAdmin);

router.get('/', contractController.getAllContracts);

router
  .route('/:id')
  .patch(contractController.updateContract)
  .delete(contractController.deleteContract);

module.exports = router;
