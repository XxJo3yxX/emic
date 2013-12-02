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
    for (var i = 0; i < 6; ++i)
        if (!parts[i])
            parts[i] = "";

    var now = new Date;
    if(yearpos < 0)
        parts[yearpos] = now.getFullYear().toString();
        
    if(parts[yearpos].length < 4) {
        parts[yearpos] = now.getFullYear().toString().substring(0, (4-parts[yearpos].length)) + parts[yearpos];
        consoleService.logStringMessage("parts[yearpos]: " + parts[yearpos]);
    }

    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]]) // months are 0-based
    switch(yearpos) {
        case -2:
            consoleService.logStringMessage("new Date(parts[-2], parts[1]-1, parts[0], parts[2], parts[3], parts[4]): " + new Date(parts[-2], parts[1]-1, parts[0], parts[2], parts[3], parts[4]));
            return new Date(parts[-2], parts[1]-1, parts[0], parts[2], parts[3], parts[4]); break;
        case -1:
            consoleService.logStringMessage("new Date(parts[-1], parts[0]-1, parts[1], parts[2], parts[3], parts[4]): " + new Date(parts[-1], parts[0]-1, parts[1], parts[2], parts[3], parts[4]));
            return new Date(parts[-1], parts[0]-1, parts[1], parts[2], parts[3], parts[4]); break;
        case 2:
            consoleService.logStringMessage("new Date(parts[2], parts[1]-1, parts[0], parts[3], parts[4], parts[5]): " + new Date(parts[2], parts[1]-1, parts[0], parts[3], parts[4], parts[5]));
            return new Date(parts[2], parts[1]-1, parts[0], parts[3], parts[4], parts[5]); break;
        default:
            consoleService.logStringMessage("new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]): " + new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]));
            return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]); break;
    }
    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
}
