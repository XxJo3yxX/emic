"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource://emic/simpledateformat.js");
Cu.import("resource://emic/parsedate.js");

var emicDialogCustomDateObj = {

    consoleService: Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService),
    prefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.emic."),
    global_strBundle: null,

    // Called once when the dialog displays
    init: function() {
//        this.consoleService.logStringMessage("emicDialogCustomDateObj.init() called");
        this.global_strBundle = document.getElementById("emic-strings-global");

        window.sizeToContent();
        // Use the arguments passed to us by the caller
        var customdate = window.arguments[0].inn.customdate;
        var suggestions = window.arguments[0].inn.suggestions;

        var den = new SimpleDateFormat("yyyy-MM-dd");
        var d = new SimpleDateFormat(this.prefs.getCharPref("dialog.suggestion.date.format"));
        var t = new SimpleDateFormat("HH:mm");

        var datepicker = document.getElementById("emic-custom-picker-date");
        var timepicker = document.getElementById("emic-custom-picker-time");
        var datelist = document.getElementById("emic-suggestion-list-date");
        var timelist = document.getElementById("emic-suggestion-list-time");
        var datelisthelper = new Array();
        var timelisthelper = new Array();

        if((Object.prototype.toString.call(customdate) === '[object Date]') && isFinite(customdate)) {
//            this.consoleService.logStringMessage("customdate: " + customdate.toString());
            if(customdate < (new Date)) {
                this.select_now();
            }
            else {
                datepicker.value = den.format(customdate);
                timepicker.value = t.format(customdate);
                this.select_custom_date();
            }
        }

    //    this.consoleService.logStringMessage("(Object.prototype.toString.call(suggestions): " + (Object.prototype.toString.call(suggestions)));
        if(Object.prototype.toString.call(suggestions) === '[object Array]') {
            for(var i=0; i<suggestions.length; ++i) {
                var suggestion = suggestions[i];
    //            this.consoleService.logStringMessage("(Object.prototype.toString.call(suggestion): " + (Object.prototype.toString.call(suggestion)));
                if((Object.prototype.toString.call(suggestion) === '[object Date]') && isFinite(suggestion)) {
                    var sugdate = d.format(suggestion);
                    var sugtime = t.format(suggestion);
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
        var now = new Date;
        var den = new SimpleDateFormat("yyyy-MM-dd");
        var d = new SimpleDateFormat(this.prefs.getCharPref("dialog.suggestion.date.format"));
        var t = new SimpleDateFormat("HH:mm");

        switch(document.getElementById("emic-custom-radiogroup").selectedItem) {
            case document.getElementById("emic-radio-now"):
                outdate = now;
            break;
            case document.getElementById("emic-radio-custom-date"):
                var datepicker = document.getElementById("emic-custom-picker-date");
                var timepicker = document.getElementById("emic-custom-picker-time");
                outdate = parseDate(den.format(datepicker.dateValue) + " " + t.format(timepicker.dateValue), 0);
            break;
            case document.getElementById("emic-radio-suggestion-date"):
                var datelist = document.getElementById("emic-suggestion-list-date");
                var timelist = document.getElementById("emic-suggestion-list-time");
                var timelistvalue = "";
                if(timelist.selectedIndex <= 0)
                    timelistvalue = t.format(now);
                else
                    timelistvalue = timelist.selectedItem.label;

                if(datelist.selectedIndex <= 0)
                    outdate = parseDate(den.format(now) + " " + timelistvalue, 0);
                else {
                    var yearpos = (d.formatString.indexOf("yyyy")<=0) ? 0 : 2;
                    outdate = parseDate(datelist.selectedItem.label + " " + timelistvalue, yearpos);
                }

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