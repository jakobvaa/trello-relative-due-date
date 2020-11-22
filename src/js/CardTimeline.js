import React, {useState} from 'react'
import styled from 'styled-components'


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
	justify-content: center;
	align-items: flex-start;
	padding: 5px;
`

const ColumnHeader = styled.div`

`

const Card = styled.div`
	display: flex;
	flex-direction: column;
	padding: 5px;
	width: calc(100% - 10px);
	border-radius: 3px;
`
const colors = {
	'Application, AP-Fin-spons': 'red',
	'Key Conference Dates': 'lightblue',
	'Finance': 'green',
	'Publicity/Website': 'red',
	'IntEvents': 'red',
	'Article/Review process': 'red',
	'Technical Program': 'red',
	'Venue/Registration': 'red',
	'Proceedings': 'red',
	'Social': 'red',
}

const timelineModes = {
	'weeks': [7, 14, 21, 28, 35],
	'year': [31, 93, 186, 365],
	'complete': []
}


export const CardTimeline = ({cards}) => {
	console.log(cards)
	const [mode, setMode] = useState('weeks')
	const renderColumn = (column) => {
		return (
			<Column>
				{column.map(card => (
					<Card>
						<h3>{card.name}</h3>
						<p>Due: {card.due}</p>
					</Card>
				))}
			</Column>
		)
	}

	const renderColumns = () => {
		const columns = []
		const edgeValues = timelineModes[mode] 
		currentColumn = 0
		const todayTimestamp = new Date(Date.now()).valueOf()
		let newColumn = []
		for(const card of cards) {
			if(currentColumn >= edgeValues.length) {
				break
			}
			else if (
				todayTimestamp - new Date(card.due).valueOf() > 
				1000 * 3600 * 24 * timelineModes[mode][currentColumn]) {
					columns.push(newColumn)
					newColumn = [card]
					currentColumn ++
			} else {
				newColumn.push(card)
			}
		}
		return (
			<div>
				{columns.map(col => (
					renderColumn(col)
				))}
			</div>
		)
	}

	return (
		<Container>
			{renderColumns()}
		</Container>
	)
}

export default CardTimeline