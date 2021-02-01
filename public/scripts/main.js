var rhit = rhit || {};

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
        this.location;
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

		const newList = htmlToElement('<div id="quoteListContainer"></div>');
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

	_createCard(movieQuote) {
		return htmlToElement(`<div class="card">
		<div class="card-body">
			<h5 class="card-title">${movieQuote.quote}</h5>
			<h6 class="card-subtitle mb-2 text-muted">${movieQuote.movie}</h6>
		</div>
	</div>`);
	}
}


rhit.main = function () {
    console.log("Ready");

    document.querySelector("#teamsButton").onclick = (event) => {
        window.location.href = "/teams.html";
    }
    document.querySelector("#teamsButton").onclick = (event) => {
        window.location.href = "/teams.html";
    }
    document.querySelector("#profileButton").onclick = (event) => {
        window.location.href = "/profile.html";
    }
    document.querySelector("#loginButton").onclick = (event) => {
        console.log("TODO: Implement RoseFire here.")
    }
};

rhit.main();
