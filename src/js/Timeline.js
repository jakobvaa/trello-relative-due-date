import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import styled from 'styled-components'
import TimelineSidebar from './TimelineSidebar'

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
`

const Sidebar = styled.div`
	display: flex;
	flex-direction: column;
	width: 10%;
`

const ignoreList = ['Application, AP-Tech-spons', 'Tech-spons']



const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})

const BASE_URL = 'https://api.trello.com/1/'


const Timeline = (props) => {
	useEffect(async () => {
		const board = await t.board('all')
		const lists = await t.list('all')
		console.log('board', board)
		console.log('lists', listst)
		
	})

	return (
		<Container>
			
		</Container>
	)
}

ReactDOM.render(<Timeline />, document.getElementById('root'))