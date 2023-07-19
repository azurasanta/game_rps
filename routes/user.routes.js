const express = require('express');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jdenticon = require('jdenticon');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const moment = require('moment');
const auth = require('../middleware/auth');
const sendgrid = require('../helper/sendgrid');

// User Model
const User = require('../model/User');
const Transaction = require('../model/Transaction');
const GameLog = require('../model/GameLog');
const Room = require('../model/Room');

router.get('/', auth, async (req, res) => {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const is_banned = req.query.is_banned;
  try {
    const users = await User.find(
      { is_deleted: is_banned },
      { _id: 1, username: 1, email: 1, created_at: 1, rewards: 1 }
    )
      .sort({ created_at: 'desc' })
      .skip(pagination * page - pagination)
      .limit(pagination);
    const count = await User.countDocuments({ is_deleted: is_banned });

    let result = [];
    users.forEach((user, index) => {
      let temp = {
        _id: user['_id'],
        username: user['username'],
        email: user['email'],
        rewards: user['rewards'], 
        date: moment(user['created_at']).format('YYYY-MM-DD')
      };
      result.push(temp);
    });
    res.json({
      success: true,
      query: req.query,
      total: count,
      users: result,
      pages: Math.ceil(count / pagination)
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      err: message
    });
  }
});

router.get('/activity', auth, async (req, res) => {
  const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
  const page = req.query.page ? parseInt(req.query.page) : 1;
  try {
    const transactions = await Transaction.find({})
      .populate({ path: 'user', model: User })
      .sort({ created_at: 'desc' })
      .skip(pagination * page - pagination)
      .limit(pagination);
    const count = await Transaction.countDocuments({});

    let result = [];
    
    transactions.forEach((transaction, index) => {
      let temp = {
        _id: transaction['_id'],
        username: transaction['user']['username'],
        description: transaction['description'],
        amount: transaction['amount'],
        created_at: moment(transaction['created_at']).format(
          'YYYY-MM-DD hh:mm:ss'
        )
      };
      result.push(temp);
    });

    res.json({
      success: true,
      query: req.query,
      total: count,
      activities: result,
      pages: Math.ceil(count / pagination)
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      err: message
    });
  }
});

router.post('/', async (req, res) => {
  const { username, email, password, bio, avatar, referralCode  } = req.body;

  // Simple validation
  if (!username || !email || !password) {
    return res.json({
      success: false,
      error: 'PLEASE FILL IN ALL THE FIELDS'
    });
  }

  // Check for existing user
  let user = await User.findOne({ email });

  if (user)
    return res.json({
      success: false,
      error: 'EMAIL ALREADY EXISTS'
    });

  user = await User.findOne({ username });
  
  if (user)
    return res.json({
      success: false,
      error: 'USERNAME ALREADY EXISTS'
    });

  const verification_code = Math.floor(Math.random() * 8999) + 1000;
  const referralId = req.body.referralCode ? await User.findOne({ referralCode: req.body.referralCode }) : null;

  const generateReferralCode = () => {
    let referralCode = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 6; i++) {
      referralCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return referralCode;
  };

  // Find the owner of the referral code, if it exists
  let referralOwner = null;
  if (referralCode) {
    referralOwner = await User.findOne({ referralCode });
  }

  function generateAvatar(userId) {
    const hash = crypto.createHash('sha256').update(userId).digest('hex');
    const svg = jdenticon.toSvg(hash, 64, {padding: 0});
    const encodedSvg = encodeURIComponent(svg);
    const dataUri = `data:image/svg+xml,${encodedSvg}`;
    return dataUri;
  }

const newUser = new User({
  username,
  email,
  password,
  bio,
  balance: 0,
  rewards: 0,
  status: 'off',
  avatar,
  referralCode: generateReferralCode(),
  referralId: referralOwner ? referralOwner._id : null
});

// Generate avatar for the user
newUser.avatar = generateAvatar(newUser.username);

  // Create salt & hash
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save().then(async user => {
        // If there is a referral owner, update their balance
        if (referralOwner) {
          referralOwner.balance += 0;
          referralOwner.rewards += 1;

          await referralOwner.save();
        }

        jwt.sign(
          { user: user, is_admin: 0 },
          process.env.SECRET_OR_KEY,
          (err, token) => {
            sendgrid.sendWelcomeEmail(email, username, verification_code);

            res.json({
              success: true,
              message: 'new user created',
              token,
              user
            });
          }
        );
      });
    });
  });
});

router.post('/get-info', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body._id });
    
    res.json({
      success: true,
      query: req.query,
      user: user
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      err: message
    });
  }
});
router.post('/getId', async (req, res) => {
  try {
    const userId = await User.findOne({ username: req.body.username }, { _id: 1 });

    if (!userId) {
      return res.json({
        success: true,
        query: req.query,
        user: null,
      });
    }

    res.json({
      success: true,
      query: req.query,
      user: userId._id, // Return the _id value directly
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: err.message,
    });
  }
});



router.post('/updateCustomer', auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body._id });
    if (req.body.balance) {
      user.balance = req.body.balance;
    }

    if (req.body.is_deleted === true || req.body.is_deleted === false) {
      user.is_deleted = req.body.is_deleted;
    }
    await user.save();

    res.json({
      success: true
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      err: message
    });
  }
});
module.exports = router;
