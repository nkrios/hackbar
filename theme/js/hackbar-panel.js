var urlField = document.querySelector('#url_field');
var postDataField = document.querySelector('#post_data_field');
var referrerField = document.querySelector('#referrer_field');
var userAgentField = document.querySelector('#user_agent_field');
var cookieField = document.querySelector('#cookie_field');

var loadUrlBtn = document.querySelector('#load_url_btn');
var splitUrlBtn = document.querySelector('#split_url_btn');
var executeBtn = document.querySelector('#execute_btn');

var md5Btn = document.querySelector('#md5_btn');
var sha1Btn = document.querySelector('#sha1_btn');
var sha256Btn = document.querySelector('#sha256_btn');
var rot13Btn = document.querySelector('#rot13_btn');
var base64EncodeBtn = document.querySelector('#base64_encode_btn');
var base64DecodeBtn = document.querySelector('#base64_decode_btn');
var urlEncodeBtn = document.querySelector('#url_encode_btn');
var urlDecodeBtn = document.querySelector('#url_decode_btn');
var hexEncodeBtn = document.querySelector('#hex_encode_btn');
var hexDecodeBtn = document.querySelector('#hex_decode_btn');
var jsonifyBtn = document.querySelector('#jsonify_btn');
var uppercaseBtn = document.querySelector('#uppercase_btn');
var lowercaseBtn = document.querySelector('#lowercase_btn');
// Block postdata and refrerrer
var enablePostBtn = document.querySelector('#enable_post_btn');
var enableReferrerBtn = document.querySelector('#enable_referrer_btn');
var enableUserAgentBtn = document.querySelector('#enable_user_agent_btn');
var enableCookieBtn = document.querySelector('#enable_cookie_btn');

var postDataBlock = document.querySelector('#post_data_block');
var referrerBlock = document.querySelector('#referrer_block');
var userAgentBlock = document.querySelector('#user_agent_block');
var cookieBlock = document.querySelector('#cookie_block');

var currentFocusField = urlField;
function onFocusListener(){
	currentFocusField = this;
}
/* Other function */
function jsonValid(text){
	try{
		var result = JSON.parse(text);
		return result;
	}catch(e){
		return false;
	}
}
function getContenType(dataString){
	isJson = jsonValid(dataString);
	if (isJson){
		contentType = 'application/json';
	}else if(dataString.indexOf('Content-Disposition: form-data; name=') > -1){
		contentType = 'multipart/form-data; boundary="boundary"';
	}else if(dataString.indexOf('&') > -1 || dataString.indexOf('=') > -1){
		contentType = 'application/x-www-form-urlencoded';
	}else{
		contentType = 'text/xml';
	}
	return contentType;
}

function getFieldFormData(dataString){
	dataString = dataString.trim();
	var fields = Array();
	var item = new Object();
	var f_split = dataString.split('&');

	for (i in f_split){
		var f = f_split[i].match(/(^.*?)=(.*)/);
		if(f.length == 3){
			item['name'] = f[1];
			item['value'] = f[2];
			fields.push(item);
		}
	}
	return fields;
}

function urlEncode(inputstr)
{
	return encodeURIComponent(inputstr).toLowerCase();
}

function jsonBeautify(inputstr){
	var jsonString = jsonValid(inputstr);
	if(jsonString){
		return JSON.stringify(jsonString, null, 4);
	}
	return false;
}
function upperCaseString(inputstr){
	return inputstr.toUpperCase();
}
function lowerCaseString(inputstr){
	return inputstr.toLowerCase();
}

//on fucus listenner field
urlField.addEventListener('click', onFocusListener, false);
postDataField.addEventListener('click', onFocusListener, false);
referrerField.addEventListener('click', onFocusListener, false);
userAgentField.addEventListener('click', onFocusListener, false);
cookieField.addEventListener('click', onFocusListener, false);

// toggle element
function toggleElement(elementBtn, elementBlock){
	if(elementBtn.checked){
		elementBlock.style.visibility = "visible";
		elementBlock.style.position = "relative";
	}else{
		elementBlock.style.visibility = "hidden";
		elementBlock.style.position = "absolute";
	}
}

function loadUrl() {
	sending = browser.runtime.sendMessage({
		tabId: browser.devtools.inspectedWindow.tabId,
		action: 'load_url'
	});
	sending.then(function(message){
		if (message.url){
			urlField.value = message.url;
		}
		if (message.data && postDataField.value == "") {
			postDataField.value = message.data;
		}
	});
}

function splitUrl(){
	var uri = currentFocusField.value;
	uri = uri.replace(new RegExp(/&/g), "\n&");
	uri = uri.replace(new RegExp(/\?/g), "\n?");
	currentFocusField.value = uri;
	return true;
}

function execute(){
	var refrerrer = null;
	var user_agent = null;
	var cookie = null;
	var post_data = null;
	if(enableReferrerBtn.checked){
		refrerrer = referrerField.value;
	}
	if(enablePostBtn.checked){
		post_data = postDataField.value;
	}
	if(enableUserAgentBtn.checked){
		user_agent = userAgentField.value;
	}
	if(enableCookieBtn.checked){
		cookie = cookieField.value;
	}

	var url = urlField.value;
	url = url.replace(new RegExp(/\n|\r/g), '');
	url = url.trim();
	if(!(new RegExp(/^(http:\/\/|https:\/\/|view-source:)/gi)).test(url)){
		url = 'http://' + url;
	}
	if (!url){
		return;
	}
	if (!enablePostBtn.checked){
		browser.runtime.sendMessage({
			tabId: browser.devtools.inspectedWindow.tabId,
			action: 'send_requests',
			url: url,
			method: 'GET',
			refrerrer: refrerrer,
			user_agent: user_agent,
			cookie: cookie
		});
	}else{
		if(!postDataField.value){
			return;
		}
		var postData = postDataField.value;
		//var contentType = getContenType(postData);
		browser.runtime.sendMessage({
			tabId: browser.devtools.inspectedWindow.tabId,
			action: 'send_requests',
			url: url,
			method: 'POST',
			data: postData,
			//content_type : contentType,
			refrerrer: refrerrer,
			user_agent: user_agent,
			cookie: cookie
		});
	}
}

function getSelectedText ()
{
	var selectionStart = this.currentFocusField.selectionStart;
	var selectionEnd = this.currentFocusField.selectionEnd;
	if (selectionEnd - selectionStart < 1) {
		browser.runtime.sendMessage({
			tabId: browser.devtools.inspectedWindow.tabId,
			action: 'selected_text'
		});
		return false;
	} else {
		return this.currentFocusField.value.substr( selectionStart, selectionEnd - selectionStart );
	}
}

function setSelectedText(str)
{
	var selectionStart = this.currentFocusField.selectionStart;
	var selectionEnd = this.currentFocusField.selectionEnd;
	var pre = this.currentFocusField.value.substr( 0, selectionStart );
	var post = this.currentFocusField.value.substr( selectionEnd, this.currentFocusField.value.length );
	this.currentFocusField.value = pre + str + post;
	this.currentFocusField.selectionStart = selectionStart;
	this.currentFocusField.selectionEnd = selectionStart + str.length;
}

function onclickMenu(action){
	var txt = '';
	var newString = '';
	switch(action){
		case 'md5':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.md5(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'sha1':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.sha1(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'sha256':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.sha2(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'rot13':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.rot13(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'base64encode':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.base64Encode(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'base64decode':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.base64Decode(txt);
				if(newString){
					this.setSelectedText(newString);
				}
			}
			break;
		case 'urlencode':
			txt = getSelectedText();
			if(txt){
				newString = urlEncode(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'urldecode':
			txt = getSelectedText();
			if(txt){
				newString = unescape(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'hexencode':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.strToHex(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'hexdecode':
			txt = getSelectedText();
			if(txt){
				newString = Encrypt.hexToStr(txt);
				this.setSelectedText(newString);
			}
			break;
		case 'jsonify':
			txt = getSelectedText();
			if(txt){
				newString = jsonBeautify(txt);
				if(newString){
					this.setSelectedText(newString);
				}
			}
			break;
		case 'uppercase':
			txt = getSelectedText();
			if(txt){
				newString = upperCaseString(txt);
				if(newString){
					this.setSelectedText(newString);
				}
			}
			break;
		case 'lowercase':
			txt = getSelectedText();
			if(txt){
				newString = lowerCaseString(txt);
				if(newString){
					this.setSelectedText(newString);
				}
			}
			break;
	}
	currentFocusField.focus();
}


loadUrlBtn.addEventListener('click', loadUrl);
splitUrlBtn.addEventListener('click', splitUrl);
executeBtn.addEventListener('click', execute);

enablePostBtn.addEventListener('click', () => toggleElement(enablePostBtn, postDataBlock));
enableReferrerBtn.addEventListener('click', () => toggleElement(enableReferrerBtn, referrerBlock));
enableUserAgentBtn.addEventListener('click', () => toggleElement(enableUserAgentBtn, userAgentBlock));
enableCookieBtn.addEventListener('click', () => toggleElement(enableCookieBtn, cookieBlock));

md5Btn.addEventListener('click', () => onclickMenu('md5'));
sha1Btn.addEventListener('click', () => onclickMenu('sha1'));
sha256Btn.addEventListener('click', () => onclickMenu('sha256'));
rot13Btn.addEventListener('click', () => onclickMenu('rot13'));
base64EncodeBtn.addEventListener('click', () => onclickMenu('base64encode'));
base64DecodeBtn.addEventListener('click', () => onclickMenu('base64decode'));
urlEncodeBtn.addEventListener('click', () => onclickMenu('urlencode'));
urlDecodeBtn.addEventListener('click', () => onclickMenu('urldecode'));
hexEncodeBtn.addEventListener('click', () => onclickMenu('hexencode'));
hexDecodeBtn.addEventListener('click', () => onclickMenu('hexdecode'));
jsonifyBtn.addEventListener('click', () => onclickMenu('jsonify'));
uppercaseBtn.addEventListener('click', () => onclickMenu('uppercase'));
lowercaseBtn.addEventListener('click', () => onclickMenu('lowercase'));

// Keyboard listener
window.addEventListener('keypress', function(event) {
	if ('key' in event && event.altKey) {
		switch(event.charCode){
			case 97: // a
				loadUrl();
				break;
			case 120: // x
				execute();
				break;
			case 112: //p
				splitUrl()
				break;
			case 117: //u
				onclickMenu('urlencode');
				break;
			case 85: //U
				onclickMenu('urldecode');
				break;
			case 99: //c
				onclickMenu('base64encode');
				break;
			case 67: //C
				onclickMenu('base64decode');
				break;
		}
	}
});
