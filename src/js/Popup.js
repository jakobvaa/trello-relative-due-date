import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

const t = TrelloPowerUp.iframe({
	appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})

const Popup = (props) => {

	const [cards, setCards] = useState([])

	useEffect(() => {
		t.getRestApi().getToken()
		.then(token => {
			console.log(token)
		})
	})
	return (
		<div>funket</div>
	)
}

ReactDOM.render(<Popup />, document.getElementById('root'))