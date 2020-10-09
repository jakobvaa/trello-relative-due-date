const axios = require('axios')
const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const appName = 'relative-due-date'


export const checkBoard = async (t, opts) => {
	const trelloCards = await t.cards('all')
	const boardId = await t.board('id')
	const relativeBoard = await axios({
		url: `/getboard?boardid=${boardId.id}`
	}) 
	const trelloIds = trelloCards.map(card => card.id)
	const relativeCards = relativeBoard.data.board.filter(card => trelloIds.includes(card.cardId))
	const checkedCards = []
	relativeCards.forEach(async card => {
		const trelloCard = trelloCards.find(trelloCard => trelloCard.id === card.cardId)
		const trelloTimestamp = Date.parse(trelloCard.due)
		const relativeTimestamp = Date.parse(card.due_date)
		if(trelloTimestamp !== relativeTimestamp) {
			card.due_date = trelloCard.due
			await axios({
				method: 'POST',
				url: `/updatedate`,
				data: {
					cardId: card.cardId,
					due_date: card.due_date
				}
			})		
			const token = await t.getRestApi().getToken()
			updateChildren(card, trelloCards, relativeCards, token)
		}
	})
	return [{
		text: 'Sync Relative Dates'
	}]
}

const updateChildren = async (currentCard, trelloCards, relativeCards, token) => {
	try {
		if(currentCard.children.length === 0) {
			return
		}
		const currentTrelloCard = trelloCards.find(card => card.id === currentCard.cardId)
		const currentTimestamp = Date.parse(currentCard.due_date)
		currentCard.children.forEach(async child => {
			const childCard = currentCard.find(card => card.id === child)
			const childTimestamp = currentTimestamp + 1000 * 3600 * 24 * difference
			const childDate = new Date(childTimestamp).toISOString()
			const [relativeResponse, trelloResponse] = await Promise.all([
				axios({
					method: 'POST',
					url: '/updatedate',
					data: {
						cardId: child,
						dueDate: childDate
					}
				}),
				axios({
					method: 'PUT',
					url: `${BASE_URL}cards/${child}?key=${appKey}&token=${token}&due=${childDate}`
				})
			])
			updateChildren(childCard, trelloCards, relativeCards, token)
		})
	} catch (err) {
		console.log(err)
	}
}

