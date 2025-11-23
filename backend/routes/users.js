const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserRecipes,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id', getUserProfile);
router.get('/:id/recipes', getUserRecipes);
router.put('/:id', protect, updateUserProfile);
router.get('/me/favorites', protect, getFavorites);
router.post('/favorites/:recipeId', protect, addToFavorites);
router.delete('/favorites/:recipeId', protect, removeFromFavorites);

module.exports = router;
