const mongoose = require('mongoose')

const BoardSchema = mongoose.Schema({
	boardId: {
		type: String,
		isRequired: true
	},
	cards: {
		type: [String],
		default: []
	}
})

module.exports = mongoose.model('boards', BoardSchema)