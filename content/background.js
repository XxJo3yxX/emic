"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource:///modules/errUtils.js");
Cu.import("resource://emic/stdlib/misc.js");
Cu.import("resource://emic/stdlib/msgHdrUtils.js");

var strBundle = document.getElementById("emic_global_strings");

var MailListener = {  
    msgAdded: function(aMsgHdr) {  
        if( !aMsgHdr.isRead )  {
            emicBackgroundObj.setInbox(aMsgHdr.folder);
//            alert("Got new mail. Look at aMsgHdr's properties for more details.");
//            alert("aMsgHdr.folder.prettiestName: " + aMsgHdr.folder.prettiestName);
            emicBackgroundObj.startup();
        }
    }
};

var copyListener = {
    OnStartCopy: function() {
        //alert("OnStartCopy()");
    },
    OnProgress: function(aProgress, aProgressMax) {
        //alert("OnProgress("+aProgress+", "+aProgressMax+")");
    },
    SetMessageKey: function(aKey) {
        //alert("SetMessageKey("+aKey+")");
    },
    SetMessageId: function(aMessageId) {
        //alert("SetMessageId("+aMessageId+")");
    },
    OnStopCopy: function(aStatus) {
        // Check: message successfully copied.
        //alert("OnStopCopy("+aStatus+")");
//        if(status == Cr.NS_OK)
//            alert("End OK");
//        else
//            alert("End Error");
    }
};
    
var gLocalIncomingServer = MailServices.accounts.localFoldersServer;
var gLocalMsgAccount = MailServices.accounts.defaultAccount; //FindAccountForServer(gLocalIncomingServer);

var gLocalRootFolder = gLocalIncomingServer.rootMsgFolder.rootFolder; //.QueryInterface(Ci.nsIMsgLocalMailFolder);

var gLocalInboxFolder = gLocalRootFolder.getFoldersWithFlags(Ci.nsMsgFolderFlags.Inbox); 

var emicBackgroundObj = {

    consoleService: Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService),
    notificationService: Cc["@mozilla.org/messenger/msgnotificationservice;1"].getService(Ci.nsIMsgFolderNotificationService),
    copyService: Cc["@mozilla.org/messenger/messagecopyservice;1"].getService(Ci.nsIMsgCopyService),
    prefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.emic."),
    srcFolder: gLocalInboxFolder,
    destFolderName: null,

    startup: function() {
//        this.consoleService.logStringMessage("emicBackgroundObj.startup() called");
        this.setExpirationDate();
        this.moveExpiredMails();
    },

    setExpirationDate: function() {
//        this.consoleService.logStringMessage("emicBackgroundObj.setExpirationDate() called");
//        this.consoleService.logStringMessage("srcFolder.prettiestName: " + this.srcFolder.prettiestName);
        if(!this.srcFolder)
            return null;

        var msgArray = this.srcFolder.messages;

        while( msgArray.hasMoreElements() ) {  
            var msgHdr = msgArray.getNext().QueryInterface(Ci.nsIMsgDBHdr);  
            if(msgHdr.getStringProperty("Expiration-Date").length <= 0) {
            // extract expiration-date from Mime-Hdr:
                msgHdrGetHeaders(msgHdr, function (aHeaders) {  
                    if(aHeaders.has("expiration-date")) {
                        msgHdr.setStringProperty("Expiration-Date", aHeaders.get("expiration-date"));
                    }
                    else
                        msgHdr.setStringProperty("Expiration-Date", "Never");
                });
            }
        }
    },

    moveExpiredMails: function() {
//        this.consoleService.logStringMessage("emicBackgroundObj.moveExpiredMails() called")
//        this.consoleService.logStringMessage("this.destFolderName: " + this.destFolderName);;

        if(!this.srcFolder)
            return null;

        var now = new Date();
        var msgArray = this.srcFolder.messages;
        var expired_mails = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);

        while( msgArray.hasMoreElements() ) {  
            var msgHdr = msgArray.getNext().QueryInterface(Ci.nsIMsgDBHdr);
            var expdatestr = msgHdr.getStringProperty("Expiration-Date");

            if(expdatestr != 0 && expdatestr.length > 0 && !(expdatestr == "Never")) {
                var expiration_date = new Date(expdatestr);
                //search for expired mails:
                if(expiration_date < now) {
                    expired_mails.appendElement(msgHdr, false);
                }
            }
        }
        //move expired mails to folder:
        if(expired_mails.length > 0) {
            var destfolder = null;

            try {
                destfolder = gLocalRootFolder.getChildNamed(this.destFolderName);
            }
            catch(e) {
                this.consoleService.logStringMessage("emicBackgroundObj.moveExpiredMails(): destfolder not exists, try to create it: " + e);
                if(!destfolder) {
                    var msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance().QueryInterface(Ci.nsIMsgWindow);
                    gLocalRootFolder.createSubfolder(this.destFolderName,msgWindow);
                    destfolder = gLocalRootFolder.getChildNamed(this.destFolderName);
                }
            }
            this.consoleService.logStringMessage("emicBackgroundObj.moveExpiredMails(): try to move " + expired_mails.length + " mails from Src: " + this.srcFolder.prettiestName + " --> Dest: " + destfolder.prettiestName);
            if(this.srcFolder && destfolder)
                this.copyService.CopyMessages(this.srcFolder, expired_mails, destfolder, true, copyListener, null, false);
        }
    },

    selectChanged: function(e) {
//        this.consoleService.logStringMessage("emicBackgroundObj.selectChanged() called");
        var folder = gFolderDisplay.selectedMessage.folder;
        this.setInbox(folder);
    },

    setInbox: function(inboxfolder) {
//        this.consoleService.logStringMessage("emicBackgroundObj.setInbox() called");
//        this.consoleService.logStringMessage("inboxfolder.prettiestName: " + inboxfolder.prettiestName);
        if(inboxfolder.flags & Ci.nsMsgFolderFlags.Inbox) {
//            this.consoleService.logStringMessage("emicBackgroundObj.setInbox(): " + inboxfolder.prettiestName + " is of type inbox");
            this.srcFolder = inboxfolder;
        }
    },

    setDestFolder: function(destfoldername) {
//        this.consoleService.logStringMessage("emicBackgroundObj.setDestFolder() called");
        this.destFolderName = destfoldername;
    },

    shutdown: function() {
//        this.consoleService.logStringMessage("emicBackgroundObj.shutdown() called");
        this.prefs.removeObserver("", this);
    },

    observe: function(subject, topic, data) {
//        this.consoleService.logStringMessage("emicBackgroundObj.observe() called");
        if (topic != "nsPref:changed")
            return;
 
        switch(data) {
        case "destfoldername":
            this.setDestFolder(this.prefs.getCharPref("destfoldername"));
            break;
        }
    },

    init: function() {
//        this.consoleService.logStringMessage("emicBackgroundObj.init() called");
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.prefs.addObserver("", this, false);
        this.setDestFolder(this.prefs.getCharPref("destfoldername"));

        this.notificationService.addListener(MailListener, this.notificationService.msgAdded);
        this.startup();
    }
}

window.addEventListener("load", function() {emicBackgroundObj.init()}, false);
window.setInterval(function(){emicBackgroundObj.startup();}, 60000); //update every minute
document.getElementById('threadTree').addEventListener('select', function(e){emicBackgroundObj.selectChanged(e);}, false);
window.addEventListener("unload", function(e) { emicBackgroundObj.shutdown(); }, false);