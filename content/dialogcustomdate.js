"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader); 
loader.loadSubScript("resource://emic/sugar.js");

var emicDialogCustomDateObj = {

    consoleService: Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService),
    prefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.emic."),
    global_strBundle: null,

    // Called once when the dialog displays
    init: function() {
        this.consoleService.logStringMessage("emicDialogCustomDateObj.init() called");
        this.global_strBundle = document.getElementById("emic-strings-global");

        window.sizeToContent();
        // Use the arguments passed to us by the caller
        var customdate = window.arguments[0].inn.customdate;
        var suggestions = window.arguments[0].inn.suggestions;

        var d = this.prefs.getCharPref("dialog.suggestion.date.format");
        var t = "{HH}:{mm}";

        var datepicker = document.getElementById("emic-custom-picker-date");
        var timepicker = document.getElementById("emic-custom-picker-time");
        var datelist = document.getElementById("emic-suggestion-list-date");
        var timelist = document.getElementById("emic-suggestion-list-time");
        var datelisthelper = new Array();
        var timelisthelper = new Array();

        
//        this.consoleService.logStringMessage("Object.isDate(customdate): " + Object.isDate(customdate));
//        this.consoleService.logStringMessage("isFinite(customdate): " + isFinite(customdate));
//        this.consoleService.logStringMessage("customdate.isValid(): " + customdate.isValid());
//        this.consoleService.logStringMessage("customdate: " + customdate);
        if(Object.isDate(customdate) && isFinite(customdate)) {
//            this.consoleService.logStringMessage("customdate: " + customdate.toString());
            if(customdate.isPast()) {
                this.select_now();
            }
            else {
                datepicker.value = customdate.format('{yyyy}-{MM}-{dd}');
                timepicker.value = customdate.format(t);
                this.select_custom_date();
            }
        }

//        this.consoleService.logStringMessage("Object.isArray(suggestions): " + Object.isArray(suggestions));
        if(Object.isArray(suggestions)) {
            for(var i=0; i<suggestions.length; ++i) {
                var suggestion = suggestions[i];
//                this.consoleService.logStringMessage("Object.isDate(suggestion): " + Object.isDate(suggestion));
                if(Object.isDate(suggestion) && isFinite(suggestion)) {
//                    this.consoleService.logStringMessage("suggestion: " + suggestion);
//                    this.consoleService.logStringMessage("d: " + d);
                    var sugdate = suggestion.format(d);
//                    this.consoleService.logStringMessage("sugdate: " + sugdate);
                    var sugtime = suggestion.format(t);
//                    this.consoleService.logStringMessage("sugtime: " + sugtime);
                    if(datelisthelper.indexOf(sugdate)<0)
                        datelisthelper.push(sugdate);
                    if(timelisthelper.indexOf(sugtime)<0)
                        timelisthelper.push(sugtime);
                }
            }
            for(var i=0; i<datelisthelper.length; ++i) {
                datelist.appendItem(datelisthelper[i]);
            }
            timelisthelper.sort();
            for(var i=0; i<timelisthelper.length; ++i) {
                timelist.appendItem(timelisthelper[i]);
            }
        }
    },

    // Called once if and only if the user clicks OK
    ondialogaccept: function() {
//        this.consoleService.logStringMessage("emicDialogCustomDateObj.ondialogaccept() called");
        // Return the changed arguments.
        // Notice if user clicks cancel, window.arguments[0].out remains null because this function is never called
        var outdate;
        var now = Date.create();
        var den = "{yyyy}-{MM}-{dd}";
        var d = this.prefs.getCharPref("dialog.suggestion.date.format");
        var t = "{HH}:{mm}";

        switch(document.getElementById("emic-custom-radiogroup").selectedItem) {
            case document.getElementById("emic-radio-now"):
                outdate = now;
            break;
            case document.getElementById("emic-radio-custom-date"):
                var datepicker = document.getElementById("emic-custom-picker-date");
                var timepicker = document.getElementById("emic-custom-picker-time");
                outdate = Date.create(datepicker.dateValue.format(den) + " " + timepicker.dateValue.format(t));
            break;
            case document.getElementById("emic-radio-suggestion-date"):
                var datelist = document.getElementById("emic-suggestion-list-date");
                var timelist = document.getElementById("emic-suggestion-list-time");
                var timelistvalue = "";
                if(timelist.selectedIndex <= 0)
                    timelistvalue = now.format(t);
                else
                    timelistvalue = timelist.selectedItem.label;

                if(datelist.selectedIndex <= 0)
                    outdate = Date.create(now.format(den) + " " + timelistvalue);
                else
                    outdate = Date.create(datelist.selectedItem.label + " " + timelistvalue);

            break;
            case document.getElementById("emic-radio-never"):
            default:
                window.arguments[0].out = {
                    date: null,
                    datestr: this.global_strBundle.getString("global.identifier.never")
                };
                return true;
            break;
        }

        window.arguments[0].out = {
            date: outdate,
            datestr: outdate.toString()
        };
        return true;
    },

    select_now: function() {
        document.getElementById("emic-custom-radiogroup").selectedItem = document.getElementById("emic-radio-now");
    },

    select_custom_date: function() {
        document.getElementById("emic-custom-radiogroup").selectedItem = document.getElementById("emic-radio-custom-date");
    },

    select_suggestion_date: function() {
        document.getElementById("emic-custom-radiogroup").selectedItem = document.getElementById("emic-radio-suggestion-date");
    }
}