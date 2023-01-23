const playground = document.querySelector('.snake__box--playground');
const scoreContainer = document.querySelector('.score');
const configPopup = document.querySelector('.snake__box--config');
const defaultDirection = 'r';
const defaultColumns = 10;
const defaultRows = 10;
const defaultIntervalMS = 500;
const defaultCoordinates = [
	{
		direction: 'r',
		col: 1,
		row: 1,
	},
];
const defaultFoodCoordinates = {
	col: undefined,
	row: undefined,
};

let interval, isGameStarted, foodCounter,
	columns,
	rows,
	direction,
	coordinates,
	foodCoordinates,
	specialFoodCoordinates,
	intervalMS;
setDefaultParams();
monitorMovements();

// ----------Functions-----------//
function setDefaultParams() {
	isGameStarted = false;
	foodCounter = 0;
	columns = defaultColumns;
	rows = defaultRows;
	direction = defaultDirection;
	coordinates = [...defaultCoordinates];
	foodCoordinates = { ...defaultFoodCoordinates };
	specialFoodCoordinates = { ...defaultFoodCoordinates };
	intervalMS = defaultIntervalMS;
}

function startGame() {
	resetGame();
	isGameStarted = true;
	showConfigPopup();
}

function resetGame() {
	isGameStarted = false;
	setDefaultParams();
	resetScore();
	resetPlayground();
	resetInterval();
}

function resetScore() {
	scoreContainer.innerHTML = 0;
}

function resetPlayground() {
	playground.innerHTML = '';
}

function resetFood() {
	const food = document.getElementById('food');
	if (food) {
		playground.removeChild(food);
	}
}

function resetInterval() {
	intervalMS = defaultIntervalMS;
	if (interval) {
		clearInterval(interval);
	}
}

function endGame() {
	isGameStarted = false;
	resetInterval();
	updateBestScore();
}

function monitorMovements() {
	document.addEventListener('keydown', (event) => {
		const name = event.key;
		switch (name) {
			case 'ArrowUp':
				direction = direction === 'd' ? 'd' : 'u';
				break;
			case 'ArrowDown':
				direction = direction === 'u' ? 'u' : 'd';
				break;
			case 'ArrowRight':
				direction = direction === 'l' ? 'l' : 'r';
				break;
			case 'ArrowLeft':
				direction = direction === 'r' ? 'r' : 'l';
				break;
			case ' ':
				clearInterval(interval);
				break;
			default:
				break;
		}
		if (isGameStarted && name !== ' ') {
			startMovement();
		}
	});
}

function showConfigPopup() {
	configPopup.style.display = 'block';
}

function configurationSelected() {
	const mode = document.querySelector("input[type='radio'][name=mode]:checked");
	const value = +mode.value;
	columns = value;
	rows = value;
	configPopup.style.display = 'none';
	updatePlayground();
	addHead();
	addFood();
	getBestScore();
}

function updatePlayground() {
	playground.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
	playground.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
	playground.style.display = 'grid';
}

function addHead() {
	const head = document.createElement('div');
	head.innerHTML = '<img class="apple" src = "./assets/images/head.png" />';
	head.className = 'item head';
	head.style.gridColumn = 1;
	head.style.gridRow = 1;
	playground.appendChild(head);
}

function addItem(col, row) {
	const item = document.createElement('div');
	item.className = 'item';

	item.style.gridColumn = col;
	item.style.gridRow = row;
	playground.appendChild(item);
}

function startMovement() {
	if (!isGameStarted) {
		return;
	}

	decreaseScore();
	clearInterval(interval);
	updateCoordinates();
	updateView();

	interval = setInterval(() => {
		if (!isGameStarted) {
			return;
		}
		decreaseScore();
		updateCoordinates();
		updateView();
	}, intervalMS);
}

function updateCoordinates() {
	if (!isGameStarted) {
		return;
	}
	const currentHeadCoordinates = coordinates[0];
	const updatedHeadCoordinates = getUpdatedHeadCoordinates(
		currentHeadCoordinates
	);
	const lastItemCoordinates = coordinates[coordinates.length - 1];

	for (let i = coordinates.length - 1; i >= 0; i--) {
		const newCoordinates =
			i === 0 ? updatedHeadCoordinates : coordinates[i - 1];

		coordinates[i] = newCoordinates;
	}

	checkIfFoodIsTaken(lastItemCoordinates);
	checkIfSpecialFoodIsTaken();

	const isHeadValid = isNewHeadValid(updatedHeadCoordinates);
	if (!isHeadValid) {
		endGame();
	}
}

function checkIfFoodIsTaken(lastItemCoordinates) {
	if (!areHeadAndFoodCoordinatedEqual()) {
		return;
	}

	foodCounter++;
	if (coordinates.length < (rows * columns) - 6) {
		coordinates.push(lastItemCoordinates);
		addItem(lastItemCoordinates.col, lastItemCoordinates.row);
		updateGameSpeed();
	}
	updateScore();
	resetFood();
	addFood();
	addSpecialFood();
}

function checkIfSpecialFoodIsTaken() {
	if (areHeadAndSpecialFoodCoordinatedEqual()) {
		removeSpecialFood();
		updateScore(500);
	}
}

function updateView() {
	const items = document.querySelectorAll('.item');
	for (let i = 0; i < coordinates.length; i++) {
		items[i].style.gridColumn = coordinates[i].col;
		items[i].style.gridRow = coordinates[i].row;
		updateItemsClassName(items[i], i, coordinates.length - 1);
	}
}

function updateItemsClassName(item, index, lastIndex) {
	if (index === 0) {
		item.className = `item head ${coordinates[index].direction}`;
		return;
	}
	if (index !== lastIndex) {
		const customClassName =
			coordinates[index - 1].direction + coordinates[index].direction;
		item.className = 'item ' + customClassName;
		return;
	}
	item.className = `item tail ${coordinates[index - 1].direction}`;
}

function getUpdatedHeadCoordinates(coordinates) {
	let x = coordinates.col;
	let y = coordinates.row;

	if (direction === 'r') {
		x = x < columns ? x + 1 : 1;
	}
	if (direction === 'l') {
		x = x > 1 ? x - 1 : columns;
	}
	if (direction === 'd') {
		y = y < rows ? y + 1 : 1;
	}
	if (direction === 'u') {
		y = y > 1 ? y - 1 : rows;
	}
	return {
		direction,
		col: x,
		row: y,
	};
}

function addFood() {
	const food = document.createElement('div');
	food.innerHTML = '<img class="apple" src = "./assets/images/apple.png" />';
	food.id = 'food';
	food.className = 'food';
	playground.appendChild(food);

	foodCoordinates = getRandomFoodCoordinates();
	food.style.gridColumn = foodCoordinates.col;
	food.style.gridRow = foodCoordinates.row;
}

function addSpecialFood() {
	if (foodCounter % 5 !== 0) {
		return;
	}

	const specialFood = document.createElement('div');
	specialFood.innerHTML =
		'<img class="special-food-img" src = "./assets/images/coin.jpg" />';
	specialFood.id = 'specialFood';
	specialFood.className = 'specialFood';
	playground.appendChild(specialFood);

	specialFoodCoordinates = getRandomSpecialFoodCoordinates();
	specialFood.style.gridColumn = specialFoodCoordinates.col;
	specialFood.style.gridRow = specialFoodCoordinates.row;

	setTimeout(() => {
		removeSpecialFood();
	}, 10 * defaultIntervalMS);
}

function getRandomSpecialFoodCoordinates() {
	const coordinates = getRandomFoodCoordinates();
	if (
		coordinates.row === foodCoordinates.row &&
		coordinates.col === foodCoordinates.col
	) {
		return getRandomSpecialFoodCoordinates();
	}
	return coordinates;
}

function removeSpecialFood() {
	const specialFood = document.getElementById('specialFood');
	if (specialFood) {
		playground.removeChild(specialFood);
	}
}

function getRandomFoodCoordinates() {
	const randomCol = getRandomValue(columns);
	const randomRow = getRandomValue(rows);

	for (let i = 0; i < coordinates.length; i++) {
		if (coordinates[i].col === randomCol && coordinates[i].row === randomRow) {
			return getRandomFoodCoordinates();
		}
	}
	if (
		randomCol === specialFoodCoordinates.col &&
		randomRow === specialFoodCoordinates.row
	) {
		return getRandomFoodCoordinates();
	}

	return {
		direction: undefined,
		col: randomCol,
		row: randomRow,
	};
}

function getRandomValue(max = 1) {
	return Math.ceil(Math.random() * max);
}

function areHeadAndFoodCoordinatedEqual() {
	return (
		coordinates[0].row === foodCoordinates.row &&
		coordinates[0].col === foodCoordinates.col
	);
}

function areHeadAndSpecialFoodCoordinatedEqual() {
	return (
		coordinates[0].row === specialFoodCoordinates.row &&
		coordinates[0].col === specialFoodCoordinates.col
	);
}

function updateScore(value = 100) {
	scoreContainer.innerHTML = value + Number(scoreContainer.innerHTML);
}

function decreaseScore(val = 1) {
	scoreContainer.innerHTML = -val + Number(scoreContainer.innerHTML);
}

function isNewHeadValid(updatedHeadCoordinates) {
	let valid = true;
	for (let i = coordinates.length - 1; i > 0; i--) {
		if (
			updatedHeadCoordinates.col === coordinates[i].col &&
			updatedHeadCoordinates.row === coordinates[i].row
		) {
			valid = false;
			break;
		}
	}
	return valid;
}

function updateGameSpeed() {
	const index = rows >= 10 ? 10 : 5;
	if (coordinates.length % index === 0) {
		intervalMS = intervalMS * 0.85;
	}
}

function getBestScore() {
	const bestScore = document.querySelector('.best-score');
	const statistics = getStatisticsFromStorage();
	const size = getGameSize();
	bestScore.innerHTML = statistics[size];
}

function updateBestScore() {
	const statistics = getStatisticsFromStorage();
	const size = getGameSize();
	const score = +scoreContainer.innerHTML;

	if (statistics[size] < score) {
		const value = JSON.stringify({
			...statistics, [size]: score
		});
		localStorage.setItem('snake-statistics', value)
	}
}

function getStatisticsFromStorage() {
	const defaultStatistics = { s: 0, m: 0, l: 0 };
	const statistics = localStorage.getItem('snake-statistics');
	return statistics ? JSON.parse(statistics) : defaultStatistics;
}

function getGameSize() {
	return rows < 10 ? 's' : rows === 10 ? 'm' : 'l';
}

function onDirectionButtonClick(d) {
	direction = d;
	startMovement();
}