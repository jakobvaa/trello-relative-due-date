import Axios from 'axios'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})
const BASE_URL = 'https://api.trello.com/1/'
const Popup = (props) => {

	const [cards, setCards] = useState([])
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		t.getRestApi().getToken()
		.then(token => {
			axios({
				url: `${BASE_URL}members/me/boards?fields=name,url&key=${appKey}&token=${token}`
			}).then(boards => {
				myBoard = boards.data.filter(board => board.name === 'IEEE Conference')[0]
				axios({
					url: `${BASE_URL}boards/${myBoard.id}/cards?key=${appKey}&token=${token}`
				}).then(cards => {
					console.log(cards.data)
					setCards(cards.data)
				})
			}) 
		})
	})
	return (
		<div>funket</div>
	)
}

ReactDOM.render(<Popup />, document.getElementById('root'))