var rhit = rhit || {};

//collections
rhit.FB_COLLECTION_MATCH = "matches";
rhit.FB_COLLECTION_SPORTS = "sports";
rhit.FB_COLLECTION_REMINDERS = "reminders";
rhit.FB_COLLECTION_TEAM = "teams";

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

//sport definitions
rhit.FB_KEY_IMG = "image"

//reminder definitions
rhit.FB_KEY_REMINDERS = "reminder"

//singletons
rhit.fbMatchManager = null;
rhit.fbSportManager = null;
rhit.fbReminderManager = null;
rhit.fbAuthManager = null;
rhit.fbTeamManager = null;

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

rhit.Team = class{
	constructor(id, name, sport, captain, league, org, matches, players, sportImg){
		this.id=id;
		this.name=name;
		this.sport=sport;
		this.captain=captain;
		this.league=league;
		this.org=org;
		this.matches=matches;
		this.players=players;
		this.sportImg = sportsImg;
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

rhit.FbUserManager = class {
	constructor() {
		this._collectoinRef = firebase.firestore().collection(rhit.FB_COLLECTION_USERS);
		this._document = null;
		this._unsubscribe = null;
	}
	addNewUserMaybe(uid, name, photoUrl) {
		// Check if the User is in Firebase already
		const userRef = this._collectoinRef.doc(uid);
		return userRef.get().then((doc) => {
			if (doc.exists) {
				console.log("User already exists:", doc.data());
				// Do nothin there is alread a User!
				return false;
			} else {
				// doc.data() will be undefined in this case
				console.log("Creating this user!");
				// Add a new document in collection "cities"
				return userRef.set({
						[rhit.FB_KEY_NAME]: name,
						[rhit.FB_KEY_PHOTO_URL]: photoUrl,
					})
					.then(function () {
						console.log("Document successfully written!");
						return true;
					})
					.catch(function (error) {
						console.error("Error writing document: ", error);
					});
			}
		}).catch(function (error) {
			console.log("Error getting document:", error);
		});
	}
	beginListening(uid, changeListener) {
		const userRef = this._collectoinRef.doc(uid);
		this._unsubscribe = userRef.onSnapshot((doc) => {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				this._document = doc;
				changeListener();
			} else {
				console.log("No User!  That's bad!");
			}
		});

	}
	stopListening() {
		this._unsubscribe();
	}

	get isListening() {
		return !!this._unsubscribe;
	}

	updatePhotoUrl(photoUrl) {
		const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
		userRef.update({
				[rhit.FB_KEY_PHOTO_URL]: photoUrl,
			})
			.then(() => {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	updateName(name) {
		const userRef = this._collectoinRef.doc(rhit.fbAuthManager.uid);
		return userRef.update({
				[rhit.FB_KEY_NAME]: name,
			})
			.then(() => {
				console.log("Document successfully updated!");
			})
			.catch(function (error) {
				console.error("Error updating document: ", error);
			});
	}

	get name() {
		return this._document.get(rhit.FB_KEY_NAME);
	}
	get photoUrl() {
		return this._document.get(rhit.FB_KEY_PHOTO_URL);
	}
}

rhit.teamsPageController = class {
	constructor() {
		rhit.fbTeamsManager.beginListening(this.updateList.bind(this));
	}

	updateList() {
		const newList = htmlToElement('<div id="teams"></div>');
		for (let i = 0; i < rhit.fbTeamManager.length; i++) {
			const team = rhit.fbTeamManager.getTeamAtIndex(i);
			const newCard = this._createCard(team);
			newCard.onclick = (event) => {
				window.location.href = `/team.html?id=${team.id}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#teams");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	_createCard(team) {
		return htmlToElement(`<div class="card">
		 <div class="card-image-title">
				<img src="${team.sportImg}" class="icon-image">
				<p class="card-text">${team.sport}</p>
				<h3 class="card-header" id="gameTitle">${team.name}</h3>
		</div>
		<div class="card-body">
			<p class="card-text" id="courtAndTimeText">${team.captain}</p>
			<p class="card-text" id="gameStatusTextText">${team.org} ${team.league}</p>
		</div>
	</div>`);
	}

}

rhit.FbTeamManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_TEAM);
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

	getTeamAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		
		let img = rhit.fbSportManager.getSport("default");
		if(rhit.fbSportManager.getSport(docSnapshot.get(rhit.FB_KEY_SPORT))!=undefined) img = rhit.fbSportManager.getSport(docSnapshot.get(rhit.FB_KEY_SPORT));

		const team = new rhit.Team(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_TEAMA),
			docSnapshot.get(rhit.FB_KEY_TEAMB),
			docSnapshot.get(rhit.FB_KEY_DATE),
			docSnapshot.get(rhit.FB_KEY_LEAGUE),
			docSnapshot.get(rhit.FB_KEY_STATUS),
			docSnapshot.get(rhit.FB_KEY_SPORT),
			docSnapshot.get(rhit.FB_KEY_LOCATION),
			img
			);
		return team;
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
		
		let img = rhit.fbSportManager.getSport("default");
		if(rhit.fbSportManager.getSport(docSnapshot.get(rhit.FB_KEY_SPORT))!=undefined) img = rhit.fbSportManager.getSport(docSnapshot.get(rhit.FB_KEY_SPORT));

		const match = new rhit.Match(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_TEAMA),
			docSnapshot.get(rhit.FB_KEY_TEAMB),
			docSnapshot.get(rhit.FB_KEY_DATE),
			docSnapshot.get(rhit.FB_KEY_LEAGUE),
			docSnapshot.get(rhit.FB_KEY_STATUS),
			docSnapshot.get(rhit.FB_KEY_SPORT),
			docSnapshot.get(rhit.FB_KEY_LOCATION),
			img
			);
		return match;
	}
}

rhit.FbSportManager = class{

	constructor(){
		this.ref = firebase.firestore().collection(rhit.FB_COLLECTION_SPORTS);
		this.sports ={};
		this.getSports();
	}

	getSports(){
		const sportImg = "https://media.npr.org/assets/img/2020/06/10/gettyimages-200199027-001-b5fb3d8d8469ab744d9e97706fa67bc5c0e4fa40.jpg";
		this.ref.onSnapshot((querySnapshot) => {
			querySnapshot.forEach((doc) => {
				this.sports[doc.get(rhit.FB_KEY_SPORT)] = doc.get(rhit.FB_KEY_IMG);
			});
		});
	}

	getSport(sport){
		return this.sports[sport];
	}

}

rhit.FbReminderManager = class{
	
	constructor(){
		this.ref = firebase.firestore().collection(rhit.FB_COLLECTION_REMINDERS);
		this.reminders = [];
		this.getReminders();
	}

	getReminders(resolve, reject){
		this.ref.onSnapshot((querySnapshot) =>{
			querySnapshot.forEach((doc)=>{
				this.reminders.push(doc.get(rhit.FB_KEY_REMINDERS));
			});
			this.placeReminders();
		});
	}

	placeReminders(){
		console.log(this.reminders);
		console.log(this.reminders.length);
		for(let i=0;i<this.reminders.length;i++){
			document.querySelector("#reminders").innerHTML+= "<br>"+this.reminders[i];
			console.log(this.reminders[i]);
		}
	}

}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}

	beginListening(changeListener) {
		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}

	signIn() {
		Rosefire.signIn("461fe83c-58db-4dfb-b6af-31ccdcb852e3", (err, rfUser) => {
			if (err) {
				return;
			}
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if (errorCode === 'auth/invalid-custom-token') {
					alert('The token you provided is not valid.');
				} else {
					console.error("Custom auth error", errorCode, errorMessage);
				}
			});
		});

	}

	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}

	get isSignedIn() {
		return !!this._user;
	}

	get uid() {
		return this._user.uid;
	}
}

rhit.checkForRedirects = function() {
	let b = document.querySelector("#loginButton");
	let pb = document.querySelector("#profileButton");
	if(rhit.fbAuthManager.isSignedIn){
		b.innerHTML = "LOGOUT";	
		b.onclick = (event) =>{
			rhit.fbAuthManager.signOut();
		};
		pb.onclick = (event) =>{
			window.location.href = "/profile.html"
		};
	}
	else{
		b.innerHTML = "LOGIN";
		b.onclick = (event) =>{
			rhit.fbAuthManager.signIn();
		};
		pb.onclick = (event) =>{
			rhit.fbAuthManager.signIn();
		};
	}
};

rhit.buildCalendar = function(){
	const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
	let calender = document.querySelector("calender");
	let date = new Date();
	let month = date.getMonth();
	let days = rhit.getDaysFromMonth(month, date.getFullYear());
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
			element.onclick = (event) =>{
				let list = document.querySelector("#calender");
				for(let child=list.firstChild; child!==null; child=child.nextSibling) {
    			child.classList.remove("currentDay");
				}
				rhit.currentDay = day;
				element.classList.add("currentDay");
			};
		}
    newList.appendChild(htmlToElement('<div class="w-100"></div>'));
	}

	const oldList = document.querySelector("#calender");
	oldList.removeAttribute("id");
	oldList.hidden = true;
	oldList.parentElement.appendChild(newList);
	document.querySelector("#month").innerHTML = monthNames[month];
}

rhit.getDaysFromMonth = function(month, year){
	  if(month<7&&month%2==0||month>=7&&month%2==1) return 31;//This is statement finds month with 31 days
    else if(month==1){ 
			if(rhit.checkLeapyear(year)) return 29;
			else return 28;//February special case
		}
			else return 30;
}

rhit.checkLeapyear = function(year){
	if(year%4==0){
		if(year%100==0){
			if(year%400==0)return true;
			return false;
		}
		return true;
	}	
	return false; 
}

rhit.main = function(){
	const urlParams = new URLSearchParams(window.location.search);
	const path = window.location.pathname;

	rhit.fbSportManager = new rhit.FbSportManager();
	console.log(path);
	document.querySelector("#teamsButton").onclick = (event) =>{
		window.location.href = "/teams.html";
	};

	if(path=="/match.html"){
		console.log("check");
		document.querySelector("#backHomeButton").onclick = (event) =>{
			window.location.href="/";
		};
	}
	else if(path=="/teams.html"){
		rhit.fbTeamManager = new rhit.FbTeamManager();
		new rhit.teamsPageController();
		document.querySelector("#createTeamButton").onclick = (event) =>{
			window.location.href = "/createTeam.html";
		};
	}
	else if(path=="/"){
		rhit.fbReminderManager = new rhit.FbReminderManager();
		rhit.fbMatchManager = new rhit.FbMatchManager();
		rhit.buildCalendar();
		new rhit.HomePageController();
	}

	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {
		console.log("isSignedIn = ", rhit.fbAuthManager.isSignedIn);
		rhit.checkForRedirects();
	});


	//rhit.fbMatchManager.add("Avalanche", "catapults", "10:00 am Friday 02/02/2021","Greek A", "To Be Played","soccer", "SRC court 2");

}

rhit.main();
