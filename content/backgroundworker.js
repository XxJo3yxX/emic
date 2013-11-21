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
            emicBackgroundWorkerObj.setInbox(aMsgHdr.folder);
//            alert("Got new mail. Look at aMsgHdr's properties for more details.");
//            alert("aMsgHdr.folder.prettiestName: " + aMsgHdr.folder.prettiestName);
            emicBackgroundWorkerObj.startup();
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

var emicBackgroundWorkerObj = {

    consoleService: Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService),
    notificationService: Cc["@mozilla.org/messenger/msgnotificationservice;1"].getService(Ci.nsIMsgFolderNotificationService),
    copyService: Cc["@mozilla.org/messenger/messagecopyservice;1"].getService(Ci.nsIMsgCopyService),
    prefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.emic."),
    global_strBundle: null,

    srcFolder: gLocalInboxFolder,
    destFolderName: null,

    startup: function() {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.startup() called");
        this.setExpirationDate();
        this.moveExpiredMails();
    },

    setExpirationDate: function() {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.setExpirationDate() called");
//        this.consoleService.logStringMessage("srcFolder.prettiestName: " + this.srcFolder.prettiestName);
        if(!this.srcFolder)
            return null;

        var msgArray = this.srcFolder.messages;
        var stringpropertyidentifier = this.global_strBundle.getString("global.identifier.expirationdate.stringproperty");
//        this.consoleService.logStringMessage("stringpropertyidentifier: " + stringpropertyidentifier);

        while( msgArray.hasMoreElements() ) {  
            var msgHdr = msgArray.getNext().QueryInterface(Ci.nsIMsgDBHdr);
            if(msgHdr.getStringProperty(stringpropertyidentifier).length <= 0) {
            // extract expiration-date from Mime-Hdr:
                msgHdrGetHeaders(msgHdr, function (aHeaders) {
//                    emicBackgroundWorkerObj.consoleService.logStringMessage("   msgHdrGetHeaders called for Subject: '" + aHeaders.get("subject") + "'");
                    var hasgetidentifier = emicBackgroundWorkerObj.global_strBundle.getString("global.identifier.expirationdate.mailheader.hasget");
                    var stringpropertyidentifier = emicBackgroundWorkerObj.global_strBundle.getString("global.identifier.expirationdate.stringproperty");
//                    emicBackgroundWorkerObj.consoleService.logStringMessage("hasgetidentifier: " + hasgetidentifier);
//                    emicBackgroundWorkerObj.consoleService.logStringMessage("stringpropertyidentifier: " + stringpropertyidentifier);

                    if(aHeaders.has(hasgetidentifier)) {
//                        emicBackgroundWorkerObj.consoleService.logStringMessage("   ^ has expiration date, set it to: " + aHeaders.get(hasgetidentifier));
                        msgHdr.setStringProperty(
                            stringpropertyidentifier, 
                            aHeaders.get(hasgetidentifier)
                        );
                    }
                    else {
//                        emicBackgroundWorkerObj.consoleService.logStringMessage("   ^ has no expiration date; set it to never");
                        msgHdr.setStringProperty(
                            stringpropertyidentifier,
                            emicBackgroundWorkerObj.global_strBundle.getString("global.identifier.expirationdate.never")
                        );
                    }

                });
            }
        }
    },

    moveExpiredMails: function() {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.moveExpiredMails() called");
//        this.consoleService.logStringMessage("this.destFolderName: " + this.destFolderName);

        if(!this.srcFolder)
            return null;

        var now = new Date();
        var msgArray = this.srcFolder.messages;
        var expired_mails = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);

        while( msgArray.hasMoreElements() ) {  
            var msgHdr = msgArray.getNext().QueryInterface(Ci.nsIMsgDBHdr);
            var expdatestr = msgHdr.getStringProperty(this.global_strBundle.getString("global.identifier.expirationdate.stringproperty"));

            if(expdatestr != 0 && expdatestr.length > 0 && !(expdatestr == this.global_strBundle.getString("global.identifier.expirationdate.never"))) {
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
                this.consoleService.logStringMessage("emicBackgroundWorkerObj.moveExpiredMails(): destfolder not exists, try to create it: " + e);
                if(!destfolder) {
                    var msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance().QueryInterface(Ci.nsIMsgWindow);
                    gLocalRootFolder.createSubfolder(this.destFolderName,msgWindow);
                    destfolder = gLocalRootFolder.getChildNamed(this.destFolderName);
                }
            }
            this.consoleService.logStringMessage("emicBackgroundWorkerObj.moveExpiredMails(): try to move " + expired_mails.length + " mails from Src: " + this.srcFolder.prettiestName + " --> Dest: " + destfolder.prettiestName);
            if(this.srcFolder && destfolder)
                this.copyService.CopyMessages(this.srcFolder, expired_mails, destfolder, true, copyListener, null, false);
        }
    },

    selectChanged: function(e) {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.selectChanged() called");
        var folder = gFolderDisplay.selectedMessage.folder;
        this.setInbox(folder);
    },

    setInbox: function(inboxfolder) {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.setInbox() called");
//        this.consoleService.logStringMessage("inboxfolder.prettiestName: " + inboxfolder.prettiestName);
        if(inboxfolder.flags & Ci.nsMsgFolderFlags.Inbox) {
//            this.consoleService.logStringMessage("emicBackgroundWorkerObj.setInbox(): " + inboxfolder.prettiestName + " is of type inbox");
            this.srcFolder = inboxfolder;
        }
    },

    setDestFolder: function(destfoldername) {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.setDestFolder() called");
        this.destFolderName = destfoldername;
    },

    shutdown: function() {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.shutdown() called");
        this.prefs.removeObserver("", this);
    },

    observe: function(subject, topic, data) {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.observe() called");
        if (topic != "nsPref:changed")
            return;
 
        switch(data) {
        case "destfoldername":
            this.setDestFolder(this.prefs.getCharPref("destfoldername"));
            break;
        }
    },

    init: function() {
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.init() called");
        this.global_strBundle = document.getElementById("emic-strings-global");

        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.prefs.addObserver("", this, false);
        this.setDestFolder(this.prefs.getCharPref("destfoldername"));

        this.notificationService.addListener(MailListener, this.notificationService.msgAdded);
        this.startup();
    }
}

window.addEventListener("load", function() {emicBackgroundWorkerObj.init()}, false);
window.setInterval(function(){emicBackgroundWorkerObj.startup();}, 60000); //update every minute
document.getElementById('threadTree').addEventListener('select', function(e){emicBackgroundWorkerObj.selectChanged(e);}, false);
window.addEventListener("unload", function(e) { emicBackgroundWorkerObj.shutdown(); }, false);