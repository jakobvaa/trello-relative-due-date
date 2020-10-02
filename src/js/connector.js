console.log('Hello world')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg'

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

window.TrelloPowerUp.initialize({
  'card-buttons': (t) => {
    return t.getRestApi()
      .isAuthorized()
      .then((isAuthorized) => {
        if (isAuthorized) {
          return [{
            text: 'Relative due date',
            callback: test
          }];
        } else {
          return [{
            text: 'Relative due date',
            callback: showIframe
          }];
        }
      });
  }
}, {
  appKey: 'f37ab50db205f3dc8f32dc97971117f4',
	appName: 'relative-due-date'
})