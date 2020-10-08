const Card = require('../models/card')
const Baord = require('../models/board')

module.exports = (app) => {
	app.post('/verifydate', async (req, res) => {
		
		try {
			const cardData = await Card.find({
				cardId: req.body.cardId,
				boardId: req.body.boardId,
			})
			if(!cardData) {
				await new Card({
					cardId,
					boardId,
					cardName,
					due_date,
					parent: [],
					children: []
				}).save()
				res.send({message: 'new user added successfully'})
			}
		} catch(err) {
			console.log(err)
		}
	})
}