"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader); 
loader.loadSubScript("resource://emic/sugar.js");

Cu.import("resource://emic/mailtodate.js");

var myStateListener = {
   init: function(e){
      gMsgCompose.RegisterStateListener(myStateListener);
      emicComposeObj.init();
   },
   NotifyComposeFieldsReady: function() {
   },
   NotifyComposeBodyReady: function() {
   },
   ComposeProcessDone: function(aResult) {
   },
   SaveInFolderDone: function(folderURI) {
   }
};

var emicComposeObj = {

    consoleService: Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService),
    promptService: Cc["@mozilla.org/embedcomp/prompt-service;1"].getService(Ci.nsIPromptService),
    prefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.emic."),
    global_strBundle: null,
    compose_strBundle: null,

    expdatestr: "",

    menu_insert_never: null,
    menu_insert_now: null,
    menu_insert_custom: null,
    menu_context_never: null,
    menu_context_now: null,
    menu_context_custom: null,

    menu_select_nothing: function(){
        this.menu_insert_never   .setAttribute("checked", "false");
        this.menu_context_never  .setAttribute("checked", "false");
        this.menu_insert_now     .setAttribute("checked", "false");
        this.menu_context_now    .setAttribute("checked", "false");
        this.menu_insert_custom  .setAttribute("checked", "false");
        this.menu_context_custom .setAttribute("checked", "false");
    },

    menu_select_custom: function(){
        this.menu_insert_never   .setAttribute("checked", "false");
        this.menu_context_never  .setAttribute("checked", "false");
        this.menu_insert_now     .setAttribute("checked", "false");
        this.menu_context_now    .setAttribute("checked", "false");
        this.menu_insert_custom  .setAttribute("checked", "true");
        this.menu_context_custom .setAttribute("checked", "true");
    },

    menu_select_never: function(){
        this.menu_insert_now     .setAttribute("checked", "false");
        this.menu_context_now    .setAttribute("checked", "false");
        this.menu_insert_custom  .setAttribute("checked", "false");
        this.menu_context_custom .setAttribute("checked", "false");
        this.menu_insert_never   .setAttribute("checked", "true");
        this.menu_context_never  .setAttribute("checked", "true");
    },

    menu_select_now: function(){
        this.menu_insert_never   .setAttribute("checked", "false");
        this.menu_context_never  .setAttribute("checked", "false");
        this.menu_insert_custom  .setAttribute("checked", "false");
        this.menu_context_custom .setAttribute("checked", "false");
        this.menu_insert_now     .setAttribute("checked", "true");
        this.menu_context_now    .setAttribute("checked", "true");
    },

    setExpirationDateCustom: function() {
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateCustom() called");
//        this.consoleService.logStringMessage("new Date(this.expdatestr): " + new Date(this.expdatestr).toString());
//        this.consoleService.logStringMessage("subject: " + document.getElementById("msgSubject").value);
//        this.consoleService.logStringMessage("body: " + GetCurrentEditor().outputToString('text/plain',4));
        var mailtodate = new MailToDate(document.getElementById("msgSubject").value, GetCurrentEditor().outputToString('text/plain',4));
        //call Dialog:
        var params = {inn:{customdate:(new Date(this.expdatestr)), suggestions: mailtodate.extractDates(window.navigator.language)}, out:null};
        window.openDialog("chrome://emic/content/dialogcustomdate.xul","","chrome, dialog, modal, resizable=no", params).focus();
        if(params.out) {
            // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
            if(params.out.datestr == this.global_strBundle.getString("global.identifier.never"))
                this.menu_select_never();
            else if(params.out.date.isPast())
                this.menu_select_now();
            else
                this.menu_select_custom();

            this.expdatestr = params.out.datestr;
//            this.consoleService.logStringMessage("this.expdatestr: " + this.expdatestr);
        }
        else {
            // User clicked cancel. Typically, nothing is done here.
        }
    },

    setExpirationDateNever: function() {
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateNever() called");
        this.menu_select_never();
        this.expdatestr = this.global_strBundle.getString("global.identifier.never");
    },

    setExpirationDateNow: function() {
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateNow() called");
        this.menu_select_now();
        this.expdatestr = Date.create().toString();
    },

    send_event_listener: function(e) {
//        this.consoleService.logStringMessage("emicComposeObj.send_event_handler(e) called, e: " + e);
//        this.consoleService.logStringMessage("e.detail: " + e.detail);
//        this.consoleService.logStringMessage("e.view: " + e.view);
        if(this.expdatestr.length <= 0){
            var result = this.promptService.confirmEx(
                window,
                this.compose_strBundle.getString("compose.noexpirationdateset.confirm.title"),
                this.compose_strBundle.getString("compose.noexpirationdateset.confirm.text"),
                Ci.nsIPromptService.STD_YES_NO_BUTTONS,
                null,null,null,null,{}
            );

            if(result == 0) {
//                this.consoleService.logStringMessage("subject: " + gMsgCompose.compFields.subject);
//                this.consoleService.logStringMessage("body: " + GetCurrentEditor().outputToString('text/plain',4));
                var mailtodate = new MailToDate(gMsgCompose.compFields.subject, GetCurrentEditor().outputToString('text/plain',4));
                var params = {inn:{customdate:null, suggestions:mailtodate.extractDates(window.navigator.language)}, out:null};
                window.openDialog("chrome://emic/content/dialogcustomdate.xul","","chrome, dialog, modal, resizable=no", params).focus();
                if (params.out) {
                    this.expdatestr = params.out.datestr;
                }
                else {
                  this.expdatestr = this.global_strBundle.getString("global.identifier.never");
                }
            } else {
              this.expdatestr = this.global_strBundle.getString("global.identifier.never");
            }
        }

        if(this.expdatestr.length > 0 && this.expdatestr != this.global_strBundle.getString("global.identifier.never")) {
            var headeridentifieroutlook = this.global_strBundle.getString("global.identifier.expirationdate.mailheader.outlook");
            if(this.prefs.getBoolPref("compose.compatiblewithoutlook") && !gMsgCompose.compFields.otherRandomHeaders.contains(headeridentifieroutlook))
                gMsgCompose.compFields.otherRandomHeaders += headeridentifieroutlook + this.expdatestr + "\r\n";
            var headeridentifier = this.global_strBundle.getString("global.identifier.expirationdate.mailheader");
            if(!gMsgCompose.compFields.otherRandomHeaders.contains(headeridentifier))
                gMsgCompose.compFields.otherRandomHeaders += headeridentifier + this.expdatestr + "\r\n";
        }
    },

    init: function() {
//        this.consoleService.logStringMessage("emicComposeObj.init() called");
//        this.setExpirationDateNever();    //not optimal
        this.expdatestr = "";
//        this.consoleService.logStringMessage("expdatestr: " + this.expdatestr);
        this.global_strBundle   = document.getElementById("emic-strings-global");
        this.compose_strBundle  = document.getElementById("emic-strings-compose");
        
        this.menu_insert_never    = document.getElementById("emic-menu-compose-insert-never");
        this.menu_insert_now      = document.getElementById("emic-menu-compose-insert-now");
        this.menu_insert_custom   = document.getElementById("emic-menu-compose-insert-custom");
        this.menu_context_never   = document.getElementById("emic-menu-compose-context-never");
        this.menu_context_now     = document.getElementById("emic-menu-compose-context-now");
        this.menu_context_custom  = document.getElementById("emic-menu-compose-context-custom");

        this.menu_select_nothing();
    }
}

window.addEventListener( "compose-send-message", function(e){emicComposeObj.send_event_listener(e);}, true);
window.addEventListener( "compose-window-init", myStateListener.init, true);