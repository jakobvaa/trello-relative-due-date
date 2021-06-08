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
	let currentChecklists = response.data

	const l = await t.lists('all')
	const rulesList = l.find(newList => card.name.includes(newList.name))
	const { cards } = rulesList
	currentChecklists.forEach(async checklist => {
		if(!cards.find(card => card.name === checklist.name)) {
			await axios({
				method: 'DELETE',
				url: `${BASE_URL}/checklists/${checklist.id}?key=${appKey}&token=${token}`
			})
		}
	})
	const newChecklist = await axios({
		method: 'GET',
		url: `${BASE_URL}/cards/${card.id}/checklists?key=${appKey}&token=${token}`
	})
	currentChecklists = newChecklist.data
	cards.forEach(async newCard => {
		const response = await axios({
			method: 'GET',
			url: `${BASE_URL}/cards/${newCard.id}/checklists?key=${appKey}&token=${token}`
		})
		const checklists = response.data
		console.log(checklists)
		const requirements = checklists.find(checklist => checklist.name === 'IEEE CIS Requirements')
		console.log(requirements, newCard.name)
		if(requirements) {
			const exists = !!currentChecklists.find(checklist => checklist.name === newCard.name)
			console.log(newCard.name, exists)
			if(!exists) {
				const newChecklist = await axios({
					method: 'POST',
					url: `${BASE_URL}/checklists?key=${appKey}&token=${token}&name=${newCard.name}&idCard=${card.id}`
				})
				const promises = requirements.map(requirement => {
					return axios({
						method: 'POST',
						url: `${BASE_URL}/checklists/${newChecklist.id}/checkItems?
						key=${appKey}&token=${token}&name=${requirement.name}
						`
					})
				})
				await Promise.all(promises)
			}
		}
	})
	
}