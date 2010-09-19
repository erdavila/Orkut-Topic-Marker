﻿function TopicMessagesPage(topicId, communityId) {
	this.topicId = topicId;
	this.communityId = communityId;
	
	var orkutFrame = document.getElementById('orkutFrame');
	this.doc = orkutFrame.contentDocument;
	
	var elements = this.doc.getElementsByClassName('rf');
	
	/*
					elements[0]                                                 is "<span>primeira | &lt; anterior | próxima &gt; | última</span>"
					elements[0].nextSibling                                     is " mostrando "
	elementRange == elements[0].nextSibling.nextSibling                         is "<b>{firstDisplayedMsg}-{lastDisplayedMsg}</b>"
					elements[0].nextSibling.nextSibling.nextSibling             is " de "
	elementTotal == elements[0].nextSibling.nextSibling.nextSibling.nextSibling is "<b>{totalMsgs}</b>"
	*/
	
	var elementRange = elements[0].nextSibling.nextSibling;
	m = elementRange.textContent.match(/(\d+)-(\d+)/);
	this.firstDisplayedMsg = parseInt(m[1]);
	this.lastDisplayedMsg  = parseInt(m[2]);
	
	var elementTotal = elements[0].nextSibling.nextSibling.nextSibling.nextSibling;
	m = elementTotal.textContent.match(/(\d+)/);
	this.totalMsgs = parseInt(m[1]);
	
	this.actionBars = [];
	
	// Cria barra de ações no topo da lista
	this.actionBars[0] = this.doc.createElement('span');
	var txtSeparator = this.doc.createTextNode(' - ');
	insertAfter(txtSeparator, elementTotal);
	insertAfter(this.actionBars[0], txtSeparator);
	
	// Cria barra de ações no rodapé da lista
	this.actionBars[1] = this.actionBars[0].cloneNode(true);
	insertAfter(this.actionBars[1], elements[1]);
};


TopicMessagesPage.prototype.update = function() {
	var status;
	var markReadAction = false;
	var markUnreadAction = false;
	
	if(this.topicId in localStorage) {
		var lastReadMsg = parseInt(localStorage[this.topicId]);
		if(lastReadMsg >= this.lastDisplayedMsg) {
			// Todas exibidas lidas
			status = 'all';
			markUnreadAction = true;
		} else if(lastReadMsg < this.firstDisplayedMsg) {
			// Nenhuma exibida lida
			status = 'none';
			markReadAction = true;
		} else {
			// Algumas exibidas lidas
			status = 'some';
			markReadAction = true;
			markUnreadAction = true;
		}
	} else {
		status = 'never';
		markReadAction = true;
	}
	
	var statusText;
	var statusColor;
	switch(status) {
		case 'never':
			statusText = 'Tópico nunca marcado!';
			statusColor = 'red';
			break;
		case 'all':
			statusText = 'Todas lidas';
			statusColor = 'green';
			break;
		case 'some':
			statusText = 'Algumas não lidas';
			statusColor = 'yellow';
			break;
		case 'none':
			statusText = 'Nenhuma lida';
			statusColor = 'red';
			break;
		default:
			alert('status desconhecido: "' + status + '"');
	}
	
	me = this;
	for(var ab = 0; ab < this.actionBars.length; ab++) {
		var actionBar = this.actionBars[ab];
		
		// Limpa a barra de ações
		while(actionBar.hasChildNodes()) {
			actionBar.removeChild(actionBar.firstChild);
		}
		
		actionBar.appendChild(this.doc.createTextNode(statusText));
		
		var node = this.doc.createElement('span');
		node.style.borderLeft = "16px solid " + statusColor;
		node.style.marginLeft = "2px";
		node.style.marginRight = "2px";
		actionBar.appendChild(node);
		
		if(markReadAction) {
			actionBar.appendChild(this.doc.createTextNode(' - '));
			
			var node = this.doc.createElement('span');
			node.textContent = 'Marcar como lido até aqui';
			node.style.color = 'blue';
			node.style.cursor = 'pointer';
			node.addEventListener('click', function() {
				localStorage[me.topicId] = me.lastDisplayedMsg;
				me.update();
			}, true);
			actionBar.appendChild(node);
		}
		
		if(markUnreadAction) {
			actionBar.appendChild(this.doc.createTextNode(' - '));
			
			var node = this.doc.createElement('span');
			node.textContent = 'Marcar como não-lido até aqui';
			node.style.color = 'blue';
			node.style.cursor = 'pointer';
			node.addEventListener('click', function() {
				localStorage[me.topicId] = me.firstDisplayedMsg - 1;
				me.update();
			}, true);
			actionBar.appendChild(node);
		}
	}
};
