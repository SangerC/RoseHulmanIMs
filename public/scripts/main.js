var rhit = rhit || {};

rhit.FB_COLLECTION_IM = "MovieQuotes";
rhit.FB_KEY_TEAMA = "teama";
rhit.FB_KEY_TEAMB = "teamb";
rhit.FB_KEY_DATE = "date";
rhit.FB_KEY_LEAGUE = "league";
rhit.FB_KEY_STATUS = "status";
rhit.FB_KEY_SPORT = "sport";
rhit.FB_KEY_SPORT = "location";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
rhit.FB_KEY_AUTHOR = "author";
rhit.fbMatchManager = null;
rhit.fbAuthManager = null;

// From: https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.match = class{
    constructor(teamA, teamB, date, league, status, sport, location) {
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

		document.querySelector("#menuShowAllQuotes").addEventListener("click", (event) => {
			window.location.href = "/list.html";
		});
		document.querySelector("#menuShowMyQuotes").addEventListener("click", (event) => {
			window.location.href = `/list.html?uid=${rhit.fbAuthManager.uid}`;
		});
		document.querySelector("#menuSignOut").addEventListener("click", (event) => {
			rhit.fbAuthManager.signOut();
		});

		document.querySelector("#submitAddQuote").addEventListener("click", (event) => {
			const quote = document.querySelector("#inputQuote").value;
			const movie = document.querySelector("#inputMovie").value;
			rhit.fbMovieQuotesManager.add(quote, movie);
		});

		$("#addQuoteDialog").on("show.bs.modal", (event) => {
			document.querySelector("#inputQuote").value = "";
			document.querySelector("#inputMovie").value = "";
		});
		$("#addQuoteDialog").on("shown.bs.modal", (event) => {
			document.querySelector("#inputQuote").focus();
		});

		rhit.fbMovieQuotesManager.beginListening(this.updateList.bind(this));
	}

	updateList() {

		const newList = htmlToElement('<div id="matchPage"></div>');
		for (let i = 0; i < rhit.fbMovieQuotesManager.length; i++) {
			const mq = rhit.fbMovieQuotesManager.getMovieQuoteAtIndex(i);
			const newCard = this._createCard(mq);
			newCard.onclick = (event) => {
				window.location.href = `/moviequote.html?id=${mq.id}`;
			};
			newList.appendChild(newCard);
		}

		const oldList = document.querySelector("#quoteListContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	_createCard(match) {
		return htmlToElement(`<div class="card">
		<div class="card-body">
            <h5 class="card-title">${match.date}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${match.sport}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${match.teamA}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${match.teamB}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${match.league}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${match.status}</h6>
            <h6 class="card-subtitle mb-2 text-muted">${match.location}</h6>
		</div>
	</div>`);
	}
}
rhit.matchManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_MATCH);
		this._unsubscribe = null;
	}

	add(teamA, teamB, date, league, status, sport, location) {
		this._ref.add({
				[rhit.FB_KEY_TEAMA]: teamA,
                [rhit.FB_KEY_TEAMB]: teamB,
                [rhit.FB_KEY_DATE]: date,
                [rhit.FB_KEY_LEAGUE]: league,
                [rhit.FB_KEY_STATUS]: status,
                [rhit.FB_KEY_SPORT]: sport,
                [rhit.FB_KEY_LOCATION]: location,
				[rhit.FB_KEY_AUTHOR]: rhit.fbAuthManager.uid,
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

		let query = this._ref.orderBy(rhit.FB_KEY_LAST_TOUCHED, "desc").limit(50);
		if (this._uid) {
				query = query.where(rhit.FB_KEY_AUTHOR, "==", this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
				console.log("MovieQuote update!");
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

	getMovieQuoteAtIndex(index) {
		const docSnapshot = this._documentSnapshots[index];
		const mq = new rhit.MovieQuote(docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_QUOTE),
			docSnapshot.get(rhit.FB_KEY_MOVIE));
		return mq;
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
		console.log("Sign in using Rosefire");
		Rosefire.signIn("eb20b5be-d31d-40fd-b4b7-e50dee8c5bf2", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
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


rhit.main = function () {
    console.log("Ready");

    // document.querySelector("#teamsButton").onclick = (event) => {
    //     window.location.href = "teams.html";
    // }
    // document.querySelector("#profileButton").onclick = (event) => {
	// 	if(fbMatchManager.isSignedIn()) window.location.href = "profile.html";
	// 	else window.location.href = "login.html";
    // }
    // document.querySelector("#loginButton").onclick = (event) => {
    //     console.log("TODO: Implement RoseFire here.")
	// }
	// document.querySelectorAll(".gameInfoButton").onclick = (event) => {
    //     window.location.href = "game.html";
	// }
	// document.querySelectorAll("#backHomeButton").forEach = (event) => {
    //     window.location.href = "index.html";
	// }
	// document.querySelector("#teamOneButton").forEach = (event) => {
	// 	window.location.href = "team.html";
	// }
	// document.querySelector("#teamTwoButton").onclick = (event) => {
	// 	window.location.href = "team.html";
	// }

	document.querySelectorAll(".gameInfoButton").forEach(button => {
		button.onclick = () => {
			window.location.href = "game.html";
		}
	});
	document.querySelector("#teamOneButton").forEach(button => {
		button.onclick = () => {
			window.location.href = "team.html";
		}
	});
	document.querySelector("#teamTwoButton").forEach(button => {
		button.onclick = () => {
			window.location.href = "team.html";
		}
	});
	document.querySelector("#teamsButton").forEach(button => {
		button.onclick = () => {
			window.location.href = "teams.html";
		}
	});
	document.querySelectorAll("#backHomeButton").forEach(button => {
		button.onclick = () => {
			window.location.href = "index.html";
		}
	});
};

rhit.main();
