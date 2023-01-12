const axios = require('axios')
const {updateChildren } = require('./boardFunctions')
const {BASE_URL} = require('./constants')
const {appKey} = require('./constants')

export const generateBadgeText = (card) => {
  const beforeOrAfter = card.difference > 0 ? 'After' : 'Before'
  const isPlural = Math.abs(card.difference) !== 1 ? 's' : ''
  return `${Math.abs(card.difference)} month${isPlural} ${beforeOrAfter} ${card.parent} `
}

export const verifyCard = async (t) => {
  const trelloCard = await t.card('all')
  const list = await t.list('name')
  const board = await t.board('id')
  const listName = list.name
  const cardMetadata = await axios({
    url: `/getcard?cardid=${trelloCard.id}&boardid=${board.id}`
  })
  let relativeCard = cardMetadata.data.card
  if(!relativeCard) {
    const labels = trelloCard.labels.map(label => label.name)
    const description = trelloCard.desc
    relativeCard = await axios({
      method: 'PUT',
      url: '/addcard',
      data: {
        boardId: board.id,
        cardId: trelloCard.id,
        due_date: trelloCard.due,
        cardName: trelloCard.name,
        labels: labels,
        url: trelloCard.url,
        description,
        listName
      }
    })
    relativeCard = relativeCard.data.card
  }
  if(trelloCard.due !== relativeCard.due_date) {
    if(relativeCard.parent){
      const {cardId, due_date, boardId} = relativeCard
      await axios({
        url: `/removeparent`,
        method: 'PUT',
        data: {
          boardId,
          cardId
        }
      })
      return
    }
    relativeCard.due_date = trelloCard.due
    await axios({
      method: 'POST',
      url: '/updatedate',
      data: {
        cardId: relativeCard.cardId,
        due_date: relativeCard.due_date,
        boardId: board.id
      }
    })
    const token = await t.getRestApi().getToken()

    const relativeBoard = await axios({
      url: `/getboard?boardid=${board.id}`
    })
    const relativeCards = relativeBoard.data.board
    await updateChildren(relativeCard, relativeCards, token)
  }

  if(trelloCard.name !== relativeCard.cardName) {
    relativeCard = await axios({
      method: 'POST',
      url: '/updatename',
      data: {
          cardId: relativeCard.cardId,
          cardName: trelloCard.name,
          boardId: relativeCard.boardId
      }
    })
  }
  const labels = trelloCard.labels.map(label => label.name)
  if(JSON.stringify(labels) !== JSON.stringify(relativeCard.labels)) {
    relativeCard = await axios({
      method: 'POST',
      url: '/updatelabels',
      data: {
        cardId: relativeCard.cardId,
        boardId: board.id,
        labels
      }
    })
  }
  if(trelloCard.desc !== relativeCard.description) {
    relativeCard = await axios({
      method: 'POST',
      url: '/updatedescription',
      data: {
        cardId: relativeCard.cardId,
        boardId: board.id,
        description: trelloCard.desc
      }
    })

    if(listName !== relativeCard.listName) {
      relativeCard = await axios({
        method: 'POST',
        url: '/updatelist',
        data: {
          cardId: relativeCard.cardId,
          boardId: board.id,
          listName
        }
      })
    }
  }


  if(relativeCard.parent) {
    return [{text: generateBadgeText(relativeCard)}]
  }

  return [{text: 'No dependencies'}]
}
