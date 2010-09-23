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
			} else if(m = hash.match(/^#Community\?cmm=(\d+)/)) {
				var communityId = m[1];
				page = new TopicListPage(communityId, true);
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
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7O' +
		'HOkAAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAJdnBBZwAAABAAAAAQAFzG' +
		'rcMAAACASURBVEjH7VVBDsAgCKNm/1Zf3h2Mc3ExY4rhMi6YYChgiyBJUtws+EH/BRQ76gHIGWhsIGMk' +
		'ASugPv9VwCiwC7BvECIpibxftAJ8TGBXh9oG1AV8fSr15OoiWuXCLGmXZbiqljCbyEqmag5Y74Vb4sKB' +
		'3ld5juJWHg3Qx9z/ghMQT8CpyMUXtAAAACV0RVh0Y3JlYXRlLWRhdGUAMjAxMC0wOS0yMVQyMDo0OToy' +
		'Ny0wMzowMFOZMWQAAAAldEVYdG1vZGlmeS1kYXRlADIwMTAtMDktMjFUMjA6NDk6MjctMDM6MDAMKEdQ' +
		'AAAAAElFTkSuQmCC',
	
	'star' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7O' +
		'HOkAAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAJdnBBZwAAABAAAAAQAFzG' +
		'rcMAAACdSURBVEjHvVXLEoAgCGyd/v+X6VA4DkE8NPfiJdkHYCAiIjrSAACAHgD5Cjda9aIUsk3A6HxW' +
		'/JIEWEg1ibCA1c57XfaRdawJzBDz8HZPMsJVTqUwuTVmqNXIPUIJcwZ6RMloo8SugL+GLizAg5VMdi2b' +
		'VlhzzoR8zraIcUadWj0dhVQeInMNJUG6sLLWWp1XC/jD2b9c9P6GOf/GBeXTsfn3yqFiAAAAJXRFWHRj' +
		'cmVhdGUtZGF0ZQAyMDEwLTA5LTIxVDIwOjQ5OjI3LTAzOjAwU5kxZAAAACV0RVh0bW9kaWZ5LWRhdGUA' +
		'MjAxMC0wOS0yMVQyMDo0OToyNy0wMzowMAwoR1AAAAAASUVORK5CYII=',
	
	'exclamation' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7O' +
		'HOkAAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAJdnBBZwAAABAAAAAQAFzG' +
		'rcMAAABgSURBVEjH7ZVRCsAwCEOT3f/Ob/9lsFkttbD8ivURNDUAKCDbfuoAsCMvSdKVH/y1ngZYox8g' +
		'APC2ZMuXcLsDbQBGq+esb+OA40lYq4QDc8lXADAOzoGc9Be0CaLaM7wBeW1AEWIEMUEAAAAldEVYdGNy' +
		'ZWF0ZS1kYXRlADIwMTAtMDktMjFUMjA6NDk6MjctMDM6MDBTmTFkAAAAJXRFWHRtb2RpZnktZGF0ZQAy' +
		'MDEwLTA5LTIxVDIwOjQ5OjI3LTAzOjAwDChHUAAAAABJRU5ErkJggg==',
	
	'ignored' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7O' +
		'HOkAAAAGYktHRAAAAAAAAPlDu38AAAAJcEhZcwAACxIAAAsSAdLdfvwAAAAJdnBBZwAAABAAAAAQAFzG' +
		'rcMAAACCSURBVEjH7ZXRDYAgDEQ9434swxgsw4TnB+kPpGmpGomxv1DucdcASJLcXqsj2ggAwIjeLgR4' +
		'z9lnBXthstZSbLAwgCU4OtDWvSAqgBxgCV4tdwQ/gFVaVNrwTgP0At7ZsPZ9J4LlALwRreuAvOlASjnH' +
		'BaRf+yMec8ASdgPc5YRWJxnrZITxLLhvAAAAJXRFWHRjcmVhdGUtZGF0ZQAyMDEwLTA5LTIxVDIwOjQ5' +
		'OjI3LTAzOjAwU5kxZAAAACV0RVh0bW9kaWZ5LWRhdGUAMjAxMC0wOS0yMVQyMDo0OToyNy0wMzowMAwo' +
		'R1AAAAAASUVORK5CYII=',
	
	'unignored' : 'data:image/png;base64,' +
		'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMA' +
		'AAsSAAALEgHS3X78AAAACXZwQWcAAAAQAAAAEABcxq3DAAAAsElEQVRIx72VwQ2FMAxDMWI/lmEMlmHC' +
		'cKgivsBuUhG+r0Cek7gFZmZm0x8FABdxeVPmt5CrNQREYNc8CryDzY5j33vGOLhZBUIDEfBZ1p/3weEE' +
		'HBwBn1rXbePW2GrSK4ikg6wyUWaAd6yRRQZ0xzyU6tSkDVxZUDvmWYkyNDCBMXBWCQPfgEMD2R3r73Pv' +
		'EQPqAqnpuGOAg7PHSQloK1T/iDl7ZVaDyQQ42At4wWqdTiCUhpB3Qe0AAAAldEVYdGNyZWF0ZS1kYXRl' +
		'ADIwMTAtMDktMjFUMjA6NDk6MjctMDM6MDBTmTFkAAAAJXRFWHRtb2RpZnktZGF0ZQAyMDEwLTA5LTIx' +
		'VDIwOjQ5OjI3LTAzOjAwDChHUAAAAABJRU5ErkJggg==',
};
