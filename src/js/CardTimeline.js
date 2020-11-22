import React from 'react'
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
	justify-content: center;
	align-items: flex-start;
`

const ColumnHeader = styled.div`

`

export const CardTimeline = ({cards, checkedLabels}) => {
	console.log(cards)
	return (
		<div>
			Here comes the cards
		</div>
	)
}

export default CardTimeline