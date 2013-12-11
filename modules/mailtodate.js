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

    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

    MailToDate = function(subject, body) {
//        consoleService.logStringMessage("MailToDate: CTor called");
        this.strBundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService).createBundle("chrome://emic/locale/mailtodate.properties");
        this.subject = subject;
//        consoleService.logStringMessage("Date.future(" + subject + ",'de'): " + Date.future(subject,'de'));
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
        //replace localespecific:
        text = replacewordstonumbers(text, this.strBundle.GetStringFromName("mailtodate.localespecific.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.localespecific.replaceto").split(","));
        //replace holiday names:
        text = replacewordstonumbers(text, this.strBundle.GetStringFromName("mailtodate.holidays.lookfor").split(","), this.strBundle.GetStringFromName("mailtodate.holidays.replaceto").split(","));
        text = this.replaceEasterDays(text);
        //parse numbers:
        text = this.parseNumbers(text);
        //parse dates in numeric format (work in any locale):
//        this.parseDatesNumericFormat(text);
//        this.parseDatesTextFormat(text);
        this.parseDatesSugarFormat(text);
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
        var d = "{yyyy}-{MM}-{dd}";
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
//        consoleService.logStringMessage("regexp: " + regexp);
        var match = text.match(regexp);
        if(match)
            for(var i=0; i<match.length; ++i) {
                consoleService.logStringMessage("Date.future(" + match[i] + "): " + Date.future(match[i]));
                this.dates.push(Date.future(match[i]));
            }
    }

//    MailToDate.prototype.parseDatesNumericFormat = function(text) {
////        consoleService.logStringMessage("MailToDate: parseDatesNumericFormat called");
//        var yyyy = "(\\d{4})";
//        var yy = "(\\d{4}|\\d{2})";
//        var mm = "([0]?[1-9]|[1][0-2])";
//        var dd = "([0]?[1-9]|[1|2]\\d|[3][0|1])";
//        var time = "((([0]?[1-9]|1[0-2])(:[0-5]\\d){0,2}([.]\\d+)?(\\s*[aApP][mM]))|(([01]\\d|2[0-3])(:[0-5]\\d){0,2}([.]\\d+)?))";
//        var offset = "([-+]((0\\d|1[0-3])(:)?([03]0|45)|14(:)?00))";
//        var opttime = "(\\s+" + time + offset + "?)?";
//        var regexps = new Array();
//        regexps.push(yyyy + "[-.]" + mm + "[-.]" + dd + opttime);
//        regexps.push(dd + "[-./]" + mm + "[-./]" + yy + opttime);
//        regexps.push("\\s+" + mm + "[-.]" + yyyy);
//        for(var i=0; i<regexps.length; ++i)
//            this.parseDates(text, new RegExp(regexps[i], "gi"));
//    }

//    MailToDate.prototype.parseDatesTextFormat = function(text) {
////        consoleService.logStringMessage("MailToDate: parseDatesTextFormat called");
//        var year = "(\\d{4})";
//        var month = "(" + this.strBundle.GetStringFromName("mailtodate.sugar.months").split(",").join("|") + ")";
//        var weekday = "(" + this.strBundle.GetStringFromName("mailtodate.sugar.weekdays").split(",").join("|") + ")";
//        var unit = "(" + this.strBundle.GetStringFromName("mailtodate.sugar.units").split(",").join("|") + ")";
//        var tokens = this.strBundle.GetStringFromName("mailtodate.sugar.tokens").split(",");
//        var edge = "(" + this.strBundle.GetStringFromName("mailtodate.sugar.modifiers.edges").split(",").join("|") + ")";
//        var day = "(" + this.strBundle.GetStringFromName("mailtodate.sugar.modifiers.days").split(",").join("|") + ")";
//        var sign = "(" + this.strBundle.GetStringFromName("mailtodate.sugar.modifiers.signs").split(",").join("|") + ")";
//        var shift = "(" + this.strBundle.GetStringFromName("mailtodate.sugar.modifiers.shifts").split(",").join("|") + ")";
//        var num = "\\d+";
//        var date = "([0]?[1-9]|[1|2]\\d|[3][0|1])";
//        var time = "((([0]?[1-9]|1[0-2])(:[0-5]\\d){0,2}([.]\\d+)?(\\s*[aApP][mM]))|(([01]\\d|2[0-3])(:[0-5]\\d){0,2}([.]\\d+)?))";
//        var offset = "([-+]((0\\d|1[0-3])(:)?([03]0|45)|14(:)?00))";
//        var opttime = "(\\s+" + time + offset + "?)?";
//        var d = "[ ,.]*";
//        var regexps = new Array();
//        switch(Date.getLocale().code) {
//            case 'en':
//                regexps.push(month + d + year);
//                regexps.push(shift + d + unit);
//                regexps.push("(" + tokens[0] + ")?" + d + date + "(" + tokens[1] + ")");
//                regexps.push("(" + tokens[0] + ")?" + d + edge + d + "of" + shift + "?" + d + unit + "?" + month + "?" + year + "?");
//                regexps.push(num + d + unit + d + sign + opttime);
//                regexps.push(sign + d + num + d + unit + opttime);
//                regexps.push("(" + tokens[0] + ")" + d + num + "(" + tokens[1] + ")" + d + weekday + d + "of" + d + month + d + year + "?" + opttime);
//                regexps.push(weekday + "?" + d + month + d + date + "(" + tokens[1] + ")?" + d + year + "?" + opttime);
//                regexps.push(date + d + month + d + year + opttime);
//                regexps.push(date + d + month + opttime);
//                regexps.push(shift + d + weekday + opttime);
//                regexps.push(shift + d + "week" + d + weekday + opttime);
//                regexps.push(weekday + d + "(" + tokens[2] + ")?" + d + shift + d + "week" + opttime);
//                regexps.push(num + d + unit + d + sign + d + weekday + opttime);
//                regexps.push("(" + tokens[0] + ")?" + d + date + "(" + tokens[1] + ")" + d + "of" + d + month + opttime);
//                regexps.push("(" + tokens[0] + ")?" + month + "?" + d + date + "?" + "(" + tokens[1] + ")?" + d + "of" + d + shift + d + unit + opttime);
//                regexps.push(edge + d + "of" + d + weekday + opttime);
//                regexps.push(day + opttime);
//                break;
//            case 'de':
//            case 'de-DE':
//                regexps.push(sign + d + num + d + unit);
//                regexps.push(num + d + unit + d + sign);
//                regexps.push(shift + d + unit);
//                regexps.push(weekday + "?" + d + date + "?" + d + month + d + year + "?" + opttime);
//                regexps.push(shift + "?" + d + weekday + opttime);
//                regexps.push(day + opttime);
//                break;
//            default: break;
//        }
//        for(var i=0; i<regexps.length; ++i)
//            this.parseDates(text, new RegExp(regexps[i], "gi"));
//    }

    MailToDate.prototype.parseDatesSugarFormat = function(text) {
//        consoleService.logStringMessage("MailToDate: parseDatesSugarFormat called");
        for(var i=0; i<Date.getLocale().compiledFormats.length; ++i) {
            var regexp = Date.getLocale().compiledFormats[i].reg.removeFlag('i').toString();
            regexp = regexp.remove('/^').reverse().remove('/$').reverse();
            this.parseDates(text, new RegExp(regexp, "gi"));
        }
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