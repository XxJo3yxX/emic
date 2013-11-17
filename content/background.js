"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

Cu.import("resource:///modules/errUtils.js");
Cu.import("resource://emic/stdlib/misc.js");
Cu.import("resource://emic/stdlib/msgHdrUtils.js");

var MailListener = {  
    msgAdded: function(aMsgHdr) {  
        if( !aMsgHdr.isRead )  {
            emicBackgroundObj.setInbox(aMsgHdr.folder);
//            alert("Got new mail. Look at aMsgHdr's properties for more details.");
//            alert("aMsgHdr.folder.prettiestName: " + aMsgHdr.folder.prettiestName);
            emicBackgroundObj.startup();
        }
    }
}

var copyListener = {
    OnStartCopy: function() {
        alert("OnStartCopy()");
    },
    OnProgress: function(aProgress, aProgressMax) {
        alert("OnProgress("+aProgress+", "+aProgressMax+")");
    },
    SetMessageKey: function(aKey) {
        //alert("SetMessageKey("+aKey+")");
    },
    SetMessageId: function(aMessageId) {
        //alert("SetMessageId("+aMessageId+")");
    },
    OnStopCopy: function(aStatus) {
        // Check: message successfully copied.
        alert("OnStopCopy("+aStatus+")");
        if(status == Cr.NS_OK)
            alert("End OK");
        else
            alert("End Error");
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
    srcFolder: gLocalInboxFolder,
    destFolder: gLocalIncomingServer.rootMsgFolder.rootFolder.getChildNamed("Expired"),

    startup: function() {
        this.consoleService.logStringMessage("emicBackgroundObj.startup() called");
        this.setExpirationDate();
        this.moveExpiredMails();
    },

    setExpirationDate: function() {
        this.consoleService.logStringMessage("emicBackgroundObj.setExpirationDate() called");
        this.consoleService.logStringMessage("srcFolder.prettiestName: " + this.srcFolder.prettiestName);
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
        this.consoleService.logStringMessage("emicBackgroundObj.moveExpiredMails() called");
        this.consoleService.logStringMessage("Src: " + this.srcFolder.prettiestName + " --> Dest: " + this.destFolder.prettiestName);
        if(!this.srcFolder || !this.destFolder)
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
            this.copyService.CopyMessages(this.srcFolder, expired_mails, this.destFolder, true, copyListener, null, false);
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
            this.consoleService.logStringMessage("emicBackgroundObj.setInbox(): " + inboxfolder.prettiestName + " is of type inbox");
            this.srcFolder = inboxfolder;
        }
    },

    init: function() {
//        this.consoleService.logStringMessage("emicBackgroundObj.init() called");
        this.notificationService.addListener(MailListener, this.notificationService.msgAdded);
        this.startup();
    }
}

window.setInterval(function(){emicBackgroundObj.startup();}, 60000); //update every minute
document.getElementById('threadTree').addEventListener('select', function(e){emicBackgroundObj.selectChanged(e);}, false);