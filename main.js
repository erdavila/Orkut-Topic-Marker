var currentHash = '';
var page;
setInterval(function() {
	var hash = document.location.hash;
	if(hash != currentHash) {
		try {
			var m;
			if(m = hash.match(/^#CommMsgs\?cmm=(\d+)&tid=(\d+)/)) {
				var topicId = m[2];
				var communityId = m[1];
				page = new TopicMessagesPage(topicId, communityId);
			} else if(m = hash.match(/^#CommTopics\?cmm=(\d+)/)) {
				var communityId = m[1];
				page = new TopicListPage(communityId);
			} else {
				page = null;
			}
			
			if(page) {
				page.update();
			}
			
			currentHash = hash;
		} finally {
			;
		}
	}
	
}, 1000);


function insertAfter(what, where) {
	where.parentNode.insertBefore(what, where.nextSibling);
}


var ICONS = {
	'check' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8' +
		'YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAGhJREFUOE+dkkES' +
		'wCAIA+nP/TkVdUAjSqnDgUM2GPFhZkqdCqQOpdRynT8AFap1J7tGSrsTYNJmasA+BKTd0QdmKRghAFJn' +
		'rEzRQGvjpmo5POD4BiPKB++hBCDco+0r3N0yITRWQfovvWQ0M4pmqfekAAAAAElFTkSuQmCC',
	'star' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8' +
		'YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAHdJREFUOE+VUtES' +
		'gCAIi///aMqkBWxZcT54wBibmrtvFGYm86PxKHDMCbokuyfrP8ATpo85B8eRJCy4AFp5OAE3MJgv2YN7' +
		'pbxM3qotVjQwhmW8MzRzNWDhVQDQAX05k0kKoOu7TO0AmP3lX8U7yFYkM7P+YQv8DnrMDRQutsikAAAA' +
		'AElFTkSuQmCC',
	'exclamation' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8' +
		'YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAEtJREFUOE9j/P//' +
		'PwMaYGSECmBKASWAGlAAUAQZoUv/HwoawIEARRgeAEliEaS9BoircAAcEiRrwGU+dk+T7CTSQonktERO' +
		'xOH1AwD9OnqlEpWFEAAAAABJRU5ErkJggg==',
	'ignored' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8' +
		'YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAGhJREFUOE9j/P//' +
		'PwNJAKgBE8BNwCKFJoRQurEHwkZXgMyHqgAr/Y9MIilCGICuaFBqAHoD4hNk36P7AaIIGSH8Bvb6YNAA' +
		'9wkkMgg7CacGSCrE9DQ0ymGRjZJUsGpAS04YaQvDEjQNAKi29MxQkD8RAAAAAElFTkSuQmCC',
};
