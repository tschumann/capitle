"use strict";

class CapitleGame {

	constructor(countries, now) {
		// filter out countries that don't have a capital city
		this.countries = countries.filter(country => country.CapitalName !== "N/A");
		// apply encoding fixes to some of the names
		this.countries.map(country => {
			if (country.CapitalName === "Willemstad") {
				country.CountryName = "Curaçao";
			}
			if (country.CountryName === "French Southern and Antarctic Lands") {
				country.CapitalName = "Port-aux-Français";
			}
			if (country.CountryName === "Western Sahara") {
				country.CapitalName = "El Aaiún";
			}
		}).sort();

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

			this.render();
			this.saveGameState();
		}
	}

	chooseInitialCountry(seed) {
		// turn the current seed into an integer
		const currentValue = this.stringToHash(seed);

		// turn the highest possible seed into an integer
		const maximumValue = this.stringToHash("ffffffffffff");

		// work out a country number by scaling the seed into the range of countries
		const countryNumber = Math.round(currentValue / maximumValue * this.countries.length);
		this.country = this.countries[countryNumber];
	}

	guessCountry() {
		// get the guess from the form
		const guess = document.getElementById("capital-city-country-choices").value;

		// don't process a duplicate guess
		if (this.guesses.includes(guess)) {
			return;
		}

		this.guesses.push(guess);		

		if (this.country.CountryName === guess) {
			this.correct = true;
		}

		this.render();
		this.saveGameState();
		
		this.guessNumber++;
	}

	getCountryByName(name) {
		return this.countries.filter(country => country.CountryName === name)[0];
	}

	saveGameState() {
		localStorage.setItem("capitle-" + this.date, JSON.stringify({"guesses": this.guesses, "guessCount": this.guessNumber, "correct": this.correct}));
	}

	render() {
		document.getElementById("capital-city-name").textContent = this.country.CapitalName;

		for (let i = 0; i < this.guesses.length; i++) {
			const isCorrect = (this.guesses[i] === this.country.CountryName);

			if (isCorrect) {
				document.getElementById("capital-city-guess-" + (i + 1)).innerHTML = this.guesses[i] + " " + "&#x1F60A;";
			}
			else {
				const actualContry = this.country;
				const guessedCountry = this.getCountryByName(this.guesses[i]);
				const distanceBetweenCapitalCities = this.getDistanceFromLatLonInKm(guessedCountry.CapitalLatitude, guessedCountry.CapitalLongitude, actualContry.CapitalLatitude, actualContry.CapitalLongitude);

				document.getElementById("capital-city-guess-" + (i + 1)).innerHTML = this.guesses[i] + " " + distanceBetweenCapitalCities + "km";
			}
		}

		if (this.correct === true || this.guessNumber === 6) {
			document.getElementById("capital-city-answer").textContent = this.country.CountryName;
			document.getElementById("capital-city-guess-button").disabled = true;
			document.getElementById("capital-city-guess-footer").textContent = "For a new round, tune in tomorrow - same Bat-time, same Bat-channel!";

			if (this.correct) {
				document.getElementById("capital-city-answer-emoji").innerHTML = "&#x1F60A;";
			}
			else {
				document.getElementById("capital-city-answer-emoji").innerHTML = "&#x1F622;";
			}
		}
	}

	/**
	 * @see http://www.movable-type.co.uk/scripts/latlong.html
	 */
	getDistanceFromLatLonInKm(latitude1, longitude1, latitude2, longitude2) {
		const earthRadiusKilometres = 6371;
		const latitudeDifference = this.degreesToRadians(latitude2 - latitude1);
		const longitudeDifference = this.degreesToRadians(longitude2 - longitude1);

		// a is the square of half the chord length between the points
		const a = Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) + Math.cos(this.degreesToRadians(latitude1)) * Math.cos(this.degreesToRadians(latitude2)) *  Math.sin(longitudeDifference / 2) * Math.sin(longitudeDifference / 2);
		const angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return Math.round(earthRadiusKilometres * angularDistance);
	}

	degreesToRadians(degrees) {
		return degrees * (Math.PI / 180);
	}

	/**
	 * Basic hashing function to turn a hexadecimal string into an integer.
	 */
	stringToHash(string) {
		let value = 0;

		for (let i = 0; i < string.length; i++) {
			value = value + (string.charCodeAt(i) * (i + 1));
		}

		return value;
	}

	zeroPad(value) {
		if (value < 10) {
			return "0" + value;
		}

		// add the string for a consistent return type
		return "" + value;
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
			const game = new CapitleGame(json, new Date());
			// export game so that submitForm can access it
			window.game = game;

			const queryParams = new URLSearchParams(window.document.location.search);
			const runTests = queryParams.has("test");

			if (runTests && window.document.location.host.startsWith("localhost")) {
				// clear before the test run
				localStorage.removeItem("capitle-2022-04-03");
				localStorage.removeItem("capitle-2022-04-04");
				localStorage.removeItem("capitle-2022-04-05");
				localStorage.removeItem("capitle-2022-04-06");
				localStorage.removeItem("capitle-2022-04-07");
				localStorage.removeItem("capitle-2022-05-06");
				localStorage.removeItem("capitle-2022-05-07");
				localStorage.removeItem("capitle-2022-05-08");
				localStorage.removeItem("capitle-2022-05-09");
				localStorage.removeItem("capitle-2022-05-10");
				localStorage.removeItem("capitle-2022-05-11");
				localStorage.removeItem("capitle-2022-05-12");

				let testGame = new CapitleGame(json, new Date("2022-04-07T00:00:00"));

				console.log("Testing constructor");
				console.assert(JSON.stringify(testGame.guesses) === JSON.stringify([]), "testGame.guesses");
				console.assert(testGame.guessNumber === 1, "testGame.guessNumber");
				console.assert(testGame.correct === false, "testGame.correct");
				console.assert(testGame.country.CountryName === "Japan", "testGame.country.CountryName");

				console.log("Testing guessCountry");
				document.getElementById("capital-city-country-choices").value = "South Korea";
				testGame.guessCountry();
				console.assert(JSON.stringify(testGame.guesses) === JSON.stringify(["South Korea"]), "testGame.guesses");
				console.assert(testGame.guessNumber === 2, "testGame.guessNumber");
				console.assert(testGame.correct === false, "testGame.correct");
				document.getElementById("capital-city-country-choices").value = "South Korea";
				testGame.guessCountry();
				console.assert(JSON.stringify(testGame.guesses) === JSON.stringify(["South Korea"]), "testGame.guesses");
				console.assert(testGame.guessNumber === 2, "testGame.guessNumber");
				console.assert(testGame.correct === false, "testGame.correct");
				document.getElementById("capital-city-country-choices").value = "China";
				testGame.guessCountry();
				console.assert(JSON.stringify(testGame.guesses) === JSON.stringify(["South Korea", "China"]), "testGame.guesses");
				console.assert(testGame.guessNumber === 3, "testGame.guessNumber");
				console.assert(testGame.correct === false, "testGame.correct");
				document.getElementById("capital-city-country-choices").value = "Japan";
				testGame.guessCountry();
				console.assert(JSON.stringify(testGame.guesses) === JSON.stringify(["South Korea", "China", "Japan"]), "testGame.guesses");
				console.assert(testGame.guessNumber === 4, "testGame.guessNumber");
				console.assert(testGame.correct === true, "testGame.correct");

				console.log("Testing getCountryByName");
				console.assert(testGame.getCountryByName("Australia").CountryName === "Australia", "testGame.getCountryByName(\"Australia\")");
				console.assert(testGame.getCountryByName("New Zealand").CountryName === "New Zealand", "testGame.getCountryByName(\"Australia\")");

				console.log("Testing degreesToRadians");
				console.assert(testGame.degreesToRadians(0).toFixed(2) + "" === "0.00", "testGame.degreesToRadians(0)");
				console.assert(testGame.degreesToRadians(90).toFixed(2) + "" === "1.57", "testGame.degreesToRadians(90)");
				console.assert(testGame.degreesToRadians(180).toFixed(2) + "" === "3.14", "testGame.degreesToRadians(180)");

				console.log("Testing stringToHash");
				console.assert(testGame.stringToHash("deadbeef") === 3612, "testGame.stringToHash(\"deadbeef\")");
				console.assert(testGame.stringToHash("ffffffff") === 3672, "testGame.stringToHash(\"deadbeef\")");
				console.assert(testGame.stringToHash("12345678") === 1932, "testGame.stringToHash(\"12345678\")");

				console.log("Testing zeroPad");
				console.assert(testGame.zeroPad(0) === "00", "testGame.zeroPad(0)");
				console.assert(testGame.zeroPad(9) === "09", "testGame.zeroPad(9)");
				console.assert(testGame.zeroPad(10) === "10", "testGame.zeroPad(10)");

				console.log("Testing different countries");
				testGame = new CapitleGame(json, new Date("2022-04-03T00:00:00"));
				console.assert(testGame.country.CountryName === "Nepal", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-04-04T00:00:00"));
				console.assert(testGame.country.CountryName === "Luxembourg", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-04-05T00:00:00"));
				console.assert(testGame.country.CountryName === "Jersey", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-04-06T00:00:00"));
				console.assert(testGame.country.CountryName === "Marshall Islands", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-05-06T00:00:00"));
				console.assert(testGame.country.CountryName === "Kyrgyzstan", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-05-07T00:00:00"));
				console.assert(testGame.country.CountryName === "Liechtenstein", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-05-08T00:00:00"));
				console.assert(testGame.country.CountryName === "Kazakhstan", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-05-09T00:00:00"));
				console.assert(testGame.country.CountryName === "Luxembourg", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-05-10T00:00:00"));
				console.assert(testGame.country.CountryName === "Liberia", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-05-11T00:00:00"));
				console.assert(testGame.country.CountryName === "Kenya", "testGame.country.CountryName");
				testGame = new CapitleGame(json, new Date("2022-05-12T00:00:00"));
				console.assert(testGame.country.CountryName === "Kiribati", "testGame.country.CountryName");
			}
		});
});