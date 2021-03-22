const axios = require('axios')
const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const moment = require('moment')

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
		// const currentTimestamp = moment(currentCard.due_date).utc() //Date.parse(currentCard.due_date)
		currentCard.children.forEach(async childName => {
			const childCards = relativeCards.filter(card => card.cardName === childName)
			childCards.forEach( async childCard => {
				if(childCard.parent === currentCard.cardName) {   // ensure the card actually has the correct parent
					let childMoment = moment(currentCard.due_date).utc()
					const [int,decimals] = childCard.difference.toString().split('.')
					childMoment.add(parseInt(int), 'M')
					const dec = childCard.difference >= 0 ? parseFloat(`0.${decimals}`) : -parseFloat(`0.${decimals}`)
					const daysRest = Math.floor(dec * 30)
					childMoment.add(daysRest, 'd')
					if(!childMoment.isValid()) {childMoment = null}
					else {childMoment = childMoment.toISOString()}
					childCard.due_date = childMoment
					const [relativeResponse, trelloResponse] = await Promise.all([
						axios({
							method: 'POST',
							url: '/updatedate',
							data: {
								cardId: childCard.cardId,
								boardId: currentCard.boardId,
								due_date: childMoment
							}
						}),
						axios({
							method: 'PUT',
							url: `${BASE_URL}cards/${childCard.cardId}?key=${appKey}&token=${token}&due=${childMoment}`
						})
					])
					await updateChildren(childCard, relativeCards, token)
				}
			})
		})
		return
	} catch (err) {
		console.log(err)
	}
}

