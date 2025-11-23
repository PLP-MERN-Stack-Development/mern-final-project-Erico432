const Recipe = require('../models/Recipe');
const User = require('../models/User');

const getRecipes = async (req, res, next) => {
  try {
    const {
      search,
      cuisine,
      category,
      difficulty,
      maxPrepTime,
      maxCookTime,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (cuisine) query.cuisine = cuisine;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (maxPrepTime) query.prepTime = { $lte: parseInt(maxPrepTime) };
    if (maxCookTime) query.cookTime = { $lte: parseInt(maxCookTime) };

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recipes = await Recipe.find(query)
      .populate('author', 'username profileImage')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Recipe.countDocuments(query);

    res.json({
      recipes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalRecipes: total,
    });
  } catch (error) {
    next(error);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      'author',
      'username profileImage bio'
    );

    if (!recipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      cuisine,
      category,
      image,
      tags,
    } = req.body;

    if (!title || !description || !ingredients || !instructions) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    const recipe = await Recipe.create({
      title,
      description,
      ingredients,
      instructions,
      prepTime,
      cookTime,
      servings,
      difficulty,
      cuisine,
      category,
      image,
      tags,
      author: req.user._id,
    });

    const populatedRecipe = await Recipe.findById(recipe._id).populate(
      'author',
      'username profileImage'
    );

    res.status(201).json(populatedRecipe);
  } catch (error) {
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }

    if (recipe.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this recipe');
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('author', 'username profileImage');

    res.json(updatedRecipe);
  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      res.status(404);
      throw new Error('Recipe not found');
    }

    if (recipe.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this recipe');
    }

    await recipe.deleteOne();

    await User.updateMany(
      { favorites: req.params.id },
      { $pull: { favorites: req.params.id } }
    );

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getRecipesByUser = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.params.userId })
      .populate('author', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipesByUser,
};
