const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const rp = require('request-promise');
const messageMaxLength = 500;
const civicKey = "AIzaSyAcmcbXLlDqkQe24_LKl3yViaIHNeBg9zE";

var Lob = require('lob')('test_22cd7ba2b32fc6ad06f811fcdd045f45086');
var prompts = ["Name", "Address Line 1", "Address Line 2", "City", "State", "Country", "Zip Code", "Message"];
var promptIndex = 0;
var userInput = [];

rl.setPrompt("From " + prompts[promptIndex] + ": ");
rl.prompt();

rl.on('line', (line) => {
  promptIndex++;
  if (promptIndex == prompts.length){
  	userInput.push(line.trim().substring(0,messageMaxLength));
  }
  else{
  	userInput.push(line.trim());
  }
  if(promptIndex < prompts.length){
  	if(promptIndex == prompts.length - 1){
  		rl.setPrompt(prompts[promptIndex] + " to Recipient (500 Character Limit): ");
  	}
  	else{
  		rl.setPrompt("From " + prompts[promptIndex] + ": ");
  	}
  	rl.prompt();
  }
  else{
  	var civicURL = 'https://www.googleapis.com/civicinfo/v2/representatives?key=' 
  		+ civicKey + "&address=" + encodeURIComponent(userInput[1] + " " + userInput[2] 
  		+ " " + userInput[3] + " " + userInput[4] + " " + userInput[5] + " " + userInput[6]) + "&roles=headOfState";
  	return rp.get(civicURL).then(
  		function (response){
  			var value = JSON.parse(response);
  			value = value.officials[0];
  			Lob.letters.create({
			  description: 'Representative Letter',
			  to: {
			    name: value.name,
			    address_line1: value.address[0].line1,
			    address_line2: value.address[0].line2,
			    address_city: value.address[0].city,
			    address_state: value.address[0].state,
			    address_zip: value.address[0].zip,
			    address_country: userInput[5],
			  },
			  from: {
			    name: userInput[0],
			    address_line1: userInput[1],
			    address_line2: userInput[2],
			    address_city: userInput[3],
			    address_state: userInput[4],
			    address_zip: userInput[6],
			    address_country: userInput[5],
			  },
			  file: "<html style='padding-top: 3in; margin: .5in;'>{{message}}</html>",
			  data: {
			    message: userInput[7]
			  },
			  color: true
			}, function (err, res) {
				if(err){
					console.log(err);
				}
				else{
					console.log("PDF of Letter Available Here: " + res.url);
				}
				rl.close();
			});	
  		}
  	).catch(function (err) {
        console.log(err);
        rl.close();
    });
  }
}).on('close', () => {
  console.log('Letter Sent!');
  process.exit(0);
});