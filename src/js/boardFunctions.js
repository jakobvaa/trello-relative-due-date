const axios = require('axios')

const checkBoard = async (t, opts) => {
	const trelloBoard = await t.board('all')
	console.log(trelloBoard)
	const relativeBoard = await axios({
		url: `/getboard?boardid=${trelloBoard.id}`
	}) 
	console.log(board)
	return [{
		text: 'Sync Relative Dates'
	}]
}

