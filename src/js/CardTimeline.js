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
	width: calc(20% - 10px);
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
`

const modes = {
	monthly: (diff) => moment.utc().add(diff, 'M'),
	weekly: (diff) => moment.utc.add(diff, 'w'),
	quarterly: (diff) => moment.utc.add(diff * 3, 'M')
}



export const CardTimeline = ({cards}) => {
	const [mode, setMode] = useState('monthly')
	const renderColumn = (column) => {
		console.log(column)
		return (
			<Column>
				<ColumnHeader>
					<h3>
						{column.name}
					</h3>
				</ColumnHeader>
				{column.cards.map(card => (
					<Card>
						<h3>{card.name}</h3>
						<p>Due: {new Date(card.due).toDateString()}</p>
					</Card>
				))}
			</Column>
		)
	}

	const renderColumns2 = () => {
		const columns = []
		let currentDiff = 1
		let currentCard = 0 
		let currentCardList = {
			name: `test ${currentDiff}`,
			cards: []
		}
		while(currentCard !== cards.length) {
			while(!moment(cards[currentCard].due).utc.isBefore(modes[mode](currentDiff))){
				columns.push(currentCardList)
				currentDiff++
				currentCardList = {
					name: `test ${currentDiff}`,
					cards: []
				}
			}
			currentCardList.cards.push(card)
			currentCard ++
		}
		return (
			<Container>
				{columns.map(column => (
					renderColumn(column)
				))}
			</Container>
		)
	}

	const renderColumns = () => {
		const columns = timelineModes[mode].map(diff => (
			{
				name: diff.name,
				diff: diff.value,
				cards: []
			}
		))
		let currentColumn = 0
		const now = new Date().valueOf()
		let finished = false
		for(const card of cards) {
			const cardTimestamp = new Date(card.due).valueOf()
			const cardDiff = cardTimestamp - now
			if(cardDiff > 1000 * 3600 * 24 * columns[currentColumn].diff) {
				for (let i = currentColumn + 1 ; i < columns.length + 1 ; i++) {
					if(i === columns.length){
						finished = true
						break
					}
					const newDiff = cardTimestamp - now
					if(newDiff <= 1000 * 3600 * 24 * columns[i].diff) {
						currentColumn = i
						columns[currentColumn].cards.push(card)
						break
					}
				}
				if(finished) break
			} else {
				columns[currentColumn].cards.push(card)
			}
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