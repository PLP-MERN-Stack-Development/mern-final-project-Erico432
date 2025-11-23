const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    ingredients: [
      {
        item: { type: String, required: true },
        quantity: { type: String, required: true },
        unit: { type: String, required: true },
      },
    ],
    instructions: [
      {
        type: String,
        required: true,
      },
    ],
    prepTime: {
      type: Number,
      required: [true, 'Prep time is required'],
      min: [0, 'Prep time cannot be negative'],
    },
    cookTime: {
      type: Number,
      required: [true, 'Cook time is required'],
      min: [0, 'Cook time cannot be negative'],
    },
    servings: {
      type: Number,
      required: [true, 'Servings is required'],
      min: [1, 'Servings must be at least 1'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    cuisine: {
      type: String,
      enum: ['Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'French', 'Japanese', 'Thai', 'Mediterranean', 'Other'],
      required: true,
    },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage'],
      required: true,
    },
    image: {
      type: String,
      default: 'https://via.placeholder.com/400x300?text=Recipe+Image',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [String],
    favoritesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
