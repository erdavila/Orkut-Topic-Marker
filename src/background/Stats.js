var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);


var Stats = {
	setVersion: function(version) {
		_gaq.push(['_setCustomVar', 1/*slot*/, 'ver', version, 2/*scope:session*/]);
	},
	
	pageview: function(url) {
		if(url) {
			_gaq.push(['_trackPageview', url]);
		} else {
			_gaq.push(['_trackPageview']);
		}
	},
	
	loaded: function() {
		this._event('main page', 'loaded');
	},
	
	install: function(newVersion, oldVersion) {
		if(oldVersion) {
			this._event('install', 'update', newVersion + '<-' + oldVersion);
		} else {
			this._event('install', 'new', newVersion);
		}
	},
	
	instructionsOpened: function() {
		this._event('instructions page', 'on install');
	},
	
	optionsSaved: function() {
		this._event('options page', 'options saved');
	},
	
	dataImported: function() {
		this._event('options page', 'data imported');
	},
	
	command: function(command) {
		_gaq.push(command);
	},
	
	_event: function(category, action, value) {
		_gaq.push(['_trackEvent', category, action, value]);
	},
};


(function() {
	var ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
})();		
