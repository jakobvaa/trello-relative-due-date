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
	weekly: (diff) => moment.utc().add(diff, 'w'),
	quarterly: (diff) => moment.utc().add(diff * 3, 'M')
}

const diffs = {
	monthly: (checkDate, eventStart) => checkDate.diff(eventStart, 'M')
}

const titleFunctions = {
	monthly: (diff) => diff > 1 ? `T + ${diff} Months` : `T ${diff} Month`,
	weekly: (diff) => diff > 1 ? `T + ${diff} Weeks` : `T ${diff} Week`,
	quarterly: (diff) => diff > 1? `T + ${diff * 3} Months` : `T ${diff} Months`
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

	const renderColumns2 = () => {
		const columns = []
		const eventStart = cards.find(card => card.name === 'Event Start')
		console.log(eventStart)
		
		const eventStartMoment = moment(eventStart.due).utc()
		console.log(eventStartMoment)

		
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
		return (
			<Container>
				{columns.map(column => (
					renderColumn(column)
				))}
			</Container>
		)
	}

	return (
			renderColumns2()
	)
}

export default CardTimeline