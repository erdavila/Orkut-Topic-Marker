function TopicData() {

}


TopicData.get = function(topicId, handler) {
	var request = {
		type: 'get',
		topicId: topicId,
	};
	chrome.extension.sendRequest(request, handler);
};
