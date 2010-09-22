﻿function TopicMessagesPage(topicId, communityId) {
	this.topicId = topicId;
	this.communityId = communityId;
	
	var orkutFrame = document.getElementById('orkutFrame');
	this.doc = orkutFrame.contentDocument;
	
	var stylesheet = this.doc.createElement('style');
	stylesheet.textContent = '.otmActionBar IMG {'
	                       +     'border: 1px solid transparent;'
	                       +     'padding: 2px;'
	                       +     'vertical-align: -6px;'
	                       + '}'
	                       + '.otmActionBar IMG.button {'
	                       +     'cursor: pointer;'
	                       + '}'
	                       + '.otmActionBar IMG.button:hover {'
	                       +     'border-color: black !important;'
	                       + '}'
	                       + '.otmActionBar IMG.off {'
	                       +     'opacity: 0.15;'
	                       + '}'
		                   ;
	this.doc.getElementsByTagName('head')[0].appendChild(stylesheet);
	
	
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
	this.actionBars[0].className = 'otmActionBar';
	var txtSeparator = this.doc.createTextNode(' | ');
	insertAfter(txtSeparator, elementTotal);
	insertAfter(this.actionBars[0], txtSeparator);
	
	// Cria barra de ações no rodapé da lista
	this.actionBars[1] = this.actionBars[0].cloneNode(true);
	insertAfter(this.actionBars[1], elements[1]);
};


TopicMessagesPage.prototype.update = function() {
	var me = this;
	
	var request = {
		'type'  : 'get',
		'topic' : this.topicId,
	};
	chrome.extension.sendRequest(
		request,
		function(response) {
			var topicStatus = {};
			
			if(response.ignored) {
				topicStatus.ignore = 'unmark';
			} else {
				var unreadMsgs = me.totalMsgs - response.lastReadMsg;
				
				topicStatus.allRead  = (unreadMsgs == 0)           ? 'sign' : 'mark';
				topicStatus.noneRead = (response.lastReadMsg == 0) ? 'sign' : 'mark';
				if(unreadMsgs != 0  &&  response.lastReadMsg != 0) {
					topicStatus.unreadMsgs = unreadMsgs;
				}
				topicStatus.ignore = 'mark';
			}
			
			
			/*
			var topicStatus = {};
			var pageStatus;
			var markReadAction = false;
			var markUnreadAction = false;
			var markIgnoredAction = false;
			var markUnignoredAction = false;
			
			if(response.ignored) {
				topicStatus.icon = 'ignored';
				topicStatus.tip  = 'Tópico ignorado';
				markUnignoredAction = true;
			} else {
				markIgnoredAction = true;
				
				if(response.lastReadMsg == null) {
					topicStatus.icon = 'exclamation';
					topicStatus.tip  = 'Tópico nunca lido';
					markReadAction = true;
				} else {
					if(response.lastReadMsg == me.totalMsgs) {
						topicStatus.icon = 'check';
						topicStatus.tip  = 'Nenhuma mensagem nova no tópico';
						markUnreadAction = true;
					} else if(me.totalMsgs > response.lastReadMsg) {
						var unreadMsgs = me.totalMsgs - response.lastReadMsg;
						topicStatus.icon = 'star';
						topicStatus.tip  = unreadMsgs + " mensagens novas no tópico";
						topicStatus.text = unreadMsgs;
						
						pageStatus = {};
						if(response.lastReadMsg >= me.lastDisplayedMsg) {
							pageStatus.icon = 'check';
							pageStatus.tip = "Todas as mensagens desta página já foram lidas";
							markUnreadAction = true;
						} else if(response.lastReadMsg < me.firstDisplayedMsg) {
							pageStatus.icon = 'exclamation';
							pageStatus.tip = "Nenhuma mensagem desta página foi lida";
							markReadAction = true;
						} else {
							pageStatus.icon = 'star';
							pageStatus.tip = "Algumas mensagens desta página não foram lidas";
							markReadAction = true;
							markUnreadAction = true;
						}
					} else {
						topicStatus.icon = 'star';
						topicStatus.tip = 'Tópico inteiramente lido. Provavelmente mensagens foram apagadas!';
						markUnreadAction = true;
					}
				}
			}
			*/
			
			for(var ab = 0; ab < me.actionBars.length; ab++) {
				var actionBar = me.actionBars[ab];
				
				// Limpa a barra de ações
				while(actionBar.hasChildNodes()) {
					actionBar.removeChild(actionBar.firstChild);
				}
				
				
				actionBar.appendChild(me.doc.createTextNode('Tópico: '));
				
				
				switch(topicStatus.allRead) {
					case 'sign':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('check', 'Este tópico foi todo lido'));
						break;
					
					case 'mark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(
							me.createIcon('check', 'Marcar todo este tópico como lido', ['button', 'off'],
								function() {
									var request = {
										'type'        : 'set',
										'topic'       : me.topicId,
										'lastReadMsg' : me.totalMsgs,
									};
									chrome.extension.sendRequest(request, function() {
										me.update();
									});
								}
							)
						);
						break;
				}
				
				
				switch(topicStatus.noneRead) {
					case 'sign':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('exclamation', 'Este tópico nunca foi lido'));
						break;
					
					case 'mark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('exclamation', 'Marcar todo este tópico como NÃO-lido', ['button', 'off'],
								function() {
									var request = {
										'type'        : 'set',
										'topic'       : me.topicId,
										'lastReadMsg' : 0,
									};
									chrome.extension.sendRequest(request, function() {
										me.update();
									});
								}
							)
						);
						break;
				}
				
				
				if(topicStatus.unreadMsgs) {
					actionBar.appendChild(me.doc.createTextNode(' '));
					var span = me.doc.createElement('span');
						span.title = topicStatus.unreadMsgs + ' mensagens não-lidas no tópico';
						span.appendChild(me.createIcon('star'));
						span.appendChild(me.doc.createTextNode(topicStatus.unreadMsgs));
					actionBar.appendChild(span);
				}
				
				
				switch(topicStatus.ignore) {
					case 'unmark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('ignored', 'Deixar de ignorar este tópico', ['button'],
								function() {
									var request = {
										'type'        : 'set',
										'topic'       : me.topicId,
										'lastReadMsg' : response.lastReadMsg,
										'ignored'     : false,
									};
									chrome.extension.sendRequest(request, function() {
										me.update();
									});
								}
							)
						);
						break;
					
					case 'mark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('ignored', 'Ignorar este tópico', ['button', 'off'],
								function() {
									var request = {
										'type'        : 'set',
										'topic'       : me.topicId,
										'lastReadMsg' : response.lastReadMsg,
										'ignored'     : true,
									};
									chrome.extension.sendRequest(request, function() {
										me.update();
									});
								}
							)
						);
						break;
				}
				
				
				/*
				// Status do tópico
				var statusNode = me.doc.createElement('span');
					statusNode.title = topicStatus.tip;
					
					var img = me.doc.createElement('img');
						img.src = ICONS[topicStatus.icon];
					statusNode.appendChild(img);
					
					if(topicStatus.text) {
						statusNode.appendChild(me.doc.createTextNode(topicStatus.text));
					}
				actionBar.appendChild(statusNode);
				
				
				// Status da página
				if(pageStatus) {
					actionBar.appendChild(me.doc.createTextNode(' - '));
					
					var img = me.doc.createElement('img');
					img.src = ICONS[pageStatus.icon];
					img.title = pageStatus.tip;
					actionBar.appendChild(img);
					if(pageStatus.text) {
						actionBar.appendChild(me.doc.createTextNode(pageStatus.text));
					}
				}
				
				actionBar.appendChild(me.doc.createTextNode(' | '));
				
				if(markReadAction) {
					actionBar.appendChild(me.doc.createTextNode(' '));
					
					var button = me.createActionButton('check', 'Marcar como lido até aqui', function() {
						var request = {
							'type'        : 'set',
							'topic'       : me.topicId,
							'lastReadMsg' : me.lastDisplayedMsg,
						};
						chrome.extension.sendRequest(request, function() {
							me.update();
						});
					});
					actionBar.appendChild(button);
				}
				
				if(markUnreadAction) {
					actionBar.appendChild(me.doc.createTextNode(' '));
					
					var button = me.createActionButton('exclamation', "Marcar como não-lido a partir daqui", function() {
						var request = {
							'type'        : 'set',
							'topic'       : me.topicId,
							'lastReadMsg' : me.firstDisplayedMsg - 1,
						};
						chrome.extension.sendRequest(request, function() {
							me.update();
						});
					});
					actionBar.appendChild(button);
				}
				
				if(markIgnoredAction) {
					actionBar.appendChild(me.doc.createTextNode(' '));
					
					var button = me.createActionButton('ignored', "Marcar o tópico como ignorado", function() {
						var request = {
							'type'        : 'set',
							'topic'       : me.topicId,
							'lastReadMsg' : response.lastReadMsg,
							'ignored'     : true,
						};
						chrome.extension.sendRequest(request, function() {
							me.update();
						});
					});
					actionBar.appendChild(button);
				}
				
				if(markUnignoredAction) {
					actionBar.appendChild(me.doc.createTextNode(' '));
					
					var button = me.createActionButton('unignored', "Não ignorar o tópico", function() {
						var request = {
							'type'        : 'set',
							'topic'       : me.topicId,
							'lastReadMsg' : response.lastReadMsg,
							'ignored'     : false,
						};
						chrome.extension.sendRequest(request, function() {
							me.update();
						});
					});
					actionBar.appendChild(button);
				}
				*/
			}
		}
	);
};

/*
TopicMessagesPage.prototype.createActionButton = function(icon, title, handler) {
	var button = me.doc.createElement('img');
	button.src = ICONS[icon];
	button.title = title;
	button.style.cursor = 'pointer';
	button.style.width = '8px';
	button.style.height = '8px';
	button.addEventListener('click', handler, true);
	return button;
};
*/

TopicMessagesPage.prototype.createIcon = function(type, tip, classes, handler) {
	var icon = this.doc.createElement('img');
	icon.src = ICONS[type];
	if(tip)     icon.title = tip;
	if(classes) icon.className = classes.join(' ');
	if(handler) icon.addEventListener('click', handler, true);
	return icon;	
};
