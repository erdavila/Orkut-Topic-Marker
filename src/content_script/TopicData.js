function TopicData() {

}


TopicData.get = function(topicId, handler) {
	var request = {
		type: 'get',
		topicId: topicId,
	};
	chrome.extension.sendRequest(request, handler);
};


TopicData.set = function(topicData, handler) {
	var request = topicData;
	request.type = 'set';
	chrome.extension.sendRequest(request, handler);
};
