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
//        this.consoleService.logStringMessage("emicComposeObj.setExpirationDateCustom() called");
//        this.consoleService.logStringMessage("new Date(this.expdatestr): " + new Date(this.expdatestr).toString());
        //call Dialog:
        var params = {inn:{customdate:(new Date(this.expdatestr)), suggestions: null}, out:null};
        window.openDialog("chrome://emic/content/customdialog.xul","","chrome, dialog, modal, resizable=no", params).focus();
        if(params.out) {
            // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
            if(params.out.datestr == "Never")
                this.check_emicnever();
            else if(params.out.date < (new Date))
                this.check_emicnow();
            else
                this.check_emiccustom();

            this.expdatestr = params.out.datestr;
            this.consoleService.logStringMessage("this.expdatestr: " + this.expdatestr);
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
        if(this.expdatestr.length <= 0){
            if(this.promptService.confirm(window, "Kein Ablaufdatum", "Sie haben für diese E-Mail noch kein Ablaufdatum angegeben. Möchten Sie dies jetzt tun?")) {
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
        this.consoleService.logStringMessage("expdatestr: " + this.expdatestr);
    }
}

window.addEventListener( "compose-send-message", function(e){emicComposeObj.send_event_listener(e);}, true);
window.addEventListener( "compose-window-init", myStateListener.init, true);