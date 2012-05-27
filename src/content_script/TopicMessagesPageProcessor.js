function TopicMessagesPageProcessor(pageInfo) {
	this.topicId     = pageInfo.topicId;
	this.communityId = pageInfo.communityId;
	this.doc         = pageInfo.doc;
}


TopicMessagesPageProcessor.prototype.pageIsReady = function() {
	try {
		var q = this.doc.evaluate('//*[@otm="true"]', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if(q.snapshotLength > 0) {
			// A página anterior ainda está carregada
			return false;
		}
		
		/*
		 * O botão "Responder" aparece acima e abaixo da lista de mensagens. Se
		 * houver dois destes botões, então a lista terminou de ser carregada.
		 */
		var replyButtons = this.doc.evaluate('//button[text()=" Responder "]', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if(replyButtons.snapshotLength != 2) {
			return false;
		}
	} catch(ex) {
		console.error(ex);
		// Se houver qualquer outro erro, considera que não terminou de carregar a página
		return false;
	}
	
	return true;
};


TopicMessagesPageProcessor.prototype.addStyles = function() {
	const OTM_STYLES = "otm-styles";
	if(this.doc.getElementById(OTM_STYLES)) {
		// Styles already added
		return;
	}
	
	var stylesheet = this.doc.createElement('style');
	stylesheet.id = OTM_STYLES;
	stylesheet.textContent = '.otmActionBar {\n'
	                       +     '\tfont-size: 12px;\n'
	                       +     '\tline-height: 16px;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon IMG {\n'
	                       +     '\tpadding: 2px;\n'
	                       +     '\tvertical-align: -6px;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon {\n'
	                       +     '\tdisplay: inline-block;\n'
	                       +     '\tborder: 1px solid transparent;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon.button {\n'
	                       +     '\tcursor: pointer;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon.button:hover {\n'
	                       +     '\tborder-left-color: lightgray !important;\n'
	                       +     '\tborder-top-color: lightgray !important;\n'
	                       +     '\tborder-right-color: gray !important;\n'
	                       +     '\tborder-bottom-color: gray !important;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon.off IMG {\n'
	                       +     '\topacity: 0.15;\n'
	                       + '}\n'
		                   ;
	this.doc.head.appendChild(stylesheet);
};


TopicMessagesPageProcessor.prototype.extractInfo = function() {
	
	/*
	                      0      1      2       3    4     5     6       7     8
	navLinkGroupTop é "primeira     < anterior     X de Y     próxima >     última"
	*/
	
	var q = this.doc.evaluate('//*[text()="primeira"]/..', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	this.navLinkGroups = [q.snapshotItem(0), q.snapshotItem(1)];
	
	var navLinkGroupTop = this.navLinkGroups[0];
	
	var m = navLinkGroupTop.childNodes[4].textContent.match(/(\d+) de (\d+)/);
	this.currentPage = parseInt(m[1]);
	this.totalPages  = parseInt(m[2]);

	// Total de mensagens no tópico
	var q = this.doc.evaluate('//*[starts-with(text(), "- ") and (contains(text(), " respostas.") or contains(text(), " resposta."))]', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	this.totalMsgsElement = q.snapshotItem(0);
	this.totalMsgs = parseInt(this.totalMsgsElement.textContent.substring(2));
	
	// Mensagens na página
	var q = this.doc.evaluate('//*[div/a[starts-with(@href, "Main#Profile?uid=")]/div/img]', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	this.messages = [];
	for(var i = 0; i < q.snapshotLength; i++) {
		this.messages.push(q.snapshotItem(i));
	}
	
	// Identifica links para páginas
	var links = navLinkGroupTop.getElementsByTagName("a");
	for(var i = 0; i < links.length; i++) {
		var link = links[i];
		if(this.isFirstPageLink(link)) {
			this.firstPageLink = link;
		} else if(this.isPreviousPageLink(link)) {
			this.previousPageLink = link;
		} else if(this.isNextPageLink(link)) {
			this.nextPageLink = link;
		} else if(this.isLastPageLink(link)) {
			this.lastPageLink = link;
		}
	}
};


TopicMessagesPageProcessor.prototype.isFirstPageLink = function(link) {
	return link.textContent == "primeira";
};

TopicMessagesPageProcessor.prototype.isPreviousPageLink = function(link) {
	return link.textContent == "< anterior";
};

TopicMessagesPageProcessor.prototype.isNextPageLink = function(link) {
	return link.textContent == "próxima >";
};

TopicMessagesPageProcessor.prototype.isLastPageLink = function(link) {
	return link.textContent == "última";
};


TopicMessagesPageProcessor.prototype.processInfo = function() {
	if(!this.firstPageLink) {
		// Se não há link para a primeira página então já estamos nela
		this.setFirstDisplayedMsg(1);
	} else if(!this.lastPageLink) {
		// Se não há link para a última página então já estamos nela
		this.setLastDisplayedMsg(this.totalMsgs);
	} else {
		// Não estamos nem na primeira nem na última página
		var transitionData = currentPageState.getTransitionData();
		if(transitionData) {
			if(transitionData.lastDisplayedMsg) {
				this.setLastDisplayedMsg(transitionData.lastDisplayedMsg);
			} else if(transitionData.firstDisplayedMsg) {
				this.setFirstDisplayedMsg(transitionData.firstDisplayedMsg);
			} else {
				console.error("Algo está errado!", transitionData);
			}
		} else {
			// Não há informações suficientes para sabermos o intervalo de mensagens sendo exibidas
			this.unknownMsgRange = true;
		}
	}
};


TopicMessagesPageProcessor.prototype.setFirstDisplayedMsg = function(n) {
	this.firstDisplayedMsg = n;
	this.lastDisplayedMsg = this.firstDisplayedMsg + this.messages.length - 1;
};

TopicMessagesPageProcessor.prototype.setLastDisplayedMsg = function(n) {
	this.lastDisplayedMsg = n;
	this.firstDisplayedMsg = this.lastDisplayedMsg - this.messages.length + 1;
};


TopicMessagesPageProcessor.prototype.setupNavTransition = function() {
	for(var i = 0; i < this.navLinkGroups.length; i++) {
		var navLinkGroup = this.navLinkGroups[i];
		var links = navLinkGroup.getElementsByTagName("a");
		for(var j = 0; j < links.length; j++) {
			var link = links[j];
			if(this.isPreviousPageLink(link)) {
				link.addEventListener("click", function() {
					currentPageState.setTransitionData({
							lastDisplayedMsg : this.firstDisplayedMsg - 1
					});
				}.bind(this));
			} else if(this.isNextPageLink(link)) {
				link.addEventListener("click", function() {
					currentPageState.setTransitionData({
							firstDisplayedMsg : this.lastDisplayedMsg + 1
					});
				}.bind(this));
			}
		}
	}
};


TopicMessagesPageProcessor.prototype.createTopicActionsGroup = function() {
	// Cria elemento que conterá as ações de tópico
	this.topicActionsGroup = this.doc.createElement("span");
	this.topicActionsGroup.className = 'otmActionBar';
	insertAfter(this.topicActionsGroup, this.totalMsgsElement);
};


TopicMessagesPageProcessor.prototype.createMessagesActionsGroups = function() {
	this.messagesActionsGroups = [];
	
	for(var i = 0; i < this.messages.length; i++) {
		var message = this.messages[i];
		var messageActionsGroup = this.doc.createElement("span");
		messageActionsGroup.className = 'otmActionBar';
		
		//insertAfter(messageActionsGroup, links[0]);
		message.children[message.children.length - 1].appendChild(messageActionsGroup);
		
		//message.style.position = "relative";
		this.messagesActionsGroups.push(messageActionsGroup);
	}
};


TopicMessagesPageProcessor.prototype.expandMessages = function() {
	setTimeout(function() {
		var links = this.doc.evaluate('//*[contains(text(), "ler postagem completa")]', this.doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		for(var i = 0; i < links.snapshotLength; i++) {
			links.snapshotItem(i).click();
		}
	}.bind(this), 1);
};


TopicMessagesPageProcessor.prototype.updateTopicActionsGroup = function() {
	removeChildren(this.topicActionsGroup);
	
	if(this.unknownMsgRange) {
		var span = this.doc.createElement('span');
			span.title = "Não há informações suficientes para identificar as mensagens já lidas.\n"
			           + "Vá para a primeira ou última página do tópico e depois navegue utilizando "
			           + 'somente os links "primeira", "< anterior", "próxima >" e "última".';
			span.appendChild(this.createIcon('warning'));
		this.topicActionsGroup.appendChild(span);
		
		Stats.topicError("unknown message range");
		
		return;
	}
	
	
	var topicUnreadMsgs = this.totalMsgs - this.topicData.lastReadMsg;
	
	if(topicUnreadMsgs == 0  ||  this.totalMsgs == 0) {
		// Tópico todo lido
		this.topicActionsGroup.appendChild(this.createIcon('check', "O tópico foi todo lido"));
	} else if(this.topicData.lastReadMsg == 0) {
		// Tópico nunca lido
		this.topicActionsGroup.appendChild(this.createIcon('exclamation', "O tópico nunca foi lido"));
	} else {
		var span = this.doc.createElement('span');
			if(topicUnreadMsgs > 0) {
				span.title = topicUnreadMsgs + " mensagens não-lidas no tópico";
			} else {
				span.title = "Mensagens previamente lidas foram apagadas!";
			}
			span.appendChild(this.createIcon('star'));
			span.appendChild(this.doc.createTextNode(topicUnreadMsgs));
		this.topicActionsGroup.appendChild(span);
	}
	
	if(this.topicData.ignored) {
		this.topicActionsGroup.appendChild(
			this.createIcon('ignored', "Deixar de ignorar o tópico", ['button'],
				function() {
					// Ação para deixar de ignorar o tópico.
					this.topicData.ignored = false;
					TopicData.set(this.topicData, function() {
						this.updateActionsGroups();
					}.bind(this));
					Stats.markTopicNotIgnored();
				}.bind(this)
			)
		);
	} else {
		var tip = "Ignorar o tópico";
		if(this.options.leaveOnIgnore) {
			tip += " e voltar à lista de tópicos";
		}
		this.topicActionsGroup.appendChild(
			this.createIcon('ignored', tip, ['button', 'off'],
				function() {
					// Ação para ignorar o tópico.
					this.topicData.ignored = true;
					TopicData.set(this.topicData, function() {
						this.updateActionsGroups();
						if(this.options.leaveOnIgnore) {
							this.goToTopicsList();
						}
					}.bind(this));
					Stats.markTopicIgnored();
				}.bind(this)
			)
		);
	}
};


TopicMessagesPageProcessor.prototype.updateMessageActionsGroup = function(messageActionsGroup, estimatedMessageNumber) {
	removeChildren(messageActionsGroup);
	
	if(this.unknownMsgRange) {
		return;
	}
	
	if(estimatedMessageNumber <= this.topicData.lastReadMsg) {
		// Mensagem lida
		messageActionsGroup.appendChild(
			this.createIcon('check', "Esta mensagem já foi lida.\nClique para marcar o tópico como NÃO-lido a partir desta mensagem.", ['button'],
				function() {
					this.topicData.lastReadMsg = estimatedMessageNumber - 1;
					TopicData.set(this.topicData, function() {
						this.updateActionsGroups();
					}.bind(this));
					Stats.markMessageUnread();
				}.bind(this)
			)
		);
	} else {
		// Mensagem não-lida
		var tip = "Esta mensagem não foi lida.\nClique para marcar o tópico como lido até esta mensagem";
		var newLastReadMsg = estimatedMessageNumber;
		var additionalAction = null;
		
		if(estimatedMessageNumber == this.lastDisplayedMsg) {
			// A mensagem é a última da página
			if(this.nextPageLink) {
				if(this.options.nextPageOnPageAllRead) {
					tip += " e ir para a próxima página.";
					additionalAction = function() { this.goToNextPage(); }.bind(this);
				}
			} else {
				// A mensagem é a última do tópico
				newLastReadMsg = this.totalMsgs;
				if(this.options.leaveOnTopicAllRead) {
					tip += " e voltar à lista de tópicos.";
					additionalAction = function() { this.goToTopicsList(); }.bind(this);
				}
			}
		} else {
			tip += ".";
		}
		
		messageActionsGroup.appendChild(
			this.createIcon('star', tip, ['button'],
				function() {
					this.topicData.lastReadMsg = newLastReadMsg;
					TopicData.set(this.topicData, function() {
						this.updateActionsGroups();
						if(additionalAction) {
							additionalAction();
						}
					}.bind(this));
					Stats.markMessageRead();
				}.bind(this)
			)
		);
	}
	
	var messageNumber = this.doc.createElement("span");
	messageNumber.textContent = estimatedMessageNumber;
	messageNumber.style.color = 'whiteSmoke';
	messageActionsGroup.appendChild(messageNumber);
};


TopicMessagesPageProcessor.prototype.updateMessagesActionsGroups = function() {
	for(var i = 0; i < this.messagesActionsGroups.length; i++) {
		/*
		O número da mensagem é estimado porque poderá haver mensagens
		apagadas, o que impedirá ter certeza no número da mensagem.
		*/
		var estimatedMessageNumber = this.lastDisplayedMsg - this.messagesActionsGroups.length + i + 1;
		var messageActionsGroup = this.messagesActionsGroups[i];
		this.updateMessageActionsGroup(messageActionsGroup, estimatedMessageNumber);
	}
};


TopicMessagesPageProcessor.prototype.updateActionsGroups = function() {
	TopicData.get(this.topicId, function(topicData) {
		topicData.topicId = this.topicId;
		this.topicData = topicData;
		/*
		this.updatePageActionsGroups();
		*/
		this.updateTopicActionsGroup();
		this.updateMessagesActionsGroups();
	}.bind(this));
};


TopicMessagesPageProcessor.prototype.process = function() {
	Options.get(function(options) {
		this.options = options;
		
		this.addStyles();
		this.extractInfo();
		this.processInfo();
		this.setupNavTransition();
		
		this.createTopicActionsGroup();
		this.createMessagesActionsGroups();
		
		if(options.expandMessages) {
			this.expandMessages();
		}
		
		this.updateActionsGroups();
		
		this.navLinkGroups[0].setAttribute("otm", "true");
	}.bind(this));
	
	Stats.topicMessagesPageview();
};


TopicMessagesPageProcessor.prototype.createIcon = function(type, tip, classes, handler) {
	var icon = this.doc.createElement('span');
		icon.className = 'icon';
		if(classes) icon.className += ' ' + classes.join(' ');
		var img = this.doc.createElement('img');
			img.src = chrome.extension.getURL("images/" + type + ".png");
			if(tip)     img.title = tip;
			if(handler) img.addEventListener('click', handler, true);
		icon.appendChild(img);
	return icon;	
};


TopicMessagesPageProcessor.prototype.getTopicsListLink = function() {
	var links = this.doc.getElementsByTagName("a");
	for(var i = 0; i < links.length; i++) {
		var link = links[i];
		if(link.href.match(/#CommTopics\?/)) {
			return link;
		}
	}
};


TopicMessagesPageProcessor.prototype.goToTopicsList = function() {
	var evt = this.doc.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window,
                       0, 0, 0, 0, 0,
	                   false, false, false, false,
	                   0, null);
	this.getTopicsListLink().dispatchEvent(evt);
};


TopicMessagesPageProcessor.prototype.goToNextPage = function() {
	var evt = this.doc.createEvent("MouseEvents");
	evt.initMouseEvent("click", true, true, window,
                       0, 0, 0, 0, 0,
	                   false, false, false, false,
	                   0, null);
	this.nextPageLink.dispatchEvent(evt);
};


/******************************************************************************/


function TopicMessagesPageProcessorOld(pageInfo) {
	this.topicId     = pageInfo.topicId;
	this.communityId = pageInfo.communityId;
	this.doc         = pageInfo.doc;
}


TopicMessagesPageProcessorOld.prototype.pageIsReady = function() {
	try {
		if(this.doc.getElementsByClassName("otmActionBar").length > 0) {
			// Ainda está na página anterior
			return false;
		}
		
		this.navLinkGroups = this.doc.getElementsByClassName("rf");
		if(this.navLinkGroups.length < 2) {
			return false;
		}
	} catch(ex) {
		console.error(ex);
		// Se houver qualquer outro erro, considera que não terminou de carregar a página
		return false;
	}
	
	return true;
};


TopicMessagesPageProcessorOld.prototype.addStyles = function() {
	var stylesheet = this.doc.createElement('style');
	stylesheet.textContent = '.otmActionBar .icon IMG {\n'
	                       +     '\tpadding: 2px;\n'
	                       +     '\tvertical-align: -6px;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon {\n'
	                       +     '\tdisplay: inline-block;\n'
	                       +     '\tborder: 1px solid transparent;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon.button {\n'
	                       +     '\tcursor: pointer;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon.button:hover {\n'
	                       +     '\tborder-left-color: lightgray !important;\n'
	                       +     '\tborder-top-color: lightgray !important;\n'
	                       +     '\tborder-right-color: gray !important;\n'
	                       +     '\tborder-bottom-color: gray !important;\n'
	                       + '}\n'
	                       + '.otmActionBar .icon.off IMG {\n'
	                       +     '\topacity: 0.15;\n'
	                       + '}\n'
	                       + '.listitem .otmActionBar {\n'
	                       +     '\tposition: absolute;\n'
	                       +     '\ttop: 0px;\n'
	                       +     '\tleft: 50%;\n'
	                       + '}\n'
		                   ;
	this.doc.getElementsByTagName('head')[0].appendChild(stylesheet);
};


TopicMessagesPageProcessorOld.prototype.extractData = function() {
	/*
	navLinkGroupTop    é "<span class='rf'>primeira | &lt; anterior | próxima &gt; | última</span>"
	labelDisplayingTop é " mostrando "
	elementRangeTop    é "<b>{firstDisplayedMsg}-{lastDisplayedMsg}</b>"
	labelOfTop         é " de "
	elementTotalTop    é "<b>{totalMsgs}</b>"
	*/
	var navLinkGroupTop    = this.navLinkGroups[0];
	var labelDisplayingTop = navLinkGroupTop.nextSibling;
	var elementRangeTop    = labelDisplayingTop.nextSibling;
	var labelOfTop         = elementRangeTop.nextSibling;
	var elementTotalTop    = labelOfTop.nextSibling;
	
	// Intervalo de mensagens
	var m = elementRangeTop.textContent.replace(/\./g, "").match(/(\d+)-(\d+)/);
	this.firstDisplayedMsg = parseInt(m[1]);
	this.lastDisplayedMsg  = parseInt(m[2]);

	// Total de mensagens
	var m = elementTotalTop.textContent.replace(/\./g, "").match(/(\d+)/);
	this.totalMsgs = parseInt(m[1]);
	
	// Identifica links para páginas
	var links = navLinkGroupTop.getElementsByTagName("a");
	for(var i = 0; i < links.length; i++) {
		var link = links[i];
		switch(link.textContent) {
			case "primeira":
				this.firstPageLink = link;
				break;
			case "< anterior":
				this.previousPageLink = link;
				break;
			case "próxima >":
				this.nextPageLink = link;
				break;
			case "última":
				this.lastPageLink = link;
				break;
			default:
				alert('"' + link.textContent + '"');
				break;
		}
	}
};


TopicMessagesPageProcessorOld.prototype.replaceNavLinks = function() {
	this.pageActionsGroups = [];
	
	for(var i = 0; i < 2; i++) {
		var navLinkGroup = this.navLinkGroups[i];
		
		// Limpa links
		removeChildren(navLinkGroup);
		
		// Adiciona link para primeira página
		if(this.firstPageLink) {
			navLinkGroup.appendChild(this.firstPageLink.cloneNode(true));
		} else {
			var grayedout = this.doc.createElement("span");
			grayedout.className = "grayedout";
			grayedout.textContent = "primeira";
			navLinkGroup.appendChild(grayedout);
		}
		
		// Separador
		navLinkGroup.appendChild(this.createSeparator());
		
		// Adiciona link para a página anterior
		if(this.previousPageLink) {
			navLinkGroup.appendChild(this.previousPageLink.cloneNode(true));
		} else {
			var grayedout = this.doc.createElement("span");
			grayedout.className = "grayedout";
			grayedout.textContent = "< anterior";
			navLinkGroup.appendChild(grayedout);
		}
		
		// Separador
		navLinkGroup.appendChild(this.createSeparator());
		
		// 
		navLinkGroup.appendChild(this.doc.createTextNode("mostrando "));
		var messageRange = this.doc.createElement("b");
		messageRange.textContent = this.firstDisplayedMsg + "-" + this.lastDisplayedMsg;
		navLinkGroup.appendChild(messageRange);
		navLinkGroup.appendChild(this.doc.createTextNode(" "));
		
		// Cria elemento que conterá as ações de página
		var pageActionsGroup = this.doc.createElement("span");
		pageActionsGroup.className = 'otmActionBar';
		navLinkGroup.appendChild(pageActionsGroup);
		this.pageActionsGroups.push(pageActionsGroup);
		
		// Separador
		navLinkGroup.appendChild(this.createSeparator());
		
		// Adiciona link para a página seguinte
		if(this.nextPageLink) {
			navLinkGroup.appendChild(this.nextPageLink.cloneNode(true));
		} else {
			var grayedout = this.doc.createElement("span");
			grayedout.className = "grayedout";
			grayedout.textContent = "próxima >";
			navLinkGroup.appendChild(grayedout);
		}
		
		// Separador
		navLinkGroup.appendChild(this.createSeparator());
		
		// Adiciona link para a última página
		if(this.lastPageLink) {
			navLinkGroup.appendChild(this.lastPageLink.cloneNode(true));
		} else {
			var grayedout = this.doc.createElement("span");
			grayedout.className = "grayedout";
			grayedout.textContent = "última";
			navLinkGroup.appendChild(grayedout);
		}
	}
};


TopicMessagesPageProcessorOld.prototype.createTopicActionsGroups = function() {
	this.topicActionsGroups = [];
	
	// Remove itens que mostram o intervalo e o total de mensagens (somente no topo)
	for(var n = 0; n < 4; n++) {
		/*
		n == 0: " mostrando "
		n == 1: "<b>{firstDisplayedMsg}-{lastDisplayedMsg}</b>"
		n == 2: " de "
		n == 3: "<b>{totalMsgs}</b>"
		*/
		var itemToRemove = this.navLinkGroups[0].nextSibling;
		itemToRemove.parentNode.removeChild(itemToRemove);
	}
	
	for(var i = 0; i < 2; i++) {
		var navLinkGroup = this.navLinkGroups[i];
		
		// Exibe total de mensagens do tópico
		var totalOfMessages = this.doc.createElement("b");
		totalOfMessages.textContent = this.totalMsgs;
		insertAfter(totalOfMessages, navLinkGroup);
		var txtMensagens = this.doc.createTextNode(" mensagens ");
		insertAfter(txtMensagens, totalOfMessages);
		
		// Cria elemento que conterá as ações de tópico
		var topicActionsGroup = this.doc.createElement("span");
		topicActionsGroup.className = 'otmActionBar';
		insertAfter(topicActionsGroup, txtMensagens);
		this.topicActionsGroups.push(topicActionsGroup);
	}
};


TopicMessagesPageProcessorOld.prototype.createMessagesActionsGroups = function() {
	this.messagesActionsGroups = [];
	
	var messages = this.doc.getElementsByClassName("listitem");
	for(var i = 0; i < messages.length; i++) {
		var message = messages[i];
		var links = message.getElementsByTagName("a");
		if(links.length > 0) {
			var messageActionsGroup = this.doc.createElement("span");
			messageActionsGroup.className = 'otmActionBar';
			
			//insertAfter(messageActionsGroup, links[0]);
			message.appendChild(messageActionsGroup);
			
			message.style.position = "relative";
			this.messagesActionsGroups.push(messageActionsGroup);
		}
	}
};


TopicMessagesPageProcessorOld.prototype.createSeparator = function() {
	var separator = this.doc.createElement("span");
	separator.className = "grayedout";
	separator.innerHTML = "&nbsp; | &nbsp;";
	return separator;
};


TopicMessagesPageProcessorOld.prototype.updateTopicActionsGroups = function() {
	var self = this;
	
	for(var i = 0; i < 2; i++) {
		var topicActionsGroup = this.topicActionsGroups[i];
		removeChildren(topicActionsGroup);
		
		var topicUnreadMsgs = self.totalMsgs - self.topicData.lastReadMsg;
		
		if(topicUnreadMsgs == 0  ||  self.totalMsgs == 0) {
			// Tópico todo lido
			topicActionsGroup.appendChild(self.createIcon('check', "O tópico foi todo lido"));
		} else if(self.topicData.lastReadMsg == 0) {
			// Tópico nunca lido
			topicActionsGroup.appendChild(self.createIcon('exclamation', "O tópico nunca foi lido"));
		} else {
			var span = self.doc.createElement('span');
				if(topicUnreadMsgs > 0) {
					span.title = topicUnreadMsgs + " mensagens não-lidas no tópico";
				} else {
					span.title = "Mensagens previamente lidas foram apagadas!";
				}
				span.appendChild(self.createIcon('star'));
				span.appendChild(self.doc.createTextNode(topicUnreadMsgs));
			topicActionsGroup.appendChild(span);
		}
		
		if(self.topicData.ignored) {
			topicActionsGroup.appendChild(
				self.createIcon('ignored', "Deixar de ignorar o tópico", ['button'],
					function() {
						// Ação para deixar de ignorar o tópico.
						self.topicData.ignored = false;
						TopicData.set(self.topicData, function() {
							self.updateActionsGroups();
						});
						Stats.markTopicNotIgnored();
					}
				)
			);
		} else {
			var tip = "Ignorar o tópico";
			if(self.options.leaveOnIgnore) {
				tip += " e voltar à lista de tópicos";
			}
			topicActionsGroup.appendChild(
				self.createIcon('ignored', tip, ['button', 'off'],
					function() {
						// Ação para ignorar o tópico.
						self.topicData.ignored = true;
						TopicData.set(self.topicData, function() {
							self.updateActionsGroups();
							if(self.options.leaveOnIgnore) {
								self.goToTopicsList();
							}
						});
						Stats.markTopicIgnored();
					}
				)
			);
		}
	}
};


TopicMessagesPageProcessorOld.prototype.updatePageActionsGroups = function() {
	var self = this;
	
	for(var i = 0; i < 2; i++) {
		var pageActionsGroup = this.pageActionsGroups[i];
		removeChildren(pageActionsGroup);
		
		if(self.topicData.lastReadMsg >= self.firstDisplayedMsg - 1  &&  self.topicData.lastReadMsg < self.lastDisplayedMsg) {
			// Primeira página com mensagens não-lidas
			var pageUnreadMsgs = self.lastDisplayedMsg - self.topicData.lastReadMsg;
			var span = self.doc.createElement('span');
				span.title = pageUnreadMsgs + " mensagens não-lidas nesta página";
				span.appendChild(self.createIcon('star'));
				span.appendChild(self.doc.createTextNode(pageUnreadMsgs));
			pageActionsGroup.appendChild(span);
		} else if(self.topicData.lastReadMsg >= self.lastDisplayedMsg) {
			// Todas as mensagens da página foram lidas
			pageActionsGroup.appendChild(self.createIcon('check', "Todas as mensagens desta página foram lidas"));
		} else {
			// Nenhuma mensagem nesta página foi lida
			pageActionsGroup.appendChild(self.createIcon('exclamation', "Nenhuma mensagem desta página foi lida"));
		}
	}
};


TopicMessagesPageProcessorOld.prototype.updateMessageActionsGroup = function(messageActionsGroup, estimatedMessageNumber) {
	var self = this;
	
	removeChildren(messageActionsGroup);
	
	if(estimatedMessageNumber <= this.topicData.lastReadMsg) {
		// Mensagem lida
		messageActionsGroup.appendChild(
			self.createIcon('check', "Esta mensagem já foi lida.\nClique para marcar o tópico como NÃO-lido a partir desta mensagem.", ['button'],
				function() {
					self.topicData.lastReadMsg = estimatedMessageNumber - 1;
					TopicData.set(self.topicData, function() {
						self.updateActionsGroups();
					});
					Stats.markMessageUnread();
				}
			)
		);
	} else {
		// Mensagem não-lida
		var tip = "Esta mensagem não foi lida.\nClique para marcar o tópico como lido até esta mensagem";
		var additionalAction = null;
		if(estimatedMessageNumber == self.totalMsgs) {
			// A página atual é a última do tópico
			if(self.options.leaveOnTopicAllRead) {
				tip += " e voltar à lista de tópicos.";
				additionalAction = function() { self.goToTopicsList(); };
			}
		} else if(estimatedMessageNumber == self.lastDisplayedMsg) {
			// A mensagem é a última da página
			if(self.options.nextPageOnPageAllRead) {
				tip += " e ir para a próxima página.";
				additionalAction = function() { self.goToNextPage(); };
			}
		} else {
			tip += ".";
		}
		
		messageActionsGroup.appendChild(
			self.createIcon('star', tip, ['button'],
				function() {
					self.topicData.lastReadMsg = estimatedMessageNumber;
					TopicData.set(self.topicData, function() {
						self.updateActionsGroups();
						if(additionalAction) {
							additionalAction();
						}
					});
					Stats.markMessageRead();
				}
			)
		);
	}
	
	var messageNumber = this.doc.createElement("span");
	messageNumber.textContent = estimatedMessageNumber;
	messageNumber.style.color = 'whiteSmoke';
	messageActionsGroup.appendChild(messageNumber);
};


TopicMessagesPageProcessorOld.prototype.updateMessagesActionsGroups = function() {
	for(var i = 0; i < this.messagesActionsGroups.length; i++) {
		/*
		O número da mensagem é estimado porque poderá haver mensagens
		apagadas, o que impedirá ter certeza no número da mensagem.
		*/
		var estimatedMessageNumber = this.lastDisplayedMsg - this.messagesActionsGroups.length + i + 1;
		var messageActionsGroup = this.messagesActionsGroups[i];
		this.updateMessageActionsGroup(messageActionsGroup, estimatedMessageNumber);
	}
};


TopicMessagesPageProcessorOld.prototype.updateActionsGroups = function() {
	var self = this;
	
	TopicData.get(this.topicId, function(topicData) {
		topicData.topicId = self.topicId;
		self.topicData = topicData;
		self.updatePageActionsGroups();
		self.updateTopicActionsGroups();
		self.updateMessagesActionsGroups();
	});
};


TopicMessagesPageProcessorOld.prototype.process = function() {
	var self = this;
	Options.get(function(options) {
		self.options = options;
		
		self.addStyles();
		self.extractData();
		self.replaceNavLinks();
		self.createTopicActionsGroups();
		self.createMessagesActionsGroups();
		
		self.updateActionsGroups();
	});
	
	Stats.topicMessagesPageview();
};


TopicMessagesPageProcessorOld.prototype.createIcon = TopicMessagesPageProcessor.prototype.createIcon;


TopicMessagesPageProcessorOld.prototype.getTopicsListLink = TopicMessagesPageProcessor.prototype.getTopicsListLink;


TopicMessagesPageProcessorOld.prototype.goToTopicsList = TopicMessagesPageProcessor.prototype.goToTopicsList;


TopicMessagesPageProcessorOld.prototype.goToNextPage = TopicMessagesPageProcessor.prototype.goToNextPage;
