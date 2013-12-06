"use strict";

var EXPORTED_SYMBOLS = ["MailToDate"];

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader); 
loader.loadSubScript("resource://emic/sugar.js");

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.importRelative(this, "easterdate.js");

var MailToDate;

(function() {
    function isUndefined(obj) {
        return typeof obj == "undefined";
    }

//    var wger = new Array("montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag", "sonntag");
//    var wen = new Array("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday");
//    var wshort = new Array("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");

    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

    MailToDate = function(subject, body) {
//        consoleService.logStringMessage("MailToDate: CTor called");
        this.strBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle("chrome://emic/locale/mailtodate.properties");
        this.subject = subject;
        this.body = body;
        this.dates = new Array();
    };

    MailToDate.prototype.extractDates = function(locale) {
//        consoleService.logStringMessage("MailToDate: extractDates called");
        this.dates.length = 0;
        Date.setLocale(locale);

        this.doWork(this.subject);
        this.doWork(this.body);

        this.sortDates();
        return this.dates;
    };

    MailToDate.prototype.doWork = function(text) {
//        consoleService.logStringMessage("MailToDate: doWork called");
        //replace holiday names:
        text = replacewordstonumbers(text, this.strBundle.GetStringFromName("mailtodate.holidays.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.holidays.replaceto").split(","));
        text = this.replaceEasterDays(text);
        //replace monthnames:
        text = replacewordstonumbers(text, this.strBundle.GetStringFromName("mailtodate.months.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.months.replaceto").split(","));
        //parse numbers:
        text = this.parseNumbers(text);
        //parse dates:
        var regexps = this.strBundle.GetStringFromName("mailtodate.parsedates.regexp").split(";");
        for(var i=0; i<regexps.length; ++i)
            this.parseDates(text, new RegExp(regexps[i], "gi"));
    }

    function replacewordstonumbers(text, lookfor, replaceto) {
//        consoleService.logStringMessage("MailToDate: replacewordstonumbers called");
        if(replaceto.length != lookfor.length)
            throw "MailToDate: replacewordstonumbers: lookfor and replaceto: different lengths!";
        var workon = text;
        for (var i=0; i<lookfor.length; ++i)
            workon = workon.replace(lookfor[i], replaceto[i], "gi");
        return workon;
    }

    MailToDate.prototype.replaceEasterDays = function(text) {
//        consoleService.logStringMessage("MailToDate: replaceEasterDays called");
        var easterdate = new EasterDate();
        var d = "{dd}.{MM}.{yyyy}";
        var workon = text;
        for (var i=0; i<easterdate.identifiers.length; ++i)
            workon = workon.replace(easterdate.identifiers[i], easterdate.GetNext(easterdate.identifiers[i]).format(d), "gi");
        return workon;
    }

    MailToDate.prototype.parseNumbers = function(text) {
//        consoleService.logStringMessage("MailToDate: parseNumbers called");
        //neuntausendzweihundertsiebenundvierzig
        var workon = replacewordstonumbers(text, this.strBundle.GetStringFromName("mailtodate.numbers.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.numbers.replaceto").split(","));
        var numberstrs = workon.match(/([+|*]\d+)+/g);
        //jetzt auswerten:
        if(numberstrs) {
            for(var i=0; i<numberstrs.length; ++i) {
                //+9*1000+2*100+7+4*10
                var numberstr = numberstrs[i];
                var prodstrs = numberstr.match(/\d+([*]\d+)+/g);
                if(prodstrs) {
                    for(var j=0; j<prodstrs.length; ++j) {
                        //9*1000
                        var factors = prodstrs[j].split("*");
                        var product = 1;
                        for(var k=0; k<factors.length; ++k) {
                            if(factors[k].length>0)
                                product *= parseInt(factors[k]);
                        }
                        numberstr = numberstr.replace(prodstrs[j], product.toString(), "gi");
                    }
                }
                //+9000+200+7+40
                var summand = numberstr.split("+");
                var sum = 0;
                for(var k=0; k<summand.length; ++k) {
                    if(summand[k].length>0)
                        sum += parseInt(summand[k]);
                }
                workon = workon.replace(numberstrs[i], sum.toString());//, "gi");
            }
        }
        return workon;
    }

    MailToDate.prototype.parseDates = function(text, regexp) {
//        consoleService.logStringMessage("MailToDate: parseDates called");
        var match = text.match(regexp);
        if(match)
            for(var i=0; i<match.length; ++i)
                this.dates.push(Date.future(match[i]));
    }

    MailToDate.prototype.sortDates = function() {
//        consoleService.logStringMessage("MailToDate: sortDates called");
        //returns only valid dates in future
        this.dates = this.dates.compact();
        this.dates.remove(function(date) {
            return !date.isBetween(Date.create('now','en'), Date.create('in 10 years','en'));
        });
        //sorts a given array of dates descending (newest to oldest)
        this.dates.sort(date_sort_desc);
    }

    var date_sort_desc = function (date1, date2) {
        // This is a comparison function that will result in dates being sorted in
        // DESCENDING order.
        if (date1 > date2) return -1;
        if (date1 < date2) return 1;
        return 0;
    };
})();