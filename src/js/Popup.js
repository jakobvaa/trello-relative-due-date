import Axios from 'axios'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})

const Popup = (props) => {

	const [cards, setCards] = useState([])
	const [loading, setLoading] = useState(false)
	useEffect(() => {
		t.getRestApi().getToken()
		.then(token => {
			axios({
				url: `https://api.trello.com/1/members/me/boards?fields=name,url&key=${appKey}&token=${token}`
			}).then(boards => {
				console.log(boards)
			}) 
		})
	})
	return (
		<div>funket</div>
	)
}

ReactDOM.render(<Popup />, document.getElementById('root'))