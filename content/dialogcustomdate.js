"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource://emic/simpledateformat.js");
Cu.import("resource://emic/parsedate.js");

var emicDialogCustomDateObj = {

    consoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    global_strBundle: null,

    // Called once when the dialog displays
    init: function() {
        this.consoleService.logStringMessage("emicDialogCustomDateObj.onLoad() called");
        this.global_strBundle = document.getElementById("emic-strings-global");

        window.sizeToContent();
        // Use the arguments passed to us by the caller
        var customdate = window.arguments[0].inn.customdate;
        var suggestions = window.arguments[0].inn.suggestions;

        var den = new SimpleDateFormat("yyyy-MM-dd");
        var d = new SimpleDateFormat("dd.MM.yyyy");
        var t = new SimpleDateFormat("HH:mm");

        var datepicker = document.getElementById("emic-custom-picker-date");
        var timepicker = document.getElementById("emic-custom-picker-time");
        var datelist = document.getElementById("emic-suggestion-list-date");
        var timelist = document.getElementById("emic-suggestion-list-time");

        if((Object.prototype.toString.call(customdate) === '[object Date]') && isFinite(customdate)) {
            this.consoleService.logStringMessage("customdate: " + customdate.toString());
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
            for (var i = 0; i < suggestions.length; ++i) {
                var suggestion = suggestions[i];
    //            this.consoleService.logStringMessage("(Object.prototype.toString.call(suggestion): " + (Object.prototype.toString.call(suggestion)));
                if((Object.prototype.toString.call(suggestion) === '[object Date]') && isFinite(suggestion)) {
                    datelist.appendItem(d.format(suggestion));
                    timelist.appendItem(t.format(suggestion));
                }
            }
        }
    },

    // Called once if and only if the user clicks OK
    ondialogaccept: function() {
        // Return the changed arguments.
        // Notice if user clicks cancel, window.arguments[0].out remains null because this function is never called
        var outdate;

        switch(document.getElementById("emic-custom-radiogroup").selectedItem) {
            case document.getElementById("emic-radio-now"):
                outdate = new Date;
            break;
            case document.getElementById("emic-radio-custom-date"):
                var datepicker = document.getElementById("emic-custom-picker-date");
                var timepicker = document.getElementById("emic-custom-picker-time");
                var d = new SimpleDateFormat("dd.MM.yyyy");
                var t = new SimpleDateFormat("HH:mm");
                outdate = parseDate(d.format(datepicker.dateValue) + " " + t.format(timepicker.dateValue));
            break;
            case document.getElementById("emic-radio-suggestion-date"):
                var datelist = document.getElementById("emic-suggestion-list-date");
                var timelist = document.getElementById("emic-suggestion-list-time");
                outdate = parseDate(datelist.selectedItem.label + " " + timelist.selectedItem.label);
            break;
            default:
            case document.getElementById("emic-radio-never"):
                window.arguments[0].out = {
                    date: null,
                    datestr: this.global_strBundle.getString("global.identifier.expirationdate.never")
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

    //timelist_changed: function() {
    //    document.getElementById("emic-custom-radiogroup").selectedItem = document.getElementById("emic-radio-suggestion-date");
    //}
}