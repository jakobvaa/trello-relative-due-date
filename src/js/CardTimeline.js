import React, {useState} from 'react'
import styled from 'styled-components'
import {timelineModes, colors} from './constants'
import moment from 'moment'
import card from '../../server/src/models/card'


const Container = styled.div`
	display: flex;
	width: 85%;
	overflow-x: scroll;
`

const Column = styled.div`
	display: flex;
	flex-direction: column;
	border: 1px solid lightgrey;
	width: calc(15% - 10px);
	min-width: 150px;
	flex-shrink: 0;
	max-width: 250px;
	justify-content: flex-start;
	align-items: center;
	padding: 5px;
	overflow-y: scroll;
`

const ColumnHeader = styled.div`
	border-bottom: 2px solid lightgrey;
	width: 100%;
	text-align: center;
	margin-bottom: 5px;
`

const Card = styled.div`
	display: flex;
	flex-direction: column;
	padding: 5px;
	width: calc(100% - 10px);
	border-radius: 3px;
	border: 1px solid lightgrey;
	cursor: pointer;
	background-color: ${props => props.color ? props.color : 'white'};
	margin-bottom: 3px;
`

const modes = {
	monthly: (diff, eventStart) => moment(eventStart.toISOString()).utc().add(diff, 'M'),
	weekly: (diff, eventStart) => moment(eventStart.toISOString()).utc().add(diff, 'w'),
	quarterly: (diff, eventStart) => moment(eventStart.toISOString()).utc().add(diff * 3, 'M')
}

const diffs = {
	monthly: (checkDate, eventStart) => checkDate.diff(eventStart, 'M'),
	weekly: (checkDate, eventStart) => checkDate.diff(eventStart, 'w'),
	quarterly: (checkDate, eventStart) => checkDate.diff(eventStart, 'M') / 3,
	
}

const titleFunctions = {
	monthly: (diff) => {
		const plural = Math.abs(diff) > 1 || Math.abs(diff) < 1 ? 'Months' : 'Month'
		const num = diff >= 0 ? `+ ${diff.toFixed(0)}` : `- ${Math.abs(diff).toFixed(0)}`
		return `Event Start ${num} ${plural}`
	},
	weekly: (diff) => {
		const plural = Math.abs(diff) > 1 || Math.abs(diff) < 1 ? 'Weeks' : 'Week'
		const num = diff >= 0 ? `+ ${diff.toFixed(0)}` : ` - ${Math.abs(diff).toFixed(0)}`
		return `Event Start ${num} ${plural}`
	},
	quarterly: (diff) => {
		const plural = Math.abs(diff) > 1 || Math.abs(diff) < 1 ? 'Months' : 'Month'
		const num = diff >= 0 ? `+ ${diff.toFixed(diff) * 3}` : `- ${Math.abs(diff).toFixed(0) * 3}`
		return `Event Start ${num} ${plural}`
	}
}



export const CardTimeline = ({cards, mode, collapsed, relativeCards, useRelativeDates}) => {
	
	

	const generateColumnsWithoutDueDates = (currentCard, columns, currentDiff, relativeCards, includeList) => {
		console.log('current diff', currentDiff)
		console.log('current card', currentCard.name)
		console.log('current parent', currentCard.parent)
		console.log('diff', currentCard.difference)
		
		const newDiff = currentDiff + currentCard.difference

		const column = columns.find(col => col.difference === Math.floor(newDiff))
		if(!column && includeList.includes(currentCard.name)) {
			const newColumn = {
				difference: Math.floor(newDiff),
				cards: [currentCard]
			}
			columns.push(newColumn)
		} else if(includeList.includes(currentCard.name)) column.cards.push(currentCard)
		if(currentCard.children.length === 0) {
			return columns
		}
		currentCard.children.forEach(cardName => {
			if(includeList.includes(cardName)) {
				const childCard = cards.find(card => card.name === cardName)
				if(childCard.parent === currentCard.name) {
					columns = generateColumnsWithoutDueDates(childCard, columns, newDiff, relativeCards, includeList)
				}
			} else {
				const childCard = relativeCards.find(card => card.cardName === cardName)
				childCard.name = cardName
				console.log(childCard)
			}
		})
		return columns.sort((a,b) => a.difference - b.difference)
	}

	const generateColumnsWithDueDates = () => {
		let columns = []
		const eventStart = cards.find(card => card.name === 'Event Start')
		const eventStartMoment = moment(eventStart.due).utc()
		let currentDiff = diffs[mode](moment(cards[0].due).utc(), eventStartMoment)
		let currentCardIndex = 0 
		let currentCardList = {
			name: titleFunctions[mode](currentDiff),
			cards: []
		}

		while(currentCardIndex !== cards.length) {
			while(!moment(cards[currentCardIndex].due).utc().isSameOrBefore(modes[mode](currentDiff, eventStartMoment))){
				columns.push(currentCardList)
				currentDiff++
				currentCardList = {
					name: titleFunctions[mode](currentDiff),
					cards: []
				}
			}
			currentCardList.cards.push(cards[currentCardIndex])
			currentCardIndex ++
		}
		columns.push(currentCardList)
		columns = collapsed ? columns.filter(col => col.cards.length > 0): columns
		return columns 
	}

	const renderColumn = (column) => { 
		return (
			<Column>
				<ColumnHeader>
					<h3>
						{column.name}
					</h3>
				</ColumnHeader>
				{column.cards.map(card => {
					const cardColor = colors[card.list] ? colors[card.list] : 'white'
					return (
						<Card color={cardColor}>
							<h3>{card.name}</h3>
							<p>Due: {new Date(card.due).toDateString()}</p>
						</Card>
					)
				})}
			</Column>
		)
	}

	const renderColumnsWithoutDueDates = () => {
		let columns = []
		const eventStart = cards.find(card => card.name === 'Event Start')
		eventStart.difference = 0
		console.log('starting')
		const includeList = cards.map(card => card.name)
		
		columns = generateColumnsWithoutDueDates(eventStart, columns, 0, relativeCards, includeList)
		console.log(columns)
		return (
			<Container>
				Dette er en test
			</Container>
		)
	}

	const renderColumnsWithDueDates = () => {
		const columns = generateColumnsWithDueDates()
		return (
			<Container>
				{columns.map(column => (
					renderColumn(column)
				))}
			</Container>
		)
	}

	console.log(cards)
	if(useRelativeDates) {
		return renderColumnsWithoutDueDates()
	}
	else {
		return renderColumnsWithDueDates()
	}
}

export default CardTimeline