const express = require('express')
const app = express()

app.use(express.static('dist'));


app.post('trelloCallback', async (res, res) => {
	return res.send({message: 'Webhook created'})
})

app.get('*', (req, res) => {
	res.sendFile(__dirname + '/dist/index.html')
})

const listener = app.listen(3000, () => {
	console.log(`Server Ready on port ${listener.address().port}`)
})

