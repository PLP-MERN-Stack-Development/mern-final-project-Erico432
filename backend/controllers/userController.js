const User = require('../models/User');
const Recipe = require('../models/Recipe');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const recipeCount = await Recipe.countDocuments({ author: user._id });

    res.json({
      ...user.toObject(),
      recipeCount,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this profile');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.username = req.body.username || user.username;
    user.bio = req.body.bio || user.bio;
    user.profileImage = req.body.profileImage || user.profileImage;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
    });
  } catch (error) {
    next(error);
  }
};

const getUserRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.params.id })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

const addToFavorites = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);

    if (!recipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }

    const user = await User.findById(req.user._id);

    if (user.favorites.includes(req.params.recipeId)) {
      res.status(400);
      throw new Error('Recipe already in favorites');
    }

    user.favorites.push(req.params.recipeId);
    await user.save();

    recipe.favoritesCount += 1;
    await recipe.save();

    res.json({ message: 'Recipe added to favorites', favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

const removeFromFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.favorites.includes(req.params.recipeId)) {
      res.status(400);
      throw new Error('Recipe not in favorites');
    }

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.recipeId
    );
    await user.save();

    const recipe = await Recipe.findById(req.params.recipeId);
    if (recipe && recipe.favoritesCount > 0) {
      recipe.favoritesCount -= 1;
      await recipe.save();
    }

    res.json({ message: 'Recipe removed from favorites', favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: {
        path: 'author',
        select: 'username profileImage',
      },
    });

    res.json(user.favorites);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserRecipes,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};
