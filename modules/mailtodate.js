"use strict";

var EXPORTED_SYMBOLS = ["MailToDate"];

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.importRelative(this, "simpledateformat.js");
XPCOMUtils.importRelative(this, "parsedate.js");
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

    MailToDate.prototype.extractDates = function() {
//        consoleService.logStringMessage("MailToDate: extractDates called");
        this.dates.length = 0;

        this.doWork(this.subject);
        this.doWork(this.body);

        sortdates(this.dates);
        return this.dates;
    };

    MailToDate.prototype.doWork = function(text) {
//        consoleService.logStringMessage("MailToDate: doWork called");
        //replace holiday names:
        text = replacewordstonumbers(text, this.strBundle.GetStringFromName("mailtodate.holidays.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.holidays.replaceto").split(","));
        text = this.replaceeasterdays(text);
        //replace monthnames:
        text = replacewordstonumbers(text, this.strBundle.GetStringFromName("mailtodate.months.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.months.replaceto").split(","));
        //parse numbers:
        text = parsenumbers(text, this.strBundle.GetStringFromName("mailtodate.numbers.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.numbers.replaceto").split(","));
        //parse dates:
        var regexps = this.strBundle.GetStringFromName("mailtodate.parsedates.regexp").split(";");
        var yearpos = this.strBundle.GetStringFromName("mailtodate.parsedates.yearpos").split(",");
        if(regexps.length != yearpos.length)
            throw "MailToDate: doWork: regexps and yearpos: different lengths!";
        for(var i=0; i<regexps.length; ++i)
            this.parseDates(text, new RegExp(regexps[i], "g"), yearpos[i]);
    }

    MailToDate.prototype.parseDates = function(text, regex, yearpos = 0) {
//        consoleService.logStringMessage("MailToDate: parsedates called");
        var match = text.match(regex);
        if(match)
            for(var i=0; i<match.length; ++i)
                this.dates.push(parseDate(match[i], yearpos));
    }

    function parsenumbers(text, b, n) {
//        consoleService.logStringMessage("MailToDate: parsenumbers called");
        //neuntausendzweihundertsiebenundvierzig
        var workon = replacewordstonumbers(text, b, n);
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

    function replacewordstonumbers(text, lookfor, replaceto) {
//        consoleService.logStringMessage("MailToDate: replacewordstonumbers called");
        if(replaceto.length != lookfor.length)
            throw "MailToDate: replacewordstonumbers: lookfor and replaceto: different lengths!";
        var workon = text;
        for (var i=0; i<lookfor.length; ++i)
            workon = workon.replace(lookfor[i], replaceto[i], "gi");
        return workon;
    }

    MailToDate.prototype.replaceeasterdays = function(text) {
        var easterdate = new EasterDate();
        var d = new SimpleDateFormat("dd.MM.yyyy");
        var workon = text;
        for (var i=0; i<easterdate.identifiers.length; ++i)
            workon = workon.replace(easterdate.identifiers[i], d.format(easterdate.GetNext(easterdate.identifiers[i])), "gi");
        return workon;
    }

    function sortdates(arrayofdates) {
//        consoleService.logStringMessage("MailToDate: sortdates called");
        //returns only valid dates in future
        var i = 0;
        var now = new Date();
        while(i < arrayofdates.length) {
            if(!arrayofdates[i] || arrayofdates[i]<now || arrayofdates[i].getFullYear()>(now.getFullYear()+10))
                arrayofdates.splice(i,1);
            else
                ++i;
        }
        //sorts a given array of dates descending (newest to oldest)
        arrayofdates.sort(date_sort_desc);
    }

    var date_sort_desc = function (date1, date2) {
        // This is a comparison function that will result in dates being sorted in
        // DESCENDING order.
        if (date1 > date2) return -1;
        if (date1 < date2) return 1;
        return 0;
    };
})();