import Axios from 'axios'
import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import fs from 'fs'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'

const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})
const BASE_URL = 'https://api.trello.com/1/'

const scrollToRef = (ref) => window.scrollTo(200, ref.current.offsetTop)

const Popup = (props) => {
	const ref = useRef(null)
	const [cards, setCards] = useState([])
	const [currentCard, setCurrentCard] = useState(null)
	const [selectedParent, setSelectedParent] = useState(null)
	const [loading, setLoading] = useState(false)
	const [difference, setDifference] = useState(0)

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

	useEffect(() => {
		return t.card('all')
		.then((card) => {
			console.log(card)
			setCurrentCard(card)
		})
	})

	const setParent = (card) => {
		setSelectedParent(card)
		setDifference(0)
		scrollToRef(ref)
	}

	const increment = () => {
		setDifference(difference + 0.5)
	}

	const decrement = () => {
		setDifference(difference - 0.5)
	}
	
	const canSetDate = () => difference && selectedParent

	const setRelativeDueDate = (card) => {
		
	}

	const renderCards = () => (
		<div className='js-results'>
			<ul className='pop-over-list js-list navigable'>
				{cards.map(card => (
					<li key={card.id} style={{cursor: 'pointer'}} onClick={() => setParent(card)}>
						{card.name} {card.due ? `(${card.due})` : ''}
					</li>
				))}
			</ul>
		</div> 
	)
	
	return (
		<div>
			{cards.length > 0 ? renderCards() : 'ffff'}
			<div style={{display:'flex', alignItems:'center'}}>
				<button disabled={!selectedParent} style ={{ margin: 0 }} onClick={() => decrement()}>-</button>
				<input style={{margin: 0, width: '75px', textAlign: 'center'}} type='number' disabled placeholder={difference}/>
				<button disabled={!selectedParent} style={{margin: 0}} onClick={() => increment()}>+</button>
			</div>
			{selectedParent && 
				<ul>
					<li style={{backgroundColor: 'grey'}}>
						{selectedParent.name} {selectedParent.name} {selectedParent.due ? `(${selectedParent.due})` : ''}
					</li>
				</ul>
			}
			<button ref={ref}>Set Relative Due Date</button>
		</div>
	)
}

ReactDOM.render(<Popup />, document.getElementById('root'))