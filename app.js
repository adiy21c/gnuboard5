const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./models'); // Add this line to import models
const expressLayouts = require('express-ejs-layouts'); // For EJS layouts
const flash = require('connect-flash'); // For flash messages

const indexRouter = require('./routes/index'); // Import index router
const boardRouter = require('./routes/boardRoutes'); // Import board router
const authRouter = require('./routes/authRoutes'); // Import auth router
const commonDataMiddleware = require('./middleware/commonDataMiddleware'); // Import common data middleware

const app = express();

// Sync database
db.sequelize.sync({ force: false }) // Add this block for DB sync
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });

// View engine setup
app.use(expressLayouts); // Use EJS layouts
app.set('layout', 'layout'); // Set default layout file (views/layout.ejs)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.COOKIE_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production (HTTPS)
  },
}));
app.use(flash()); // Use connect-flash for flash messages

// Apply common data middleware globally
app.use(commonDataMiddleware);

// Routes
app.use('/', indexRouter);
app.use('/board', boardRouter);
app.use('/auth', authRouter); // Use auth router for /auth path (or /member)

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Server port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
