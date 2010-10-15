function TopicData(lastReadMsg, timestamp, ignored) {
	this.lastReadMsg = parseInt(lastReadMsg);
	this.timestamp   = parseInt(timestamp);
	this.ignored     = ignored;
	
	if(isNaN(this.lastReadMsg)) {
		this.lastReadMsg = 0;
	}
}

TopicData.prototype.toString = function() {
	var str = this.lastReadMsg;
	str = TopicData._appendValue(str, this.timestamp);
	str = TopicData._appendValue(str, this.ignored ? 'ignored' : null);
	str = str.replace(/:+$/, '');
	return str;
};

TopicData.fromObject = function(obj) {
	return new TopicData(obj.lastReadMsg, obj.timestamp, obj.ignored);
};

TopicData.fromString = function(str) {
	if(str == null) {
		return new TopicData();
	}

	var parts = str.split(':');
	var lastReadMsg = parts[0];
	var timestamp   = parts[1];
	var ignored     = parts[2];
	return new TopicData(lastReadMsg, timestamp, ignored);
};

TopicData._appendValue = function(str, value) {
	str += ':';
	if(value != null) {
		str += value;
	}
	return str;
};
