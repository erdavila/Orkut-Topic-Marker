var Options = {
	get: function(handler) {
		var request = {
			type: 'get_options',
		};
		chrome.extension.sendRequest(request, handler);
	},
	
	set: function(options) {
		var request = {
			type: 'set_options',
			options: options,
		};
		chrome.extension.sendRequest(request);
	},
};
