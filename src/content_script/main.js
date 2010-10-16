var currentHash = '';

setInterval(function() {
	var hash = document.location.hash;
	if(hash != currentHash) {
		var identifiedPage = identifyPage(hash);
		var pageProcessor = new identifiedPage.processor(identifiedPage);
		
		if(pageProcessor.pageIsReady()) {
			pageProcessor.process();
			currentHash = hash;
		}
	}
}, 1000);


function identifyPage(hash) {
	var m;
	var identifiedPage = {};
	
	if(m = hash.match(/^#Community\?cmm=(\d+)/)) {
		identifiedPage.communityId = m[1];
		identifiedPage.communityMainPage = true;
		identifiedPage.processor = TopicListPageProcessor;
	} else if(m = hash.match(/^#CommTopics\?cmm=(\d+)/)) {
		identifiedPage.communityId = m[1];
		identifiedPage.processor = TopicListPageProcessor;
	} else if(m = hash.match(/^#CommMsgs\?cmm=(\d+)&tid=(\d+)/)) {
		identifiedPage.topicId = m[2];
		identifiedPage.communityId = m[1];
		identifiedPage.processor = TopicMessagesPageProcessor;
	} else {
		identifiedPage.processor = OtherPageProcessor;
	}
	
	return identifiedPage;
}


function OtherPageProcessor() { ; }
OtherPageProcessor.prototype.pageIsReady = function() { return true; }
OtherPageProcessor.prototype.process = function() { ; }



function insertAfter(what, where) {
	where.parentNode.insertBefore(what, where.nextSibling);
}

function removeChildren(parent) {
	while(parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild);
	}
}
