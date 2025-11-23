const express = require('express');
const router = express.Router();
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByUser,
} = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');

router.get('/', getRecipes);
router.get('/:id', getRecipeById);
router.get('/user/:userId', getRecipesByUser);
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;
