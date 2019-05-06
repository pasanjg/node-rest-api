const express = require('express');
const router = express.Router();

const UserController = require('../controlers/user');


router.post('/signup', UserController.user_signup);
router.post('/signin', UserController.user_signin);

module.exports = router;