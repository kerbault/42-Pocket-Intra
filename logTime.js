// chrome.runtime.onInstalled.addListener(function () {
//     chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
//         chrome.declarativeContent.onPageChanged.addRules([{
//             conditions: [new chrome.declarativeContent.PageStateMatcher({pageUrl: {hostEquals: 'profile.intra.42.fr'}})],
//             actions: [new chrome.declarativeContent.ShowPageAction()]
//         }]);
//     });
// });