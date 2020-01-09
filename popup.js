//----------------------------------//
//		   Const Declaration		//
//----------------------------------//

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const objectives = {
	"2019": [{
		"01": 22,
		"02": 20,
		"03": 21,
		"04": 21,
		"05": 20,
		"06": 19,
		"07": 23,
		"08": 21,
		"09": 21,
		"10": 23,
		"11": 19,
		"12": 21
	}],
	"2020": [{
		"01": 22,
		"02": 20,
		"03": 22,
		"04": 21,
		"05": 18,
		"06": 21,
		"07": 22,
		"08": 21,
		"09": 22,
		"10": 22,
		"11": 20,
		"12": 22
	}]
};

//----------------------------------//
//			   Triggers				//
//----------------------------------//

//--- Redirection Links ---//

$('#goIntra').click(() => { chrome.tabs.update({url: "https://profile.intra.42.fr/"});});
$('#goMatrix').click(() => { chrome.tabs.update({url: "https://the-matrix.le-101.fr/"});});
$('#goTuteur').click(() => { chrome.tabs.update({url: "https://tuteurs.le-101.fr/"});});
$('#goLogTime').click(() => { chrome.tabs.update({url: "http://logtime.42lyon.fr/index"});});
$('#updateLogin').click(() => {
	chrome.storage.sync.remove('sLogin');
	init();
});

//--- Search triggers ---//

// $("#loginToSearch").keyup((key) => { if (key.which === 13) { alert('hola') }});
// $('#startSearch').click(() => {});
//
// $('#setButton').click(() => { chrome.storage.sync.set({sLogin: $('#inputToSet').val()});});
// $('#getButton').click(() => {
// 	chrome.storage.sync.get(['sLogin'], function (result) {
// 		alert(result.sLogin);
// 	});
// });


//----------------------------------//
//				Scripts				//
//----------------------------------//

function fadeInSuccessive(selector, t) {
	const items = $(selector);
	let index = 0;

	function next() {
		if (index < items.length) {
			items.eq(index++).fadeIn(t, next);
		}
	}

	next();
}

function formatLogTime(tmpMonth, logTimeMonth, objectiveMonth) {
	const d = new Date();
	d.getMonth();

	let color;
	let difference = 0;
	let progressBar = logTimeMonth / objectiveMonth * 100;
	const monthProgress = d.getDate() / nDays[tmpMonth - 1] * 100;

	if (logTimeMonth >= objectiveMonth) {
		difference = logTimeMonth - objectiveMonth;
		color = '#2abb77';
	} else {
		difference = objectiveMonth - logTimeMonth;
		color = '#da5a51';
	}

	let hours = Math.floor(difference / 3600);
	let minutes = Math.floor(difference % 3600 / 60);

	let formatedLogTime =
		'<h4 style="margin-top: 5px; margin-bottom: 5px;display: inline;">' +
		months[tmpMonth - 1] + ' :<p style="color: ' + color + ';display: inline;"> ' + hours + 'h ' + minutes + 'min</p>' +
		'</h4>' +
		'<div class="progressBar"><div style="width: ' + (progressBar > 100 ? 100 : progressBar) + '%"></div></div>' +
		'<h4 style="margin-top: -19px" align="center">' + Math.floor(logTimeMonth / 3600) + ' / ' + Math.floor(objectiveMonth / 3600) + 'h</h4>'

	if (d.getMonth() == tmpMonth - 1) {
		formatedLogTime += ' <div style="margin-left: -7px; margin-right: 7px"><div class="triangle-up" style="margin-left: ' + monthProgress + '%"></div></div>';
	}

	return (formatedLogTime);
}

const init = () => {
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
		if (tabs[0].url.match('^https:\\/\\/profile.intra.42.fr\\/')) {
			chrome.storage.sync.get(['sLogin'], (result) => {

				if (result.sLogin === undefined) {
					const loginResponse = $.ajax({
						type: "GET",
						url: "https://profile.intra.42.fr/",
						async: false
					}).responseText.match('data-login=\\\'(.*?)\\\'');
					chrome.storage.sync.set({sLogin: loginResponse[1]});
					result.sLogin = loginResponse[1];
				}

				const p1 = new Promise((resolve) => {
						$.getJSON('https://profile.intra.42.fr/users/' + result.sLogin + '/locations_stats', function (data) {
							let logTimeMonth = 0;
							let tmpMonth = null;
							let tmpYear = null;
							let logTimeContent = '';
							let currentDate;

							for (const i in data) {

								let logTimeDay = data[i].split(':');
								logTimeDay = parseInt(logTimeDay[0]) * 3600 + parseInt(logTimeDay[1]) * 60 + parseInt(logTimeDay[2]);

								currentDate = i.split('-');

								if (tmpMonth == null) {
									tmpMonth = currentDate[1];
									tmpYear = currentDate[0];
								}

								if (tmpMonth != currentDate[1]) {
									logTimeContent += formatLogTime(tmpMonth, logTimeMonth, (objectives[tmpYear][0][tmpMonth] * 7 * 3600));
									tmpMonth = currentDate[1];
									tmpYear = currentDate[0];
									logTimeMonth = 0;
								}
								logTimeMonth += logTimeDay;
							}

							logTimeContent += formatLogTime(tmpMonth, logTimeMonth, (objectives[tmpYear][0][tmpMonth] * 7 * 3600));
							$('#myLogTime').html(logTimeContent);
							resolve();
						});
					}
				);

				p1.then(() => {
					fadeInSuccessive("#intraPlus", 1000);
					$(".arrow-icon").click(function () {
						$(this).toggleClass("open");
					});
				});
			});
		}
	})
};

init();

