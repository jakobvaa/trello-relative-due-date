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
		if(!loading && cards.length === 0) {
			setLoading(true)
			t.getRestApi().getToken()
			.then(token => {
				axios({
					url: `${BASE_URL}members/me/boards?fields=name,url&key=${appKey}&token=${token}`
				}).then(boards => {
					console.log(boards)
					const myBoard = boards.data.find(board => board.name === 'IEEE Conference')
					axios({
						url: `${BASE_URL}boards/${myBoard.id}/cards?key=${appKey}&token=${token}`
					}).then(cards => {
						console.log(cards.data)
						setCards(cards.data)
						setLoading(false)
					})
				}) 
			})
		}
	}, [cards])



	const renderCards = () => (
		<div>
			<ul className='pop-over-list js-list navigable'>
				{cards.map(card => (
					<li key={card.id}>
						fdfdfd
					</li>
				))}
			</ul>
		</div> 
	)

	return (
		<div>
			{cards.length > 0 ? renderCards() : 'ffff'}
		</div>
	)
}

ReactDOM.render(<Popup />, document.getElementById('root'))