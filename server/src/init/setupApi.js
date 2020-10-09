const Card = require('../models/card')
const Baord = require('../models/board')

const addNewCard = async (data) => {
	try {
		const {cardId, cardName, boardId, due_date} = data
		await new Card({
			cardId,
			cardName,
			boardId,
			due_date,
		}).save()
		return 'Success'
	} catch(err) {
		throw err
	}
}


// Adds a child to a parent
const addChildToParent = async (childId, parentId) => {
	try {
		const parentCard = await Card.findOne({ cardId: parentId })
		if(!parentCard.children.includes(childId)) {
			parentCard.children = [...parentCard.children, childId]
		}
		await parentCard.save()
		return 
	} catch(err) {
		throw err
	}
}


// Add parent to child, and remove the child from previous parent if applicable
const addParentToChild = async (childId, parentId, difference) => {
	try {
		const childCard = await Card.findOne({ cardId: childId })
		if(childCard.parent && childCard.parent !== parentId) {
			const previousParent = await Card.findOne({ cardId: childCard.parent })
			previousParent.children = previousParent.children.filter(id => id !== childId)
			await previousParent.save()
		}
		const newParent = await Card.findOne({cardId: parentId})
		childCard.parent = parentId
		childCard.difference = difference
		if(newParent.due_date) {
			const timestamp = Date.parse(newParent.due_date)
			const childTimestamp = timestamp + 1000 * 3600 * 24 * difference
			const childDate = new Date(childTimestamp)
			childCard.due_date = childDate.toISOString()
		}
		await childCard.save()
		const changed = await changeChildrenDueDates(childCard, [(childCard.cardId, childDate)])
		return changed
	} catch(err) {
		throw err
	}
}

const changeChildrenDueDates = async (card, currentChanged=[]) => {
	try {
		if(card.children.length === 0) {  
			return
		}
		const timestamp = Date.parse(card.due_date)
		for(let childId of card.children) {
			const child = await Card.findOne({cardId: childId})
			const childTimestamp = timestamp + 1000 * 3600 * 24 * child.difference
			const childDate = new Date(childTimestamp)
			child.due_date = !isNaN(childDate) ? childDate.toISOString() : null
			await child.save()
			const changed = changeChildrenDueDates(child, [...currentChanged, (childId, childDate)])
			return changed
		}
	} catch(err) {
		throw err
	}
}

module.exports = (app) => {
	app.post('/verifydate', async (req, res) => {
		const {cardId, boardId, cardName, due_date } = req.body
		try {
			const cardData = await Card.findOne({
				cardId,
				boardId
			})
			if(!cardData) {
				await addNewCard(req.body)
				return res.send({message: 'new user added successfully'})
			}
			const cardTimestamp = Date.parse(cardData.due_date)
			const trelloTimestamp = Date.parse(due_date)
			if(cardTimestamp !== trelloTimestamp) {
				cardData.due_date = due_date
				await cardData.save()
				const changedCards = await changeChildrenDueDates(cardData)
				console.log(changedCards)
			}
			return res.send({message: 'ok'})
		} catch(err) {
			console.log(err)
		}
	})

	app.post('/addParent', async (req, res) => {
		const { cardId, newParent, difference } = req.body
		try {
			await addChildToParent(cardId, newParent)
			const changedDates = await addParentToChild(cardId, newParent, difference)
			console.log(changedDates)
			return res.send({message: 'success'})
		} catch(err) {
			console.log(err)
		}
	})

	app.get('/getcard', async (req, res) => {
		try {
			const { cardid } = req.query
			const card = await Card.findOne({cardId: cardid})
			return res.send({card})
		} catch(err) {
			console.log(err)
		}
	})

	app.get('/getboard', async (req, res) => {
		try { 
			const {boardid} = req.query
			const board = await Card.find({boardid: boardId})
			return res.send({ board })
		} catch(err) {
			console.log(err)
		}
	})
}