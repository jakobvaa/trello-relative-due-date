const Card = require('../models/card')
const Baord = require('../models/board')

const addNewCard = async (data) => {
	try {
		const {cardId, cardName, boardId, due_date} = data
		const baseCard = await Card.findOne({cardName, boardId: 'base'})
		if (baseCard) {
			const card = await new Card({
				cardId,
				cardName,
				boardId,
				due_date,
				difference: baseCard.difference,
				parent: baseCard.parent,
				children: baseCard.children
			}).save()
			return card
		} else {
			const card = await new Card({
				cardId,
				cardName,
				boardId,
				due_date,
			}).save()
			return card
		}
	} catch(err) {
		throw err
	}
}


// Adds a child to a parent
const addChildToParent = async (childName, parentName, boardId) => {
	try {
		const parentCard = await Card.findOne({ cardName: parentName, boardId })
		if(!parentCard.children.includes(childName)) {
			parentCard.children = [...parentCard.children, childName]
		}
		await parentCard.save()
		return 
	} catch(err) {
		throw err
	}
}


// Add parent to child, and remove the child from previous parent if applicable
const addParentToChild = async (childName, parentName, difference, boardId) => {
	try {
		const childCard = await Card.findOne({cardName: childName, boardId})
		childCard.difference = difference
		if(childCard.parent && childCard.parent !== parentName) {
			const previousParent = await Card.findOne({ cardName: childCard.parent, boardId })
			previousParent.children = previousParent.children.filter(name => name !== childName)
			await previousParent.save()
		}
		const newParent = await Card.findOne({cardName: parentName, boardId})
		childCard.parent = parentName
		if (newParent.due_date) {
			const timestamp = Date.parse(newParent.due_date)
			const childTimestamp = timestamp + 1000 * 3600 * 24 * 31 * difference
			const childDate = new Date(childTimestamp).toISOString()
			childCard.due_date = childDate
		}
		else {
			childCard.due_date = null

		}
		await childCard.save()
		return childCard
	} catch (err) {
		throw err
	}
}

module.exports = (app) => {
	app.post('/addParent', async (req, res) => {
		const { cardName, newParent, difference, boardId } = req.body
		try {
			await addChildToParent(cardName, newParent, boardId)
			const newChild = await addParentToChild(cardName, newParent, difference, boardId)
			return res.send({card: newChild})
		} catch(err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/getcard', async (req, res) => {
		try {
			const { cardid, cardname, boardid } = req.query
			let card
			if(cardid) card = await Card.findOne({cardId: cardid})
			else card = await Card.findOne({ cardName: cardname, boardId: boardid })
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
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})
    app.post('/updatename', async (req, res) => {
        try {
            const {cardId, cardName} = req.body
            const card = await Card.findOne({cardId: cardId})
            const oldName = card.cardName
						if(card.parent) {
							const parentCard = await Card.findOne({boardId: card.boardId, cardName: card.parent})
							parentCard.children = [...parentCard.children.filter(card => card.cardName !== oldName), cardName]
							await parentCard.save()
						}
						card.cardName = cardName
            await Card.updateMany({parent: oldName}, {parent: cardName})
            await card.save()
            return res.send({card, message: 'ok'})
        } catch(err) {
            console.log(err)
            res.status(500).send({message: 'Internal Server Error.'})
        } 
    })
	app.get('/setbase', async (req, res) => {
		try {
			const set = await Card.updateMany({}, {boardId: 'base', cardId: 'base', due_date: null})
			console.log(set)
			return res.send(set)
		} catch(err){
			res.status(500).send({message: 'Internal server error.'})
		}
	})

	app.delete('/deleteboard', async (req, res) => {
		try {
			const {boardid} = req.query
			const del  = await Card.deleteMany({boardId: boardid})
			return res.send({del })
		} catch (err) {
			res.status(500).send({message: 'Internal server error. '})
		}
	})

	app.put('/addcard', async (req, res) => {
		try { 
			const card = await addNewCard(req.body)
			return res.status(200).send({message: 'ok', card})
		} catch (err) { 
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})
}
