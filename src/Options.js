var Options = {
	'get' : function(handler) {
		if(chrome.extension.context == 'CONTENT-SCRIPT') {
			var request = {
				'type' : 'get_options',
			};
			chrome.extension.sendRequest(request, handler);
		} else {
			var userOptions;
			try {
				userOptions = JSON.parse(localStorage["USER_OPTIONS"]);
			} catch(ex) {
				userOptions = null;
			}
			
			if(!userOptions) {
				// Default options
				userOptions = {
					'leaveOnIgnore' : true,
				};
			}
			
			handler(userOptions);
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
