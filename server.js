const express = require('express')
const app = express()
const {read, write } = require('./readWritePromise')
app.use(express.json())

app.post('/trelloCallback', async (req, res) => {
	console.log('Change happened')
	console.log(req.body)
	return res.status(200).send({message: 'Webhook created'})
})

app.get('/changeduedate', async (req, res) => {
	const {child, parent, difference, boardid} = req.query
	try {
		const doc = JSON.parse(await read('./dates.json'))
		console.log(doc)
		const currentDates = doc[boardid]

		if(!currentDates) {
			currentDates = {
				[child] : {
					parent: parent,
					difference,
				},
				[parent]: {
					children: [child]
				}
			}
		} else {
			currentDates[child] = {
				parent: parent,
				difference,
				...currentDates[child]
			}
			if (currentDates[parent].children) {
				currentDates[parent].children = [...currentDates[parent].children, child]
			}
			else { 
				currentDates[parent].children = [child]
			}
		}
		await write('../dates.json', doc)
		console.log('successfully added new date')
	} catch(err) {
		console.log(err)
	}
})

app.use(express.static('dist'));

app.get('*', (req, res) => {
	res.sendFile(__dirname + '/dist/index.html')
})

const listener = app.listen(3000, () => {
	console.log(`Server Ready on port ${listener.address().port}`)
})

