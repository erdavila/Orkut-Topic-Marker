function TopicListPage(communityId) {
	this.communityId = communityId;
	
	var orkutFrame = document.getElementById('orkutFrame');
	this.doc = orkutFrame.contentDocument;
	
	var table = this.doc.getElementsByClassName('displaytable')[0];
	var rows = table.getElementsByTagName('tr');
	
	// Adiciona cabeçalho da nova coluna
	var headerRow = rows[0];
	var th = this.doc.createElement('th');
	th.width = '56px';
	th.textContent = 'status';
	headerRow.appendChild(th);

	
	var me = this;
	
	// Processa cada linha
	for(var r = 1; r < rows.length; r++) {
		var row = rows[r];
		var cells = row.getElementsByTagName('td');
		
		var linkCell = cells[1]
		var topicUrl = linkCell.getElementsByTagName('a')[0].href;
		var m = topicUrl.match(/tid=(\d+)/);
		var topicId = m[1];
		
		var totalCell = cells[3];
		var totalMsgs = parseInt(totalCell.textContent);
		
		this.processRow(row, topicId, totalMsgs);
	}
}


TopicListPage.prototype.processRow = function(row, topicId, totalMsgs) {
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
				status.tip = "Ignorado";
			} else {
				if(response.lastReadMsg == null) {
					status.icon = "exclamation";
					status.tip = "Nunca lido";
				} else {
					if(response.lastReadMsg == totalMsgs) {
						status.icon = 'check';
						status.tip = 'Nenhuma mensagem nova';
					} else if(totalMsgs > response.lastReadMsg) {
						var unreadMsgs = totalMsgs - response.lastReadMsg;
						status.icon = 'star';
						status.tip = unreadMsgs + " mensagens novas";
						status.text = unreadMsgs;
					} else {
						status.icon = 'star'
						status.tip = 'Tópico inteiramente lido. Provavelmente mensagens foram apagadas!';
					}
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
			row.appendChild(newCell);
		}
	);
};


TopicListPage.prototype.update = function() {

};
