const axios = require('axios')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg'
const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'a21948406b564382c19a797995373c5a'
const appName = 'relative-due-date'
const { checkBoard, updateChildren } = require('./boardFunctions')
const {verifyCard, generateBadgeText} = require('./badgeFunctions')
const {calendarPopup} = require('./dateFunctions')
const {verifyRules } = require('./utils')
const openPopup = (t, opts) => {
  return t.popup({
    title: 'Cards',
    url: './popup.html',
    height: 350
  })
}

const showIframe = (t) => {
  return t.popup({
    title: 'Authorize to continue',
    url: './authorize.html'
  })
}

const authorize = (t) => {

}

const openDocumentation = (t) => {
  return t.modal({
    title: 'Help',
    url: './marked.html',
    fullscreen: true
  })
}

const openTimeline = (t) => {
  return t.modal({
    title: 'Conference Timeline',
    url: './timeline.html',
    fullscreen: true,
  })
}

window.TrelloPowerUp.initialize({
  'card-buttons': (t) => {
    return t.getRestApi()
      .isAuthorized()
      .then((isAuthorized) => {
        if (isAuthorized) {
          return [{
            text: 'Relative due date',
            callback: openPopup,
          }, 
          {
            text: 'CIS Timeline',
            callback: openTimeline
          }
        ];
        } else {
          return [{
            text: 'Relative due date',
            callback: showIframe
          }];
        }
      });
    },
  'card-badges': verifyCard,
  'board-buttons': async (t, opts) => {
      const isAuth = await t.getRestApi().isAuthorized()
      if(isAuth) {
        return [
          {
            text: 'Help',
            callback: openDocumentation
          },
          {
            text: 'CIS Timeline',
            callback: openTimeline
          }
      ]
      } else {
        return [{
            text: 'Authorize Power up',
            callback: showIframe
        }]
      }
  },
  'on-enable': (t, opts) => {
    return t.modal({
      url: './board-form.html',
      height: 500,
      title: 'Welcome to the Trello template for IEEE Conferences'
    })
  },
  'card-detail-badges': async (t, opts) => {
    const card = await t.card('all')
    const board = await t.board('all')
    const list = await t.list('name')
    if (list.name === 'IEEE CIS Rules Summary') { 
      await verifyRules(t, card, list)
    }
    
    const response = await axios(`/getcard?cardid=${card.id}&boardid=${board.id}`)
    const relativeCard = response.data.card
    if(relativeCard.parent) {
      return [{ title: 'Parent', text: generateBadgeText(relativeCard) }]
    } else {
      return []
    }
  }
},
{
  appKey: 'a21948406b564382c19a797995373c5a',
	appName: 'relative-due-date'
})
