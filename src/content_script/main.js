var currentPageState = {
	hash: '',
	fromTransitionData: null,
	toTransitionData: null,
	getTransitionData: function() { return this.fromTransitionData; },
	setTransitionData: function(data) { this.toTransitionData = data; },
};

setInterval(function() {
	// Detects if the page has changed
	var hash = document.location.hash;
	if(hash != currentPageState.hash) {
		var identifiedPage = identifyPage(hash);
		var pageProcessor = new identifiedPage.processor(identifiedPage);
		
		if(pageProcessor.pageIsReady()) {
			pageProcessor.process();
			currentPageState.hash = hash;
			currentPageState.fromTransitionData = currentPageState.toTransitionData;
			currentPageState.toTransitionData = null;
		}
	}
}, 1000);


/*
 * Identifies the type of page current loaded:
 *      - community main page
 *      - topics listing
 *      - topic messages
 */
function identifyPage(hash) {
	var m;
	var identifiedPage = {};
	
	identifiedPage.doc = document;
	var oldVersion = false;
	
	var orkutFrame = document.getElementById('orkutFrame');
	if(orkutFrame) {
		var doc = orkutFrame.contentDocument;
		if(doc.body.innerHTML != "") {
			// Versão antiga do Orkut
			identifiedPage.doc = doc;
			oldVersion = true;
		}
	}
	
	if(m = hash.match(/^#Community\?cmm=(\d+)/)) {
		identifiedPage.communityId = m[1];
		identifiedPage.communityMainPage = true;
		identifiedPage.processor = oldVersion
		                         ? TopicListPageProcessorOld
		                         : TopicListPageProcessor;
	} else if(m = hash.match(/^#CommTopics\?cmm=(\d+)/)) {
		identifiedPage.communityId = m[1];
		identifiedPage.processor = oldVersion
		                         ? TopicListPageProcessorOld
		                         : TopicListPageProcessor;
	} else if(m = hash.match(/^#CommMsgs\?cmm=(\d+)&tid=(\d+)/)) {
		identifiedPage.topicId = m[2];
		identifiedPage.communityId = m[1];
		identifiedPage.processor = oldVersion
		                         ? TopicMessagesPageProcessorOld
		                         : TopicMessagesPageProcessor;
	} else {
		identifiedPage.processor = OtherPageProcessor;
	}
	
	return identifiedPage;
}


// Dummy page-processor for pages without any message or topic
function OtherPageProcessor() { ; }
OtherPageProcessor.prototype.pageIsReady = function() { return true; };
OtherPageProcessor.prototype.process = function() { ; };



function insertAfter(what, where) {
	where.parentNode.insertBefore(what, where.nextSibling);
}

function removeChildren(parent) {
	while(parent.hasChildNodes()) {
		parent.removeChild(parent.firstChild);
	}
}
