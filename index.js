require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const PORT = process.env.PORT;
const cors = require('cors');
const router = require('./routes/index');
const errorHandler = require('./middleware/ErrorHandlingMiddleware');

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', router);

app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => console.log('server started'));
  } catch (error) {
    console.log(error);
  }
}

start();