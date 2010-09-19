/*
mudar de:
	localStorage[topicId] = lastReadMsg
para:
	localStorage[communityId + ":" + topicId] = lastReadMsg + ":" + timestamp
*/


var currentHash = '';
var page;
setInterval(function() {
	var hash = document.location.hash;
	if(hash != currentHash) {
		try {
			var m;
			if(m = hash.match(/^#CommMsgs\?cmm=(\d+)&tid=(\d+)/)) {
				var topicId = m[2];
				var communityId = m[1];
				page = new TopicMessagesPage(topicId, communityId);
			} else if(m = hash.match(/^#CommTopics\?cmm=(\d+)/)) {
				var communityId = m[1];
				page = new TopicListPage(communityId);
			} else {
				page = null;
			}
			
			if(page) {
				page.update();
			}
			
			currentHash = hash;
		} finally {
			;
		}
	}
	
}, 1000);


function insertAfter(what, where) {
	where.parentNode.insertBefore(what, where.nextSibling);
}
