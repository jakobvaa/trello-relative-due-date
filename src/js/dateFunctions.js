const ics = require('ics')
const {saveAs} = require('file-saver')
const generateCalendar = async (t, label) => {
	const cards = t.cards('all')
	const calendarCards = []
	cards.forEach(card => {
		const calendarCard = card.labels.find(lab => lab.name === label)
		if(calendarCard) {
			calendarCards.push(calendarCard)
		}
	})
	const calendarEvents = calendarCards.map(card => {
		const dueDate = new Date(card.due)
		return {
			start: [
				dueDate.getFullYear(),
				dueDate.getMonth(),
				dueDate.getDate(),
				10,
				0
			],
			duration: {hours: 1},
			description: card.desc,
			url: card.url,
		}
	})
	console.log(calendarEvents)
	const {err, value} = ics.createEvent(calendarEvents)
	console.log(value)
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