/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

/** globals */
rhit.variableName = "";

/** function and class syntax examples */
rhit.functionName = function () {
	/** function body */
};

rhit.ClassName = class {
	constructor() {

	}

	methodName() {

	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
    console.log("Ready");
    
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
