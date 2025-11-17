// Server/routes/discountRoutes.js
const express = require('express');
const router = express.Router();
const {
  listDiscounts,
  getDiscount,
  createDiscount,
  updateDiscount,
  deleteDiscount
} = require('../controllers/discountController');

const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');

router.get('/', auth, admin, listDiscounts);
router.get('/:id', auth, admin, getDiscount);
router.post('/', auth, admin, createDiscount);
router.put('/:id', auth, admin, updateDiscount);
router.delete('/:id', auth, admin, deleteDiscount);

module.exports = router;
