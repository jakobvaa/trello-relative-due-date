import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { updateChildren } from './boardFunctions'
import axios from 'axios'
import styled from 'styled-components'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'

const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})
const BASE_URL = 'https://api.trello.com/1/'

const scrollToRef = (ref) => window.scrollTo(200, ref.current.offsetTop)

const ListItem = styled.li`
	width: 100%;
	cursor: pointer;
	padding: 0 12px;
	&:hover {
		background-color: lightblue;
	}
	background-color: ${(props) => props.active ? 'blue' : 'white'};
`

const List = styled.ul`
	margin-bottom: 10px;
	width: calc(100% - 24px);
`

const Popup = (props) => {
	const ref = useRef(null)
	const [cards, setCards] = useState([])
	const [currentCard, setCurrentCard] = useState(null)
  const [relativeCard, setRelativeCard] = useState(null)
	const [selectedParent, setSelectedParent] = useState(null)
	const [loading, setLoading] = useState(false)
	const [difference, setDifference] = useState(0)
	const [search, setSearch] = useState('')

	useEffect(async () => {
		if(!loading && cards.length === 0) {
			setLoading(true)
			const [myCard, boardCards] = await Promise.all([
				t.card('all'),
				t.cards('all')
			])
      
			setCurrentCard(myCard)
			setCards(boardCards.filter(card => card.id !== myCard.id ))
      const relativeCard = await axios({
        url: `/getcard?cardid=${myCard.id}`
      })
      setRelativeCard(relativeCard.data)
			setLoading(false)
		}
	},[])

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
	
	const canSetDate = () => !(selectedParent)

	const setRelativeDueDate = async () => {
		const token = await t.getRestApi().getToken()
		const board = await t.board('id')
		const boardId = board.id
		const response = await axios({
			method: 'POST',
			url: '/addparent',
			data: {
				cardName: currentCard.name,
				newParent: selectedParent.name,
				difference,
				boardId
			}
		})
		const { card } = response.data
		
		const relativeBoard = await axios({
			url: `/getboard?boardid=${boardId}`
		})
		await axios({
			method: 'PUT',
			url: `${BASE_URL}cards/${card.cardId}?key=${appKey}&token=${token}&due=${card.due_date}`
		})
		await updateChildren(response.data.card, relativeBoard.data.board, token)
		t.closePopup()
	}

	const renderCards = () => (
		<div>
			<List>
				{cards.filter(card => (card.name.toLowerCase().includes(search.toLowerCase())))
				.map(card => (
					<ListItem
						active={card === selectedParent} 
						onClick = {() => setParent(card)}>
						{card.name} {card.due ? `(${new Date(card.due).toDateString()})` : ''}
					</ListItem>
				))}
			</List>
		</div>
	)

	return (
		<div>
			<div>
				<input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Type Card Name'/>
			</div>
			{cards.length > 0 ? renderCards() : 'Loading cards'}
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
