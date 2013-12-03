"use strict";

var EXPORTED_SYMBOLS = ["parseDate"];

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

// parse a date in "yyyy/mm/dd hh:mm:ss" format
function parseDate(input, yearpos = 0) {
    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
    consoleService.logStringMessage("parseDate called");
    consoleService.logStringMessage("input: " + input);
    consoleService.logStringMessage("yearpos: " + yearpos);

    var parts = input.split(/\D+/); //RegExp => anything but number
    for(var i=0; i<6; ++i)
        if(!parts[i])
            parts[i] = "";

    var now = new Date;
    if(yearpos < 0) {
        parts.splice(0, 0, now.getFullYear().toString());
        if(yearpos == -2) {
            //swap day and month
            var temp = parts[1];
            parts[1] = parts[2];
            parts[2] = temp;
        }
        if((new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]))<now)
            parts[0] = (now.getFullYear()+1).toString();
    }

    if(yearpos > 0) {
        //swap year to pos 0
        var temp = parts[yearpos];
        parts[yearpos] = parts[0];
        parts[0] = temp;
    }

    if(parts[0].length < 4)
        parts[0] = now.getFullYear().toString().substring(0, (4-parts[0].length)) + parts[0];

    if(parts[3].length <= 0)
        parts[3] = "23";
    if(parts[4].length <= 0)
        parts[4] = "59";

    consoleService.logStringMessage("parts: " + parts);

    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]]) // months are 0-based
    consoleService.logStringMessage("new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]): " + new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]));
    return new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
}
