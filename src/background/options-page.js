var contentTitle;

var activeNavBarItem;
var activeContentPanel;
var exportImportPanel;
var exportImportData;


function automaticCheckboxOptionClick(evt) {
	var checkbox = evt.target;
	var option = checkbox.id.substring(checkbox.id.indexOf("-") + 1);
	
	Options.get(function(options) {
		options[option] = checkbox.checked;
		Options.set(options);
		Stats.optionsSaved();
	});
}


function loaded() {
	window.addEventListener("hashchange", hashChange, false);
	
	contentTitle = document.getElementById("content-title");
	
	// Configura opções automáticas em checkboxes
	var checkboxes = document.getElementsByClassName("automatic-checkbox-option");
	Options.get(function(options) {
		for(var i = 0; i < checkboxes.length; i++) {
			var checkbox = checkboxes[i];
			checkbox.addEventListener("click", automaticCheckboxOptionClick, true);
									
			// Inicializa o checkbox
			var option = checkbox.id.substring(checkbox.id.indexOf("-") + 1);
			checkbox.checked = options[option];
		}
	});
	
	exportImportPanel = document.getElementById("export-import-panel");
	exportImportData = document.getElementById("export-import-data");
	
	document.getElementById("export-import-toggle").addEventListener("click", toggleExportImport, true);
	document.getElementById("import-button").addEventListener("click", importData, true);
	
	
	// Força exibição de conteúdo
	hashChange();
}


function hashChange() {
	var hash = window.location.hash;
	if(! hash) {
		// Seleciona o primeiro item
		hash = document.getElementsByClassName("navbar-item")[0].hash;
	}
	
	// Ignora o caractere "#"
	var content = hash.substring(1);
	
	if(activeNavBarItem) activeNavBarItem.className = "navbar-item";
	if(activeContentPanel) activeContentPanel.style.display = "none";
	
	activeNavBarItem = document.getElementById("nav-" + content);
	activeNavBarItem.className = "navbar-item selected";
	
	var activeContentPanelId = "cont-" + content;
	activeContentPanel = document.getElementById(activeContentPanelId);
	activeContentPanel.style.display = "block";
	
	contentTitle.textContent = activeNavBarItem.textContent;
	document.title = "Marcador de Tópicos para o Orkut™ - " + activeNavBarItem.textContent;
	
	Stats.pageview(document.location.pathname + hash);
}


function toggleExportImport() {
	if(exportImportPanel.style.display == 'none') {
		// Show
		var str = '';
		for(var key in localStorage) {
			var val = localStorage[key];
			if(key  &&  key != "USER_OPTIONS"  &&  val) {
				str += key + ' ' + val + "\n";
			}
		}
		exportImportData.value = str;
		exportImportPanel.style.display = 'block';
		exportImportData.focus();
	} else {
		// Hide
		exportImportPanel.style.display = 'none';
	}
}


function importData() {
	var userOptions = localStorage['USER_OPTIONS'];
	localStorage.clear();
	localStorage['USER_OPTIONS'] = userOptions;
	
	var str = exportImportData.value;
	var values = str.split('\n');
	for(var i = 0; i < values.length; i++) {
		var value = values[i];
		var parts = value.split(' ');
		var key = parts[0];
		var val = parts[1];
		if(key  &&  val) {
			localStorage[key] = val;
		}
	}
	
	alert("Os dados foram importados corretamente.");
	Stats.dataImported();
}


document.addEventListener('DOMContentLoaded', loaded);
