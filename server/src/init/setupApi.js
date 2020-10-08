const Card = require('../models/card')
const Baord = require('../models/board')

const addNewCard = async (data) => {
	try {
		await new Card({
			...card,
			boardId
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
			console.log(previousParent.children)
			previousParent.children = previousParent.children.filter(id => id !== childId)
			console.log(previousParent.children)
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
		await changeChildrenDueDates(childCard)
		return childCard
	} catch(err) {
		throw err
	}
}

const changeChildrenDueDates = async (card) => {
	try {
		if(card.children.length === 0) {  
			return
		}
		const timestamp = Date.parse(card.due_date)
		for(let childId of card.children) {
			const child = await Card.findOne({cardId: childId})
			const childTimestamp = timestamp + 1000 * 3600 * 24 * child.difference
			const childDate = new Date(childTimestamp)
			child.due_date = childDate.toISOString()
			await child.save()
			changeChildrenDueDates(child)
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
			return res.send({message: 'ok'})
		} catch(err) {
			console.log(err)
		}
	})

	app.post('/addParent', async (req, res) => {
		const { cardId, newParent, difference } = req.body
		try {
			await addChildToParent(cardId, newParent)
			await addParentToChild(cardId, newParent, difference)
			return res.send({message: 'success'})
		} catch(err) {
			console.log(err)
		}
	})
}