var ObjectId = require('mongoose').Types.ObjectId;
const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const BrainGameType = require('../model/BrainGameType');
router.post('/delete', auth, async (req, res) => {
	try {
		const { _id } = req.body;

		const gameType = await BrainGameType.findOne({ _id });
		if (!gameType) {
			return res.json({
				success: false,
				message: 'Game type not found'
			});
		}

		if (gameType.user_id.toString() !== req.user._id.toString()) {
			return res.json({
				success: false,
				message: 'You are not authorized to delete this game type'
			});
		}

		await BrainGameType.deleteOne({ _id });
		const brain_game_types = await BrainGameType.find({}).sort({game_type_name: 'asc'});
	
		res.json({
			success: true,
			message: 'Game type has been removed',
			brain_game_types
		});
	} catch (err) {
		res.json({
			success: false,
			err: err
		});
	}
});


router.post('/', auth, async (req, res) => {
	try {
	  const { game_type_name } = req.body;
  
	  const brainGameType = new BrainGameType({
		user_id: req.user._id,
		game_type_name
	  });
  
	  await brainGameType.save();
	  const brain_game_types = await BrainGameType.find({}).sort({ game_type_name: 'asc' });
  
	  res.json({
		success: true,
		message: 'New brain game type created',
		brain_game_types
	  });
	} catch (err) {
	  res.json({
		success: false,
		err: err
	  });
	}
  });
  
router.get('/:id', async (req, res) => {
	try {
        const brainGameType = await BrainGameType.findOne({_id: req.params.id});

        res.json({
            success: true,
            query: req.query,
            brain_game_type: brainGameType
        });
	} catch (err) {
        res.json({
            success: false,
            err: err
        });
	}
});

// router.get('/', async (req, res) => {
// 	try {
//         const brain_game_types = await BrainGameType.find({}).sort({created_at: 'asc'});

// 		res.json({
// 				success: true,
// 				query: req.query,
// 				brain_game_types,
// 		});
// 	} catch (err) {
// 		res.json({
// 				success: false,
// 				err: err
// 		});
// 	}
// });

router.get('/', async (req, res) => {
	try {
	  const { user_id } = req.query;
	  const query = user_id ? { user_id } : {};
	  const brain_game_types = await BrainGameType.find(query).sort({created_at: 'asc'});
  
	  res.json({
		success: true,
		query: req.query,
		brain_game_types,
	  });
	} catch (err) {
	  res.json({
		success: false,
		err: err
	  });
	}
  });
  

module.exports = router;
