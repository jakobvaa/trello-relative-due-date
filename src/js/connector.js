
console.log('Hello world')
const GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';

const onBtnClick = (t, opts) => {
  console.log('clicked the button');
};



window.TrelloPowerUp.initialize({
  'card-buttons': (t, opts) => {

    return [{
      // usually you will provide a callback function to be run on button click
      // we recommend that you use a popup on click generally
      icon: GRAY_ICON, // don't use a colored icon here
      text: 'Relative Due Date',
      callback: onBtnClick,
      condition: 'edit'
    }];
  }
});