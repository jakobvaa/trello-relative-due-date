import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})
const BASE_URL = 'https://api.trello.com/1/'

const BoardForm = (props) => {
	
	const [confType, setConfType] = useState(null)
	const [startDate, setStartDate] = useState(null)

	useEffect(async () => {
		const boardId = await t.board('id')
		const cards = await t.cards('all')
	})

	const handleSubmit = (e) => {
		e.preventDefault()
	} 

	const dateCallback = (t, opts) => {
		setStartDate(opts.date)
	}

	const openDaterPicker = () => {
	    t.popup({
            title: 'Hei',
            items: [{text: 'halla'}]
        })
	}

	return (
		<div style={{display: 'flex', flexDirection: 'column', padding: '5em'}}>
			<form onSubmit={handleSubmit}>
				<select value={confType} onChange={(e) => setConfType(e.target.value)}>
					<option value='wcii'>WCII</option>
					<option value='tech-spons'>Tech-Spons=</option>
				</select>
				<button onClick={openDaterPicker}>Set Conference Start Date</button>
			</form>
		</div>
	)
}

ReactDOM.render(<BoardForm/>, document.getElementById('root'))
