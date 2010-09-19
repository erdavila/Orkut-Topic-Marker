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
		
		var statusText;
		var statusColor;
		if(topicId in localStorage) {
			var readMsgs = parseInt(localStorage[topicId]);
			if(readMsgs == totalMsgs) {
				statusText = 'Tópico inteiramente lido';
				statusColor = 'green';
			} else if(totalMsgs > readMsgs) {
				statusText = 'Tópico parcialmente lido';
				statusColor = 'yellow';
			} else {
				statusText = 'Tópico inteiramente lido. Provavelmente mensagens foram apagadas!';
				statusColor = 'yellow';
			}
		} else {
			statusText = 'Tópico nunca lido';
			statusColor = 'red';
		}
		
		var newCell = this.doc.createElement('td');
			newCell.style.width = '20px';
			newCell.width = '20px';
			var status = this.doc.createElement('div');
				status.title = statusText;
				status.style.backgroundColor = statusColor;
				status.style.width = '16px';
				status.style.height = '16px';
				status.style.marginLeft = '17px';
				status.style.marginRight = '17px';
			newCell.appendChild(status);
		row.appendChild(newCell);
	}
}


TopicListPage.prototype.update = function() {

};
