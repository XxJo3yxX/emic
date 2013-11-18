"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource://emic/parsedate.js");

// Called once when the dialog displays
function onLoad() {
    window.sizeToContent();
    // Use the arguments passed to us by the caller
    if(window.arguments[0].inn.customdatetime) {
        document.getElementById("emic-custom-datepicker").value = window.arguments[0].inn.customdatetime;
        document.getElementById("emic-custom-timepicker").value = window.arguments[0].inn.customdatetime;
    }
}

// Called once if and only if the user clicks OK
function onOK() {
    // Return the changed arguments.
    // Notice if user clicks cancel, window.arguments[0].out remains null because this function is never called
    var outdate;
    if(document.getElementById("emic-custom-date").selected)
        outdate = parseDate(document.getElementById("emic-custom-datepicker").value + " " + document.getElementById("emic-custom-timepicker").value);
    else if(document.getElementById("emic-suggestion-date").selected)
        outdate = parseDate(document.getElementById("emic-suggestion-datelist").value + " " + document.getElementById("emic-suggestion-timelist").value);
    else
        outdate = new Date;


    alert(document.getElementById("emic-custom-datepicker").value + " " + document.getElementById("emic-custom-timepicker").value);
    alert(parseDate(document.getElementById("emic-custom-datepicker").value + " " + document.getElementById("emic-custom-timepicker").value).toString());
    alert(document.getElementById("emic-suggestion-datelist").value + " " + document.getElementById("emic-suggestion-timelist").value);
    
 










    window.arguments[0].out = {
        datetime: outdate
    };
    return true;
}