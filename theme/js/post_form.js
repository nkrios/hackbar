function getFieldFormData(dataString){
	dataString = dataString.trim();
	var fields = Array();
	var f_split = dataString.split('&');
	for (i in f_split){
		var f = f_split[i].match(/(^.*?)=(.*)/);
		if(f.length == 3){
			var item = new Object();
			item['name'] = f[1];
			item['value'] = f[2];
			fields.push(item);
		}
	}
	return fields;
}

function htmlUnescape(inputstr){
    return inputstr
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

var fields = getFieldFormData(htmlUnescape(post_data));

var form = document.createElement("form");
form.setAttribute("method", "post");
form.setAttribute("action", unescape(url));
fields.forEach(function(f){
	var input = document.createElement("input");
	input.setAttribute("type", "hidden");
	input.setAttribute("name", f['name']);
	input.setAttribute("value", f['value']);
	form.appendChild(input);
})
document.body.appendChild(form);
form.submit();