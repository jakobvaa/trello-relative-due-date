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
	height: 100%;
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
`

const modes = {
	monthly: (diff, eventStart) => eventStart.add(diff, 'M'),
	weekly: (diff, eventStart) => eventStart.add(diff, 'w'),
	quarterly: (diff, eventStart) => eventStart.add(diff * 3, 'M')
}

const diffs = {
	monthly: (eventStart, checkDate) => eventStart.diff(checkDate, 'M'),
	weeklt: (eventStart, checkDate) => eventStart.diff(checkDate, 'w'),
	quarterly: (eventStart, checkDate) => eventStart.diff(checkDate * 3, 'M')
}

const titleFunctions = {
	monthly: (diff) => diff > 1 ? `${diff} Months` : `${diff} Month`,
	weekly: (diff) => diff > 1 ? `${diff} Weeks` : `${diff} Week`,
	quarterly: (diff) => `${diff * 3} Months`
}





export const CardTimeline = ({cards, mode}) => {
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
		const columns = []
		const eventStart = cards.find(card => card.name === 'Event Start')
		const eventStartMoment = eventStart ? moment(eventStart.due).utc() : moment().utc()
		let currentDiff = diffs[mode](eventStartMoment, moment(cards[0].due).utc()) + 1
		let currentCardIndex = 0 
		let currentCardList = {
			name: titleFunctions[mode](currentDiff),
			cards: [],
			diff: currentDiff
		}
		while(currentCardIndex !== cards.length) {
			while(!moment(cards[currentCardIndex].due).utc().isBefore(modes[mode](currentDiff, eventStartMoment))){
				columns.push(currentCardList)
				currentDiff++
				currentCardList = {
					name: titleFunctions[mode](currentDiff),
					cards: [],
					diff: currentDiff
				}
			}
			currentCardList.cards.push(cards[currentCardIndex])
			currentCardIndex ++
		}
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