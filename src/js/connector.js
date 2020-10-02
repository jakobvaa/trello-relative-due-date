console.log('Hello world')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg'

const onBtnClick = (t, opts) => {
  return t.popup({
    title: 'Possible cards',
    items: [{
      text: 'Test 1'
    }, {
      text: 'Test 2'
    }]
  })
}

const showIrame = (t) => {
  return t.popup({
    title: 'Authorize to continue',
    url: '../html/authorize.html'
  })
}

window.TrelloPowerUp.initialize({
  'card-buttons': function(t) {
    return t.getRestApi()
      .isAuthorized()
      .then(function(isAuthorized) {
        if (isAuthorized) {
          return [{
            text: 'Relative due date',
            callback: showMenu
          }];
        } else {
          return [{
            text: 'David\'s Power-Up',
            callback: showIframe
          }];
        }
      });
  }
}, {
  appKey: 'your-app-key',
  appName: 'My Great Power-Up'
})