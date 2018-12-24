/**
When we receive the message, execute the given script in the given
tab.
*/
var url;
var refrerrer;
var user_agent;
var cookie;
var method;
var postDataCurrent;

function htmlEscape(inputstr) {
    return inputstr
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getPostData(e) {
	if ( e.method == "POST" && e.requestBody ) {
		let rawData = e.requestBody.formData;
		postDataCurrent = "";
		for (let key in rawData) {
			if (rawData.hasOwnProperty(key)) {
				postDataCurrent = postDataCurrent + key + "=" + rawData[key] + "&";
			}
		}
		postDataCurrent = postDataCurrent.slice(0,-1); // remove last &
	}
}

browser.webRequest.onBeforeRequest.addListener(
	getPostData,
	{urls: ["<all_urls>"], types: ["main_frame"]},
	["requestBody"]
);

function getCurrentTabUrl(sendResponse){
	browser.tabs.query({active:true, currentWindow:true}).then(tabs => {
		currentTabUrl = tabs[0].url;
		sendResponse({url: currentTabUrl, data: postDataCurrent});
	});
}

function isExistHeaders(name, requestHeaders){
	for(i=0; i< requestHeaders.length; i++){
		var v = requestHeaders[i];
		if(v.name.toLowerCase() === name){
			return i;
		}
	}
	return -1;
}
function rewriteHeaders(e) {
	//add referer
	if(refrerrer){
		index_referer = isExistHeaders('referer', e.requestHeaders);
		if(index_referer != -1){
			e.requestHeaders[index_referer].value = refrerrer;
		}else{
			e.requestHeaders.push({
				name: "Referer",
				value: refrerrer
			});
		}
	}
	//modify user agent
	if(user_agent){
		index_user_agent = isExistHeaders('user-agent', e.requestHeaders);
		if(index_user_agent != -1){
			e.requestHeaders[index_user_agent].value = user_agent;
		}else{
			e.requestHeaders.push({
				name: "User-Agent",
				value: user_agent
			});
		}
	}
	//modify cookie
	if(cookie){
		index_cookie = isExistHeaders('cookie', e.requestHeaders);
		if(index_cookie != -1){
			e.requestHeaders[index_cookie].value = cookie;
		}else{
			e.requestHeaders.push({
				name: "Cookie",
				value: cookie
			});
		}
	}
	browser.webRequest.onBeforeSendHeaders.removeListener(rewriteHeaders);
	return {requestHeaders: e.requestHeaders};
}

function handleMessage(request, sender, sendResponse) {
	if (sender.url !== browser.runtime.getURL("/theme/hackbar-panel.html")) {
		return;
	}

	var tabId = request.tabId;
	var action = request.action;
	switch(action){
		case 'send_requests':
			var Data = request.data;
			console.log(Data);
			url = Data.url;
			method = Data.method;
			refrerrer = Data.refrerrer;
			user_agent = Data.user_agent;
			cookie = Data.cookie;
			//content_type = request.content_type;
			if(method == 'GET'){
				browser.tabs.update({url: url});
			}else{
				var post_data = JSON.stringify(Data.post_data);
				console.log(post_data);
				browser.tabs.executeScript(tabId, {code: 'var post_data = "'+encodeURIComponent(post_data)+'"; var url = "'+ encodeURIComponent(url) +'"'}, function(){
					browser.tabs.executeScript(tabId, {file: 'theme/js/post_form.js'});
				});
			}
			browser.webRequest.onBeforeSendHeaders.addListener(
				rewriteHeaders,
				{urls: ["<all_urls>"], types: ["main_frame"]},
				["blocking", "requestHeaders"]
			);
			sendResponse({status: true});
			break;
		case 'load_url':
			getCurrentTabUrl(sendResponse);
			break;
		case 'selected_text':
			var code = 'var user_input; user_input = prompt("Please enter some text")';
			browser.tabs.executeScript(tabId, {code: code}, function(user_input){
				sendResponse({user_input: user_input[0]});
			});
			break;
	}
	return true;
}

/**
Listen for messages from our devtools panel.
*/
browser.runtime.onMessage.addListener(handleMessage);