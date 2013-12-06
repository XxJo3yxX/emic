"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

//Cu.import("resource:///modules/errUtils.js");
Cu.import("resource://emic/mailtodate.js");
Cu.import("resource://emic/stdlib/msgHdrUtils.js");

var emicMessageWindowObj = {

    consoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),
    global_strBundle: null,
    
    menu_message_never: null,
    menu_message_now: null,
    menu_message_custom: null,
    menu_context_never: null,
    menu_context_now: null,
    menu_context_custom: null,

    menu_select_custom: function(){
        this.menu_message_never     .setAttribute("checked", "false");
        this.menu_context_never     .setAttribute("checked", "false");
        this.menu_message_now       .setAttribute("checked", "false");
        this.menu_context_now       .setAttribute("checked", "false");
        this.menu_message_custom    .setAttribute("checked", "true");
        this.menu_context_custom    .setAttribute("checked", "true");
    },

    menu_select_never: function(){
        this.menu_message_now       .setAttribute("checked", "false");
        this.menu_context_now       .setAttribute("checked", "false");
        this.menu_message_custom    .setAttribute("checked", "false");
        this.menu_context_custom    .setAttribute("checked", "false");
        this.menu_message_never     .setAttribute("checked", "true");
        this.menu_context_never     .setAttribute("checked", "true");
    },

    menu_select_now: function(){
        this.menu_message_never     .setAttribute("checked", "false");
        this.menu_context_never     .setAttribute("checked", "false");
        this.menu_message_custom    .setAttribute("checked", "false");
        this.menu_context_custom    .setAttribute("checked", "false");
        this.menu_message_now       .setAttribute("checked", "true");
        this.menu_context_now       .setAttribute("checked", "true");
    },

    setExpirationDateCustom: function() {
//        this.consoleService.logStringMessage("emicMessageWindowObj.setExpirationDateCustom() called");
        var mailtodate = new MailToDate(gFolderDisplay.selectedMessage.subject, msgHdrToMessageBody(gFolderDisplay.selectedMessage, false, -1));
        //call Dialog
        var params = {inn:{customdate:(new Date(this.getExpirationDateStr())), suggestions:mailtodate.extractDates(window.navigator.language)}, out:null};
        window.openDialog("chrome://emic/content/dialogcustomdate.xul","","chrome, dialog, modal, resizable=no", params).focus();
        if(params.out) {
            // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
            this.setExpirationDateStr(params.out.datestr);
        }
        else {
            // User clicked cancel. Typically, nothing is done here.
        }
    },

    setExpirationDateNever: function() {
//        this.consoleService.logStringMessage("emicMessageWindowObj.setExpirationDateNever() called");
        this.setExpirationDateStr(this.global_strBundle.getString("global.identifier.never"));
    },

    setExpirationDateNow: function() {
//        this.consoleService.logStringMessage("emicMessageWindowObj.setExpirationDateNow() called");
        this.setExpirationDateStr((new Date).toString());
    },

    getExpirationDateStr: function() {
        return gFolderDisplay.selectedMessage.getStringProperty(this.global_strBundle.getString("global.identifier.expirationdate.stringproperty"));
    },

    setExpirationDateStr: function(expdatestr) {
//        this.consoleService.logStringMessage("emicMessageWindowObj.setExpirationDateStr() called");
        var msgArraylength = gFolderDisplay.selectedCount;
        var msgArray = gFolderDisplay.selectedMessages;

        for (var msgHdr in fixIterator(msgArray, Ci.nsIMsgDBHdr)) {
//            this.consoleService.logStringMessage("emicMessageWindowObj.setExpirationDateStr() called for Header: " + msgHdr.subject);
            msgHdr.setStringProperty(this.global_strBundle.getString("global.identifier.expirationdate.stringproperty"),expdatestr);
        }

        this.selectChanged(null);
    },

    selectChanged: function(e) {
//        this.consoleService.logStringMessage("emicMessageWindowObj.selectChanged() called");
//        var msgHdr = gFolderDisplay.selectedMessage;
        var expdatestr = this.getExpirationDateStr();//msgHdr.getStringProperty("Expiration-Date");
//        this.consoleService.logStringMessage("expdatestr: " + expdatestr);
        if(!expdatestr || expdatestr.length <= 0 || expdatestr == this.global_strBundle.getString("global.identifier.never")) {
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
//        this.consoleService.logStringMessage("emicMessageWindowObj.init() called");
        this.global_strBundle   = document.getElementById("emic-strings-global");
        
        this.menu_message_never     = document.getElementById("emic-menu-message-never");
        this.menu_message_now       = document.getElementById("emic-menu-message-now");
        this.menu_message_custom    = document.getElementById("emic-menu-message-custom");
        this.menu_context_never     = document.getElementById("emic-menu-context-never");
        this.menu_context_now       = document.getElementById("emic-menu-context-now");
        this.menu_context_custom    = document.getElementById("emic-menu-context-custom");

        this.menu_select_never();
    }
}

window.addEventListener("load", function() {emicMessageWindowObj.init()}, false);
document.getElementById('threadTree').addEventListener('select', function(e){emicMessageWindowObj.selectChanged(e);}, false);