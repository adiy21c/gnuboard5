const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Show login form
router.get('/login', authController.showLoginForm);

// Handle login attempt
router.post('/login', authController.login);

// Handle logout
router.get('/logout', authController.logout);

// Show registration terms page
router.get('/register', authController.showRegistrationTerms);

// Handle registration terms agreement
router.post('/register', authController.handleRegistrationTerms);

// Show registration form page
router.get('/register-form', authController.showRegistrationForm);

// Handle user registration
router.post('/register-form', authController.registerUser);

// Show registration result page
router.get('/register-result', authController.showRegistrationResult);

// AJAX checks
router.post('/check-userid', authController.checkUserid);
router.post('/check-nickname', authController.checkNickname);
router.post('/check-email', authController.checkEmail);


module.exports = router;
