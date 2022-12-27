const horses = [
  'Hilda',
  'Secretariat',
  'Eclipse',
  'Absent',
  'Parametr',
  'Bucephalus',
  'Kopengagen',
  'King',
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
// вибірка елементів
const refs = {
  btnStart: document.querySelector('.js-btn'),
  form: document.querySelector('.js-form'),
  select: document.querySelector('#select'),
  userBalance: document.querySelector('.js-user-balance'),
  progress: document.querySelector('.js-progress'),
  winnerField: document.querySelector('.js-winner-field'),
  tableBody: document.querySelector('.js-result-table > tbody'),
  tableBodyHistory: document.querySelector('.js-table-history'),
};

// додаємо слухачів

refs.btnStart.addEventListener('click', onStartRace);
refs.form.addEventListener('submit', onFormSubmit);

let runResult = [];
let userBalance = 100;
let userRate = 0;
let selectedHorse = null;

refs.userBalance.textContent = userBalance;
onLocalStorageSet(); // вносимо історію переможців у localStorage
renderSelectField(horses); // рендеримо Selections
//  Створюємо Promise

function run(horse) {
  return new Promise(resolve => {
    const time = getRandomeTime(2000, 3500);

    setTimeout(() => {
      resolve({ horse, time });
    }, time);
  });
}

// Сет функцій
function onStartRace() {
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
    updateProgressField('The race has finished 🥇. You can do new rate 💰');

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

  if (userBalance < +rate.value) {
    return console.log('Not enougth money');
  }
  if (rate.value === '' || +rate.value <= 0) {
    return console.log('Wrong your rate');
  }
  userBalance -= +rate.value;
  refs.userBalance.textContent = userBalance;
  rate.value = '';
}

function rateResult(horse) {
  const isResult = horse === selectedHorse;
  return isResult ? win() : lose();
}

function win() {
  userRate *= 10;
  userBalance += userRate;
  refs.userBalance.textContent = userBalance;
  console.log(`You win ${userRate} $ and now you balanse ${userBalance} $`);
}
function lose() {
  console.log('You lost');
}
// poбота з LocalStorage
function onLocalStorageSet() {
  let savedData = localStorage.getItem('rases-history');
  savedData = savedData ? JSON.parse(savedData) : horsesHistory; //перевіряємо якщо дані в LocalStorafe є, то перезаписуємо їх, якщо немає, створюємо обєкт з такими властивостями
  updateHistoryTable(savedData);
}

function updateHistoryTable(historyData) {
  const trArr = historyData
    .map(
      ({ name, victories }) => `<tr>
            <td>${name}</td>
            <td>${victories}</td>
          </tr>`
    )
    .join('');
  refs.tableBodyHistory.innerHTML = trArr;
}
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

function renderSelectField(horses) {
  const selectList = horses
    .map(horse => `<option value="${horse}">${horse}</option>`)
    .join('');
  refs.select.innerHTML = selectList;
}

function getRandomeTime(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
