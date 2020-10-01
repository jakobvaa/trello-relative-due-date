const express = require('express')
const serverless = require('serverless-http')

const app = express()

const router = express.Router()
router.get('/', (req, res) => {
	res.send({message: 'geigei'})
})

app.use('/api', router)

module.exports.handler = serverless(app)

app.get('*', (req, res) => {
	res.sendFile(__dirname__ + 'dist/index.html')
})

const listener = app.listen(process.env.PORT, () => {
	console.log(`Server Ready on port ${listener.address().port}`)
})

