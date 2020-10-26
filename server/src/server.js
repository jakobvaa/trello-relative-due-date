const express = require('express')
const app = express()

const setupDB = require('./init/setupDB')
const setupLogger = require('./init/setupLogger')
const setupApi = require('./init/setupApi')

const start = async() => {
	let log = undefined
	const prestart = async () => {
		log = setupLogger()
	}
	await prestart().catch(err => {
		console.error(err)
		process.exit(1)
	})

	const startAsync = async () => {
		log.info('Application Starting')
		app.set('etag', true)
		app.use(express.json())
		await setupDB(app)
        console.log('hei')
        
		app.use(express.static('dist'));
		setupApi(app)
		app.get('*', (req, res) => {
			res.sendFile(__dirname + '/dist/index.html')
		})

		const listener = app.listen(3000, () => {
			console.log(`Server Ready on port ${listener.address().port}`)
		})
	}
	startAsync().catch(err => {
		console.log(err)
		process.exit(1)
	})
}

start()
