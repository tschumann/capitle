"use strict";

class CapitleGame {

	constructor(countries) {
		this.countries = countries;

		// get a list of country names to populate the dropdown
		this.countryNames = this.countries.map(country => country.CountryName).sort();

		// initialise the game state
		this.guesses = [];
		this.guessNumber = 1;
		this.correct = false

		const choices = document.getElementById("capital-city-country-choices");

		for (let i = 0; i < this.countryNames.length; i++){
			const option = document.createElement("option");
			option.value = this.countryNames[i];
			option.innerHTML = this.countryNames[i];
			choices.appendChild(option);
		}

		const now = new Date();
		this.date = now.getFullYear() + "-" + this.zeroPad(now.getMonth() + 1) + "-" + this.zeroPad(now.getDate());

		const today = new Date(now.getFullYear() + "-" + this.zeroPad(now.getMonth() + 1) + "-" + this.zeroPad(now.getDate()) + "T00:00:00+00:00");

		this.chooseInitialCountry(today.valueOf().toString(16));

		const savedState = localStorage.getItem("capitle-" + this.date);

		if (savedState) {
			const stateToRestore = JSON.parse(savedState);

			// restore game state
			this.guesses = stateToRestore.guesses;
			this.guessNumber = stateToRestore.guessCount;
			this.correct = stateToRestore.correct;

			this.processGuesses();
			this.checkGameState();
		}
	}

	zeroPad(value) {
		if (value < 10) {
			return "0" + value;
		}

		return value;
	}

	chooseInitialCountry(seed) {
		const maximumSeed = "ffffffffffff";

		// turn the current seed into an integer
		let currentValue = 0;
		for (let i = 0; i < seed.length; i++) {
			currentValue = currentValue + seed.charCodeAt(i);
		}

		// turn the highest possible seed into an integer
		let maximumValue = 0;
		for (let i = 0; i < maximumSeed.length; i++) {
			maximumValue = maximumValue + maximumSeed.charCodeAt(i);
		}

		// work out a country number by scaling the seed into the range of countries
		const countryNumber = Math.round(currentValue / maximumValue * this.countries.length);
		this.country = this.countries[countryNumber];

		// set the capital city name
		document.getElementById("capital-city-name").textContent = this.country.CapitalName;
	}

	guessCountry() {
		// get the guess from the form
		const guess = document.getElementById("capital-city-country-choices").value;

		this.guesses.push(guess);		

		if (this.country.CountryName === guess) {
			this.correct = true;
		}

		this.processGuesses();
		this.checkGameState();
		
		this.guessNumber++;
	}

	processGuesses() {
		for (let i = 0; i < this.guesses.length; i++) {
			document.getElementById("capital-city-guess-" + (i + 1)).textContent = this.guesses[i];
		}
	}

	checkGameState() {
		localStorage.setItem("capitle-" + this.date, JSON.stringify({"guesses": this.guesses, "guessCount": this.guessNumber, "correct": this.correct}));

		if (this.correct === true || this.guessNumber === 6) {
			document.getElementById("capital-city-answer").textContent = this.country.CountryName;
			document.getElementById("capital-city-guess-button").disabled = true;

			if (this.correct) {
				document.getElementById("capital-city-answer-emoji").innerHTML = "&#x1F60A;";
			}
			else {
				document.getElementById("capital-city-answer-emoji").innerHTML = "&#x1F622;";
			}
		}
	}
}

const submitForm = (event) => {
	event.preventDefault();
	game.guessCountry();

	return false;
}

document.addEventListener("DOMContentLoaded", () => {
	fetch("country-capitals.json")
		.then(response => response.json())
		.then(json => {
			const game = new CapitleGame(json);
			// export game so that submitForm can access it
			window.game = game;
		});
});