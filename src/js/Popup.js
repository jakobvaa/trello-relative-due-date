import Axios from 'axios'
import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import { updateChildren } from './boardFunctions'


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

	useEffect(async () => {
		if(!loading && cards.length === 0) {
			setLoading(true)
			const [myCard, boardCards] = await Promise.all([
				t.card('all'),
				t.cards('all')
			])
			console.log(myCard)
			console.log(boardCards)
			setCurrentCard(myCard)
			setCards(boardCards.filter(card => card.id !== myCard.id ))
			setLoading(false)
		}
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
	
	const canSetDate = () => !(difference && selectedParent)

	const setRelativeDueDate = async () => {
		const response = await axios({
			method: 'POST',
			url: '/addparent',
			data: {
				cardId: currentCard.id,
				newParent: selectedParent.id,
				difference
			}
		})
		const token = await t.getRestApi().getToken()
		const board = await t.board('id')
		const boardId = board.id
		const relativeBoard = await axios({
			url: `/getboard?boardid=${boardId}`
		})
		await axios({
			method: 'PUT',
			url: `${BASE_URL}cards/${card.cardId}?key=${appKey}&token=${token}&due=${card.due_date}`
		})
		await updateChildren(response.data.card, relativeBoard.data.board, token)
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
			{cards.length > 0 ? renderCards() : 'Loading cards'}
			{selectedParent && 
				<ul>
					<li style={{backgroundColor: 'grey'}}>
						{selectedParent.name} {selectedParent.name} {selectedParent.due ? `(${selectedParent.due})` : ''}
					</li>
				</ul>
			}
			<div style={{display:'flex', alignItems:'center'}}>
				<button disabled={!selectedParent} style ={{ margin: 0 }} onClick={() => decrement()}>-</button>
				<input style={{margin: 0, width: '75px', textAlign: 'center'}} type='number' disabled placeholder={difference}/>
				<button disabled={!selectedParent} style={{margin: 0}} onClick={() => increment()}>+</button>
			</div>
			<button ref={ref} disabled={canSetDate()} onClick={() => setRelativeDueDate()}>Set Relative Due Date</button>
		</div>
	)
}

ReactDOM.render(<Popup />, document.getElementById('root'))