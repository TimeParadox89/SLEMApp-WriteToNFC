var app = {
    pages: {
        HOME: "home",
        WRITEMAN: "write_manager_page",
        READMAN: "read_manager_page"
    },

    initialize: function () {
        app.bindEvents();
    },

    /*
    bind any events that are required on startup to listeners:
     */
    bindEvents: function () {
        document.addEventListener('deviceready', app.onDeviceReady, false);
    },

    /*
    app runs when the device is ready for user interaction:
     */
    onDeviceReady: function () {
        nfc.addNdefListener(
            app.onNfc, // tag successfully scanned
            function (status) { // listener successfully initialized

            },
            function (error) { // listener fails to initialize
                newDiv = '<center><i class="fa fa-times-circle"></i> Failed to inizialize NFC' + JSON.stringify(error) + '<br> Please close the APP</center>';
                document.getElementById("resultBoxMain")
                $("#resultBoxMain").show();
            }
        );
    },

    doNothingOnNfc: function (nfcEvent) {
        //do nothing function used when an nfc event is fired and no code has to be executed
    },

    /*
    called when a device is close to a nfc tag
     */
    onNfc: function (nfcEvent) {
        var currentPage = $.mobile.activePage.attr('id');
        app.onNfc = app.doNothingOnNfc;

        switch (currentPage) {
            case app.pages.WRITEMAN:
                var message = [ndef.textRecord($("#fiscalcodeMan").val()), ndef.textRecord($("#warehouseIDMan").val()),  ndef.textRecord($("#tokenIDMan").val())];
                // write the record to the tag:
                nfc.write(
                    message, // write the record itself to the tag
                    function () { // when complete, run app callback function:
                        $("#resultBoxMan").show();
                        $("#resultBoxMan").attr('class', 'successBox');
                        newDiv = '<center><i class="fa fa-check"></i> Scritto correttamente </center>';
                        document.getElementById("resultBoxMan").innerHTML = newDiv;
                    },
                    // app function runs if the write command fails:
                    function (reason) {
                        $("#resultBoxMan").show();
                        $("#resultBoxMan").attr('class', 'errorBox');
                        newDiv = '<center><i class="fa fa-times-circle"></i>' + reason + '</center>';
                        document.getElementById("resultBoxMan")
                    }
                );
                break;
            case app.pages.READMAN:
                var tag = nfcEvent.tag;
                var manID = ndef.textHelper.decodePayload(tag.ndefMessage[0].payload);
                var whID = ndef.textHelper.decodePayload(tag.ndefMessage[1].payload);
                var tknID = ndef.textHelper.decodePayload(tag.ndefMessage[2].payload);
                //fare controlli sul terzo elemento
                $('#fiscalcodeManRead').val(manID);
                $('#warehouseIDManRead').val(whID);
                $('#tokenIDManRead').val(tknID);
                break;
            default:
            //doNothing();
        }
    },

    getAccessToken: function () {
        var win = window.open("http://petprojects.altervista.org/Authentication/", "_blank", "location=no");

        win.addEventListener("loadstop", function () {

            // Clear out the name in localStorage for subsequent opens.
            win.executeScript({ code: "localStorage.setItem( 'tokenID', '' );" });

            // Start an interval
            var loop = setInterval(function () {

                // Execute JavaScript to check for the existence of a name in the
                // child browser's localStorage.
                win.executeScript(
                    {
                        code: "localStorage.getItem( 'tokenID' )"
                    },
                    function (values) {
                        var tokenid = values[0];

                        // If a name was set, clear the interval and close the InAppBrowser.
                        if (tokenid) {
                            clearInterval(loop);
                            win.close();
                            document.getElementById("tokenIDMan").value = tokenid;
                        }
                    }
                );
            });
        });

    },

    clearAlerts: function () {

    },

    navigateTo: function (location) {
        $.mobile.navigate('#' + location);
        app.clearPage(location);
    },

    clearPage: function (nextPage) {

        switch (nextPage) {
            case app.pages.WRITEMAN:
                $("#fiscalcodeMan").val("");
                $("#warehouseIDMan").val("");
                $("#resultBoxMan").hide();
                break;
            case app.pages.READMAN:
                $("#fiscalcodeManRead").val("");
                $("#warehouseIDManRead").val("");
                break;
            default:
                break;
        }

    }

};