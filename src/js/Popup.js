import Axios from 'axios'
import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'


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
	const [currentBoardId, setCurrentBoardId] = useState(null)
	const [loading, setLoading] = useState(false)
	const [difference, setDifference] = useState(0)

	useEffect(() => {
		if(!loading && cards.length === 0 && currentCard) {

			setLoading(true)
			t.getRestApi().getToken()
			.then(token => {
				axios({
					url: `${BASE_URL}members/me/boards?fields=name,url&key=${appKey}&token=${token}`
				}).then(boards => {
					const myBoard = boards.data.find(board => board.name === 'IEEE Conference')
					setCurrentBoardId(myBoard.id)
					axios({
						url: `${BASE_URL}boards/${myBoard.id}/cards?key=${appKey}&token=${token}`
					}).then(cards => {
						setCards(cards.data.filter(card => card.id !== currentCard.id))
						setLoading(false)
					})
				}) 
			})
		}
	}, [currentCard])

	useEffect(() => {
		return t.card('all')
		.then((card) => {
			setCurrentCard(card)
		})
	}, [])

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
		console.log(response.data)
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