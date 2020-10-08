import Axios from 'axios'
import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})

const BASE_URL = 'https://api.trello.com/1/'

const CardBadge = (props) => {
	const [boardId, setBoardId] = useState(null)
	const [loading, setLoading] = useState(false)
	const [card, setCard] = useState(null)

	useEffect(() => {
		if(!loading && !boardId) {
			setLoading(true)
			t.getRestApi().getToken()
			.then(token => {
				axios({
					url: `${BASE_URL}members/me/boards?fields=name,url&key=${appKey}&token=${token}`
				}).then(board => {
					const myBoard = boards.data.find(board => board.name === 'IEEE Conference')
					setBoardId(myBoard.id)
				})
			})
		}
	})

	useEffect(() => {
		return t.card('all')
		.then(card => {
			setCard(card)
		})
	})

	useEffect(async () => {
		const isCorrectDate = await axios ({
			method: 'POST',
			data: {
				cardName: card.name,
				cardId: card.id,
				due_date: card.due,
				boardId
			}
		})
		console.log(isCorrectDate.data)
	}, [card, boardId])

	return (
		<div>fdfdsf</div>
	)

}