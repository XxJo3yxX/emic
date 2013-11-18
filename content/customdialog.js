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
//    consoleService.logStringMessage("customdate: " + customdate.toString());
//    consoleService.logStringMessage("Object.prototype.toString.call(customdate) === '[object Date]': " + (Object.prototype.toString.call(customdate) === '[object Date]'));
//    consoleService.logStringMessage("Object.prototype.toString.call(customdate): " + (Object.prototype.toString.call(customdate)));
//    consoleService.logStringMessage("Object.prototype.toString(customdate): " + (Object.prototype.toString(customdate)));
//    consoleService.logStringMessage("customdate instanceof Date: " + (customdate instanceof Date));
//    consoleService.logStringMessage("isFinite(customdate): " + isFinite(customdate));
    if((Object.prototype.toString.call(customdate) === '[object Date]') && isFinite(customdate)) {
        var d = new SimpleDateFormat("yyyy-MM-dd");
        var t = new SimpleDateFormat("HH:mm");
//        consoleService.logStringMessage("d.format(customdate): " + d.format(customdate));
        document.getElementById("emic-custom-datepicker").value = d.format(customdate);
        document.getElementById("emic-custom-timepicker").value = t.format(customdate);
//        consoleService.logStringMessage("customdate: " + customdate.toString());
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
        datetime: outdate
    };
    return true;
}