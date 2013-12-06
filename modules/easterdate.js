"use strict";

var EXPORTED_SYMBOLS = ["EasterDate"];

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader); 
loader.loadSubScript("resource://emic/sugar.js");

var EasterDate;

(function() {
    function isUndefined(obj) {
        return typeof obj == "undefined";
    }

    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

    EasterDate = function() {
//        consoleService.logStringMessage("EasterDate: CTor called");
        this.identifiers = new Array();
        this.identifiers.push("shrove monday");             //rosenmontag
        this.identifiers.push("shrove tuesday");            //fastnachtsdienstag
        this.identifiers.push("ash wednesday");             //aschermittwoch
        this.identifiers.push("holy thursday");             //gründonnerstag
        this.identifiers.push("good friday");               //karfreitag
        this.identifiers.push("holy saturday");             //karsamstag
        this.identifiers.push("easter sunday");             //ostersonntag
        this.identifiers.push("easter monday");             //ostermontag
        this.identifiers.push("ascension day");             //christi himmelfahrt
        this.identifiers.push("whit sunday");               //pfingstsonntag
        this.identifiers.push("whit monday");               //pfingstmontag
        this.identifiers.push("feast of corpus christi");   //fronleichnam
        this.identifiers.push("easter");                    //ostern
    };

    EasterDate.prototype.calceasterdate = function(J) {
//        consoleService.logStringMessage("EasterDate: calceasterdate called");
        var a = J % 19;
        var b = J % 4;
        var c = J % 7;
        var d = (19 * a + 24) % 30;
        var e = (2 * b + 4 * c + 6 * d + 5) % 7;
        var OT = 22 + d + e;
        var OM = 3;
        if (OT > 31) {
            OT = d + e - 9;
            OM = 4;
        }
        if (OT == 26 && OM == 4) {
            OT = 19;
        }
        if (OT == 25 && OM == 4 && d == 28 && e == 6 && a > 10) {
            OT = 18;
        }
        return new Date(J,OM-1,OT);
    }

    EasterDate.prototype.GetDateFor = function(identifier, year) {
//        consoleService.logStringMessage("EasterDate: GetDateFor called");
        var easterdate = this.calceasterdate(year);
        switch(identifier) {
            case "shrove monday":           easterdate.addDays(-48);   break;  //rosenmontag
            case "shrove tuesday":          easterdate.addDays(-47);   break;  //fastnachtsdienstag
            case "ash wednesday":           easterdate.addDays(-46);   break;  //aschermittwoch
            case "holy thursday":           easterdate.addDays(-3);    break;  //gründonnerstag
            case "good friday":             easterdate.addDays(-2);    break;  //karfreitag
            case "holy saturday":           easterdate.addDays(-1);    break;  //karsamstag
            case "easter monday":           easterdate.addDays(+1);    break;  //ostermontag
            case "ascension day":           easterdate.addDays(+39);   break;  //christi himmelfahrt
            case "whit sunday":             easterdate.addDays(+49);   break;  //pfingstsonntag
            case "whit monday":             easterdate.addDays(+50);   break;  //pfingstmontag
//            case "trinity sunday":          easterdate.addDays();      break;  //dreifaltigkeitssonntag
            case "feast of corpus christi": easterdate.addDays(+60);   break;  //fronleichnam
            //case "easter": case "easter day": case "easter sunday":
            default: break;
        }
        return easterdate;
    }

    EasterDate.prototype.GetNext = function(identifier) {
//        consoleService.logStringMessage("EasterDate: GetNext called");
        var now = Date.create();
        var next = this.GetDateFor(identifier, now.getFullYear());
        if(next.isPast())
            next = this.GetDateFor(identifier, now.getFullYear()+1);
        return next;
    }
})();