//----------------------------------//
//		   Const Declaration		//
//----------------------------------//
const d = new Date();

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const nDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // I know for feb

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

let storedLogtime;


//----------------------------------//
//			   Triggers				//
//----------------------------------//

//--- Redirection Links ---//

$('#goIntra').click(() => {
    chrome.tabs.create({url: "https://profile.intra.42.fr/"});
});
$('#goMatrix').click(() => {
    chrome.tabs.create({url: "https://the-matrix.le-101.fr/"});
});
$('#goTuteur').click(() => {
    chrome.tabs.create({url: "https://tuteurs.le-101.fr/"});
});
$('#goLogTime').click(() => {
    chrome.tabs.create({url: "http://logtime.42lyon.fr/index"});
});
$('#updateLogin').click(() => {
    $('#updateLogin').toggle();
    // chrome.storage.sync.remove('sLogin');
    chrome.storage.sync.clear();
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

function fadeInSuccessive(selector, t, bOut) {
    const items = $(selector);
    let index = 0;

    function next() {
        if (index < items.length) {
            items.eq(index++).fadeIn(t, next, bOut);
        }
    }

    next();
}

function formatLogTime(tmpMonth, logTimeMonth, objectiveMonth) {
    let color;
    let difference = 0;
    let progressBar = logTimeMonth / objectiveMonth * 100;
    const monthProgress = d.getDate() / nDays[tmpMonth - 1] * 100;
    // const monthProgress = 80;

    let differenceProgress = monthProgress - progressBar;

    // alert(differenceProgress);
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
        '<div class="progressBar">';

    if (differenceProgress >= 0 && d.getMonth() == tmpMonth - 1) {
        formatedLogTime += '' +
            '   <div class="currentProgress" style="width: ' + (progressBar > 100 ? 100 : progressBar) + '%"></div>' +
            '   <div class="lateProgress" style="width: ' + differenceProgress + '%"></div>';
    } else if (d.getMonth() == tmpMonth - 1) {
        differenceProgress = -differenceProgress;
        formatedLogTime +=
            '   <div class="currentProgress" style="width: ' + monthProgress + '%"></div>' +
            '   <div class="advanceProgress" style="width: ' + (differenceProgress + progressBar > 100 ? 100 - monthProgress : differenceProgress) + '%"></div>';
    } else {
        formatedLogTime +=
            '   <div class="currentProgress" style="width: ' + (progressBar > 100 ? 100 : progressBar) + '%"></div>';
    }
    formatedLogTime +=
        '</div>' +
        '<h4 style="margin-top: -19px" align="center">' + Math.floor(logTimeMonth / 3600) + ' / ' + Math.floor(objectiveMonth / 3600) + 'h</h4>'

    if (d.getMonth() == tmpMonth - 1) {
        formatedLogTime += ' <div style="margin-left: -2px; margin-right: 6px"><div class="triangle-up" style="margin-left: ' + monthProgress + '%"></div></div>';
    }

    return (formatedLogTime);
}

function updateStored(tmpYear, tmpMonth, logTimeMonth) {
    const storedIndex = tmpYear + '-' + tmpMonth + '-00';

    if (d.getMonth() != tmpMonth - 1) {
        if (storedLogtime === undefined) {
            storedLogtime = {[storedIndex]: logTimeMonth};
        } else {
            storedLogtime[storedIndex] = logTimeMonth;
        }
    }
}

const init = () => {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, (tabs) => {
        if (tabs[0].url.match('^https:\\/\\/profile.intra.42.fr\\/')) {

            // Login recovery
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
                    // Log-time request from locations_stats
                    // $.getJSON('https://profile.intra.42.fr/users/fpupier/locations_stats', function (data) {
                    $.getJSON('https://profile.intra.42.fr/users/' + result.sLogin + '/locations_stats', function (data) {

                        // data = {
                        //     "2020-01-15": "08:41:30",
                        //     "2020-01-14": "09:22:57",
                        //     "2020-01-13": "10:25:31",
                        //     "2020-01-12": "08:52:00",
                        //     "2020-01-11": "08:46:30",
                        //     "2020-01-10": "08:08:01",
                        //     "2020-01-09": "07:50:00",
                        //     "2020-01-08": "08:38:27",
                        //     "2020-01-07": "08:49:31",
                        //     "2020-01-06": "08:47:26",
                        //     "2020-01-04": "07:57:02",
                        //     "2020-01-03": "10:56:10",
                        //     "2020-01-02": "09:12:01",
                        //     "2020-01-01": "08:30:00",
                        //     "2019-12-31": "10:00:08",
                        //     "2019-12-30": "05:30:36",
                        //     "2019-12-29": "05:01:58",
                        //     "2019-12-28": "07:58:12",
                        //     "2019-12-27": "07:52:34",
                        //     "2019-12-23": "09:23:59",
                        //     "2019-12-22": "08:25:43",
                        //     "2019-12-21": "07:40:09",
                        //     "2019-12-20": "05:08:08",
                        //     "2019-12-19": "08:36:14",
                        //     "2019-12-18": "08:53:49",
                        //     "2019-12-17": "02:10:07",
                        //     "2019-12-16": "09:46:07",
                        //     "2019-12-15": "09:52:15",
                        //     "2019-12-14": "08:26:00",
                        //     "2019-12-13": "09:02:23",
                        //     "2019-12-12": "10:42:56",
                        //     "2019-12-11": "00:07:56",
                        //     "2019-12-10": "07:54:30",
                        //     "2019-12-08": "02:26:27",
                        //     "2019-12-07": "10:04:43",
                        //     "2019-12-06": "08:24:31",
                        //     "2019-12-05": "07:36:08",
                        //     "2019-12-04": "10:05:28",
                        //     "2019-12-03": "08:00:29",
                        //     "2019-12-02": "07:58:27",
                        //     "2019-12-01": "04:12:01",
                        //     "2019-11-30": "10:42:00",
                        //     "2019-11-29": "09:30:27",
                        //     "2019-11-28": "04:06:35",
                        //     "2019-11-21": "06:20:02",
                        //     "2019-11-19": "09:53:59",
                        //     "2019-11-09": "11:00:29",
                        //     "2019-11-08": "00:05:56",
                        //     "2019-11-07": "07:07:12",
                        //     "2019-11-06": "09:26:46",
                        //     "2019-11-04": "06:26:42",
                        //     "2019-11-02": "04:26:44",
                        //     "2019-11-01": "07:16:29",
                        //     "2019-10-31": "04:38:00",
                        //     "2019-10-30": "02:06:00",
                        //     "2019-10-29": "08:26:06",
                        //     "2019-10-28": "10:03:59",
                        //     "2019-10-26": "05:02:02",
                        //     "2019-10-25": "08:00:08",
                        //     "2019-10-23": "07:50:27",
                        //     "2019-10-22": "04:48:26",
                        //     "2019-10-21": "07:26:02",
                        //     "2019-10-18": "06:28:04",
                        //     "2019-10-17": "09:20:29",
                        //     "2019-10-16": "05:20:34",
                        //     "2019-10-15": "02:22:00",
                        //     "2019-10-14": "04:36:44",
                        //     "2019-10-10": "04:52:04",
                        //     "2019-10-09": "07:23:44",
                        //     "2019-10-08": "05:52:07",
                        //     "2019-10-07": "07:16:32",
                        //     "2019-10-04": "08:10:15",
                        //     "2019-10-02": "06:13:59",
                        //     "2019-09-30": "08:59:54",
                        //     "2019-09-27": "01:26:34",
                        //     "2019-09-26": "12:39:21",
                        //     "2019-09-25": "12:08:00",
                        //     "2019-09-24": "07:28:18",
                        //     "2019-09-23": "07:48:08",
                        //     "2019-09-22": "14:45:59",
                        //     "2019-09-21": "14:04:25",
                        //     "2019-09-20": "11:30:32",
                        //     "2019-09-19": "12:28:27",
                        //     "2019-09-18": "11:32:29",
                        //     "2019-09-17": "11:42:08",
                        //     "2019-09-16": "11:38:08",
                        //     "2019-09-15": "10:28:00"
                        // };

                        let logTimeMonth = 0;
                        let tmpMonth = null;
                        let tmpYear = null;
                        let logTimeContent = '';
                        let currentDate;

                        const d = new Date();
                        d.getMonth();

                        chrome.storage.sync.get((result) => {
                            storedLogtime = result[result.sLogin];

                            // Merge stored and requested datas
                            // for (const i in storedLogtime) {
                            //     data[i] = storedLogtime[i];
                            // }

                            // data['2019-11-00'] = 478900;
                            console.log(data);

                            // Iteration on request Data
                            for (const i in data) {
                                let logTimeDay = 0;

                                currentDate = i.split('-');
                                if (currentDate[2] === '00' && currentDate[0] !== d.getFullYear()) {
                                    logTimeDay = parseInt(data[i]);
                                } else if (data[currentDate[0] + '-' + currentDate[1] + '-00'] === undefined) {
                                    logTimeDay = data[i].split(':');
                                    logTimeDay = parseInt(logTimeDay[0]) * 3600 + parseInt(logTimeDay[1]) * 60 + parseInt(logTimeDay[2]);
                                }

                                // First iteration definition
                                if (tmpMonth == null) {
                                    tmpMonth = currentDate[1];
                                    tmpYear = currentDate[0];
                                }

                                // On month change
                                if (tmpMonth !== currentDate[1]) {
                                    logTimeContent += formatLogTime(tmpMonth, logTimeMonth, (objectives[tmpYear][0][tmpMonth] * 7 * 3600));


                                    updateStored(tmpYear, tmpMonth, logTimeMonth);

                                    tmpMonth = currentDate[1];
                                    tmpYear = currentDate[0];
                                    logTimeMonth = 0;
                                }
                                logTimeMonth += logTimeDay;
                            }
                            updateStored(tmpYear, tmpMonth, logTimeMonth);

                            chrome.storage.sync.set({[result.sLogin]: storedLogtime});

                            logTimeContent += formatLogTime(tmpMonth, logTimeMonth, (objectives[tmpYear][0][tmpMonth] * 7 * 3600));
                            $('#myLogTime').html(logTimeContent);
                            resolve();
                        });
                    });
                });

                // Display the formatted output
                p1.then(() => {
                    fadeInSuccessive("#intraPlus", 1000);
                    $('#updateLogin').show();
                });
            });
        }
    })
};

init();

