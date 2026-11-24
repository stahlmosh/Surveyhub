require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const responseRoutes = require('./routes/responseRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

connectDB();

const app = express();

const allowedOrigin = (process.env.CLIENT_URL || '*').trim().replace(/\/+$/, '');
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigin === '*' || origin === allowedOrigin) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SurveyHub API is running',
    healthEndpoint: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', app: 'SurveyHub API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
