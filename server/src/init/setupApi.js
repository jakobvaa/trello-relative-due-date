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
		const childCard = await Card.findOne({cardId: childId})
		childCard.difference = difference
		if(childCard.parent && childCard.parent !== parentId) {
			const previousParent = await Card.findOne({ cardId: childCard.parent })
			previousParent.children = previousParent.children.filter(id => id !== childId)
			await previousParent.save()
		}
		const newParent = await Card.findOne({cardId: parentId})
		childCard.parent = parentId
		if (newParent.due_date) {
			const timestamp = Date.parse(newParent.due_date)
			const childTimestamp = timestamp + 1000 * 3600 * 24 * 31 * difference
			const childDate = new Date(childTimestamp).toISOString()
			childCard.due_date = childDate
			await childCard.save()
			return childCard
		}
	} catch (err) {
		res.status(500).send({message: 'Internal Server Error.'})
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
			const childTimestamp = timestamp + 1000 * 3600 * 24 * 31 * child.difference
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
	app.post('/addParent', async (req, res) => {
		const { cardId, newParent, difference } = req.body
		try {
			await addChildToParent(cardId, newParent)
			const newChild = await addParentToChild(cardId, newParent, difference)
			return res.send({card: newChild})
		} catch(err) {
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/getcard', async (req, res) => {
		try {
			const { cardid } = req.query
			const card = await Card.findOne({cardId: cardid})
			return res.send({card})
		} catch(err) {
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/getboard', async (req, res) => {
		try { 
			const { boardid } = req.query
			const board = await Card.find({boardId: boardid})
			return res.send({ board })
		} catch(err) {
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.post('/updatedate', async (req, res) => {
		try {
			const {cardId, due_date} = req.body
			const card = await Card.findOne({cardId})
			card.due_date = due_date

			await card.save()
			return res.status(200).send({message: 'OK'})
		} catch (err) {
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.put('/addcard', async (req, res) => {
		try { 
			await addNewCard(req.body)
			return res.status(200).send({message: 'ok'})
		} catch (err) { 
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})
}