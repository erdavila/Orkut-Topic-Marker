function TopicListPage(communityId, communityMainPage) {
	this.communityId = communityId;
	if(communityMainPage) {
		this.topicLinkColumnIndex = 1;
		this.totalColumnIndex = 2;
		this.statusColumnPosition = 2;
		this.topicTitleResizeWidth = "55%";
	} else {
		this.topicLinkColumnIndex = 1;
		this.totalColumnIndex = 3;
		this.statusColumnPosition = 3;
		this.topicTitleResizeWidth = "40%";
	}
	
	var orkutFrame = document.getElementById('orkutFrame');
	this.doc = orkutFrame.contentDocument;
	
	if(this.doc.getElementsByClassName("rf").length < 2) {
		// Não terminou de carregar a página
		throw new Error("Page not yet fully loaded");
	}
	
	var table = this.doc.getElementsByClassName('displaytable')[0];
	var rows = table.getElementsByTagName('tr');
	
	// Adiciona cabeçalho da nova coluna
	var headerRow = rows[0];
	var th = this.doc.createElement('th');
	th.textContent = 'status';
	th.style.textAlign = 'center';
	var headers = headerRow.getElementsByTagName('th');
	headerRow.insertBefore(th, headers[this.statusColumnPosition]);
	headers[1].width = this.topicTitleResizeWidth;
	
	// Processa cada linha
	for(var r = 1; r < rows.length; r++) {
		var row = rows[r];
		this.processRow(row);
	}
}


TopicListPage.prototype.processRow = function(row) {
	var cells = row.getElementsByTagName('td');
	
	var linkCell = cells[this.topicLinkColumnIndex];
	var topicUrl = linkCell.getElementsByTagName('a')[0].href;
	var m = topicUrl.match(/tid=(\d+)/);
	var topicId = m[1];
	
	var totalCell = cells[this.totalColumnIndex];
	var totalMsgs = parseInt(totalCell.textContent.replace(".", ""));
	
	
	var me = this;
	
	var request = {
		'type'  : 'get',
		'topic' : topicId,
	}
	chrome.extension.sendRequest(
		request,
		function(response) {
			var status = {};
			if(response.ignored) {
				status.icon = "ignored";
				status.tip = chrome.i18n.getMessage("topicList_tooltip_ignored");
			} else {
				var unreadMsgs = totalMsgs - response.lastReadMsg;
				
				if(response.lastReadMsg == totalMsgs  ||  totalMsgs == 0) {
					status.icon = 'check';
					status.tip = chrome.i18n.getMessage("topicList_tooltip_allRead");
				} else if(response.lastReadMsg == 0) {
					status.icon = "exclamation";
					status.tip = chrome.i18n.getMessage("topicList_tooltip_noneRead");
					status.text = unreadMsgs;
				} else if(totalMsgs > response.lastReadMsg) {
					status.icon = 'star';
					status.tip = chrome.i18n.getMessage("topicList_tooltip_newMsgs", [unreadMsgs]);
					status.text = unreadMsgs;
				} else {
					status.icon = 'star'
					status.tip = chrome.i18n.getMessage("topicList_tooltip_special");
				}
			}
			
			var newCell = me.doc.createElement('td');
				newCell.title = status.tip;
				newCell.style.textAlign = 'center';
				var img = me.doc.createElement('img');
					img.src = ICONS[status.icon];
				newCell.appendChild(img);
				
				if(status.text) {
					newCell.appendChild(me.doc.createTextNode(status.text));
				}
			row.insertBefore(newCell, row.getElementsByTagName('td')[me.statusColumnPosition]);
		}
	);
};


TopicListPage.prototype.update = function() {

};
