var fs = require('fs');

// Read in the file path given and returns one 2d array with scores
// associated with each userid, and an object containting questions
// and the associated userids that got them right or wrong
function readFile(filePath){
	var answers = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	var users = [];
	var answer = {};
	var tempID = -1;
	var score;
	for(var j = 0; j < answers.length; j++){
		if(answers[j].user_id != tempID){
			if(tempID != -1){
				score = userScore(correct, total);
				users.push([score, tempID]);
			}
			tempID = answers[j].user_id;
			correct = 0;
			total = 0;
		}
		if(answers[j].correct == true){
			correct++;
		}
		total++;
		var question = answers[j].question;
		if(answer[question] == null){
			answer[question] = {correct: [], incorrect: []};	
		}
		if(answers[j].correct == true){
			answer[question].correct.push(tempID);
		}
		else{
			answer[question].incorrect.push(tempID);
		}
	}
	score = userScore(correct, total);
	users.push([score, tempID]);
	return [users, answer];
}

// determines the users score and returns it as an int
// between 0 and 100
function userScore(correct, total){
	var uScore;
	if(correct != 0){
		uScore = (correct/total) * 100;
	}
	else{
		uScore = 0;
	}
	return uScore;
}

// determines the differemct cohorts based on the user scores
// and return three arrays of ids for each cohort
function cohorts(scores){
	var group_size = Math.ceil((scores.length)/3);
	var top = [];
	var middle = [];
	var bottom = [];
	scores.sort(function(a,b){return a[0] - b[0]});
	for(var j = 0; j < scores.length; j++){
		if(j < group_size){
			bottom.push(scores[j][1]);
		}
		else if(j < (group_size * 2)){
			middle.push(scores[j][1]);
		}
		else{
			top.push(scores[j][1]);
		}
	}
	return [bottom, middle, top];
}

// takes in a cohort and the ids for correct and incorrect
// users and determines the ratio of correct to total answers
// in the given cohort
function correctRatio(correctID, incorrectID, cohort){
	var correct = 0;
	var answer = 0;
	for(var j = 0; j < correctID.length; j++){
		if(cohort.indexOf(correctID[j]) != -1){
			correct++;
			answer++;
		}
	}
	for(var j = 0; j < incorrectID.length; j++){
		if(cohort.indexOf(incorrectID[j]) != -1){
			answer++;
		}
	}
	return (correct/answer);
}

// finds and prints the item discrimination values
function run(filePath){
	var read = readFile(filePath);
	var cohortArrs = cohorts(read[0]);
	var answers = {};
	Object.keys(read[1]).sort().forEach(function(key) {
	  answers[key] = read[1][key];
	});
	console.log("Question                     Discrimination");
	for(var j = 0; j < Object.keys(answers).length; j++){
		var question = Object.keys(answers)[j];
		var discrimination = correctRatio(answers[question].correct, answers[question].incorrect, cohortArrs[2])
			- correctRatio(answers[question].correct, answers[question].incorrect, cohortArrs[0]);
		console.log(Object.keys(answers)[j] + "               " + discrimination);
	}
}

run('./answers.json');