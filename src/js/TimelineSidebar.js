import React, {useRef} from 'react'
import styled from 'styled-components'
import {Component, Property} from 'immutable-ics'
import {saveAs} from 'file-saver'
import {colors} from './constants'
import { text } from 'body-parser'

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
		setCollapsed,
		cards,
		boardId
	}) => {
	const textRef = useRef(null)
	const downloadCalendar = () => {
		const versionProperty = new Property({name: 'VERSION', value: 2})
		let calendar
		calendar = new Component({name: 'VCALENDAR'})
		calendar = calendar.pushProperty(versionProperty)
		cards.forEach(card => {
			let event
			event = new Component({name: 'VEVENT'})
			const start = new Property({
				name: 'DTSTART',
				parameters: {VALUE: 'DATE'},
				value: new Date(card.due)
			})
			event = event.pushProperty(start)
			const duration = new Property({
				name: 'DURATION',
				value: 'PT1H'
			})
			event = event.pushProperty(duration)
			const description = new Property({
				name: 'DESCRIPTION',
				value: card.desc
			})
			event = event.pushProperty(description)
			const url = new Property({
				name: 'URL',
				value: card.url
			})
			event = event.pushProperty(url)
			const title = new Property({
				name: 'SUMMARY',
				value: card.name
			})
			event = event.pushProperty(title)
			calendar = calendar.pushComponent(event)
		})
		const blob = new Blob([calendar.toString()], {type: 'text/plain;charset=utf-8'})
		saveAs(blob, 'calendar.ics')
	}

	const copyToClipboard = () => {
		
		textRef.current.select()
		document.execCommand('copy')
		console.log('success')
	}

	const renderLines = () => (
		<CheckList>
			<h4>Select Labels for Timeline</h4>
			{labels.map(label => {
				const isChecked = checkedLabels.includes(label.name)
				return (
					<CheckListItem
						key={label.id}
						onClick={isChecked ? () => unsetLabel(label.name) :() => setLabel(label.name)}>
						<CheckBox 
							type='checkbox' 
							checked={isChecked}
							onChange={() => {return}}/>
						<Label>{label.name}</Label>
					</CheckListItem>
				)
			})}
			<button onClick={downloadCalendar}>Download as Calendar</button>
			<input
				disabled
				style={{visibility: 'hidden'}}
				ref={textRef}
				value={`ieee.martinnj.com/calendar?boardid=${boardId}&labels=${checkedLabels}`}/>
			<button onClick={copyToClipboard}>Copy Calendar Link to Clipboard</button>
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