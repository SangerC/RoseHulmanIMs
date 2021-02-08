var rhit = rhit || {};

//collections
rhit.FB_COLLECTION_MATCH = "matches";

//match definitions
rhit.FB_KEY_TEAMA = "teama";
rhit.FB_KEY_TEAMB = "teamb";
rhit.FB_KEY_DATE = "date";
rhit.FB_KEY_LEAGUE = "league";
rhit.FB_KEY_STATUS = "status";
rhit.FB_KEY_SPORT = "sport";
rhit.FB_KEY_LOCATION = "location";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author";

//singletons
rhit.fbMatchManager = null;
rhit.fbAuthManager = null;

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.Match = class{
    constructor(id, teamA, teamB, date, league, status, sport, location) {
		this.id = id;
        this.teamA = teamA;
        this.teamB = teamB;
        this.date = date;
        this.league = league;
        this.status = status;
        this.sport = sport;
        this.location = location;
	}
}

rhit.HomePageController = class {
	constructor() {
		rhit.fbMatchManager.beginListening(this.updateList.bind(this));
	}

	updateList() {
		console.log(rhit.fbMatchManager.length);
		const newList = htmlToElement('<div id="matches"></div>');
		for (let i = 0; i < rhit.fbMatchManager.length; i++) {
			const match = rhit.fbMatchManager.getMatchAtIndex(i);
			const newCard = this._createCard(match);
			newCard.onclick = (event) => {
				window.location.href = `/match.html?id=${match.id}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#matches");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	_createCard(match) {
		return htmlToElement(`<div class="card">
		<div class="card-body">
			<h5 class="card-title">${match.date}</h5>
			<h6 class="card-subtitle mb-2">${match.teamA} vs ${match.teamB}</h6>
			<h6 class="card-subtitle mb-2">${match.sport}</h6>
			<h6 class="card-subtitle mb-2">${match.league}</h6>
			<h6 class="card-subtitle mb-2">${match.location}</h6>
			<h6 class="card-subtitle mb-2">${match.status}</h6>
		</div>
	</div>`);
	}

}

rhit.FbMatchManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MATCH);
		this._unsubscribe = null;
	}

	add(teamA, teamB, date, league, status, sport, location) {
		console.log("tried");
		this._ref.add({
				[rhit.FB_KEY_TEAMA] : teamA,
				[rhit.FB_KEY_TEAMB] : teamB,
				[rhit.FB_KEY_DATE] :  date,
				[rhit.FB_KEY_LEAGUE] :league,
				[rhit.FB_KEY_STATUS] :status,
				[rhit.FB_KEY_SPORT] : sport,
				[rhit.FB_KEY_LOCATION] : location,
				[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
			})
			.then(function (docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function (error) {
				console.error("Error adding document: ", error);
			});
	}

	beginListening(changeListener) {
		this._unsubscribe = this._ref
			.limit(50)
			.onSnapshot((querySnapshot) => {
				this._documentSnapshots = querySnapshot.docs;
				changeListener();
			});
	}

	stopListening() {
		this._unsubscribe();
	}

	get length() {
		return this._documentSnapshots.length;
	}

	getMatchAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const match = new rhit.Match(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_TEAMA),
			docSnapshot.get(rhit.FB_KEY_TEAMB),
			docSnapshot.get(rhit.FB_KEY_DATE),
			docSnapshot.get(rhit.FB_KEY_LEAGUE),
			docSnapshot.get(rhit.FB_KEY_STATUS),
			docSnapshot.get(rhit.FB_KEY_SPORT),
			docSnapshot.get(rhit.FB_KEY_LOCATION)			
			);
		return match;
	}
}

rhit.main = function(){
	rhit.fbMatchManager = new rhit.FbMatchManager();
	new rhit.HomePageController();

	const ref = firebase.firestore().collection("MovieQuotes");

	//rhit.fbMatchManager.add("Avalanche", "catapults", "10:00 am Friday 02/02/2021","Greek A", "To Be Played","soccer", "SRC court 2");


}

rhit.main();
