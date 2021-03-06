chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		switch(request.type) {
			case 'get':
				var value = localStorage[request.topicId];
				var response = TopicData.fromString(value);
				sendResponse(response);
				break;
				
			case 'set':
				var topicData = TopicData.fromObject(request);
				if(topicData.lastReadMsg == 0  &&  !topicData.ignored) {
					delete localStorage[request.topicId];
				} else {
					topicData.timestamp = Date.now();
					localStorage[request.topicId] = topicData.toString();
				}
				sendResponse({});
				break;
			
			case 'get_options':
				Options.get(sendResponse);
				break;
			
			case 'set_options':
				/* NÃO IMPLEMENTADO! */
				break;
				
			case 'stats':
				for(var i = 0; i < request.commands.length; i++) {
					var command = request.commands[i];
					Stats.command(command);
				}
				break;
		}
	});


Options.get(function(options) {
	getManifest(function(manifest) {
		Stats.setVersion(manifest.version);
		Stats.loaded();
		
		var lastUsedVersion = options.lastUsedVersion;
		if(lastUsedVersion != manifest.version) {
			if(compareVersions(lastUsedVersion, "2.0.0") < 0) {
				// Mostra instruções quando uma nova versão é instalada
				openInstructions();
			}
			
			options.lastUsedVersion = manifest.version;
			Options.set(options);
			
			Stats.install(manifest.version, lastUsedVersion);
		}
	});
});


function getManifest(handler) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(req.readyState == 4) {
			 var manifest = JSON.parse(req.responseText);
			 handler(manifest);
		}
	};
	req.open("GET", "/manifest.json", true);
	req.send();
}


function openInstructions() {
	chrome.tabs.create({ 'url' : '/background/options.html#instructions' });
	Stats.instructionsOpened();
}

function compareVersions(v1, v2) {
	if(!v1) {
		v1 = "0";
	}
	v1 = v1.split(".");
	v2 = v2.split(".");
	var len = Math.max(v1.length, v2.length);
	while(v1.length < len) { v1.push(0); }
	while(v2.length < len) { v2.push(0); }
	
	for(var i = 0; i < len; i++) {
		var n1 = parseInt(v1[i]);
		var n2 = parseInt(v2[i]);
		if(n1 > n2) {
			return +1;
		} else if(n1 < n2) {
			return -1;
		}
	}
	
	// Versões iguais
	return 0;
}
