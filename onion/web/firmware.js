   //======================
   // Step 4: Firmware Update
   //======================
   var bFirmwareUpdated = true;
   var bFirmwareDownloaded = true;
   var isChecked = true;

   var binName,
      binDownloaded = false,
      upgradeRequired = 'false';

   var checkDownload = function () {
      if (!binDownloaded) {
         var checkDownloadInterval = setInterval(function () {
            sendUbusRequest('file', 'stat', {
               path: binName
            }, function (data) {
               if (data && data.result.length === 2) {
                  $('#download-progress').prop('value', data.result[1].size);

                  if (data.result[1].size === parseInt(fileSize)) {
                     binDownloaded = true;
                     clearInterval(checkDownloadInterval);
                     console.log('download complete')
                     $('#downloading').hide();
                     $('#upgrade-required').show();
                     startTimer();
                     //gotoStep(nextStep);
                  }
               }
            });
         }, 1000);
      }
   };
   
   //Updates text on upgrade page based on if upgrade is required or if the console is going to be installed
   var firmwareText = function () {
      if($('#consoleInstall').is(':checked') && upgradeRequired === 'true'){
         $('#upgradeFirmwareButton').html('Upgrade Firmware and Install Console');
         $('#firmwareText').html('<p>Update your Omega to the latest and greatest firmware to get all the newest software goodies from Onion.</p>');
         $('#consoleText').html('<p>The Onion Console is a web-based virtual desktop for the Omega that allows you to easily change settings and can be used as an IDE.</p>');
      } else if($('#consoleInstall').is(':checked') && upgradeRequired === 'false'){
         $('#upgradeFirmwareButton').html('Install Console');
         $('#firmwareText').html('<p>Your Omega is up to date!</p>');
         $('#consoleText').html('<p>The Onion Console is a web-based virtual desktop for the Omega that allows you to easily change settings and can be used as an IDE.</p>');
      } else if(upgradeRequired === 'true'){
         $('#upgradeFirmwareButton').html('Upgrade Firmware');
         $('#firmwareText').html('<p>Update your Omega to the latest and greatest firmware to get all the newest software goodies from Onion.</p>');
         // $('#consoleText').html('');
      } else {
         $('#upgradeFirmwareButton').html('Finish Setup Wizard');
         $('#firmwareText').html('<p>Your Omega is up to date!</p>');
         // $('#consoleText').html('');
      }
   };
   
   $('#consoleInstall').click(firmwareText);
   
   $('#upgradeFirmwareButton').click(function(){
      isChecked = $('#consoleInstall').is(':checked');
      sendUbusRequest('uci', 'set', {
            config: 'onion',
            section: 'console',
            values: {
               setup: '1'
            }
         }, function (result) {
            console.log('uci set onion.console.setup result:', result);
            if (result.result[0] === 0) {
               sendUbusRequest('uci', 'commit', {
                     config: 'onion'
               }, function (result) {
                  if (result.result[0] === 0) {
                     console.log('console setup set');
                  } else {
                     console.log('Unable to edit console settings.');
                  }
               });
            } else {
               console.log('Unable to edit console settings.');
            }
         });
         gotoStep(nextStep);
   });

   $('#skipFirmwareStep').click(function(){
      console.log("Skip Firmware Step Button is clicked");
      upgradeRequired = 'false';
      console.log(upgradeRequired);
      // The last page behaves differently depending on which case was passed in. 
      // Makes sense to add a new case for this.
      gotoStep(nextStep);
   });

   $('#firmwareBackButton').click(function(){
      console.log("firmware back button gets called");
      gotoStep(preStep);
   })


