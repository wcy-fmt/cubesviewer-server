/*
 * CubesViewer
 * Copyright (c) 2012-2013 Jose Juan Montes, see AUTHORS for more details
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * If your version of the Software supports interaction with it remotely through
 * a computer network, the above copyright notice and this permission notice
 * shall be accessible to all users.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * This addon adds export to CSV capability to CubesViewer cube view. 
 * It offers an "export facts" menu option for all cube view modes,
 * and a "export table" option in Explore and Series mode. 
 */
function cubesviewerViewCubeExporter() {

	this.cubesviewer = cubesviewer; 

	/*
	 * Draw export options.
	 */
	this.onViewDraw = function(event, view) {

		//if (view.params.mode != "explore") return;
		
		view.cubesviewer.views.cube.exporter.drawMenu(view);
		
	};

	/*
	 * Draw export menu options.
	 */
	this.drawMenu = function(view) {
		
		var menu = $(".cv-view-menu-view", $(view.container));
		var cube = view.cube;
		
		// Draw menu options (depending on mode)
		
		if ((view.params.mode == "explore") || (view.params.mode == "series")) {
			menu.append('<div></div>');
			menu.append('<li><a href="#" class="cv-view-export-table"><span class="ui-icon ui-icon-script"></span>Export table</a></li>');
		}
		menu.append('<li><a href="#" class="cv-view-export-facts"><span class="ui-icon ui-icon-script"></span>Export facts</a></li>');
	  		
		$(menu).menu( "refresh" );
		$(menu).addClass("ui-menu-icons");
		
		// Events
		$(view.container).find('.cv-view-export-table').click(function() {
			view.cubesviewer.views.cube.exporter.exportCsv(view);
			return false;
		});
		$(view.container).find('.cv-view-export-facts').click(function() {
			view.cubesviewer.views.cube.exporter.exportFacts(view);
			return false;
		});		
		
		
	};	
	
	/*
	 * Download facts in CSV format from Cubes Server
	 */
	this.exportFacts = function(view) {

		var params = view.cubesviewer.views.cube.buildQueryParams(view, false, true);

		params["format"] = "csv";

		var url = view.cubesviewer.options.cubesUrl + "/cube/" + view.cube.name + "/facts?" + $.param(params);
		window.open(url, '_blank');
		window.focus();

	};

	/*
	 * Export a view (either in "explore" or "series" mode) in CSV format.
	 */
	this.exportCsv = function (view) {
		
		var content = "";
		
		if (view.params.mode == "explore") {
			var grid = $('#summaryTable-' + view.id);
		} else {
			var grid = $('#seriesTable-' + view.id);
		}
		
		var values = [];
		for (var i = 0; i < grid.jqGrid('getGridParam','colNames').length; i++) {
			values.push ('"' + grid.jqGrid('getGridParam','colNames')[i] + '"');
		}
		content = content + (values.join(",")) + "\n";
		
		var m = grid.getDataIDs();
		for (var i = 0; i < m.length; i++) {
		    var record = grid.getRowData(m[i]);
		    values = [];
		    for (key in record) {
		    	//if (key == "key") {
		    	// TODO: Fix this incorrect way of resolving what value to use 
		    	if (record[key].indexOf('<a') >= 0) {
		    		values.push ('"' + m[i] + '"');
		    	} else {
		    		values.push ('"' + record[key] + '"');
		    	}
		    }
		    content = content + (values.join(",")) + "\n";
		}
		
		var url = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
		window.open (url, "_blank");
	};

};


/*
 * Create object.
 */
cubesviewer.views.cube.exporter = new cubesviewerViewCubeExporter();

/*
 * Bind events.
 */
$(document).bind("cubesviewerViewDraw", { }, cubesviewer.views.cube.exporter.onViewDraw);
