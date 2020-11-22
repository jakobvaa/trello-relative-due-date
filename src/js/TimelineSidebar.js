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



co


const TimelineSidebar = ({labels, checkedLabels, setLabel, unsetLabel}) => {

	const renderLines = () => (
		labels.map(label => {
			isChecked = checkedLabels.includes(label.id)
			return (
				<div 
					key={label.id}
					onClick={isChecked ? unsetLabel(label.id) : setLabel(label.id)}>
					<input 
						type='ceckbox' 
						checked={checkedLabels.includes(label.name)}
						onChange={() => {return}}/>
					<label>{label.name}</label>
				</div>
			)
		}
		)
	)

	return(
		<SidebarContainer>
			<CheckList>
				{renderLines()}
			</CheckList>
		</SidebarContainer>
	)
}

export default TimelineSidebar