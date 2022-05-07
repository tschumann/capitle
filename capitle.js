"use strict";

class CapitleGame {
	constructor(countries) {
		this.countries = countries;

		this.countryNames = this.countries.map(country => country.CountryName).sort();
		this.correct = false;
		this.guesses = [];

		const choices = document.getElementById("capital-city-country-choices");

		for (let i = 0; i<this.countryNames.length; i++){
			const opt = document.createElement("option");
			opt.value = this.countryNames[i];
			opt.innerHTML = this.countryNames[i];
			choices.appendChild(opt);
		}
		this.guessNumber = 1;

		const now = new Date();
		this.date = now.getFullYear() + "-" + this.zeroPad(now.getMonth() + 1) + "-" + this.zeroPad(now.getDate());
		const today = new Date(now.getFullYear() + "-" + this.zeroPad(now.getMonth() + 1) + "-" + this.zeroPad(now.getDate()) + "T00:00:00+00:00");
		console.log(today.valueOf().toString(16));
		this.chooseInitialCountry(today.valueOf().toString(16));
		
		const savedState = localStorage.getItem("capitle-" + this.date);

		if (savedState) {
			const stateToRestore = JSON.parse(savedState);
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
		let result = 0;
		for (let i = 0; i < seed.length; i++) {
			result = result + seed.charCodeAt(i);
		}
		let upper = 0;
		for (let i = 0; i < "ffffffffffff".length; i++) {
			upper = upper + "ffffffffffff".charCodeAt(i);
		}
		const choice = result / upper;
		const c = Math.round(choice * this.countries.length);
		this.country = this.countries[c];
		console.log(this.country);
		document.getElementById("capital-city-name").textContent = this.country.CapitalName;
	}

	guessCountry() {
		const guess = document.getElementById("capital-city-country-choices").value;
		console.log(guess);
		this.guesses.push(guess);		

		if (this.country.CountryName === guess) {
			console.log("Correct");
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
	console.log("here");
	event.preventDefault();
	game.guessCountry();
	return false;
}

document.addEventListener("DOMContentLoaded", () => {
	fetch("country-capitals.json")
		.then(response => response.json())
		.then(json => {
			
			const game = new CapitleGame(json);
			window.game = game;
		});
});