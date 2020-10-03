const express = require('express')
const app = express()

app.post('/trelloCallback', async (req, res) => {
	return res.status(200).send({message: 'Webhook created'})
})

app.use(express.static('dist'));

app.get('*', (req, res) => {
	res.sendFile(__dirname + '/dist/index.html')
})

const listener = app.listen(3000, () => {
	console.log(`Server Ready on port ${listener.address().port}`)
})

