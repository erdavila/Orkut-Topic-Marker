function TopicMessagesPage(topicId, communityId) {
	this.topicId = topicId;
	this.communityId = communityId;
	
	var orkutFrame = document.getElementById('orkutFrame');
	this.doc = orkutFrame.contentDocument;
	
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
	
	
	var elements = this.doc.getElementsByClassName('rf');
	
	/*
					elements[0]                                                 is "<span>primeira | &lt; anterior | próxima &gt; | última</span>"
					elements[0].nextSibling                                     is " mostrando "
	elementRange == elements[0].nextSibling.nextSibling                         is "<b>{firstDisplayedMsg}-{lastDisplayedMsg}</b>"
					elements[0].nextSibling.nextSibling.nextSibling             is " de "
	elementTotal == elements[0].nextSibling.nextSibling.nextSibling.nextSibling is "<b>{totalMsgs}</b>"
	*/
	
	var elementRange = elements[0].nextSibling.nextSibling;
	var m = elementRange.textContent.match(/(\d+)-(\d+)/);
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
			var pageStatus;
			
			if(response.ignored) {
				topicStatus.ignore = 'unmark';
			} else {
				var topicUnreadMsgs = me.totalMsgs - response.lastReadMsg;
				
				topicStatus.allRead  = (topicUnreadMsgs == 0)      ? 'sign' : 'mark';
				topicStatus.noneRead = (response.lastReadMsg == 0) ? 'sign' : 'mark';
				if(topicUnreadMsgs != 0  &&  response.lastReadMsg != 0) {
					topicStatus.unreadMsgs = topicUnreadMsgs;
				}
				topicStatus.ignore = 'mark';
				
				
				pageStatus = {};
				pageStatus.allRead  = (response.lastReadMsg >= me.lastDisplayedMsg)  ? 'sign' : 'mark';
				pageStatus.noneRead = (response.lastReadMsg <  me.firstDisplayedMsg) ? 'sign' : 'mark';
				
				if(topicUnreadMsgs != 0  &&  topicUnreadMsgs != me.totalMsgs) {
					if(response.lastReadMsg < me.firstDisplayedMsg) {
						pageStatus.unreadMsgs = me.lastDisplayedMsg - me.firstDisplayedMsg + 1;
					} else if(response.lastReadMsg < me.lastDisplayedMsg) {
						pageStatus.unreadMsgs = me.lastDisplayedMsg - response.lastReadMsg;
					}
				}
			}
			
			
			for(var ab = 0; ab < me.actionBars.length; ab++) {
				var actionBar = me.actionBars[ab];
				
				// Limpa a barra de ações
				while(actionBar.hasChildNodes()) {
					actionBar.removeChild(actionBar.firstChild);
				}
				
				
				actionBar.appendChild(me.doc.createTextNode(chrome.i18n.getMessage("label_Topic") + ': '));
				
				
				switch(topicStatus.allRead) {
					case 'sign':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('check', chrome.i18n.getMessage("topic_tooltip_allRead")));
						break;
					
					case 'mark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(
							me.createIcon('check', chrome.i18n.getMessage("topic_tooltip_mark_allRead"), ['button', 'off'],
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
						actionBar.appendChild(me.createIcon('exclamation', chrome.i18n.getMessage("topic_tooltip_noneRead")));
						break;
					
					case 'mark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('exclamation', chrome.i18n.getMessage("topic_tooltip_mark_noneRead"), ['button', 'off'],
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
						span.title = chrome.i18n.getMessage("topic_tooltip_unreadMsgs", [topicStatus.unreadMsgs]);
						span.appendChild(me.createIcon('star'));
						span.appendChild(me.doc.createTextNode(topicStatus.unreadMsgs));
					actionBar.appendChild(span);
				}
				
				
				switch(topicStatus.ignore) {
					case 'mark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('ignored', chrome.i18n.getMessage("topic_tooltip_mark_ignored"), ['button', 'off'],
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
					
					case 'unmark':
						actionBar.appendChild(me.doc.createTextNode(' '));
						actionBar.appendChild(me.createIcon('ignored', chrome.i18n.getMessage("topic_tooltip_mark_notIgnored"), ['button'],
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
				}
				
				
				if(pageStatus) {
					actionBar.appendChild(me.doc.createTextNode(' | ' + chrome.i18n.getMessage("label_This_page") + ': '));
					
					switch(pageStatus.allRead) {
						case 'sign':
							actionBar.appendChild(me.doc.createTextNode(' '));
							actionBar.appendChild(me.createIcon('check', chrome.i18n.getMessage("page_tooltip_allRead")));
							break;
						
						case 'mark':
							actionBar.appendChild(me.doc.createTextNode(' '));
							actionBar.appendChild(
								me.createIcon('check', chrome.i18n.getMessage("page_tooltip_mark_allRead"), ['button', 'off'],
									function() {
										var request = {
											'type'        : 'set',
											'topic'       : me.topicId,
											'lastReadMsg' : me.lastDisplayedMsg,
										};
										chrome.extension.sendRequest(request, function() {
											me.update();
										});
									}
								)
							);
							break;
					}
					
					
					switch(pageStatus.noneRead) {
						case 'sign':
							actionBar.appendChild(me.doc.createTextNode(' '));
							actionBar.appendChild(me.createIcon('exclamation', chrome.i18n.getMessage("page_tooltip_noneRead")));
							break;
						
						case 'mark':
							actionBar.appendChild(me.doc.createTextNode(' '));
							actionBar.appendChild(me.createIcon('exclamation', chrome.i18n.getMessage("page_tooltip_mark_noneRead"), ['button', 'off'],
									function() {
										var request = {
											'type'        : 'set',
											'topic'       : me.topicId,
											'lastReadMsg' : me.firstDisplayedMsg - 1,
										};
										chrome.extension.sendRequest(request, function() {
											me.update();
										});
									}
								)
							);
							break;
					}
					
					
					if(pageStatus.unreadMsgs) {
						actionBar.appendChild(me.doc.createTextNode(' '));
						var span = me.doc.createElement('span');
							span.title = chrome.i18n.getMessage("page_tooltip_unreadMsgs", [pageStatus.unreadMsgs]);
							span.appendChild(me.createIcon('star'));
							span.appendChild(me.doc.createTextNode(pageStatus.unreadMsgs));
						actionBar.appendChild(span);
					}
				}
			}
		}
	);
};

TopicMessagesPage.prototype.createIcon = function(type, tip, classes, handler) {
	var icon = this.doc.createElement('img');
	icon.src = ICONS[type];
	if(tip)     icon.title = tip;
	if(classes) icon.className = classes.join(' ');
	if(handler) icon.addEventListener('click', handler, true);
	return icon;	
};
