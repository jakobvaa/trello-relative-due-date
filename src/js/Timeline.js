import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'
import styled from 'styled-components'
import TimelineSidebar from './TimelineSidebar'
import CardTimeline from './CardTimeline'
import axios from 'axios'
const {BASE_URL} = require('./constants')
const {appKey} = require('./constants')
const {appName} = require('./constants')


const Container = styled.div`
	display: flex;
	flex-direction: row;
	box-sizing: border-box;
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
	appKey: appKey,
	appName: appName
})


const Timeline = (props) => {
	const [checkedLabels, setCheckedLabels] = useState([])
	const [board, setBoard] = useState(null)
	const [lists, setLists] = useState([])
	const [cards, setCards] = useState([])
	const [relativeCards, setRelativeCards] = useState([])
	const [useRelativeDates, setUseRelativeDates] = useState(false)
	const [mode, setMode] = useState('quarterly')
	const [collapsed, setCollapsed] = useState(true)
	const [loading, setLoading] = useState(false)
	
	useEffect(async () => {
		if(!loading && lists.length === 0) {
			setLoading(true)
			const b = await t.board('all')
			setBoard(b)
			const l = await t.lists('all')
			const filteredList = l.filter(list => !ignoreList.includes(list.name))
			const relCards = await axios({
				method: 'GET',
				url: `/getboard?boardid=${b.id}`
			})
			setRelativeCards(relCards.data.board)
			const r = relCards.data.board
			setLists(filteredList)
			let eventHasStartDate = false
			for(let list of filteredList) {
				for(let card of list.cards) {
					if(card.name === 'Event Start' && card.due){
						eventHasStartDate = true
						break
					}
				}
				if (eventHasStartDate) break	
			}
			setUseRelativeDates(!eventHasStartDate)
			const parsedCards = generateCards(filteredList, r, !eventHasStartDate)
			setCards(parsedCards)
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		const newCards = generateCards(lists, relativeCards, useRelativeDates)
		setCards(newCards)
	}, [checkedLabels])

	const generateCards = (cardLists, relativeCardsList, useRel) => {
		const parsedCards = []
		const today = moment().utc()
		cardLists.forEach(list => {
			list.cards.forEach(card => {
				const relativeCard = relativeCardsList.find(relCard => relCard.cardId === card.id)
				const totalLength = card.labels.length + checkedLabels.length
				const cardLabelNames = card.labels.map(label => label.name)
				const labelSet = new Set([...cardLabelNames, ...checkedLabels])
				if(useRel &&
				((totalLength !== labelSet.size || checkedLabels.length === 0) && 
				relativeCard.parent) || card.name === 'Event Start') {
					card.list = list.name
					card.parent = relativeCard.parent
					card.children = relativeCard.children
					card.difference = relativeCard.difference
					parsedCards.push(card)
				}
				else if(card.due && today.isBefore(card.due) && 
				((totalLength !== labelSet.size || checkedLabels.length === 0) || card.name === 'Event Start')) {
					card.list = list.name
					parsedCards.push(card)
				}
			})
		})
		
		const sortedCards =  parsedCards.sort((a,b) => new Date(a.due) - new Date(b.due))
		return sortedCards
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
			boardId={board.id}
			labels={board.labels}
			checkedLabels={checkedLabels}
			setLabel={setLabel}
			unsetLabel={unsetLabels}
			setMode={setMode}
			mode={mode}
			collapsed={collapsed}
			setCollapsed={setCollapsed}
			cards={cards}
			useRelativeDates={useRelativeDates}/>
			{cards.length > 0 &&
				<CardTimeline cards={cards} relativeCards={relativeCards} mode={mode} collapsed={collapsed} useRelativeDates={useRelativeDates}/>
			}
		</Container>
	)
}

ReactDOM.render(<Timeline />, document.getElementById('root'))