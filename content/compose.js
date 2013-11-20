"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource:///modules/errUtils.js");
Cu.import("resource://emic/simpledateformat.js");
Cu.import("resource://emic/parsedate.js");

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
    strBundle: null,
    expdatestr: "",

    menu_insert_never: null,
    menu_insert_now: null,
    menu_insert_custom: null,
    menu_context_never: null,
    menu_context_now: null,
    menu_context_custom: null,

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
        //call Dialog:
        var params = {inn:{customdate:(new Date(this.expdatestr)), suggestions: null}, out:null};
        window.openDialog("chrome://emic/content/customdialog.xul","","chrome, dialog, modal, resizable=no", params).focus();
        if(params.out) {
            // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
            if(params.out.datestr == "Never")
                this.menu_select_never();
            else if(params.out.date < (new Date))
                this.menu_select_now();
            else
                this.menu_select_custom();

            this.expdatestr = params.out.datestr;
            this.consoleService.logStringMessage("this.expdatestr: " + this.expdatestr);
        }
        else {
            // User clicked cancel. Typically, nothing is done here.
        }
    },

    setExpirationDateNever: function() {
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateNever() called");
        this.menu_select_never();
        this.expdatestr = "Never";
    },

    setExpirationDateNow: function() {
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateNow() called");
        this.menu_select_now();
        this.expdatestr = (new Date).toString();
    },

    send_event_listener: function(e) {
//        this.consoleService.logStringMessage("emicComposeObj.send_event_handler() called");
        if(this.expdatestr.length <= 0){
            var result = this.promptService.confirmEx(
                window,
                this.strBundle.getString("compose.noexpirationdateset.confirm.title"),
                this.strBundle.getString("compose.noexpirationdateset.confirm.text"),
                Ci.nsIPromptService.STD_YES_NO_BUTTONS,
                null,null,null,null,{}
            );

            if(result == 0) {
                var params = {inn:{customdate:null, suggestions:null}, out:null};
                window.openDialog("chrome://emic/content/customdialog.xul","","chrome, dialog, modal, resizable=no", params).focus();
                if (params.out) {
                    this.expdatestr = params.out.datestr;
                }
                else {
                  this.expdatestr = "Never";
                }
            } else {
              this.expdatestr = "Never";
            }
        }

        if(!gMsgCompose.compFields.otherRandomHeaders.contains("Expiration-Date: "))
            gMsgCompose.compFields.otherRandomHeaders += "Expiration-Date: " + this.expdatestr + "\r\n";
    },

    init: function() {
        this.consoleService.logStringMessage("emicComposeObj.init() called");
//        this.setExpirationDateNever();    //not optimal
        this.expdatestr = "";
//        this.consoleService.logStringMessage("expdatestr: " + this.expdatestr);
        this.strBundle = document.getElementById("emic-global-strings");
        
        this.menu_insert_never    = document.getElementById("emic-menu-compose-insert-never");
        this.menu_insert_now      = document.getElementById("emic-menu-compose-insert-now");
        this.menu_insert_custom   = document.getElementById("emic-menu-compose-insert-custom");
        this.menu_context_never   = document.getElementById("emic-menu-compose-context-never");
        this.menu_context_now     = document.getElementById("emic-menu-compose-context-now");
        this.menu_context_custom  = document.getElementById("emic-menu-compose-context-custom");
    }
}

window.addEventListener( "compose-send-message", function(e){emicComposeObj.send_event_listener(e);}, true);
window.addEventListener( "compose-window-init", myStateListener.init, true);