"use strict";

let Ci = Components.interfaces;
let Cc = Components.classes;
let Cu = Components.utils;
let Cr = Components.results;

//Cu.import("resource:///modules/errUtils.js");
//Cu.import("resource://emic/stdlib/misc.js");
Cu.import("resource://emic/stdlib/msgHdrUtils.js");

var MailListener = {  
    msgAdded: function(aMsgHdr) {  
        if( !aMsgHdr.isRead )  {
//            alert("Got new mail. Look at aMsgHdr's properties for more details.");
//            alert("aMsgHdr.folder.prettiestName: " + aMsgHdr.folder.prettiestName);
            emicBackgroundWorkerObj.setExpirationDate(aMsgHdr);
        }
    }
};

var copyListener = {
    OnStartCopy: function() {
        document.getElementById("emic-progress").value = 0;
        document.getElementById("emic-statusbarpanel").hidden = false;
//        alert("OnStartCopy()");
    },
    OnProgress: function(aProgress, aProgressMax) {
        document.getElementById("emic-progress").value = 100*aProgress/aProgressMax;
//        alert("OnProgress("+aProgress+", "+aProgressMax+")");
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
        document.getElementById("emic-progress").value = 100;
        document.getElementById("emic-statusbarpanel").hidden = true;
    }
};

var emicBackgroundWorkerObj = {

    consoleService: Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService),
    notificationService: Cc["@mozilla.org/messenger/msgnotificationservice;1"].getService(Ci.nsIMsgFolderNotificationService),
    tagService: Cc["@mozilla.org/messenger/tagservice;1"].getService(Ci.nsIMsgTagService),
    copyService: Cc["@mozilla.org/messenger/messagecopyservice;1"].getService(Ci.nsIMsgCopyService),
    prefs: Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.emic."),
    accountManager: Cc["@mozilla.org/messenger/account-manager;1"].getService(Ci.nsIMsgAccountManager),
    global_strBundle: null,
    backgroundworker_strBundle: null,

    destFolderName: null,

    setExpirationDate: function(msgHdr) {
        this.consoleService.logStringMessage("emicBackgroundWorkerObj.setExpirationDate() called");

        var stringpropertyidentifier = this.global_strBundle.getString("global.identifier.expirationdate.stringproperty");
//        this.consoleService.logStringMessage("stringpropertyidentifier: " + stringpropertyidentifier);

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
                        emicBackgroundWorkerObj.global_strBundle.getString("global.identifier.never")
                    );
                }

            });
        }
    },

    processExpiredMails: function() {
        this.consoleService.logStringMessage("emicBackgroundWorkerObj.processExpiredMails() called");

        var srcFolders = new Array;
        var servers = this.accountManager.allServers;
        for(var i=0; i<servers.length; ++i) {
            var folders = servers.queryElementAt(i, Ci.nsIMsgIncomingServer).rootFolder.getFoldersWithFlags(Ci.nsMsgFolderFlags.Inbox);
            for (var j=0; j<folders.length; ++j) {
                srcFolders.push(folders.queryElementAt(j, Ci.nsIMsgFolder));
            }
        }

        for(var i=0; i<srcFolders.length; ++i) {
            var srcFolder = srcFolders[i];
//            this.consoleService.logStringMessage("srcFolder: " + srcFolder.prettiestName);

            var now = new Date();
            var msgArray = srcFolder.messages;
            var tag_mails = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);
            var move_mails = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);

            while( msgArray.hasMoreElements() ) {  
                var msgHdr = msgArray.getNext().QueryInterface(Ci.nsIMsgDBHdr);
                var expdatestr = msgHdr.getStringProperty(this.global_strBundle.getString("global.identifier.expirationdate.stringproperty"));
                if(expdatestr != 0 && expdatestr.length > 0 && !(expdatestr == this.global_strBundle.getString("global.identifier.never"))) {
                    if((new Date(expdatestr)) < now) {
                        //mail is expired
                        tag_mails.appendElement(msgHdr, false);
                        if(!this.prefs.getBoolPref("expiredmails.move.onlyifread") || msgHdr.isRead)
                            move_mails.appendElement(msgHdr, false);
                    }
                }
            }

            if(tag_mails.length > 0 && this.prefs.getBoolPref("expiredmails.addtag")) {
                //add keyword to expired mails:
                this.consoleService.logStringMessage(" Try to tag " + tag_mails.length + " mails.");
                srcFolder.addKeywordsToMessages(tag_mails, this.global_strBundle.getString("global.tag.expired.key"));
            }

            if(move_mails.length > 0 && this.prefs.getBoolPref("expiredmails.move")) {
                //move expired mails to folder:
                var gLocalIncomingServer = MailServices.accounts.localFoldersServer;
                var gLocalRootFolder = gLocalIncomingServer.rootFolder;
                var destfolder = null;

                try {
                    destfolder = gLocalRootFolder.getChildNamed(this.destFolderName);
                }
                catch(e) {
                    this.consoleService.logStringMessage(" Destination folder not exists, try to create it (" + e + ").");
                    if(!destfolder) {
                        var msgWindow = Cc["@mozilla.org/messenger/msgwindow;1"].createInstance().QueryInterface(Ci.nsIMsgWindow);
                        gLocalRootFolder.createSubfolder(this.destFolderName,msgWindow);
                        destfolder = gLocalRootFolder.getChildNamed(this.destFolderName);
                    }
                }
                this.consoleService.logStringMessage(" Try to move " + move_mails.length + " mails from Src: " + srcFolder.prettiestName + " --> Dest: " + destfolder.prettiestName + ".");
                if(srcFolder && destfolder)
                    this.copyService.CopyMessages(srcFolder, move_mails, destfolder, true, copyListener, null, false);
            }
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

    observe: function(aSubject, aTopic, aData) {
    // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
    // aData is the name of the pref that's been changed (relative to aSubject)
//        this.consoleService.logStringMessage("emicBackgroundWorkerObj.observe() called");
        if (aTopic != "nsPref:changed")
            return;
 
        switch(aData) {
        case "expiredmails.move.destfoldername":
            this.setDestFolder(this.prefs.getCharPref("expiredmails.move.destfoldername"));
            break;
        case "expiredmails.addtag.colorcode":
            this.tagService.setColorForKey(this.global_strBundle.getString("global.tag.expired.key"), this.prefs.getCharPref("expiredmails.addtag.colorcode"));
            break;
        }
    },

    init: function() {
        this.consoleService.logStringMessage("emicBackgroundWorkerObj.init() called");
        this.global_strBundle           = document.getElementById("emic-strings-global");
        this.backgroundworker_strBundle = document.getElementById("emic-strings-backgroundworker");

        this.prefs.QueryInterface(Ci.nsIPrefBranch);
        this.prefs.addObserver("", this, false);
        this.setDestFolder(this.prefs.getCharPref("expiredmails.move.destfoldername"));

        this.notificationService.addListener(MailListener, this.notificationService.msgAdded);

        //set up a Tag:
        if(!this.tagService.isValidKey(this.global_strBundle.getString("global.tag.expired.key"))) {
            this.tagService.addTagForKey(this.global_strBundle.getString("global.tag.expired.key"), this.backgroundworker_strBundle.getString("backgroundworker.tag.expired.label"), this.prefs.getCharPref("expiredmails.addtag.colorcode"), "");
        }

        //set up status-bar:
        var statBar = document.getElementById("status-bar");
	    var statPanel = document.getElementById("emic-statusbarpanel");
        statBar.insertBefore(statPanel, null);

        this.processExpiredMails();
    }
}

window.addEventListener("load", function() {emicBackgroundWorkerObj.init()}, false);
window.setInterval(function(){emicBackgroundWorkerObj.processExpiredMails();}, 60000); //update every minute
//document.getElementById('threadTree').addEventListener('select', function(e){emicBackgroundWorkerObj.selectChanged(e);}, false);
window.addEventListener("unload", function(e) { emicBackgroundWorkerObj.shutdown(); }, false);