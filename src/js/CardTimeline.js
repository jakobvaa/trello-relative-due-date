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



export const CardTimeline = ({cards, mode, collapsed, useRelativeDates}) => {
	console.log(useRelativeDates)
	
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

	const generateColumnsWithoutDueDates = (currentCard, columns, currentDiff, allCards) => {
		const newDiff = currentDiff + currentCard.diff
		
		const column = columns.find(col => col.difference === Math.floor(currentDiff))
		if(!column) {
			const newColumn = {
				difference: currentDiff,
				cards: [currentCard]
			}
			columns.push(newColumn)
		} else column.cards.push(currentCard)
		if(currentCard.children.length === 0) {
			return columns
		}
		currentCard.children.forEach(cardName => {
			const childCard = allCards.find(card => card.cardName === cardName)
			if(childCard.parent === currentCard.cardName) {
				columns = generateColumnsWithoutDueDates(childCard, columns, newDiff, allCards)
			}
		})
		return columns
	}

	const renderColumnsWitoutDueDates = () => {
		let columns = []
		const eventStart = cards.find(card => card.cardName === 'Event Start')
		columns = generateColumnsWithoutDueDates(eventStart, columns, 0, cards)
		console.log(columns)
		return (
			<Container>
				Dette er en test
			</Container>
		)
	}

	const renderColumnsWithDueDates = () => {
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

		return (
			<Container>
				{columns.map(column => (
					renderColumn(column)
				))}
			</Container>
		)
	}
	return (
			renderColumns()
	)
}

export default CardTimeline