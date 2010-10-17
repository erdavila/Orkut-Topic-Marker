function TopicMessagesPageProcessor(pageInfo) {
	this.topicId = pageInfo.topicId;
	this.communityId = pageInfo.communityId;
}


TopicMessagesPageProcessor.prototype.pageIsReady = function() {
	try {
		var orkutFrame = document.getElementById('orkutFrame');
		this.doc = orkutFrame.contentDocument;
		
		this.navLinkGroups = this.doc.getElementsByClassName("rf");
		if(this.navLinkGroups.length < 2) {
			return false;
		}
	} catch(ex) {
		// Se houver qualquer outro erro, considera que não terminou de carregar a página
		return false;
	}
	
	return true;
};


TopicMessagesPageProcessor.prototype.addStyles = function() {
	var stylesheet = this.doc.createElement('style');
	stylesheet.textContent = '.otmActionBar IMG {\n'
	                       +     '\tborder: 1px solid transparent;\n'
	                       +     '\tpadding: 2px;\n'
	                       +     '\tvertical-align: -6px;\n'
	                       + '}\n'
	                       + '.otmActionBar IMG.button {\n'
	                       +     '\tcursor: pointer;\n'
	                       + '}\n'
	                       + '.otmActionBar IMG.button:hover {\n'
	                       +     '\tborder-color: black !important;\n'
	                       + '}\n'
	                       + '.otmActionBar IMG.off {\n'
	                       +     '\topacity: 0.15;\n'
	                       + '}\n'
		                   ;
	this.doc.getElementsByTagName('head')[0].appendChild(stylesheet);
};


TopicMessagesPageProcessor.prototype.extractData = function() {
	/*
	navLinkGroupTop    é "<span class='rf'>primeira | &lt; anterior | próxima &gt; | última</span>"
	labelDisplayingTop é " mostrando "
	elementRangeTop    é "<b>{firstDisplayedMsg}-{lastDisplayedMsg}</b>"
	labelOfTop         é " de "
	elementTotalTop    é "<b>{totalMsgs}</b>"
	*/
	var navLinkGroupTop    = this.navLinkGroups[0];
	var labelDisplayingTop = navLinkGroupTop.nextSibling
	var elementRangeTop    = labelDisplayingTop.nextSibling;
	var labelOfTop         = elementRangeTop.nextSibling
	var elementTotalTop    = labelOfTop.nextSibling;
	
	// Intervalo de mensagens
	var m = elementRangeTop.textContent.match(/(\d+)-(\d+)/);
	this.firstDisplayedMsg = parseInt(m[1]);
	this.lastDisplayedMsg  = parseInt(m[2]);

	// Total de mensagens
	var m = elementTotalTop.textContent.match(/(\d+)/);
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


TopicMessagesPageProcessor.prototype.replaceNavLinks = function() {
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
		var pageActionsGroup = this.doc.createElement("span")
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


TopicMessagesPageProcessor.prototype.createTopicActionsGroups = function() {
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
		var topicActionsGroup = this.doc.createElement("span")
		topicActionsGroup.className = 'otmActionBar';
		insertAfter(topicActionsGroup, txtMensagens);
		this.topicActionsGroups.push(topicActionsGroup);
	}
};


TopicMessagesPageProcessor.prototype.createSeparator = function() {
	var separator = this.doc.createElement("span");
	separator.className = "grayedout";
	separator.innerHTML = "&nbsp; | &nbsp;";
	return separator;
};


TopicMessagesPageProcessor.prototype.updatePageActionsGroups = function() {
	var self = this;
	
	for(var i = 0; i < 2; i++) {
		var pageActionsGroup = this.pageActionsGroups[i];
		removeChildren(pageActionsGroup);
		
		
		if(self.topicData.lastReadMsg >= self.lastDisplayedMsg) {
			// Todas as mensagens da página foram lidas
			pageActionsGroup.appendChild(self.createIcon('check', "Todas as mensagens desta página foram lidas"));
		} else {
			var tip = "Marcar o tópico como lido até esta página";
			var additionalAction;
			if(self.lastDisplayedMsg == self.totalMsgs) {
				// A página atual é a última do tópico
				if(self.options.leaveOnTopicAllRead) {
					tip += " e voltar à lista de tópicos";
					additionalAction = function() { self.goToTopicsList(); };
				}
			} else {
				if(self.options.nextPageOnPageAllRead) {
					tip += " e ir para a próxima página";
					additionalAction = function() { self.goToNextPage(); };
				}
			}
			
			pageActionsGroup.appendChild(
				self.createIcon('check', tip, ['button', 'off'],
					function() {
						self.topicData.lastReadMsg = self.lastDisplayedMsg;
						TopicData.set(self.topicData, function() {
							self.updateActionsGroups();
							if(additionalAction) {
								additionalAction();
							}
						});
					}
				)
			);
		}
		
		
		if(self.topicData.lastReadMsg < self.firstDisplayedMsg) {
			// Nenhuma mensagem nesta página foi lida
			pageActionsGroup.appendChild(self.createIcon('exclamation', "Nenhuma mensagem desta página foi lida"));
		} else {
			pageActionsGroup.appendChild(
				self.createIcon('exclamation', "Marcar o tópico como NÃO-lido a partir desta página", ['button', 'off'],
					function() {
						self.topicData.lastReadMsg = self.firstDisplayedMsg - 1;
						TopicData.set(self.topicData, function() {
							self.updateActionsGroups();
						});
					}
				)
			);
		}
		
		
		// Mostra estrela somente na primeira página com mensagens não-lidas
		if(self.topicData.lastReadMsg >= self.firstDisplayedMsg - 1  &&  self.topicData.lastReadMsg < self.lastDisplayedMsg) {
			var pageUnreadMsgs = self.lastDisplayedMsg - self.topicData.lastReadMsg;
			var span = self.doc.createElement('span');
				span.title = pageUnreadMsgs + " mensagens não-lidas nesta página";
				span.appendChild(self.createIcon('star'));
				span.appendChild(self.doc.createTextNode(pageUnreadMsgs));
			pageActionsGroup.appendChild(span);
		}
	}
};


TopicMessagesPageProcessor.prototype.updateTopicActionsGroups = function() {
	var self = this;
	
	for(var i = 0; i < 2; i++) {
		var topicActionsGroup = this.topicActionsGroups[i];
		removeChildren(topicActionsGroup);
		
		if(self.topicData.ignored) {
			topicActionsGroup.appendChild(
				self.createIcon('ignored', "Deixar de ignorar o tópico", ['button'],
					function() {
						// Ação para deixar de ignorar o tópico.
						self.topicData.ignored = false;
						TopicData.set(self.topicData, function() {
							self.updateActionsGroups();
						});
					}
				)
			);
		} else {
			var topicUnreadMsgs = self.totalMsgs - self.topicData.lastReadMsg;
			
			if(topicUnreadMsgs == 0) {
				// Tópico todo lido
				topicActionsGroup.appendChild(self.createIcon('check', "O tópico foi todo lido"));
			} else {
				var tip = "Marcar todo o tópico como lido";
				if(self.options.leaveOnTopicAllRead) {
					tip += " e voltar à lista de tópicos";
				}
				topicActionsGroup.appendChild(
					self.createIcon('check', tip, ['button', 'off'],
						function() {
							self.topicData.lastReadMsg = self.totalMsgs;
							TopicData.set(self.topicData, function() {
								self.updateActionsGroups();
								if(self.options.leaveOnTopicAllRead) {
									self.goToTopicsList();
								}
							});
						}
					)
				);
			}
			
			
			if(self.topicData.lastReadMsg == 0) {
				// Tópico nunca lido
				topicActionsGroup.appendChild(self.createIcon('exclamation', "O tópico nunca foi lido"));
			} else {
				topicActionsGroup.appendChild(
					self.createIcon('exclamation', "Marcar todo o tópico como NÃO-lido", ['button', 'off'],
						function() {
							self.topicData.lastReadMsg = 0;
							TopicData.set(self.topicData, function() {
								self.updateActionsGroups();
							});
						}
					)
				);
			}
			
			
			if(topicUnreadMsgs != 0  &&  self.topicData.lastReadMsg != 0) {
				var span = self.doc.createElement('span');
					span.title = topicUnreadMsgs + " mensagens não-lidas no tópico";
					span.appendChild(self.createIcon('star'));
					span.appendChild(self.doc.createTextNode(topicUnreadMsgs));
				topicActionsGroup.appendChild(span);
			}
			
			
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
					}
				)
			);
		}
	}
};


TopicMessagesPageProcessor.prototype.updateActionsGroups = function() {
	var self = this;
	
	TopicData.get(this.topicId, function(topicData) {
		topicData.topicId = self.topicId;
		self.topicData = topicData;
		self.updatePageActionsGroups();
		self.updateTopicActionsGroups();
	});
};


TopicMessagesPageProcessor.prototype.process = function() {
	var self = this;
	Options.get(function(options) {
		self.options = options;
		
		self.addStyles();
		self.extractData();
		self.replaceNavLinks();
		self.createTopicActionsGroups();
		
		self.updateActionsGroups();
	});
};


TopicMessagesPageProcessor.prototype.createIcon = function(type, tip, classes, handler) {
	var icon = this.doc.createElement('img');
	icon.src = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/" + type + ".png";
	if(tip)     icon.title = tip;
	if(classes) icon.className = classes.join(' ');
	if(handler) icon.addEventListener('click', handler, true);
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
