const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const appName = 'relative-due-date'
const BASE_URL = 'https://api.trello.com/1/'
const axios = require('axios')

export const verifyRules = async (t, card) => {
	const token = await t.getRestApi().getToken()
	const currentChecklists = await axios({
		method: 'GET',
		url: `${BASE_URL}/cards/${card.id}/checklists/`
	})
	console.log(currentChecklists)
	
}