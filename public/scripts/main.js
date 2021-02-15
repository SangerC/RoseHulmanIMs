var rhit = rhit || {};

//collections
rhit.FB_COLLECTION_MATCH = "matches";
rhit.FB_COLLECTION_SPORTS = "sports";

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

rhit.currentDay = null;

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.Match = class{
    constructor(id, teamA, teamB, date, league, status, sport, location, sportImg) {
				this.id = id;
        this.teamA = teamA;
        this.teamB = teamB;
        this.date = date;
        this.league = league;
        this.status = status;
        this.sport = sport;
        this.location = location;
				this.sportImg = sportImg;
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
		 <div class="card-image-title">
				<img src="${match.sportImg}" class="icon-image">
				<p class="card-text">${match.sport}</p>
				<h3 class="card-header" id="gameTitle">${match.teamA}  vs.  ${match.teamB}</h3>
		</div>
		<div class="card-body">
			<p class="card-text" id="courtAndTimeText">${match.location}  ${match.date}</p>
			<p class="card-text" id="gameStatusTextText">${match.status}</p>
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
		const sportRef = firebase.firestore().collection(rhit.FB_COLLECTION_SPORTS);
		
		let sportImg = "https://media.npr.org/assets/img/2020/06/10/gettyimages-200199027-001-b5fb3d8d8469ab744d9e97706fa67bc5c0e4fa40.jpg";
		sportRef.where("sport", "==", docSnapshot.get(rhit.FB_KEY_SPORT)).get().then((snap) =>{
        snap.forEach((sp) => {
          sportImg = sp.get("image");
        	console.log("test");
				});
		});

		const match = new rhit.Match(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_TEAMA),
			docSnapshot.get(rhit.FB_KEY_TEAMB),
			docSnapshot.get(rhit.FB_KEY_DATE),
			docSnapshot.get(rhit.FB_KEY_LEAGUE),
			docSnapshot.get(rhit.FB_KEY_STATUS),
			docSnapshot.get(rhit.FB_KEY_SPORT),
			docSnapshot.get(rhit.FB_KEY_LOCATION),
			sportImg
			);
		return match;
	}
}

rhit.buildCalendar = function(){
	let calender = document.querySelector("calender");
	let date = new Date();
	let month = date.getMonth();
	let days = rhit.getDaysFromMonth(month);
	rhit.currentDay = date.getDate();



	const newList = htmlToElement('<div id="calender" class="row"></div>');
	for (let i = 0; i < 4; i++) {
		for(let j=0; j<5;j++){
			let day = j+1+i*7;
			let element;
			if(day==rhit.currentDay) element = htmlToElement(`<div class="calenderSpace currentDay col" data-date="${day}">${day}</div>`);
			else if(day<=days) element = htmlToElement(`<div class="calenderSpace col" data-date="${day}">${day}</div>`);
			else element = htmlToElement('<div class="calenderSpace col" data-date="-1"></div>');
			newList.appendChild(element);
		}
    newList.appendChild(htmlToElement('<div class="w-100"></div>'));
	}

	const oldList = document.querySelector("#calender");
	oldList.removeAttribute("id");
	oldList.hidden = true;
	oldList.parentElement.appendChild(newList);


}

rhit.getDaysFromMonth = function(month){
	  if(month<7&&month%2==0||month>=7&&month%2==1) return 31;//This is statement finds month with 31 days
    else if(month==1) return 28;//February special case
    else return 30;
}


rhit.main = function(){
	rhit.fbMatchManager = new rhit.FbMatchManager();
	new rhit.HomePageController();

	const ref = firebase.firestore().collection("MovieQuotes");

	//rhit.fbMatchManager.add("Avalanche", "catapults", "10:00 am Friday 02/02/2021","Greek A", "To Be Played","soccer", "SRC court 2");

	rhit.buildCalendar();
}

rhit.main();
