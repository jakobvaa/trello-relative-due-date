const axios = require('axios')
const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'


export const checkBoard = async (t, opts) => {
	const trelloCards = await t.cards('all')
	const boardId = await t.board('id')
	const relativeBoard = await axios({
		url: `/getboard?boardid=${boardId.id}`
	}) 
	const trelloIds = trelloCards.map(card => card.id)
	const relativeCards = relativeBoard.data.board.filter(card => trelloIds.includes(card.cardId))
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
			await updateChildren(card, relativeCards, token)
		}
	})
	return 
}

export const updateChildren = async (currentCard, relativeCards, token) => {
	try {
		if(currentCard.children.length === 0) {
			return
		}
		const currentTimestamp = Date.parse(currentCard.due_date)
		currentCard.children.forEach(async childName => {
			const childCard = relativeCards.find(card => card.cardName === childName)
			console.log(childCard)
			const childTimestamp = currentTimestamp + 1000 * 3600 * 24 * 31 * childCard.difference
			let childDate = new Date(childTimestamp)
			if(isNaN(childDate)) {childDate = null}
			else {childDate = childDate.toISOString()}
			childCard.due_date = childDate
			const [relativeResponse, trelloResponse] = await Promise.all([
				axios({
					method: 'POST',
					url: '/updatedate',
					data: {
						cardId: childCard.cardId,
						due_date: childDate
					}
				}),
				axios({
					method: 'PUT',
					url: `${BASE_URL}cards/${childCard.cardId}?key=${appKey}&token=${token}&due=${childDate}`
				})
			])
			await updateChildren(childCard, relativeCards, token)
		})
	} catch (err) {
		console.log(err)
	}
}

