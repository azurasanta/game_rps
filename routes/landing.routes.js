const express = require('express');

const router = express.Router();
const moment = require('moment');

// /api/landing call
router.get('/', async (req, res) => {
    const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    try {
    } catch (err) {
    }
  });
  
  module.exports = router;
  