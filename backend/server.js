const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.json({ message: 'Recipe Sharing Platform API' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
