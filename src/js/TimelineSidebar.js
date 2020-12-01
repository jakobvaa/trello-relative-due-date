import React from 'react'
import styled from 'styled-components'
const SidebarContainer = styled.div`
	box-sizing: border-box;
	overflow-y: scroll;
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
	align-items: center;
	padding: 5px;
	cursor: pointer;
	margin: 0 5px 0 0;
`

const CheckBox = styled.input`
	margin-right: 10px;
	font-size: 12px;
`

const Label = styled.label`
	margin: 0;
`


export const TimelineSidebar = (props) => {
	const {
		labels,
		checkedLabels,
		setLabel,
		unsetLabel,
		mode,
		setMode,
		collapsed,
		setCollapsed
	} = props
	
	const renderLines = () => (
		<CheckList>
			{labels.map(label => {
				const isChecked = checkedLabels.includes(label.id)
				return (
					<CheckListItem
						key={label.id}
						onClick={isChecked ? () => unsetLabel(label.id) :() => setLabel(label.id)}>
						<CheckBox 
							type='checkbox' 
							checked={checkedLabels.includes(label.id)}
							onChange={() => {return}}/>
						<Label>{label.name}</Label>
					</CheckListItem>
				)
			})}
		</CheckList>
	)
	
	return (
		<SidebarContainer>

			{renderLines()}
			<CheckList>
				<CheckListItem onClick={() => setMode('weekly')}>
					<input type='radio' checked={mode === 'weekly'}/>
					<label>Weekly</label>
				</CheckListItem>
				<CheckListItem onClick={() => setMode('monthly')}>
					<input type='radio' checked={mode === 'monthly'}/>
					<label>Monthly</label>
				</CheckListItem>
				<CheckListItem onClick={() => setMode('quarterly')}>
					<input type='radio' checked={mode === 'quarterly'}/>
					<label>Quarterly</label>
				</CheckListItem>
			</CheckList>
			<CheckList>
				<CheckListItem onClick={() => setCollapsed(!collapsed)}>
					<input type='checkbox'
						checked={collapsed}
					/>
					<label>Collapse empty columns</label>
				</CheckListItem>
			</CheckList>
		</SidebarContainer>
	)
}

export default TimelineSidebar