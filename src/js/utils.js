const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const appName = 'relative-due-date'
const BASE_URL = 'https://api.trello.com/1/'
const axios = require('axios')

export const verifyRules = async (t, card, list) => {
	const token = await t.getRestApi().getToken()
	const response = await axios({
		method: 'GET',
		url: `${BASE_URL}/cards/${card.id}/checklists?key=${appKey}&token=${token}`
	})
	const currentChecklists = response.data
	console.log(currentChecklists)
	const l = t.lists('all')
	console.log(lists)
	const rulesList = l.find(newList => newList.name.includes(list.name))
	const { cards } = rulesList
	cards.forEach(async newCard => {
		const checklists = await axios({
			method: 'GET',
			url: `${BASE_URL}/cards/${newCard.id}/checklists?key=${appKey}&token=${token}`
		})
		const requirements = checklists.find(checklist => checklist.name === 'IEEE CIS Requirements')
		if(requirements) {
			const exists = !!currentChecklists.find(checklist => checklist.name === newCard.name)
			console.log(newCard.name, exists)
		}
	})
	
}