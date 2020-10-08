const Card = require('../models/card')
const Baord = require('../models/board')

module.exports = (app) => {
	app.post('/verifydate', async (req, res) => {
		const {cardId, boardId, cardName, due_date } = req.body
		try {
			const cardData = await Card.find({
				cardId: req.body.cardId,
				boardId: req.body.boardId,
			})
			console.log(cardData)
			if(cardData.length === 0) {
				await new Card({
					cardId,
					boardId,
					cardName,
					due_date,
					children: []
				}).save()
				console.log('success')
				res.send({message: 'new user added successfully'})
			}
		} catch(err) {
			console.log(err)
		}
	})
}