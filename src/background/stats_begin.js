var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXXXXX-X']);


var stats = (function() {
	return {
		setVersion: function(version) {
			_gaq.push(['_setCustomVar', 1/*slot*/, 'v', version, 2/*scope:session*/]);
		},
		
		pageview: function(url) {
			if(url) {
				_gaq.push(['_trackPageview', url]);
			} else {
				_gaq.push(['_trackPageview']);
			}
		},
		
		install: function(newVersion, oldVersion) {
			if(oldVersion) {
				_gaq.push(['_trackEvent', 'install', 'update', newVersion + '<-' + oldVersion]);
			} else {
				_gaq.push(['_trackEvent', 'install', 'new', newVersion]);
			}
		},
		
		instructionsOpened: function() {
			_gaq.push(['_trackEvent', 'Instructions Page', 'on install']);
		},
	};
})();
