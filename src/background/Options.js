var Options = {
	get: function(handler) {
		var options;
		try {
			options = JSON.parse(localStorage["USER_OPTIONS"]);
		} catch(ex) {
			options = null;
		}
		
		// Define valores padrão
		if(options == null  ||   typeof(options) != 'object')    options = {};
		if(typeof(options.leaveOnTopicAllRead)   == 'undefined') options.leaveOnTopicAllRead = true;
		if(typeof(options.nextPageOnPageAllRead) == 'undefined') options.nextPageOnPageAllRead = true;
		if(typeof(options.leaveOnIgnore)         == 'undefined') options.leaveOnIgnore = true;
		if(typeof(options.openLastPage)          == 'undefined') options.openLastPage = true;
		
		handler(options);
	},
	
	set: function(options) {
		localStorage["USER_OPTIONS"] = JSON.stringify(options);
	},
};
