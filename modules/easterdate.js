"use strict";

var EXPORTED_SYMBOLS = ["EasterDate"];

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.importRelative(this, "simpledateformat.js");
XPCOMUtils.importRelative(this, "parsedate.js");

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
            case "shrove monday":           easterdate.setDate(easterdate.getDate() -48);   break;  //rosenmontag
            case "shrove tuesday":          easterdate.setDate(easterdate.getDate() -47);   break;  //fastnachtsdienstag
            case "ash wednesday":           easterdate.setDate(easterdate.getDate() -46);   break;  //aschermittwoch
            case "holy thursday":           easterdate.setDate(easterdate.getDate() -3);    break;  //gründonnerstag
            case "good friday":             easterdate.setDate(easterdate.getDate() -2);    break;  //karfreitag
            case "holy saturday":           easterdate.setDate(easterdate.getDate() -1);    break;  //karsamstag
            case "easter monday":           easterdate.setDate(easterdate.getDate() +1);    break;  //ostermontag
            case "ascension day":           easterdate.setDate(easterdate.getDate() +39);   break;  //christi himmelfahrt
            case "whit sunday":             easterdate.setDate(easterdate.getDate() +49);   break;  //pfingstsonntag
            case "whit monday":             easterdate.setDate(easterdate.getDate() +50);   break;  //pfingstmontag
//            case "trinity sunday":          easterdate.setDate(easterdate.getDate() );      break;  //dreifaltigkeitssonntag
            case "feast of corpus christi": easterdate.setDate(easterdate.getDate() +60);   break;  //fronleichnam
            //case "easter": case "easter day": case "easter sunday":
            default: break;
        }
        return easterdate;
    }

    EasterDate.prototype.GetNext = function(identifier) {
//        consoleService.logStringMessage("EasterDate: GetNext called");
        var now = new Date();
        var next = this.GetDateFor(identifier, now.getFullYear());
        if(next < now)
            next = this.GetDateFor(identifier, now.getFullYear()+1);
        return next;
    }
})();