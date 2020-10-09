const axios = require('axios')

export const checkBoard = async (t, opts) => {
	const trelloCards = await t.cards('all')
	const boardId = await t.board('id')
	console.log(boardId)
	const relativeBoard = await axios({
		url: `/getboard?boardid=${trelloBoard.id}`
	}) 
	console.log(relativeBoard.data)
	return [{
		text: 'Sync Relative Dates'
	}]
}

