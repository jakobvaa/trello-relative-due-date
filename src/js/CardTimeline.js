import React, {useState} from 'react'
import styled from 'styled-components'
import {timelineModes, colors} from './constants'
import moment from 'moment'


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
	flex-shrink: 0;
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
		const num = diff > 0 ? `+ ${diff.toFixed(0)}` : `${diff.toFixed(0)}`
		return `Event Start ${num} ${plural}`
	},
	weekly: (diff) => {
		const plural = Math.abs(diff) > 1 || Math.abs(diff) < 1 ? 'Weeks' : 'Week'
		const num = diff > 0 ? `+ ${diff.toFixed(0)}` : `${diff.toFixed(0)}`
		return `Event Start ${num} ${plural}`
	},
	quarterly: (diff) => monthly(diff)
}



export const CardTimeline = ({cards, mode, collapsed}) => {
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

	const renderColumns = () => {
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