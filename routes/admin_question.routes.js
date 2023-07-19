/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
var ObjectId = require('mongoose').Types.ObjectId;
const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const Question = require('../model/Question');
const Answer = require('../model/Answer');
const BrainGameType = require('../model/BrainGameType');

router.post('/delete', async (req, res) => {
	try {
		const { _id } = req.body;

		questionObj = await Question.remove({_id: _id});
	
		await Answer.remove({question: _id});
	
		res.json({
			success: true,
			message: 'Question has been removed',
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
		const { _id, question, brain_game_type, answers, incorrect_answers } = req.body;

		if ( !question || answers.length === 0 ) {
			return res.json({
				success: false,
				error: 'Please enter all fields'
			});
		}
	
		let questionObj = new Question({
			question,
			brain_game_type : new ObjectId(brain_game_type)
		});;
		
		if (_id) {
			questionObj = await Question.findOne({_id: _id});
			questionObj.question = question;
			questionObj.brain_game_type = new ObjectId(brain_game_type);
			questionObj.updated_at = Date.now();
		}
		
		// Retrieve the brain game type from the database and check its user_id
		const gameType = await BrainGameType.findById(brain_game_type);
		if (gameType.user_id.toString() !== req.user._id.toString()) {
			return res.status(401).json({
				success: false,
				error: 'You are not authorized to add a question to this brain game type'
			});
		}
	
		await questionObj.save();
	
		await Answer.remove({question: questionObj});
	
		answers.forEach(answer => {
			const newAnswer = new Answer({
				question: questionObj,
				answer: answer,
				brain_game_type: new ObjectId(brain_game_type),
				is_correct_answer: true
			});
	
			newAnswer.save();
		});
		
		incorrect_answers.forEach(answer => {
			const newAnswer = new Answer({
				question: questionObj,
				answer: answer,
				brain_game_type: new ObjectId(brain_game_type),
				is_correct_answer: false
			});
	
			newAnswer.save();
		});
		
		res.json({
			success: true,
			message: 'New question created',
		});
	} catch (err) {
		res.json({
			success: false,
			err: err
		});
	}
});

// /api/question/:id call
router.get('/:id', async (req, res) => {
	try {
			const question = await Question.findOne({_id: req.params.id});
			const answers = await Answer.find({question: question, is_correct_answer: true});
			const incorrectAnswers = await Answer.find({question: question, is_correct_answer: false});

			let answerList = [];
			answers.forEach(answer => {
				answerList.push(answer.answer);
			});

			let incorrectAnswerList = [];
			incorrectAnswers.forEach(answer => {
				incorrectAnswerList.push(answer.answer);
			});

			res.json({
					success: true,
					query: req.query,
					question : {
						_id: question._id,
						question: question.question,
						brain_game_type: question.brain_game_type,
						answers : answerList,
						incorrect_answers: incorrectAnswerList
					}
			});
	} catch (err) {
			res.json({
					success: false,
					err: err
			});
	}
});

// /api/questions call
router.get('/', async (req, res) => {
	const pagination = req.query.pagination ? parseInt(req.query.pagination) : 10;
	const page = req.query.page ? parseInt(req.query.page) : 1;

	try {
		const questions = await Question.find({})
        	.populate({path: 'brain_game_type', model: BrainGameType})
			.sort({updated_at: 'desc'})
			.skip(pagination * page - pagination)
			.limit(pagination);

		const count = await Question.countDocuments({});

		let question_list = [];

		for (const question of questions) {
			let str_answer = '';
			const answers = await Answer.find({question, question});

			answers.forEach(answer => {
				if (str_answer === '') {
					str_answer = answer.answer;
				} else {
					str_answer += ', ' + answer.answer;
				}
			});

			question_list.push({
				_id: question._id,
				question: question.question,
				brain_game_type: question.brain_game_type.game_type_name,
				answers: str_answer
			})
		}

		res.json({
				success: true,
				query: req.query,
				total: count,
				questions: question_list,
				pages: Math.ceil(count / pagination)
		});
	} catch (err) {
		res.json({
				success: false,
				err: err
		});
	}
});

module.exports = router;
