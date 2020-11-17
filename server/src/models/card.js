const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema({
	cardId: {
		type: String,
		required: true
	}, 
	boardId: {
		type: String,
		isRequired: true
	},
	cardName: {
		type: String
	}, 
	due_date: {
		type: Date,
	},
	parent: {
		type: String,
		default: ''
	},
	children: {
		type: [String],
		default: []
	},
	difference: {
		type: Number,
	},
	labels: {
		type: [String]
	},
	description: {
		type: String
	},
	url: {
		type: String
	},
	listName: {
		type: String
	}
})

module.exports = mongoose.model('cards', CardSchema)