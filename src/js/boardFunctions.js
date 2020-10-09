const axios = require('axios')

export const checkBoard = async (t, opts) => {
	const trelloCards = await t.cards('all')
	const boardId = await t.board('id')
	const relativeBoard = await axios({
		url: `/getboard?boardid=${boardId.id}`
	}) 
	const trelloIds = trelloCards.map(card => card.id)
	trelloCards.sort((a,b) => a.id - b.id)
	const relativeCards = relativeBoard.data.board.filter(card => trelloIds.includes(card.cardId))
	relativeCards.sort((a,b ) => a.cardId - b.cardId)
	console.log(trelloCards)
	console.log(relativeCards)
	return [{
		text: 'Sync Relative Dates'
	}]
}

