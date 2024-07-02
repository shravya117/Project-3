const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const passport = require('passport');

// Load User model
const User = require('../models/User');

// Register Route
router.post('/register', (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role // Example of role-based access
  });

  // Hash password before saving in database
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save()
        .then(user => res.json(user))
        .catch(err => console.log(err));
    });
  });
});

// Login Route
router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ emailnotfound: 'Email not found' });
      }

      // Check password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // User matched, create JWT payload
            const payload = {
              id: user.id,
              name: user.name,
              role: user.role // Include additional user data as needed
            };

            // Sign token
            jwt.sign(
              payload,
              keys.secretOrKey,
              { expiresIn: 3600 }, // Token expires in 1 hour (adjust as needed)
              (err, token) => {
                res.json({
                  success: true,
                  token: 'Bearer ' + token
                });
              }
            );
          } else {
            return res.status(400).json({ passwordincorrect: 'Password incorrect' });
          }
        });
    });
});

module.exports = router;
