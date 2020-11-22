import React from 'react'
import styled from 'styled-components'
const SidebarContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 10%;
	background-color: lightgrey;
`

const CheckList = styled.div`
	width: calc(100% - 10px);
	padding: 5px;
	margin: 10px 0;
`


export const TimelineSidebar = (props) => {
	const {
		labels,
		checkedLabels,
		setLabel,
		unsetLabel
	} = props
	
	const renderLines = () => (
		<CheckList>
			{labels.map(label => {
				const isChecked = checkedLabels.includes(label.id)
				return (
					<div 
					key={label.id}
					onClick={isChecked ? () => unsetLabel(label.id) :() => setLabel(label.id)}>
					<input 
						type='checkbox' 
						checked={checkedLabels.includes(label.name)}
						onChange={() => {return}}/>
					<label>{label.name}</label>
				</div>
				)
			})}
		</CheckList>
	)
	

	// console.log(labels)
	// console.log(checkedLabels)
	
	return (
		<SidebarContainer>

			{renderLines()}
		</SidebarContainer>
	)
}

export default TimelineSidebar