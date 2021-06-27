const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const appName = 'relative-due-date'
const BASE_URL = 'https://api.trello.com/1/'
const axios = require('axios')

export const verifyRules = async (t, card, list) => {
	const token = await t.getRestApi().getToken()
	const response = await axios({
		method: 'GET',
		url: `${BASE_URL}cards/${card.id}/checklists?key=${appKey}&token=${token}`
	})
	let currentChecklists = response.data

	const l = await t.lists('all')
	const rulesList = l.find(newList => card.name.includes(newList.name))
	const { cards } = rulesList
	if(cards.length === 0) return
	currentChecklists.forEach(async checklist => {
		if(!cards.find(card => card.name === checklist.name)) {
			await axios({
				method: 'DELETE',
				url: `${BASE_URL}checklists/${checklist.id}?key=${appKey}&token=${token}`
			})
		}
	})
	const newChecklist = await axios({
		method: 'GET',
		url: `${BASE_URL}cards/${card.id}/checklists?key=${appKey}&token=${token}`
	})
	currentChecklists = newChecklist.data
	cards.forEach(async newCard => {
		const response = await axios({
			method: 'GET',
			url: `${BASE_URL}cards/${newCard.id}/checklists?key=${appKey}&token=${token}`
		})
		const checklists = response.data
		const requirements = checklists.find(checklist => checklist.name === 'IEEE CIS Requirements')
		if (requirements) {
			const faultyChecklist = currentChecklists.find(checklist => checklist.name === newCard.name)
			console.log(faultyChecklist)
			
			if(!faultyChecklist.find(item => item.name === card.url)) {
				await axios({
					method: 'POST',
					url: `${BASE_URL}checklists/${newChecklist.data.id}/checkItems?
					key=${appKey}&token=${token}&name=${encodeURI(card.url)}&checked=true}`
				})
			}
			if (!faultyChecklist) {
				try {
					const newChecklist = await axios({
						method: 'POST',
						url: `${BASE_URL}checklists?key=${appKey}&token=${token}&name=${encodeURI(newCard.name)}&idCard=${card.id}`
					})				
					const promises = requirements.checkItems.map(requirement => {
						return axios({
							method: 'POST',
							url: `${BASE_URL}checklists/${newChecklist.data.id}/checkItems?
							key=${appKey}&token=${token}&name=${encodeURI(requirement.name)}&checked=${requirement.state === 'complete'}
							`
						})
					})
					await Promise.all(promises)
				} catch(e) {
					console.log('56', e, newCard.name)
				}
			} else {
				try {
					const promises = []
					const correctNames = requirements.checkItems.map(checkItem => checkItem.name)
					const faultyCheckItems = faultyChecklist.checkItems.filter(checkItem => 
						!correctNames.includes(checkItem.name))
					faultyCheckItems.forEach(checkItem => {
						promises.push(axios({
							method: 'DELETE',
							url: `
								${BASE_URL}checklists/${faultyChecklist.id}/checkItems/${checkItem.id}?key=${appKey}&token=${token}
							`
						}))
					})
	
					const correctNamesInFaulty = faultyChecklist.checkItems.filter(checkItem => (
						correctNames.includes(checkItem.name)
					))
					const correctItemNames = correctNamesInFaulty.map(item => item.name)
					correctNamesInFaulty.forEach(item => {
						const correspondingRequirement = requirements.checkItems.filter(req => req.name === item.name)[0]
						if (item.state !== correspondingRequirement.state) {
							promises.push(axios({
								method: 'DELETE',
								url: `${BASE_URL}checklists/${faultyChecklist.id}/checkItems/${item.id}?key=${appKey}&token=${token}`
							}))
							promises.push({
								method: 'POST',
								url: `
									${BASE_URL}checklists/${faultyChecklist.id}/checkItems?
									key=${appKey}&token=${token}&name=${encodeURI(correspondingRequirement.name)}
									&checked=${correspondingRequirement.state === 'complete'}&pos=top
								`
							})
						}
					})
					const addCheckItems = requirements.checkItems.filter(item => (
						!correctItemNames.includes(item.name)
					))
					addCheckItems.forEach(item => {
						promises.push(axios({
							method: 'POST',
							url: `
							${BASE_URL}checklists/${faultyChecklist.id}/checkItems?
							key=${appKey}&token=${token}&name=${encodeURI(item.name)}&checked=${item.state === 'complete'}
							`
						}))
					})
					await Promise.all(promises)
				} catch(e) {
					console.log(91, e, newCard.name)
				}

			}
		} else {
			const shouldDelete = currentChecklists.find(checklist => checklist.name === newCard.name)
			if (shouldDelete) {
				await axios({
					method: 'DELETE',
					url: `${BASE_URL}checklists/${shouldDelete.id}?key=${appKey}&token=${token}`
				})
			}
		}
	})
}