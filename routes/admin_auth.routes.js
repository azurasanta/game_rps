/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
// AdminUser Model
const jwt = require('jsonwebtoken');
const AdminUser = require('../model/AdminUser');

const auth = require('../middleware/auth');

// @route   POST api/admin_auth
// @desc    Auth AdminUser
// @access  Public
// eslint-disable-next-line consistent-return
router.post('/', (req, res) => {
  const { email, password } = req.body;
  //  Simple validation
  if (!email || !password) {
    return res.json({
      success: false,
      error: 'Please enter all fields'
    });
  }

  // Check for existing AdminUser
  AdminUser.findOne({ email }).then(user => {
    if (!user)
      return res.json({
        success: false,
        error: 'User does not exist'
      });

    // Validate password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch)
        return res.json({
          success: false,
          error: 'Invalid credentials'
        });
      jwt.sign(
        { id: user._id, is_admin: 1 },
        process.env.SECRET_OR_KEY,
        { expiresIn: '7d' },
        (err, token) => {
          res.json({
            success: true,
            message: 'Admin user logged in',
            token,
            admin: user
          });
        }
      );
    });
  });
});

// @route   GET api/admin_auth/admin
// @desc    Get AdminUser data
// @access  Private
router.get('/admin', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin has been authenticated',
      admin: req.user
    });
  } catch (error) {
    res.json({ success: false, error });
  }
});

// @route   GET api/admin_auth/logout
// @desc    logout
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.status = 'off';
    req.user.save();
    res.json({
      success: true,
      message: 'AdminUser has been logged out'
    });
  } catch (error) {
    res.json({ success: false, error });
  }
});

// router.post('/signup', (req, res) => {
//   const { first_name, last_name, email, password } = req.body;

//   // Simple validation
//   if (!first_name || !last_name || !email || !password) {
//     return res.json({
//       success: false,
//       error: 'Please enter all fields'
//     });
//   }

//   // Check for existing admin
//   AdminUser.findOne({ email }).then(async user => {
//     if (user)
//       return res.json({
//         success: false,
//         error: 'User already exists'
//       });

//     const newAdmin = new AdminUser({
//       first_name,
//       last_name,
//       email,
//       password,
//       status: 'off',
//     });

//     // Create salt & hash
//     bcrypt.genSalt(10, (err, salt) => {
//       bcrypt.hash(newAdmin.password, salt, (err, hash) => {
//         if (err) throw err;
//         newAdmin.password = hash;
//         newAdmin.save().then(user => {
//           jwt.sign({ user: user, is_admin: 1 }, process.env.SECRET_OR_KEY, (err, token) => {
//             res.json({
//               success: true,
//               message: 'New admin user created',
//               token,
//               admin: user
//             });
//           });
//         });
//       });
//     });
//   });
// });

module.exports = router;
