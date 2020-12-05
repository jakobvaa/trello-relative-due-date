const {Component, Property} = require('immutable-ics')
const {saveAs} = require('file-saver')
const generateCalendar = async (t, label) => {
	const cards = await  t.cards('all')
	const versionProperty = new Property({name: 'VERSION', value: 2})
	let calendar
	calendar = new Component({name: 'VCALENDAR'})
	calendar = calendar.pushProperty(versionProperty)
	const calendarCards = []
	cards.forEach(card => {
		const hasLabel = card.labels.find(lab => lab.name === label)
		if(hasLabel && card.due) {
			calendarCards.push(card)
		}
	})
	calendarCards.forEach(card => {
		let event
		event = new Component({name: 'VEVENT'})
		const start = new Property({
			name: 'DTSTART',
			parameters: {VALUE: 'DATE'},
			value: new Date(card.due)
		})
		event = event.pushProperty(start)
		const duration = new Property({
			name: 'DURATION',
			value: 'PT1H'
		})
		event = event.pushProperty(duration)
		const description = new Property({
			name: 'DESCRIPTION',
			value: card.desc
		})
		event = event.pushProperty(description)
		const url = new Property({
			name: 'URL',
			value: card.url
		})
		event = event.pushProperty(url)
		const title = new Property({
			name: 'SUMMARY',
			value: card.name
		})
		event = event.pushProperty(title)
		calendar = calendar.pushComponent(event)
	})
	const blob = new Blob([calendar.toString()], {type: 'text/plain;charset=utf-8'})
	saveAs(blob, `${label}-calendar.ics`)
}

const openSecondaryPopup = (t, label) => {
	return t.popup({
		'title': 'Download Calendar or subscribe to it',
		items: [{
			text: 'GC',
			callback: (t) => generateCalendar(t, label)
		}]
	})
}

export const calendarPopup = (t, label) => {
	return t.popup({
		title: 'Sync Calendar based on label',
		items: [
			{
				text: 'General Chair',
				callback: () =>  openSecondaryPopup(t, 'GC')
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