import React from 'react'
import styled from 'styled-components'
const SidebarContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 15%;
	background-color: lightgrey;
`

const CheckList = styled.div`
	width: calc(100% - 20px);
	padding: 10px;
	margin: 10px 0;
`

const CheckListItem = styled.div`
	display: flex;
	flex-direction: row;

`


export const TimelineSidebar = (props) => {
	const {
		labels,
		checkedLabels,
		setLabel,
		unsetLabel,
		mode,
		setMode
	} = props
	
	const renderLines = () => (
		<CheckList>
			{labels.map(label => {
				const isChecked = checkedLabels.includes(label.id)
				return (
					<CheckListItem
						key={label.id}
						onClick={isChecked ? () => unsetLabel(label.id) :() => setLabel(label.id)}>
						<input 
							type='checkbox' 
							checked={checkedLabels.includes(label.id)}
							onChange={() => {return}}/>
						<label>{label.name}</label>
					</CheckListItem>
				)
			})}
		</CheckList>
	)
	
	return (
		<SidebarContainer>

			{renderLines()}
			<CheckList>
				<CheckListItem onClick={() => setMode('monthly')}>
					<input type='radio' checked={mode === 'Weekly'}/>
					<label>Weekly</label>
				</CheckListItem>
				<CheckListItem onClick={() => setMode('monthly')}>
					<input type='radio' checked={mode === 'Weekly'}/>
					<label>Monthly</label>
				</CheckListItem>
				<CheckListItem onClick={() => setMode('quarterly')}>
					<input type='radio' checked={mode === 'quarterly'}/>
					<label>Quarterly</label>
				</CheckListItem>
			</CheckList>
		</SidebarContainer>
	)
}

export default TimelineSidebar