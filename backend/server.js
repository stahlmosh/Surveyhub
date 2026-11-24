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

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', app: 'SurveyHub API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);

app.use(notFound);
app.use(errorHandler);

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
