"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource:///modules/errUtils.js");
Cu.import("resource://emic/simpledateformat.js");
Cu.import("resource://emic/parsedate.js");

var emicObj = {

    consoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),

    check_emiccustom: function(){
        var emicnever = document.getElementById("emic-never");
        var emicnow = document.getElementById("emic-now");
        var emiccustom = document.getElementById("emic-custom");
        var emicnever2 = document.getElementById("emic-never2");
        var emicnow2 = document.getElementById("emic-now2");
        var emiccustom2 = document.getElementById("emic-custom2");
        emicnever.setAttribute("checked", "false");
        emicnever2.setAttribute("checked", "false");
        emicnow.setAttribute("checked", "false");
        emicnow2.setAttribute("checked", "false");
        emiccustom.setAttribute("checked", "true");
        emiccustom2.setAttribute("checked", "true");
    },

    check_emicnever: function(){
        var emicnever = document.getElementById("emic-never");
        var emicnow = document.getElementById("emic-now");
        var emiccustom = document.getElementById("emic-custom");
        var emicnever2 = document.getElementById("emic-never2");
        var emicnow2 = document.getElementById("emic-now2");
        var emiccustom2 = document.getElementById("emic-custom2");
        emicnow.setAttribute("checked", "false");
        emicnow2.setAttribute("checked", "false");
        emiccustom.setAttribute("checked", "false");
        emiccustom2.setAttribute("checked", "false");
        emicnever.setAttribute("checked", "true");
        emicnever2.setAttribute("checked", "true");
    },

    check_emicnow: function(){
        var emicnever = document.getElementById("emic-never");
        var emicnow = document.getElementById("emic-now");
        var emiccustom = document.getElementById("emic-custom");
        var emicnever2 = document.getElementById("emic-never2");
        var emicnow2 = document.getElementById("emic-now2");
        var emiccustom2 = document.getElementById("emic-custom2");
        emicnever.setAttribute("checked", "false");
        emicnever2.setAttribute("checked", "false");
        emiccustom.setAttribute("checked", "false");
        emiccustom2.setAttribute("checked", "false");
        emicnow.setAttribute("checked", "true");
        emicnow2.setAttribute("checked", "true");
    },

    setExpirationDateCustom: function() {
//        this.consoleService.logStringMessage("emicObj.setExpirationDateCustom() called");
        //call Dialog
        var params = {inn:{customdate:(new Date(this.getExpirationDateStr())), suggestions: null}, out:null};
        window.openDialog("chrome://emic/content/customdialog.xul","","chrome, dialog, modal, resizable=no", params).focus();
        if(params.out) {
            // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
            this.setExpirationDateStr(params.out.datestr);
        }
        else {
            // User clicked cancel. Typically, nothing is done here.
        }
    },

    setExpirationDateNever: function() {
//        this.consoleService.logStringMessage("emicObj.setExpirationDateNever() called");
        this.setExpirationDateStr("Never");
    },

    setExpirationDateNow: function() {
//        this.consoleService.logStringMessage("emicObj.setExpirationDateNow() called");
        this.setExpirationDateStr((new Date).toString());
    },

    getExpirationDateStr: function() {
        return gFolderDisplay.selectedMessage.getStringProperty("Expiration-Date");
    },

    setExpirationDateStr: function(expdatestr) {
//        this.consoleService.logStringMessage("emicObj.setExpirationDateStr() called");
        var msgArraylength = gFolderDisplay.selectedCount;
        var msgArray = gFolderDisplay.selectedMessages;

        for (var msgHdr in fixIterator(msgArray, Ci.nsIMsgDBHdr)) {
            msgHdr.setStringProperty("Expiration-Date",expdatestr);
        }

        this.selectChanged(null);
    },

    selectChanged: function(e) {
//        this.consoleService.logStringMessage("emicObj.selectChanged() called");
//        var msgHdr = gFolderDisplay.selectedMessage;
        var expdatestr = this.getExpirationDateStr();//msgHdr.getStringProperty("Expiration-Date");
        this.consoleService.logStringMessage("expdatestr: " + expdatestr);
        if(!expdatestr || expdatestr.length <= 0 || expdatestr == "Never") {
            this.check_emicnever();
        }
        else if((new Date(expdatestr)) < (new Date())) {
            this.check_emicnow();
        }
        else {
            this.check_emiccustom();
        }
    },

    init: function() {
//        this.consoleService.logStringMessage("emicObj.init() called");
        this.check_emicnever();
    }
}

document.getElementById('threadTree').addEventListener('select', function(e){emicObj.selectChanged(e);}, false);