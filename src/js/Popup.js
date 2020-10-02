import Axios from 'axios'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import styled from styled-components
import axios from 'axios'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'

const CardContainer = styled.div`
	overflow-x: hidden;
	overflow-y: auto;
	padding: 0 12px 12px;
`

const List = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0;
`

const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})
const BASE_URL = 'https://api.trello.com/1/'
const Popup = (props) => {

	const [cards, setCards] = useState([])
	const [selected, setSelected] = useState(null)
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
		<div className='js-results'>
			<ul className='pop-over-list js-list navigable'>
				{cards.map(card => (
					<li key={card.id} style={{cursor: 'pointer'}} onClick={() => setSelected(card.name)}>
						{card.name} {card.due ? `(${card.due})` : ''}
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