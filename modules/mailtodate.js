"use strict";

var EXPORTED_SYMBOLS = ["MailToDate"];

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.importRelative(this, "simpledateformat.js");
XPCOMUtils.importRelative(this, "parsedate.js");

var MailToDate;

(function() {
    function isUndefined(obj) {
        return typeof obj == "undefined";
    }

    //  de
    var bger = new Array(   "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf",
                            "zwanzig", "ßig", "zig", "sech", "sieb", "hundert", "ein", "tausend", "ers", "zwo", "drit", "ach",
                            "und", "ster", "sten", "ter", "ten"); 
    var nger = new Array();
    nger["eins"] =     "+1";
    nger["zwei"] =     "+2";
    nger["drei"] =     "+3";
    nger["vier"] =     "+4";
    nger["fünf"] =     "+5";
    nger["sechs"] =    "+6";
    nger["sieben"] =   "+7";
    nger["acht"] =     "+8";
    nger["neun"] =     "+9";
    nger["zehn"] =     "+10";
    nger["elf"] =      "+11";
    nger["zwölf"] =    "+12";
    nger["zwan"] =     "+2";
    nger["ßig"] =      "*10";
    nger["zig"] =      "*10";
    nger["sech"] =     "+6";
    nger["sieb"] =     "+7";
    nger["hundert"] =  "*100";
    nger["ein"] =      "+1";
    nger["tausend"] =  "*1000";
    nger["ers"] =      "+1";
    nger["zwo"] =      "+2";
    nger["drit"] =     "+3";
    nger["ach"] =      "+8";
    nger["und"] =      "";
    nger["ster"] =     ".";
    nger["sten"] =     ".";
    nger["ter"] =      ".";
    nger["ten"] =      ".";

    //  en
    var ben = new Array(    "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "teen", "eleven", "twelve",
                            "twenty", "thirty", "ty", "fiv", "eigh", "hundret", "thousand", "first", "second", "third", "fif", "nin",
                            "and", "th");
    var nen = new Array();
    nen["one"] =      "+1";
    nen["two"] =      "+2";
    nen["three"] =    "+3";
    nen["four"] =     "+4";
    nen["five"] =     "+5";
    nen["six"] =      "+6";
    nen["seven"] =    "+7";
    nen["eight"] =    "+8";
    nen["nine"] =     "+9";
    nen["ten"] =      "+10";
    nen["teen"] =     "+10";
    nen["eleven"] =   "+11";
    nen["twelve"] =   "+12";
    nen["twenty"] =   "+20";
    nen["thirty"] =   "+30";
    nen["ty"] =       "*10";
    nen["fiv"] =      "+5";
    nen["eigh"] =     "+8";
    nen["hundret"] =  "*100";
    nen["thousand"] = "*1000";
    nen["first"] =    "+1";
    nen["second"] =   "+2";
    nen["third"] =    "+3";
    nen["fif"] =      "+5";
    nen["nin"] =      "+9";
    nen["and"] =      "";
    nen["th"] =       ".";

    var mger = new Array(   "januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember",
                            "jan", "feb", "mär", "apr", "jun", "jul", "aug", "sep", "okt", "nov", "dez",
                            "jänner");
    var mnger = new Array();
    mnger["januar"] =       "1.";
    mnger["februar"] =      "2.";
    mnger["märz"] =         "3.";
    mnger["april"] =        "4.";
    mnger["mai"] =          "5.";
    mnger["juni"] =         "6.";
    mnger["juli"] =         "7.";
    mnger["august"] =       "8.";
    mnger["september"] =    "9.";
    mnger["oktober"] =      "10.";
    mnger["november"] =     "11.";
    mnger["dezember"] =     "12.";
    mnger["jan"] =          "1.";
    mnger["feb"] =          "2.";
    mnger["mär"] =          "3.";
    mnger["apr"] =          "4.";
    mnger["jun"] =          "6.";
    mnger["jul"] =          "7.";
    mnger["aug"] =          "8.";
    mnger["sep"] =          "9.";
    mnger["okt"] =          "10.";
    mnger["nov"] =          "11.";
    mnger["dez"] =          "12.";
    mnger["jänner"] =       "1.";

    var men = new Array("january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december",
                        "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec");
    var mnen = new Array();
    mnen["january"] =   "1.";
    mnen["february"] =  "2.";
    mnen["march"] =     "3.";
    mnen["april"] =     "4.";
    mnen["may"] =       "5.";
    mnen["june"] =      "6.";
    mnen["july"] =      "7.";
    mnen["august"] =    "8.";
    mnen["september"] = "9.";
    mnen["october"] =   "10.";
    mnen["november"] =  "11.";
    mnen["december"] =  "12.";
    mnen["jan"] =       "1.";
    mnen["feb"] =       "2.";
    mnen["mar"] =       "3.";
    mnen["apr"] =       "4.";
    mnen["jun"] =       "6.";
    mnen["jul"] =       "7.";
    mnen["aug"] =       "8.";
    mnen["sep"] =       "9.";
    mnen["oct"] =       "10.";
    mnen["nov"] =       "11.";
    mnen["dec"] =       "12.";

    var wger = new Array("montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag", "sonntag");
    var wen = new Array("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday");
    var wshort = new Array("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");

    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);

    MailToDate = function(subject, body) {
//        consoleService.logStringMessage("MailToDate: CTor called");
        this.subject = subject;
        this.body = body;
        this.dates = new Array();
    };

    MailToDate.prototype.extractDates = function() {
//        consoleService.logStringMessage("MailToDate: extractDates called");
        this.dates.length = 0;

        this.doWork(this.subject);
        this.doWork(this.body);

        consoleService.logStringMessage("this.dates.length: " + this.dates.length);

        sortdates(this.dates);
        
        return this.dates;
    };

    MailToDate.prototype.doWork = function(text) {
//        consoleService.logStringMessage("MailToDate: doWork called");
        text =  parsenumbers(text, bger, nger);
        text =  parsenumbers(text, ben, nen);
        
        //replace monthnames:
        text =  replacewordstonumbers(text, mger, mnger);
        text =  replacewordstonumbers(text, men, mnen);

        //parse Dates in format: "yyyy/mm/dd[ hh:mm]"
        this.parseDates(text, new RegExp("\\d{4}\\D+([0]?[1-9]|[1][0-2])\\D+([0]?[1-9]|[1|2]\\d|[3][0|1])(\\D+([0-1]?\\d|[2][0-3])[:]([0-5]\\d))?","g"));
        //parse Dates in format: "dd.mm.yyyy[ hh:mm]"
        this.parseDates(text, new RegExp("([0]?[1-9]|[1|2]\\d|[3][0|1])\\D+([0]?[1-9]|[1][0-2])\\D+\\d{4}(\\D+([0-1]?\\d|[2][0-3])[:]([0-5]\\d))?","g"), 2);
        //parse Dates in format: "yy/mm/dd [hh:mm]"
        this.parseDates(text, new RegExp("\\d{2}[-/ ]+([0]?[1-9]|[1][0-2])[-/ ]+([0]?[1-9]|[1|2]\\d|[3][0|1])[ ](\\D*([0-1]?\\d|[2][0-3])[:]([0-5]\\d))?","g"));
        //parse Dates in format: "dd.mm.yy [hh:mm]"
        this.parseDates(text, new RegExp("([0]?[1-9]|[1|2]\\d|[3][0|1])[. ]+([0]?[1-9]|[1][0-2])[. ]+\\d{2}[ ](\\D*([0-1]?\\d|[2][0-3])[:]([0-5]\\d))?","g"), 2);
        //parse Dates in format: "mm/dd [hh:mm]"
        this.parseDates(text, new RegExp("([0]?[1-9]|[1][0-2])[-/ ]+([0]?[1-9]|[1|2]\\d|[3][0|1])[ ](\\D*([0-1]?\\d|[2][0-3])[:]([0-5]\\d))?","g"), -1);
        //parse Dates in format: "dd.mm. [hh:mm]"
        this.parseDates(text, new RegExp("([0]?[1-9]|[1|2]\\d|[3][0|1])[. ]+([0]?[1-9]|[1][0-2])[. ](\\D*([0-1]?\\d|[2][0-3])[:]([0-5]\\d))?","g"), -2);
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

    function replacewordstonumbers(text, b, n) {
//        consoleService.logStringMessage("MailToDate: replacewordstonumbers called");
        var workon = text;//.toLowerCase();
        for (var i=0; i<b.length; ++i)
            workon = workon.replace(b[i], n[b[i]], "gi");
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