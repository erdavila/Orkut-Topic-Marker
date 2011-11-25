function TopicListPageProcessor(pageInfo) {
	this.communityId       = pageInfo.communityId;
	this.communityMainPage = pageInfo.communityMainPage;
	this.doc               = pageInfo.doc;
}


TopicListPageProcessor.prototype.pageIsReady = function() {
	try {
		if(this.communityMainPage) {
			/*
			 * O link "ver todos os tópicos" aparece abaixo da lista de tópicos. Se
			 * este link está presente, então a lista terminou de ser carregada.
			 */
			var as = this.doc.evaluate('//a[contains(text(), "ver todos os tópicos")]', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			if(as.snapshotLength != 1) {
				return false;
			}
		} else {
			/*
			 * O link "última" aparece acima e abaixo da lista de tópicos. Se
			 * houver dois deste link, então a lista terminou de ser carregada.
			 */
			var last = this.doc.evaluate('//*[text()="última"]', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
			if(last.snapshotLength != 2) {
				return false;
			}
		}
	} catch(ex) {
		console.error(ex);
		// Se houver qualquer outro erro, considera que não terminou de carregar a página
		return false;
	}
	
	return true;
};


TopicListPageProcessor.prototype.process = function() {
	// Encontra os tópicos na página
	var items = this.doc.evaluate('//a[starts-with(@href, "#CommMsgs?cmm=")]/..', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	for(var i = 0; i < items.snapshotLength; i++) {
		if(i % 2 == 0) {
			// Link com o título do tópico
			var item = items.snapshotItem(i);
			this.processItem(item);
		} else {
			// Link com o início do texto da última postagem no tópico
			;
		}
	}
};


TopicListPageProcessor.prototype.processItem = function(item) {
	// Extrai o ID do tópico
	var linkElement = item.getElementsByTagName('a')[1];
	var topicUrl = linkElement.href;
	var m = topicUrl.match(/tid=(\d+)/);
	var topicId = m[1];
	
	// Obtém o total de mensagens
	var totalMsgsNodes = this.doc.evaluate('.//*[contains(text(), " replies") or contains(text(), " reply")]', item, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if(totalMsgsNodes.snapshotLength != 1) {
		throw 'Não encontrou total de mensagens!';
	}
	var totalMsgs = parseInt(totalMsgsNodes.snapshotItem(0).innerText);
	
	
	TopicData.get(topicId, function(topicData) {
		var status = this.getTopicStatus(topicData, totalMsgs);
		var newCell = this.doc.createElement('div');
			newCell.title = status.tip;
			newCell.style.float = 'right';
			newCell.style.paddingRight = '4px';

			if(status.text  &&  status.icon == 'star') {
				newCell.appendChild(this.doc.createTextNode(status.text));
			}
			
			var img = this.doc.createElement('img');
				img.src = chrome.extension.getURL("images/" + status.icon + ".png");
			newCell.appendChild(img);
		
		insertAfter(newCell, item.getElementsByTagName("a")[0]);
	}.bind(this));
};


TopicListPageProcessor.prototype.getTopicStatus = function(topicData, totalMsgs) {
	var status = {};
	if(topicData.ignored) {
		status.icon = "ignored";
		status.tip = "Ignorado";
	} else {
		var unreadMsgs = totalMsgs - topicData.lastReadMsg;
		
		if(unreadMsgs == 0  ||  totalMsgs == 0) {
			status.icon = 'check';
			status.tip = "Nenhuma mensagem nova";
		} else if(topicData.lastReadMsg == 0) {
			status.icon = "exclamation";
			status.tip = "Nunca lido";
			status.text = unreadMsgs;
		} else {
			status.icon = 'star';
			if(unreadMsgs > 0) {
				if(unreadMsgs == 1) {
					status.tip = unreadMsgs + " mensagem nova";
				} else {
					status.tip = unreadMsgs + " mensagens novas";
				}
			} else {
				status.tip = "Mensagens previamente lidas foram apagadas!";
			}
			status.text = unreadMsgs;
		}
	}
	
	return status;
};


/******************************************************************************/


function TopicListPageProcessorOld(pageInfo) {
	this.communityId       = pageInfo.communityId;
	this.communityMainPage = pageInfo.communityMainPage;
	this.doc               = pageInfo.doc;
}


TopicListPageProcessorOld.prototype.pageIsReady = function() {
	try {
		if(this.doc.getElementsByClassName("rf").length < 2) {
			// Não terminou de carregar a página
			return false;
		}
	} catch(ex) {
		console.error(ex);
		// Se houver qualquer outro erro, considera que não terminou de carregar a página
		return false;
	}
	
	return true;
};


TopicListPageProcessorOld.prototype.process = function() {
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
	
	// Encontra as linhas da tabela
	var table = this.doc.getElementsByClassName('displaytable')[0];
	this.rows = table.getElementsByTagName('tr');
	
	// Adiciona cabeçalho da nova coluna
	var headerRow = this.rows[0];
	var th = this.doc.createElement('th');
	th.textContent = 'status';
	th.style.textAlign = 'center';
	var headers = headerRow.getElementsByTagName('th');
	headerRow.insertBefore(th, headers[this.statusColumnPosition]);
	headers[1].width = this.topicTitleResizeWidth;
	
	// Obtém a configuração
	Options.get(function(options) {
		this.openLastPage = options.openLastPage;
		
		// Depois, continua com o processamento de cada linha
		for(var r = 1; r < this.rows.length; r++) {
			var row = this.rows[r];
			this.processRow(row);
		}
	}.bind(this));
};

TopicListPageProcessorOld.prototype.processRow = function(row) {
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
	var totalMsgs = parseInt(totalCell.textContent.replace(/\./g, ""));
	
	
	TopicData.get(topicId, function(topicData) {
		var status = this.getTopicStatus(topicData, totalMsgs);
		
		if(this.openLastPage  &&  topicData.lastReadMsg > totalMsgs / 2) {
			linkElement.href += '&na=2&nst=' + (totalMsgs - 9);
		}
		
		var newCell = this.doc.createElement('td');
			newCell.title = status.tip;
			newCell.style.textAlign = 'center';
			var img = this.doc.createElement('img');
				img.src = chrome.extension.getURL("images/" + status.icon + ".png");
			newCell.appendChild(img);
			
			if(status.text) {
				newCell.appendChild(this.doc.createTextNode(status.text));
			}
		row.insertBefore(newCell, row.getElementsByTagName('td')[this.statusColumnPosition]);
	}.bind(this));
};


TopicListPageProcessorOld.prototype.getTopicStatus = TopicListPageProcessor.prototype.getTopicStatus;
