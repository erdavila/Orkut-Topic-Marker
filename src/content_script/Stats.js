var Stats = {
	setCommunityMainPage: function(isCommunityMainPage) {
		this.isCommunityMainPage = isCommunityMainPage;
	},
	
	setOldOrkut: function(isOldOrkut) {
		this.isOldOrkut = isOldOrkut;
	},
	
	setCommunityId: function(communityId) {
		this.communityId = communityId;
	},
	
	setTopicId: function(topicId) {
		this.topicId = topicId;
	},
		
		
	topicListPageview: function() {
		var url = this.isCommunityMainPage
		        ? '/Main#Community'
		        : '/Main#CommTopics'
		        ;
		
		var request = {
			type: 'stats',
			commands: [
	   			this._setCommunityIdCommand(),
	   			this._setOldOrkutCommand(),
				['_trackPageview', url],
				this._unsetOldOrkutCommand(),
				this._unsetCommunityIdCommand(),
			],
		};
		
		chrome.extension.sendRequest(request);
	},
	
	
	topicMessagesPageview: function() {
		var url = "/Main#CommMsgs";
		
		var request = {
			type: 'stats',
			commands: [
	   			this._setCommunityIdCommand(),
	   			this._setTopicIdCommand(),
	   			this._setOldOrkutCommand(),
				['_trackPageview', url],
	   			this._unsetOldOrkutCommand(),
				this._unsetTopicIdCommand(),
				this._unsetCommunityIdCommand(),
			],
		};
		
		chrome.extension.sendRequest(request);
	},
	
	
	_setCommunityIdCommand: function() {
		return ['_setCustomVar', 2/*slot*/, 'cmm', this.communityId, 3/*scope:page*/];
	},
	
	
	_unsetCommunityIdCommand: function() {
		return ['_deleteCustomVar', 2/*slot*/];
	},
	
	
	_setTopicIdCommand: function() {
		var tid = this.communityId + ':' + this.topicId;
		return ['_setCustomVar', 3/*slot*/, 'tid', tid, 3/*scope:page*/];
	},
	
	
	_unsetTopicIdCommand: function() {
		return ['_deleteCustomVar', 3/*slot*/];
	},
	
	
	_setOldOrkutCommand: function() {
		var orkutVer = this.isOldOrkut ? 'old' : 'new';
		return ['_setCustomVar', 5/*slot*/, 'orkut version', orkutVer, 3/*scope:page*/];
	},
	
	
	_unsetOldOrkutCommand: function() {
		return ['_deleteCustomVar', 5/*slot*/];
	},
	
};
