import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';

const horses = [
  'Hilda',
  'Secretariat',
  // 'Eclipse',
  // 'Absent',
  // 'Parametr',
  // 'Bucephalus',
  // 'Kopengagen',
  // 'King',
];

const horsesHistory = [
  { name: 'Hilda', victories: 0 },
  { name: 'Secretariat', victories: 0 },
  { name: 'Eclipse', victories: 0 },
  { name: 'Absent', victories: 0 },
  { name: 'Parametr', victories: 0 },
  { name: 'Bucephalus', victories: 0 },
  { name: 'Kopengagen', victories: 0 },
  { name: 'King', victories: 0 },
];
// choose items
const refs = {
  btnStart: document.querySelector('.js-btn-bet'),
  btnOnlyRace: document.querySelector('.js-btn-race'),
  form: document.querySelector('.js-form'),
  select: document.querySelector('#select'),
  userBalance: document.querySelector('.js-user-balance'),
  progress: document.querySelector('.js-progress'),
  winnerField: document.querySelector('.js-winner-field'),
  tableBody: document.querySelector('.js-result-table > tbody'),
  tableBodyHistory: document.querySelector('.js-table-history'),
};

// add listener
refs.form.addEventListener('submit', onFormSubmit);
refs.btnStart.addEventListener('click', onStartRaceWithBet);

refs.btnOnlyRace.addEventListener('click', onStartRace);

// Base settings

let runResult = [];
let userBalance = 100;
let userRate = 0;
let selectedHorse = null;

refs.userBalance.textContent = userBalance;
onLocalStorageSet(); // add history of the winners to the localStorage
renderSelectField(horses); // rendering Selections

//  create Promise

function run(horse) {
  return new Promise(resolve => {
    const time = getRandomeTime(2000, 3500);

    setTimeout(() => {
      resolve({ horse, time });
    }, time);
  });
}

// Сет функцій
function onStartRaceWithBet() {
  console.log('userRate', userRate);

  if (!checkUserValue(userRate)) {
    console.log('****');
    return;
  }

  updateWinnerField('');
  updateProgressField('🐴The race has begun. Wait result.🐴');

  const promises = horses.map(horse => run(horse)); // cтворюємо масив промісів

  // Визначаємо одного переможця (найшвидший проміс)
  Promise.race(promises).then(({ horse, time }) => {
    updateWinnerField(`Won horse "${horse}" at time ${time}.`);

    rateResult(horse);

    noteWinner(horse);
    onLocalStorageSet();
  });

  // Виводимо результати всього забігу
  Promise.all(promises).then(x => {
    updateProgressField('The race has finished 🥇. You can do new bet 💰');
    runResult.push(x);
    runResult = runResult[0].sort((a, b) => a.time - b.time);
    updateResultTable(runResult);
    runResult.length = 0;
  });
}

function updateWinnerField(message) {
  refs.winnerField.textContent = message;
}
function updateProgressField(message) {
  refs.progress.textContent = message;
}
function updateResultTable(result) {
  const trArr = result
    .map(
      ({ horse, time }, ind) => `<tr>
            <td>${ind + 1}</td>
            <td>${horse}</td>
            <td>${time}</td>
          </tr>`
    )
    .join('');
  refs.tableBody.innerHTML = trArr;
}

// TODO *************************************
function onFormSubmit(evt) {
  evt.preventDefault();

  const { selectName, rate } = evt.currentTarget.elements;
  selectedHorse = selectName.value;
  userRate = +rate.value;
  console.log('userRate', userRate);

  if (checkUserValueForSubmit(userRate)) {
    userBalance -= +rate.value;
    refs.userBalance.textContent = userBalance;
    rate.value = '';
    // rateResult(selectedHorse);
  }
}

// function checking result of the race
function rateResult(horse) {
  const isResult = horse === selectedHorse;
  return isResult ? win(horse) : lose(horse);
}

function win(horse) {
  userRate *= 10;
  userBalance += userRate;
  refs.userBalance.textContent = userBalance;
  Report.success(
    `You win ${userRate} $`,
    `Won ${horse} and now you balanse ${userBalance} $`,
    'Okay'
  );
}
function lose(horse) {
  Report.failure('You lost', `Won ${horse}`, 'Okay');
}
// work with LocalStorage
function onLocalStorageSet() {
  let savedData = localStorage.getItem('rases-history');
  savedData = savedData ? JSON.parse(savedData) : horsesHistory; //перевіряємо якщо дані в LocalStorafe є, то перезаписуємо їх, якщо немає, створюємо обєкт з такими властивостями
  updateHistoryTable(savedData);
}

function updateHistoryTable(historyData) {
  const markupHistoryTable = historyData
    .map(
      ({ name, victories }) => `<tr>
            <td>${name}</td>
            <td>${victories}</td>
          </tr>`
    )
    .join('');
  refs.tableBodyHistory.innerHTML = markupHistoryTable;
}

// write winner to history table
function noteWinner(winner) {
  let savedData = localStorage.getItem('rases-history');
  savedData = savedData ? JSON.parse(savedData) : horsesHistory;
  savedData.forEach(elem => {
    if (elem.name === winner) {
      elem.victories += 1;
      console.log(elem);
    }
  });
  localStorage.setItem('rases-history', JSON.stringify(savedData));
}

// add items to select field on page
function renderSelectField(horses) {
  const selectList = horses
    .map(horse => `<option value="${horse}">${horse}</option>`)
    .join('');
  refs.select.innerHTML = selectList;
}

function getRandomeTime(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function checkUserValue(userValue) {
  if (userValue === '') {
    Report.failure('Wrong your bet', 'Race was start without your bet', 'Okay');
    return false;
  }
  if (userValue < 0) {
    Report.failure('Wrong your bet', 'Your bet must be more then 0', 'Okay');
    return false;
  }
  if (userBalance < userValue) {
    Report.failure(
      'Wrong your bet',
      'You have not enough money on balance',
      'Okay'
    );
    return false;
  }
  console.log(true);

  return true;
}

function checkUserValueForSubmit(userValue) {
  if (userValue === '' || userValue < 0 || userBalance < userValue) {
    return false;
  }
  return true;
}

function onStartRace() {
  updateWinnerField('');
  updateProgressField('🐴The race has begun. Wait result.🐴');

  const promises = horses.map(horse => run(horse)); // cтворюємо масив промісів

  // Визначаємо одного переможця (найшвидший проміс)
  Promise.race(promises).then(({ horse, time }) => {
    updateWinnerField(`Won horse "${horse}" at time ${time}.`);

    noteWinner(horse);
    onLocalStorageSet();
  });

  // Виводимо результати всього забігу
  Promise.all(promises).then(x => {
    updateProgressField('The race has finished 🥇. You can do new rate 💰');
    runResult.push(x);
    runResult = runResult[0].sort((a, b) => a.time - b.time);
    updateResultTable(runResult);
    runResult.length = 0;
  });
}
