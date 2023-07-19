const express = require('express');

const router = express.Router();

// /api/item call
router.post('/', async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.file;
    file.mv('./client/build/img/uploads/' + file.name, function(err) {
        if (err)
            return res.status(500).send(err);

        res.status(200).json({filename: file.name});
    });
});

module.exports = router;