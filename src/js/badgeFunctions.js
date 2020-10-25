const axios = require('axios')

const generateBadgeText = (card) => {
  const beforeOrAfter = card.difference > 0 ? 'After' : 'Before'
  return `${Math.abs(card.difference)} months ${beforeOrAfter} ${card.parent} `
}

export const verifyCard = async (t) => {
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
		relativeCard = relativeCard.data.card
		if(trelloCard.name === 'Conference Start Date') {
			t.popup({
				title: 'Welcome to Trello template for IEEE Conferences.',
				url: './board-form.html'
			})
		}
  }
  if(trelloCard.due !== relativeCard.due_date) {
    if(relativeCard.parent){
      const {cardId, due_date, parent, boardId} = relativeCard
      const token = await t.getRestApi().getToken()
      await axios({
        method: 'PUT',
        url: `${BASE_URL}cards/${cardId}?key=${appKey}&token=${token}&due=${due_date}`
      })
      return
    }
    relativeCard.due_date = trelloCard.due
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
    return [{text: generateBadgeText(relativeCard)}]
  }

  return [{text: 'No dependencies'}]
}