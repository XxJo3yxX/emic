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

    menu_select_custom: function(){
        var never   = document.getElementById("emic-menu-message-never");
        var now     = document.getElementById("emic-menu-message-now");
        var custom  = document.getElementById("emic-menu-message-custom");
        var never2  = document.getElementById("emic-menu-context-never");
        var now2    = document.getElementById("emic-menu-context-now");
        var custom2 = document.getElementById("emic-menu-context-custom");
        never   .setAttribute("checked", "false");
        never2  .setAttribute("checked", "false");
        now     .setAttribute("checked", "false");
        now2    .setAttribute("checked", "false");
        custom  .setAttribute("checked", "true");
        custom2 .setAttribute("checked", "true");
    },

    menu_select_never: function(){
        var never   = document.getElementById("emic-menu-message-never");
        var now     = document.getElementById("emic-menu-message-now");
        var custom  = document.getElementById("emic-menu-message-custom");
        var never2  = document.getElementById("emic-menu-context-never");
        var now2    = document.getElementById("emic-menu-context-now");
        var custom2 = document.getElementById("emic-menu-context-custom");
        now     .setAttribute("checked", "false");
        now2    .setAttribute("checked", "false");
        custom  .setAttribute("checked", "false");
        custom2 .setAttribute("checked", "false");
        never   .setAttribute("checked", "true");
        never2  .setAttribute("checked", "true");
    },

    menu_select_now: function(){
        var never   = document.getElementById("emic-menu-message-never");
        var now     = document.getElementById("emic-menu-message-now");
        var custom  = document.getElementById("emic-menu-message-custom");
        var never2  = document.getElementById("emic-menu-context-never");
        var now2    = document.getElementById("emic-menu-context-now");
        var custom2 = document.getElementById("emic-menu-context-custom");
        never   .setAttribute("checked", "false");
        never2  .setAttribute("checked", "false");
        custom  .setAttribute("checked", "false");
        custom2 .setAttribute("checked", "false");
        now     .setAttribute("checked", "true");
        now2    .setAttribute("checked", "true");
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
            this.menu_select_never();
        }
        else if((new Date(expdatestr)) < (new Date())) {
            this.menu_select_now();
        }
        else {
            this.menu_select_custom();
        }
    },

    init: function() {
//        this.consoleService.logStringMessage("emicObj.init() called");
        this.menu_select_never();
    }
}

window.addEventListener("load", function() {emicObj.init()}, false);
document.getElementById('threadTree').addEventListener('select', function(e){emicObj.selectChanged(e);}, false);