import React, {useState, useEffect} from 'react'
import ReactDOM from 'react-dom'

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


const Timeline = (props) => {
	const [checkedLabels, setCheckedLabels] = useState([])
	const [board, setBoard] = useState(null)
	const [lists, setLists] = useState([])
	const [loading, setLoading] = useState(false)
	useEffect(async () => {
		if(!loading && lists.length === 0) {
			setLoading(true)
			const b = await t.board('all')
			setBoard(b)
			const l = await t.lists('all')
			const filteredList = l.filter(list => !ignoreList.includes(list.name))
			setLists(filteredList)
			setLoading(false)
		}
	}, [])

	console.log(lists)
	

	const setLabel = (label) => setCheckedLabels([...checkedLabels, label])
	const unsetLabels = (label) => setCheckedLabels(checkedLabels.filter(l => label !== l)) 

	if(loading || !board) {
		return (
			<div>Loading</div>
		)
	}

	return (
		<Container>
			dsfds
			{lists.length > 0 &&
				<div>
					<TimelineSidebar
					labels={board.labels}
					checkedLabels={checkedLabels}
					setLabel={setLabel}
					unsetLabel={unsetLabels}/>

				</div>
			}
		</Container>
	)
}

ReactDOM.render(<Timeline />, document.getElementById('root'))