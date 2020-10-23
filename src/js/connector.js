const axios = require('axios')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg'
const BASE_URL = 'https://api.trello.com/1/'
const appKey = 'f37ab50db205f3dc8f32dc97971117f4'
const appName = 'relative-due-date'
const { checkBoard, updateChildren } = require('./boardFunctions')


const onBtnClick = (t, opts) => {
  t.getRestApi().getToken()

  return t.popup({
    title: 'Cards',
    url: './popup.html'
  })
}

const showIframe = (t) => {
  return t.popup({
    title: 'Authorize to continue',
    url: './authorize.html'
  })
}

const generateBadgeText = (card, parent) => {
  const beforeOrAfter = card.difference > 0 ? 'After' : 'Before'
  return `${Math.abs(card.difference)} months ${beforeOrAfter} ${parent.cardName} `
}

const verifyCard = async (t) => {
  const trelloCard = await t.card('all')
  const cardMetadata = await axios({
    url: `/getcard?cardid=${trelloCard.id}`
  })
  let relativeCard = cardMetadata.data.card
  if(!relativeCard) {
    const boardId = await t.board('id')
    relativeCard = await axios({
      method: 'PUT',
      url: '/addcard',
      data: {
        boardId: boardId.id,
        cardId: trelloCard.id,
        due_date: trelloCard.due,
        cardName: trelloCard.name
      }
    })
    relativeCard.data.card
  }
  if(trelloCard.due !== relativeCard.due_date) {
    if(relativeCard.parent){
      const {cardId, due_date} = relativeCard
      const token = await t.getRestApi().getToken()
      await axios({
        method: 'PUT',
        url: `${BASE_URL}cards/${cardId}?key=${appKey}&token=${token}&due=${due_date}`
      })
      return
    }
    relativeCard.due_date = trelloCard.due
    console.log(relativeCard.due_date)
    await axios({
      method: 'POST',
      url: '/updatedate',
      data: {
        cardId: relativeCard.cardId,
        due_date: relativeCard.due_date
      }
    })
    const token = await t.getRestApi().getToken()
    const board = await t.board('id')
    const { id } = board
    const relativeBoard = await axios({
      url: `/getboard?boardid=${id}`
    })
    const relativeCards = relativeBoard.data.board
    await updateChildren(relativeCard, relativeCards, token)
  }

  if(relativeCard.parent) {
    const parent = await axios({
      url: `/getcard?cardid=${relativeCard.parent}`
    })
    return [{text: generateBadgeText(relativeCard, parent.data.card)}]
  }

  return [{text: 'No dependencies'}]
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
  'board-buttons': (t, opts) => {
    return [{
      text: 'Sync Relative Dates',
      callback: checkBoard
    }]
  }
},
{
  appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})