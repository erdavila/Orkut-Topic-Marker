function TopicListPageProcessor(pageInfo) {
	this.communityId       = pageInfo.communityId;
	this.communityMainPage = pageInfo.communityMainPage;
}


TopicListPageProcessor.prototype.pageIsReady = function() {
	try {
		var orkutFrame = document.getElementById('orkutFrame');
		this.doc = orkutFrame.contentDocument;
		
		if(this.doc.getElementsByClassName("rf").length < 2) {
			// Não terminou de carregar a página
			return false;
		}
		
		var table = this.doc.getElementsByClassName('displaytable')[0];
		this.rows = table.getElementsByTagName('tr');
	} catch(ex) {
		// Se houver qualquer outro erro, considera que não terminou de carregar a página
		return false;
	}
	
	return true;
};


TopicListPageProcessor.prototype.process = function() {
	if(this.communityMainPage) {
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
	
	// Adiciona cabeçalho da nova coluna
	var headerRow = this.rows[0];
	var th = this.doc.createElement('th');
	th.textContent = 'status';
	th.style.textAlign = 'center';
	var headers = headerRow.getElementsByTagName('th');
	headerRow.insertBefore(th, headers[this.statusColumnPosition]);
	headers[1].width = this.topicTitleResizeWidth;
	
	
	// Sinônimo para ser usado dentro de closures
	var self = this;
	
	// Obtém a configuração
	Options.get(function(options) {
		self.openLastPage = options.openLastPage;
		
		// Depois, continua com o processamento de cada linha
		for(var r = 1; r < self.rows.length; r++) {
			var row = self.rows[r];
			self.processRow(row);
		}
	});
};

TopicListPageProcessor.prototype.processRow = function(row) {
	// Sinônimo para ser usado dentro de closures
	var self = this;
	
	
	// Obtém as células da linha
	var cells = row.getElementsByTagName('td');
	
	// Extrai o ID do tópico
	var linkCell = cells[this.topicLinkColumnIndex];
	var linkElement = linkCell.getElementsByTagName('a')[0];
	var topicUrl = linkElement.href;
	var m = topicUrl.match(/tid=(\d+)/);
	var topicId = m[1];
	
	// Obtém o total de mensagens
	var totalCell = cells[this.totalColumnIndex];
	var totalMsgs = parseInt(totalCell.textContent.replace(".", ""));
	
	
	TopicData.get(topicId, function(topicData) {
		var status = {};
		if(topicData.ignored) {
			status.icon = "ignored";
			status.tip = "Ignorado";
		} else {
			var unreadMsgs = totalMsgs - topicData.lastReadMsg;
			
			if(topicData.lastReadMsg == totalMsgs  ||  totalMsgs == 0) {
				status.icon = 'check';
				status.tip = "Nenhuma mensagem nova"
			} else if(topicData.lastReadMsg == 0) {
				status.icon = "exclamation";
				status.tip = "Nunca lido"
				status.text = unreadMsgs;
			} else if(totalMsgs > topicData.lastReadMsg) {
				status.icon = 'star';
				status.tip = unreadMsgs + " mensagens novas";
				status.text = unreadMsgs;
			} else {
				status.icon = 'star'
				status.tip = "Tópico inteiramente lido. Provavelmente mensagens foram apagadas!";
			}
			
			
			if(self.openLastPage  &&  topicData.lastReadMsg > totalMsgs / 2) {
				linkElement.href += '&na=2&nst=' + (totalMsgs - 9);
			}
		}
		
		var newCell = self.doc.createElement('td');
			newCell.title = status.tip;
			newCell.style.textAlign = 'center';
			var img = self.doc.createElement('img');
				img.src = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/" + status.icon + ".png";
			newCell.appendChild(img);
			
			if(status.text) {
				newCell.appendChild(self.doc.createTextNode(status.text));
			}
		row.insertBefore(newCell, row.getElementsByTagName('td')[self.statusColumnPosition]);
	});
};
