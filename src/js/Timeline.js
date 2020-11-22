import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'

import styled from 'styled-components'
import TimelineSidebar from './TimelineSidebar'
import CardTimeline from './CardTimeline'
const Container = styled.div`
	display: flex;
	flex-direction: row;
	height: 100vh;
	width: 100vw;
`

const Sidebar = styled.div`
	display: flex;
	flex-direction: column;
	width: 10%;
`

const ignoreList = ['Application, AP-Tech-spons', 'Tech-spons']



const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})


const Timeline = (props) => {
	const [checkedLabels, setCheckedLabels] = useState([])
	const [board, setBoard] = useState(null)
	const [lists, setLists] = useState([])
	const [cards, setCards] = useState([])
	const [loading, setLoading] = useState(false)
	useEffect(async () => {
		if(!loading && lists.length === 0) {
			setLoading(true)
			const b = await t.board('all')
			setBoard(b)
			const l = await t.lists('all')
			const filteredList = l.filter(list => !ignoreList.includes(list.name))
			const parsedCards = generateCards(filteredList)
			setCards(parsedCards)
			setLists(filteredList)
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		const newCards = generateCards(lists)
		setCards(newCards)
	}, [checkedLabels])

	const generateCards = (cardLists) => {
		const parsedCards = []
		console.log(cardLists)
		cardLists.forEach(list => {
			list.cards.forEach(card => {
				if(card.due && checkedLabels.includes(card.label)) {
					card.list = list.name
					parsedCards.push(card)
				}
			})
		})
		console.log(parsedCards)
		return parsedCards.sort((a,b) => new Date(a.due) - new Date(b.due))
	}	

	const setLabel = (label) => setCheckedLabels([...checkedLabels, label])
	const unsetLabels = (label) => setCheckedLabels(checkedLabels.filter(l => label !== l)) 

	if(loading || lists.length === 0) {
		return (
			<div>Loading</div>
		)
	}
	
	return (
		<Container>
			<TimelineSidebar
			labels={board.labels}
			checkedLabels={checkedLabels}
			setLabel={setLabel}
			unsetLabel={unsetLabels}/>
			{cards.length > 0 &&
				<CardTimeline cards={cards} />
			}
		</Container>
	)
}

ReactDOM.render(<Timeline />, document.getElementById('root'))