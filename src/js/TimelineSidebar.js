import React from 'react'
import styled from 'styled-components'
import {colors} from './constants'
const SidebarContainer = styled.div`
	box-sizing: border-box;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	width: 15%;
	background-color: lightgrey;
	max-width: 300px;
`

const CheckList = styled.div`
	width: calc(100% - 20px);
	padding: 10px;
`

const CheckListItem = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 5px;
	cursor: pointer !important;
	margin: 0 5px 2px 0;
`

const CheckBox = styled.input`
	margin: 0 12px 0 0 !important;
	font-size: 12px;
	cursor: pointer;
`

const Label = styled.label`
	margin: 0;
	cursor: pointer;
`

const ColorLine = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center; 
	margin: 0 5px 2px 0; 
	padding: 5px;
`

const ColorBullet = styled.div`
	width: 15px;
	height: 15px;
	background-color: ${props => props.color? props.color : 'inherit'};
	border-radius: 100%;
	margin-right: 12px;
`




export const TimelineSidebar = ({
		labels,
		checkedLabels,
		setLabel,
		unsetLabel,
		mode,
		setMode,
		collapsed,
		setCollapsed
	}) => {
	
	const renderLines = () => (
		<CheckList>
			<h4>Select Labels for Timeline</h4>
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

	const renderColorCoding = () => {
		return (
			<CheckList>
				<h4>Colors </h4>
				{Object.entries(colors).map(entry => (
					<ColorLine>
						<ColorBullet color={entry[1]}/>
						<label style={{margin: '0'}}>{entry[0]}</label>
					</ColorLine>
				))}
			</CheckList>
		)
	}

	return (
		<SidebarContainer>

			{renderLines()}
			<CheckList>
				<h4>Select Time Interval</h4>
				<CheckListItem onClick={() => setMode('weekly')}>
					<CheckBox type='radio' checked={mode === 'weekly'}/>
					<Label>Weekly</Label>
				</CheckListItem>
				<CheckListItem onClick={() => setMode('monthly')}>
					<CheckBox type='radio' checked={mode === 'monthly'}/>
					<Label>Monthly</Label>
				</CheckListItem>
				<CheckListItem onClick={() => setMode('quarterly')}>
					<CheckBox type='radio' checked={mode === 'quarterly'}/>
					<Label>Quarterly</Label>
				</CheckListItem>
			</CheckList>
			<CheckList>
				<CheckListItem onClick={() => setCollapsed(!collapsed)}>
					<CheckBox type='checkbox'
						checked={collapsed}
					/>
					<Label>Collapse empty columns</Label>
				</CheckListItem>
			</CheckList>
			{renderColorCoding()}
		</SidebarContainer>
	)
}

export default TimelineSidebar