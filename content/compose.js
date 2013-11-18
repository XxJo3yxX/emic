"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource:///modules/errUtils.js");
Cu.import("resource://emic/simpledateformat.js");
Cu.import("resource://emic/parsedate.js");

var emicComposeObj = {

    consoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),

    expdatestr: "",

    check_emiccustom: function(){
        var emicnever = document.getElementById("emic-compose-never");
        var emicnow = document.getElementById("emic-compose-now");
        var emiccustom = document.getElementById("emic-compose-custom");
        var emicnever2 = document.getElementById("emic-compose-never2");
        var emicnow2 = document.getElementById("emic-compose-now2");
        var emiccustom2 = document.getElementById("emic-compose-custom2");
        emicnever.setAttribute("checked", "false");
        emicnever2.setAttribute("checked", "false");
        emicnow.setAttribute("checked", "false");
        emicnow2.setAttribute("checked", "false");
        emiccustom.setAttribute("checked", "true");
        emiccustom2.setAttribute("checked", "true");
    },

    check_emicnever: function(){
        var emicnever = document.getElementById("emic-compose-never");
        var emicnow = document.getElementById("emic-compose-now");
        var emiccustom = document.getElementById("emic-compose-custom");
        var emicnever2 = document.getElementById("emic-compose-never2");
        var emicnow2 = document.getElementById("emic-compose-now2");
        var emiccustom2 = document.getElementById("emic-compose-custom2");
        emicnow.setAttribute("checked", "false");
        emicnow2.setAttribute("checked", "false");
        emiccustom.setAttribute("checked", "false");
        emiccustom2.setAttribute("checked", "false");
        emicnever.setAttribute("checked", "true");
        emicnever2.setAttribute("checked", "true");
    },

    check_emicnow: function(){
        var emicnever = document.getElementById("emic-compose-never");
        var emicnow = document.getElementById("emic-compose-now");
        var emiccustom = document.getElementById("emic-compose-custom");
        var emicnever2 = document.getElementById("emic-compose-never2");
        var emicnow2 = document.getElementById("emic-compose-now2");
        var emiccustom2 = document.getElementById("emic-compose-custom2");
        emicnever.setAttribute("checked", "false");
        emicnever2.setAttribute("checked", "false");
        emiccustom.setAttribute("checked", "false");
        emiccustom2.setAttribute("checked", "false");
        emicnow.setAttribute("checked", "true");
        emicnow2.setAttribute("checked", "true");
    },

    setExpirationDateCustom: function() {
        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateCustom() called");
        this.consoleService.logStringMessage("new Date(this.expdatestr): " + new Date(this.expdatestr).toString());
        //call Dialog:
        var params = {inn:{customdatetime:(new Date(this.expdatestr))}, out:null};
        window.openDialog("chrome://emic/content/customdialog.xul","","chrome, dialog, modal, resizable=no", params).focus();
        if (params.out) {
            // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
            this.check_emiccustom();
            this.expdatestr = params.out.datetime.toString();
        }
        else {
            // User clicked cancel. Typically, nothing is done here.
        }
    },

    setExpirationDateNever: function() {
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateNever() called");
        this.check_emicnever();
        this.expdatestr = "Never";
    },

    setExpirationDateNow: function() {
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateNow() called");
        this.check_emicnow();
        this.expdatestr = (new Date).toString();
    },

    send_event_listener: function(e) {
//        this.consoleService.logStringMessage("emicComposeObj.send_event_handler() called");
//        this.consoleService.logStringMessage("expdatestr: " + this.expdatestr);
        if(!gMsgCompose.compFields.otherRandomHeaders.contains("Expiration-Date: "))
            gMsgCompose.compFields.otherRandomHeaders += "Expiration-Date: " + this.expdatestr + "\r\n";
    },

    init: function() {
//        this.consoleService.logStringMessage("emicComposeObj.init() called");
//        this.consoleService.logStringMessage("expdatestr: " + this.expdatestr);
    }
}

window.addEventListener( "compose-send-message", function(e){emicComposeObj.send_event_listener(e);}, true);