const Card = require('../models/card')
const {Component, Property} = require('immutable-ics')
const moment = require('moment')

const addNewCard = async (data) => {
	try {
		const {
			cardId, 
			cardName, 
			boardId, 
			due_date, 
			url, 
			description, 
			labels,
			listName
		} = data
		const baseCard = await Card.findOne({cardName, boardId: 'base'})
		if (baseCard) {
			const card = await new Card({
				cardId,
				cardName,
				boardId,
				due_date,
				url,
				description,
				labels,
				listName,
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
				url,
				description,
				labels,
				listName
			}).save()
			return card
		}
	} catch(err) {
		console.log(err)
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
			const childDate = moment(newParent.due_date).utc()
			const [int, decimals] = difference.toString().split('.')

			childDate.add(parseInt(int), 'M')
			const dec = difference >= 0 ? parseFloat(`0.${decimals}`) : -parseFloat(`0.${decimals}`)
			const daysRest = Math.floor(dec * 30)
			childDate.add(daysRest, 'd')
			childCard.due_date = childDate.toISOString()
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

const createCalendarLink = async (boardId, labels) => {
	try {
		const cards = await Card.find({boardId})
		const versionProperty = new Property({name: 'VERSION', value: 2})
		let calendar
		calendar = new Component({name: 'VCALENDAR'})
		calendar = calendar.pushProperty(versionProperty)
		const calendarCards = []
		cards.forEach(card => {
			const totalLength = card.labels.length + labels.length
			const labelSet = new Set([...labels, ...card.labels])
			if(totalLength !== labelSet.size && card.due_date) {
				calendarCards.push(card)
				let event
				event = new Component({name: 'VEVENT'})
				const start = new Property({
					name: 'DTSTART',
					parameters: {VALUE: 'DATE'},
					value: new Date(card.due_date)
				})
				event = event.pushProperty(start)
				const duration = new Property({
					name: 'DURATION',
					value: 'PT1H'
				})
				event = event.pushProperty(duration)
				const description = new Property({
					name: 'DESCRIPTION',
					value: card.description
				})
				event = event.pushProperty(description)
				const url = new Property({
					name: 'URL',
					value: card.url
				})
				event = event.pushProperty(url)
				const title = new Property({
					name: 'SUMMARY',
					value: card.cardName
				})
				event = event.pushProperty(title)
				calendar = calendar.pushComponent(event)
			}
		})
		return calendar.toString()
	} catch(err) {
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
				console.log(oldName)
				if(card.parent) {
					const parentCard = await Card.findOne({boardId: card.boardId, cardName: card.parent})
					parentCard.children = [...parentCard.children.filter(child => child !== oldName), cardName]
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
	app.post('/updatelabels', async (req, res) => {
		try {
			const {cardId, labels} = req.body
			const card = await Card.findOne({cardId})
			card.labels = labels
			await card.save()
			res.send({card, message: 'OK'})
		} catch(err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})
	app.post('/updatedescription', async (req, res) => {
		try {
			const {cardId, description} = req.body
			const card = await Card.findOne({cardId})
			card.description = description
			await card.save()
			res.send({card, message: 'OK'})
		} catch(err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.post('/updatelist', async (req, res) => {
		try {
			const {cardId, listName} = req.body
			const card = await Card.findOne({cardId})
			card.list = listName
			await card.save()
			res.send({card, message: 'OK'})
		} catch(err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/setbase', async (req, res) => {
		try {

			const set = await Card.updateMany({boardId: req.query.boardid}, {boardId: 'base', cardId: 'base', due_date: null})
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

	app.put('/removeparent', async (req, res) => {
		try {
			const {cardId} = req.body
			const card = await Card.findOne({cardId})
			const parent = await Card.findOne({boardId: card.boardId, cardName: card.parent})
			const childrenWithName = await Card.find({boardId: card.boardId, cardName: card.cardName})
			if(childrenWithName.length === 1) {
				parent.children = parent.children.filter(child => child !== card.cardName)
				await parent.save()
			}
			card.parent = null
			await card.save()
			res.send({ card })

		} catch (err) {
			console.log(err)
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})

	app.get('/calendar', async (req, res) => {
		try {
			const {boardid, labels} = req.query
			const calendar = await createCalendarLink(boardid, labels.split(','))
			res.send(calendar)
		} catch (err) {
			console.log(err) 
			res.status(500).send({message: 'Internal Server Error.'})
		}
	})
}
