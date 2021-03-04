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
	padding: 3px 12px;
	color: ${props => props.active ? 'white' : 'black'};
	&:hover {
		background-color: ${(props) => props.active ? '#0079bf' : 'lightgray'};
	}
	background-color: ${(props) => props.active ? '#0079bf' : 'white'};
	border-bottom: .5px solid lightgrey;
`

const List = styled.ul`
	margin-bottom: 10px;
	width: calc(100% - 24px);
`

const Container = styled.div`
	&:--scrollbar-style {
		display: none;
	}
	--ms-overflow-style: none;
	scrollbar-width: none;
`

const StickySubmit = styled.div`
	width: calc(100% - 24px);
	position: ${props => props.sticky ? 'sticky' : 'none'};
	bottom: 0;
	padding: 4px 12px;
	background-color: white;
	display: flex;
	flex-direction: column;
	z-index: 10;
`

const SearchField = styled.div`
	position: sticky; 
	top: 0;
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
			const board = await t.board('all')
			console.log(myCard)
			console.log(board)
			setCurrentCard(myCard)
			setCards(boardCards.filter(card => card.id !== myCard.id ))
      const relativeCard = await axios({
        url: `/getcard?cardid=${myCard.id}`
      })
			console.log(relativeCard.data.card)
      setRelativeCard(relativeCard.data.card)

			setLoading(false)
		}
	},[])

	const setParent = (card) => {
		setSelectedParent(card)
		setDifference(0)
		//scrollToRef(ref)
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
				cardId: relativeCard.cardId,
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
		const relativeCards = relativeBoard.data.board
		const update = await updateChildren(response.data.card, relativeCards, token)

	}

	const removeParent = async () => {
		const newCard = await axios({
			method: 'PUT',
			url: '/removeparent',
			data: {
				cardId: relativeCard.cardId
			}
		})
		setRelativeCard(newCard.data.card)
	}

	const generateDifference = (card) => {
		const beforeOrAfter = card.difference > 0 ? 'After' : 'Before'
		const isPlural = card.difference !== 1 ? 's' : ''
		return `${Math.abs(card.difference)} month${isPlural} ${beforeOrAfter}`
	}
	


	const renderCards = () => (
		<div>
			<List>
				{cards.filter(card => (card.name.toLowerCase().includes(search.toLowerCase())))
				.map(card => (
					<ListItem
						active={card === selectedParent} 
						onClick = {() => card === selectedParent ? setParent(null) : setParent(card)}>
						{card.name} {card.due ? `(${new Date(card.due).toDateString()})` : ''}
					</ListItem>
				))}
			</List>
		</div>
	)

	if(loading || !relativeCard) {
		return (
			<div>
				Loading Cards and info.
			</div>
		)
	}

	return (
		<Container>
			{relativeCard.parent && 
			<div>
				<p>Current parent: {relativeCard.parent}({generateDifference(relativeCard)})</p>
				<button onClick={removeParent}>Remove Parent</button>
			</div>}
			<SearchField>
				<input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Type Card Name'/>
			</SearchField>
			{cards.length > 0 ? renderCards() : 'Loading cards'}
			<StickySubmit sticky={!!selectedParent}>
				<h3>Set difference in months</h3>
				<div style={{display: 'flex', alignItems: 'center'}}>
					<button disabled={!selectedParent} style ={{ margin: 0 }} onClick={() => decrement()}>-</button>
					<input type='number' step={0.01} placeholder={difference} onChange={(e) => setDifference(e.target.value)} value={difference}/>
					<button disabled={!selectedParent} style={{margin: 0}} onClick={() => increment()}>+</button>
				</div>
				<button ref={ref} disabled={canSetDate()} onClick={() => setRelativeDueDate()}>Set Relative Due Date</button>
			</StickySubmit>
		</Container>
	)
}

ReactDOM.render(<Popup />, document.getElementById('root'))
