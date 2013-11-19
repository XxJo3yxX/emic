"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource://emic/simpledateformat.js");
Cu.import("resource://emic/parsedate.js");

var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

// Called once when the dialog displays
function onLoad() {
    consoleService.logStringMessage("customdialog.onLoad() called");
    window.sizeToContent();
    // Use the arguments passed to us by the caller
    var customdate = window.arguments[0].inn.customdate;
    var suggestions = window.arguments[0].inn.suggestions;

    var den = new SimpleDateFormat("yyyy-MM-dd");
    var d = new SimpleDateFormat("dd.MM.yyyy");
    var t = new SimpleDateFormat("HH:mm");

    var datepicker = document.getElementById("emic-custom-datepicker");
    var timepicker = document.getElementById("emic-custom-timepicker");
    var datelist = document.getElementById("emic-suggestion-datelist");
    var timelist = document.getElementById("emic-suggestion-timelist");

    if((Object.prototype.toString.call(customdate) === '[object Date]') && isFinite(customdate)) {
        datepicker.value = den.format(customdate);
        timepicker.value = t.format(customdate);
    }

//    consoleService.logStringMessage("(Object.prototype.toString.call(suggestions): " + (Object.prototype.toString.call(suggestions)));
    if(Object.prototype.toString.call(suggestions) === '[object Array]') {
        for (var i = 0; i < suggestions.length; ++i) {
            var suggestion = suggestions[i];
//            consoleService.logStringMessage("(Object.prototype.toString.call(suggestion): " + (Object.prototype.toString.call(suggestion)));
            if((Object.prototype.toString.call(suggestion) === '[object Date]') && isFinite(suggestion)) {
                datelist.appendItem(d.format(suggestion));
                timelist.appendItem(t.format(suggestion));
            }
        }
    }
}

// Called once if and only if the user clicks OK
function onOK() {
    // Return the changed arguments.
    // Notice if user clicks cancel, window.arguments[0].out remains null because this function is never called
    var outdate;

    var datepicker = document.getElementById("emic-custom-datepicker");
    var timepicker = document.getElementById("emic-custom-timepicker");
    var datelist = document.getElementById("emic-suggestion-datelist");
    var timelist = document.getElementById("emic-suggestion-timelist");
    
    var d = new SimpleDateFormat("dd.MM.yyyy");
    var t = new SimpleDateFormat("HH:mm");

    if(document.getElementById("emic-custom-date").selected)
        outdate = parseDate(d.format(datepicker.dateValue) + " " + t.format(timepicker.dateValue));
    else if(document.getElementById("emic-suggestion-date").selected)
        outdate = parseDate(datelist.selectedItem.label + " " + timelist.selectedItem.label);
    else
        outdate = new Date;

    window.arguments[0].out = {
        datetime: outdate,
        datetimestr: outdate.toString()
    };
    return true;
}

function customdate_changed() {
    consoleService.logStringMessage("customdate_changed() called");
    document.getElementById("emic-custom-radiogroup").selectedItem = document.getElementById("emic-custom-date");
}

function datelist_changed() {
    consoleService.logStringMessage("datelist_changed() called");
    document.getElementById("emic-custom-radiogroup").selectedItem = document.getElementById("emic-suggestion-date");
}

function timelist_changed() {
    consoleService.logStringMessage("timelist_changed() called");
    document.getElementById("emic-custom-radiogroup").selectedItem = document.getElementById("emic-suggestion-date");
}