const express = require('express')
const app = express()
const {read, write } = require('./readWritePromise')
require('dotenv').config()
app.use(express.json())

// Setup authorization

const OAuth = require('oauth').OAuth
const url = require('url')

const scope = 'read, write'
const requestURL = "https://trello.com/1/OAuthGetRequestToken"
const accessURL = "https://trello.com/1/OAuthGetAccessToken"
const authorizeURL = "https://trello.com/1/OAuthAuthorizeToken"
const appName = 'relative-due-date'
const expiration = '1hour'

const key = process.env.APP_KEY
const secret = process.env.APP_SECRET

const loginCallback = `${process.env.REDIRECT_URL}callback`

const oauth_secrets = {}
const oauth = new OAuth(requestURL, accessURL, key, secret, '1.0A', loginCallback, 'HMAC-SHA1')

const login = (req, res) => {
	oauth.getOAuthRequestToken((err, token, tokenSecret, results) => {
		oauth_secrets[token] = tokenSecret
		console.log('token')
		res.redirect(`${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}&expiration=${expiration}`)
	})
}

const callback = (req, res) => {
	const query = url.parse(req.url, true).query
	const token = query.oauth_token
	const tokenSecret = oauth_secrets[token]
	const verifier = query.oauth_verifier
	oauth.getOAuthAccessToken(token, tokenSecret, verifier, (err, accessToken, accessTokenSecret, results) => {
    oauth.getProtectedResource("https://api.trello.com/1/members/me", "GET", accessToken, accessTokenSecret, (error, data, response) => {
			console.log(accessToken)
		})
	})
}

app.get('/login', (req, res) => {
	login(req, res)
})

app.get('/callback', (req, res) => {
	console.log('fdsfds')
	callback(req, res)
})


app.post('/trelloCallback', async (req, res) => {
	console.log('Change happened')
	login(req, res)
})

app.get('/changeduedate', async (req, res) => {
	const {child, parent, difference, boardid} = req.query
	try {
		const doc = JSON.parse(await read('./dates.json'))
		console.log(doc)
		const currentDates = doc[boardid]
		
		if(!currentDates) {
			doc[boardid] = {
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
			if (currentDates[parent]) {
				currentDates[parent].children = [...currentDates[parent].children, child]
			}
			else { 
				currentDates[parent].children = [child]
			}
		}
		await write('./dates.json', JSON.stringify(doc))
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

