console.log('Hello world')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

const onBtnClick = (t, opts) => {
  return t.popup({
    title: 'Possible cards',
    items: [{
      text: 'Test 1'
    }, {
      text: 'Test 2'
    }]
  })  
};



window.TrelloPowerUp.initialize({
  'card-buttons': async (t, opts) => {
    const rest = await t.getRestApi()
    const isAuthorized = rest.isAuthorized()
    if (isAuthorized) {
      return [{
        text: 'Relative due date',
        callback: onBtnClick
      }]
    } else {
      return [{
        text: 'Unauthorized'
      }]
    }
  }
});