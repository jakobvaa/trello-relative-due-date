const axios = require('axios')

export const checkBoard = async (t, opts) => {
	const trelloBoard = await t.cards('all')
	console.log(trelloBoard)
	const relativeBoard = await axios({
		url: `/getboard?boardid=${trelloBoard.id}`
	}) 
	console.log(relativeBoard.data)
	return [{
		text: 'Sync Relative Dates'
	}]
}

