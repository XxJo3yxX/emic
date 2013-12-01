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

    var n = new Array();
    var b = new Array(  "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf",
                        "zwanzig", "dreißig", "zig", "sech", "sieb", "hundert", "ein", "tausend", "ers", "zwo", "drit", "ach"); 
    //  de
    n["eins"] =     "+1";
    n["zwei"] =     "+2";
    n["drei"] =     "+3";
    n["vier"] =     "+4";
    n["fünf"] =     "+5";
    n["sechs"] =    "+6";
    n["sieben"] =   "+7";
    n["acht"] =     "+8";
    n["neun"] =     "+9";
    n["zehn"] =     "+10";
    n["elf"] =      "+11";
    n["zwölf"] =    "+12";
    n["zwan"] =     "+2";
    n["dreißig"] =  "+30";
    n["zig"] =      "*10";
    n["sech"] =     "+6";
    n["sieb"] =     "+7";
    n["hundert"] =  "*100";
    n["ein"] =      "+1";
    n["tausend"] =  "*1000";
    n["ers"] =      "+1";
    n["zwo"] =      "+2";
    n["drit"] =     "+3";
    n["ach"] =      "+8";

    //var n = new Array(); b = new Array( "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    //                                    "twenty", "thirty", "ty", "fiv", "eigh", "hundret", "thousand", "first", "second", "third", "fif", "nin");
    ////  en           base      multiplier
    //n["zero"] =     {base:  0,  mult:   0};
    //n["one"] =      {base:  1,  mult:   1};
    //n["two"] =      {base:  2,  mult:   1};
    //n["three"] =    {base:  3,  mult:   1};
    //n["four"] =     {base:  4,  mult:   1};
    //n["five"] =     {base:  5,  mult:   1};
    //n["six"] =      {base:  6,  mult:   1};
    //n["seven"] =    {base:  7,  mult:   1};
    //n["eight"] =    {base:  8,  mult:   1};
    //n["nine"] =     {base:  9,  mult:   1};
    //n["ten"] =      {base:  10, mult:   1};
    //n["teen"] =     n["ten"];
    //n["eleven"] =   {base:  11, mult:   1};
    //n["twelve"] =   {base:  12, mult:   1};
    //n["twenty"] =   {base:  20, mult:   1};
    //n["thirty"] =   {base:  30, mult:   1};
    //n["ty"] =       {base:  1,  mult:   10};
    //n["fiv"] =      n["five"];
    //n["eigh"] =     n["eight"];
    //n["hundret"] =  {base:  1,  mult:   100};
    //n["thousand"] = {base:  1,  mult:   1000};
    //n["first"] =    n["one"];
    //n["second"] =   n["two"];
    //n["third"] =    n["three"];
    //n["fif"] =      n["five"];
    //n["nin"] =      n["nine"];

    var mger = new Array("januar", "februar", "märz", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "dezember");
    var men = new Array("january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december");
    var mshort = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

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
        var regex = new RegExp("([0]?[1-9]|[1|2]\\d|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-](\\d{4}|\\d{2})\\s*(([0-1]?\\d|[2][0-3]):([0-5]\\d))?","g");
        var match = this.subject.match(regex);
        if(match) {
            for(var i=0; i<match.length; ++i) {
                this.dates.push(parseDate(match[i]));
            }
        }
        match = this.body.match(regex);
        if(match) {
            for(var i=0; i<match.length; ++i) {
                this.dates.push(parseDate(match[i]));
            }
        }

        sortdates(this.dates);
        
//        consoleService.logStringMessage("MailToDate: extractDates end");
        return this.dates;
    };

//    function splitintolines(subject, body) {
//        subjectlines = subject.replace(". ", "! ").split("! ");
//        bodylines = body.replace(". ", "! ").split("! ");
//    }

//    function replacewordstonumbers(line) {
//    //    neuntausendzweihundertsiebenundvierzig
//        workon = line.toLowerCase();
//        for (var i=0; i<b.length; ++i) {
//            workon = workon.replace(b[i],n[b[i]]);
//        }
//        workon = workon.replace("und", "");
//        numbers = line.split(/\D/);
//        //jetzt auswerten:
//        for (var i=0; i<numbers.length; ++i) {
//            var number = numbers[i];
//            if (number.length > 0) {
//            //+9*1000+2*100+7+4*10
//                null;
//            }
//        }
//    }

//    function stupidparse(input) {
//        var year = new Array();
//        var month = new Array();
//        var day = new Array();
//        var weekday = new Array();
//        var hour = new Array();
//        var minute = new Array();
//        var now = new Date();

//        var workon = input.toLowerCase();

//        year.push(now.getFullYear());
//        for(var i = now.getFullYear(); i<=now.getFullYear()+7; ++i) {
//            if(workon.contains(i.toString()))
//                year.push(i);
//        }

//        workon = workon.replace("jänner","Jan");
//        for (var i = 0; i < mshort.length; ++i) {
//            workon = workon.replace(mger[i], mshort[i]);
//            workon = workon.replace(men[i], mshort[i]);
//            if(workon.contains(mshort[i]))
//                month.push(1+i);
//        }

//        for (var i = 0; i < wshort.length; ++i) {
//            workon = workon.replace(wger[i], wshort[i]);
//            workon = workon.replace(wen[i], wshort[i]);
//            if(workon.contains(wshort[i]))
//                weekday.push(wshort[i]);
//        }
//    }

    function sortdates(arrayofdates) {
        //returns only valid dates in future
        var i = 0;
        var now = new Date();
        while(i < arrayofdates.length) {
            if(!arrayofdates[i] || arrayofdates[i]<now)
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