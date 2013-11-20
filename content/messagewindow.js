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
    
    menu_message_never: null,
    menu_message_now: null,
    menu_message_custom: null,
    menu_context_never: null,
    menu_context_now: null,
    menu_context_custom: null,

    menu_select_custom: function(){
        this.menu_message_never   .setAttribute("checked", "false");
        this.menu_context_never  .setAttribute("checked", "false");
        this.menu_message_now     .setAttribute("checked", "false");
        this.menu_context_now    .setAttribute("checked", "false");
        this.menu_message_custom  .setAttribute("checked", "true");
        this.menu_context_custom .setAttribute("checked", "true");
    },

    menu_select_never: function(){
        this.menu_message_now     .setAttribute("checked", "false");
        this.menu_context_now    .setAttribute("checked", "false");
        this.menu_message_custom  .setAttribute("checked", "false");
        this.menu_context_custom .setAttribute("checked", "false");
        this.menu_message_never   .setAttribute("checked", "true");
        this.menu_context_never  .setAttribute("checked", "true");
    },

    menu_select_now: function(){
        this.menu_message_never   .setAttribute("checked", "false");
        this.menu_context_never  .setAttribute("checked", "false");
        this.menu_message_custom  .setAttribute("checked", "false");
        this.menu_context_custom .setAttribute("checked", "false");
        this.menu_message_now     .setAttribute("checked", "true");
        this.menu_context_now    .setAttribute("checked", "true");
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
        
        this.menu_message_never     = document.getElementById("emic-menu-message-never");
        this.menu_message_now       = document.getElementById("emic-menu-message-now");
        this.menu_message_custom    = document.getElementById("emic-menu-message-custom");
        this.menu_context_never     = document.getElementById("emic-menu-context-never");
        this.menu_context_now       = document.getElementById("emic-menu-context-now");
        this.menu_context_custom    = document.getElementById("emic-menu-context-custom");

        this.menu_select_never();
    }
}

window.addEventListener("load", function() {emicObj.init()}, false);
document.getElementById('threadTree').addEventListener('select', function(e){emicObj.selectChanged(e);}, false);