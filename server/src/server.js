const express = require('express')
const app = express()
const path = require('path')
const setupDB = require('./init/setupDB')
const setupLogger = require('./init/setupLogger')
const setupApi = require('./init/setupApi')
const cors = require('cors');

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
		app.use(cors({ origin: ['https://trello.com'] }));
		
		await setupDB(app)
        
		app.use(express.static('dist', {
			setHeaders: function (res, path) {
				res.set('Content-Security-Policy', "frame-ancestors 'self' https://trello.com;");
			}
		}

		));
		
		setupApi(app)
		
		app.get('*', (req, res) => {
			res.sendFile(path.resolve(__dirname, '../../dist/index.html'))
			console.log("Managed getting requirements and resolutions")
		})

		const listener = app.listen(process.env.PORT || 3000, () => {
			console.log(`Server Ready on port ${listener.address().port}`)
		})
	}
	startAsync().catch(err => {
		console.log(err)
		process.exit(1)
	})
}

start()
