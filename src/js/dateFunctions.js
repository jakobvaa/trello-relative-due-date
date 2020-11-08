const ics = require('ics')
const {Component, Property} = require('immutable-ics')
const {saveAs} = require('file-saver')
const generateCalendar = async (t, label) => {
	const cards = await  t.cards('all')
	const versionProperty = new Property({name: 'VERSION', value: 2})
	const calendar = new Component({name: 'VCALENDAR'})
	calendar.pushProperty(versionProperty)
	const calendarCards = []
	cards.forEach(card => {
		const hasLabel = card.labels.find(lab => lab.name === label)
		if(hasLabel && card.due) {
			calendarCards.push(card)
		}
	})
	calendarCards.forEach(card => {
		const event = new Component({name: 'VEVENT'})
		const start = new Property({
			name: 'DTSTART',
			parameters: {VALUE: 'DATE'},
			value: new Date(card.due)
		})
		event.pushProperty(start)
		const duration = new Property({
			name: 'DURATION',
			value: 'PT1H'
		})
		event.pushProperty(duration)
		const description = new Property({
			name: 'DESCRIPTION',
			value: card.desc
		})
		event.pushProperty(description)
		const url = new Property({
			name: 'URL',
			value: card.url
		})
		event.pushProperty(url)
		calendar.pushComponent(event)
	})
	// const calendarEvents = calendarCards.map(card => {
	// 	const dueDate = new Date(card.due)
	// 	return {
	// 		start: [
	// 			dueDate.getFullYear(),
	// 			dueDate.getMonth(),
	// 			dueDate.getDate(),
	// 			10,
	// 			0
	// 		],
	// 		duration: {hours: 1},
	// 		description: card.desc,
	// 		url: card.url,
	// 	}
	// })
	// console.log(calendarEvents)
	// const {err, value} = ics.createEvent(calendarEvents)
	// console.log(value)
	const blob = new Blob([calendar.toString()], {type: 'text/plain;charset=utf-8'})
	saveAs(blob, `${label}-calendar.ics`)
}

export const calendarPopup = (t, opts) => {
	return t.popup({
		title: 'Sync Calendar based on label',
		items: [
			{
				text: 'General Chair',
				callback: () =>  generateCalendar(t, 'GC')
			},
			{
				text: 'Technical Program Chair',
				callback: () => generateCalendar(t, 'TPC')
			},
			{
				text: 'Financial Chair',
				callback: () => generateCalendar(t, 'FC')
			},
			{
				text: 'Publicity Chair',
				callback: () => generateCalendar(t, 'PuC')
			},
			{
				text: 'Local Chair',
				callback: () => generateCalendar(t, 'LC')
			},
			{
				text: 'Proceedings Chair',
				callback: () => generateCalendar(t, 'PrC')
			}
		]
	})
}