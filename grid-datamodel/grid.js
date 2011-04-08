/*
 * Grid
 * 
 * Depends on:
 * tmpl
 * datastore
 * 
 * Optional:
 * extractingDatasource
 */
(function( $ ) {

$.widget( "ui.grid", {
	options: {
		columns: null,
		type: null,
		rowTemplate: null
	},
	_create: function() {
		this._type();
		this._columns();
		this._rowTemplate();
		var that = this;
		this.element.addClass( "ui-widget" );
		this.element.find( "th" ).addClass( "ui-widget-header" );
		this.element.delegate( "tbody > tr", "click", function( event ) {
			that._trigger( "select", event, {
				item: $.ui.datastore.main.get( that.options.type,
					$( this ).tmplItem().data.guid )
			});
		});
		this.items = $.ui.datastore.main.get( this.options.type );
		// if data is already available, refresh directly
		if (this.items.options.items.length) {
			this.refresh();
		}
		$(this.items).bind("dataitemsdata", function() {
			that.refresh();
		});
	},
	refresh: function() {
		var tbody = this.element.find( "tbody" ).empty(),
        template = this.options.rowTemplate,
        tmplVals = [],
        that = this;

    $.each( this.items.options.items, function (itemId, item) {
      var itemVals = {};
      $.each( that.options.columns, function (colIdx, col) {
        var field = $.isPlainObject(col) ? col.field : col;
        itemVals[field] = item.get(field);
      });
      tmplVals.push(itemVals);
    });

    $.tmpl( template, tmplVals ).appendTo( tbody );

		tbody.find( "td" ).addClass( "ui-widget-content" );
	},
	
	_type: function() {
		if ( !this.options.type ) {
			// doesn't cover generationg the columns option or generating headers when option is specified
			this.options.type = new $.ui.extractingDatasource( {
				// TODO generate columns first, and pass along?
				table: this.element
			}).type();
		}
	},
	
	_columns: function() {
		if ( this.options.columns ) {
			// TODO check if table headers exist, generate if not
			return;
		}
		this.options.columns = this.element.find( "th" ).map(function() {
			var field = $( this ).data( "field" );
			if ( !field ) {
				// generate field name if missing
				field = $( this ).text().toLowerCase().replace(/\s|[^a-z0-9]/g, "_");
			}
			return field;
		}).get()
	},

	_rowTemplate: function() {
		if ( this.options.rowTemplate ) {
			return;
		}
		var template = $.map( this.options.columns, function( col ) {
      if ($.isPlainObject(col)) {
        if (col.html) {
          return "<td>{{html " + col.field + "}}</td>";
        } else {
          return "<td>${" + col.field + "}</td>";
        }
      }
        
			return "<td>${" + col + "}</td>";
		}).join( "" );

		template = "<tr>" + template + "</tr>";
		this.options.rowTemplate = template;
	}
});

})( jQuery );
