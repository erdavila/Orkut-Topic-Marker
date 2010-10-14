var Options = {
	'get' : function(handler) {
		if(chrome.extension.context == 'CONTENT-SCRIPT') {
			var request = {
				'type' : 'get_options',
			};
			chrome.extension.sendRequest(request, handler);
		} else {
			var options;
			try {
				options = JSON.parse(localStorage["USER_OPTIONS"]);
			} catch(ex) {
				options = null;
			}
			
			// Set defaults
			if(typeof(options)                       != 'object')    options = {};
			if(typeof(options.leaveOnTopicAllRead)   == 'undefined') options.leaveOnTopicAllRead = true;
			if(typeof(options.nextPageOnPageAllRead) == 'undefined') options.nextPageOnPageAllRead = true;
			if(typeof(options.leaveOnIgnore)         == 'undefined') options.leaveOnIgnore = true;
			if(typeof(options.openLastPage)          == 'undefined') options.openLastPage = true;
			
			handler(options);
		}
	},
	
	'set' : function(options) {
		if(chrome.extension.context == 'CONTENT-SCRIPT') {
			var request = {
				'type' : 'set_options',
			};
			chrome.extension.sendRequest(request);
		} else {
			localStorage["USER_OPTIONS"] = JSON.stringify(options);
		}
	},
};
