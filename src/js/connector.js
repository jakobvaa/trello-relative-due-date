const axios = require('axios')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg'
const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const appName = 'relative-due-date'


const onBtnClick = (t, opts) => {
  t.getRestApi().getToken()

  return t.popup({
    title: 'Cards',
    url: './popup.html'
  })
}

const showIrame = (t) => {
  return t.popup({
    title: 'Authorize to continue',
    url: './authorize.html'
  })
}

const test = (t) => {
  return t.popup({
    title: 'cards',
    items: [{
      text: 'fdfd'
    }, {
      text: 'fdfdfdfss'
    }]
  })
}

const verifyCard = async (t) => {
  const card = await t.card('all')
  const token = await t.getRestApi().getToken()
  const boards = await axios ({
    url: `${BASE_URL}members/me/boards?fields=name,url&key=${appKey}&token=${token}`
  })
  const boardId = boards.data.find(board => board.name === 'IEEE Conference')
  const verify = await axios({
    method: 'POST',
    url: '/verifydate',
    data: {
      cardName: card.name,
      cardId: card.id,
      due_date: card.due,
      boardId: boardId.id
    }
  })

  const cardMetadata = await axios({
    url: `/getcard?cardid=${card.id}`
  })
  if(cardMetadata.data.parent) {
    const parent = await axios({
      url: `/getcard?cardId=${cardMetadata.data.parent}`
    })
    return [{text: `Dependency of ${parent.data.CardName}`}]
  }

  return [{text: 'fdfd'}]
}


const getCardBadges = (t, opts) => {
  t.card('all').then(card => {
    console.log(card)
  })
  return [{text: 'fdfd'}]
}

window.TrelloPowerUp.initialize({
  'card-buttons': (t) => {
    return t.getRestApi()
      .isAuthorized()
      .then((isAuthorized) => {
        if (isAuthorized) {
          return [{
            text: 'Relative due date',
            callback: onBtnClick
          }];
        } else {
          return [{
            text: 'Relative due date',
            callback: showIframe
          }];
        }
      });
    },
  'card-badges': verifyCard,
},
{
  appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})