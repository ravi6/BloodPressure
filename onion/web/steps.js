   var steps = [
      {  // step 1
         ready: function(){
            return false;
         },
         init: function(){
            return;
         }
      },
      {  // step 2
         ready: function () {
            return true;
         },
         init: function () {
            $.sessionStorage.remove('OmegaRequestCounter');
            $.sessionStorage.remove('OmegaToken');
            $.sessionStorage.remove('OmegaTokenExpires');

            $('#login-username').val('');
            $('#login-password').val('');
            $('#login-message').html('');
         }
      },
      { // step 3
         ready: function () {
            // return $.sessionStorage.isSet('OmegaToken') && !isTokenExpired();
            return false;
         },
         init: function () {
            $('[data-toggle="tooltip"]').tooltip(); 
            $('#wifi-connect').hide();
            $('#wifi-list').hide();
            $('#wifiLoading').show();
            
            sendUbusRequest('system', 'info', {}, function (data) {
               if (data.result && data.result.length === 2) {
                  $('#wifi-ssid').val('');
                  $('#wifi-key').val('');
                  scanWifiNetwork();
                  scanWifiNetworkModal();
               } else {
                  gotoStep(preStep);
               }
            });

            
            //Check if already connected to internet. 
             //If yes, show configured networks; otherwise, show configure wifi page.
            sendUbusRequest('file', 'exec', {
               command: 'wget',
               params: ['--spider', 'http://repo.onion.io/omega2/images']
<script src="firmware.js"></script>
            }, function (data){
               if (data.result.length === 2 && data.result[1].code === 0) {
                  omegaOnline = true;
                  
                  refreshNetworkList();
                  console.log('Already connected to the internet!')
                  sendUbusRequest('onion', 'oupgrade', {
                     params: {
                        check: ''
                     }
                  }, function (data) {
                     binName = data.result[1].image.local;
                     upgradeRequired = data.result[1].upgrade;
                     fileSize = data.result[1].image.size;
                     $('#download-progress').prop('max', data.result[1].image.size);
                     $('#wifi-connect').hide();
                     $('#wifiLoading').hide();
                     $('#wifi-list').show();
                     $('#networkTable').show();
                  });
               } else {
                  sendUbusRequest('file', 'exec', {
                     command: 'wget',
                     params: ['--spider', 'http://repo.onion.io/omega2/images']
                  }, function (data){
                     if (data.result.length === 2 && data.result[1].code === 0) {
                        omegaOnline = true;
                        
                        refreshNetworkList();
                        console.log('Already connected to the internet!')
                        sendUbusRequest('onion', 'oupgrade', {
                           params: {
                              check: ''
                           }
                        }, function (data) {
                           binName = data.result[1].image.local;
                           upgradeRequired = data.result[1].upgrade;
                           fileSize = data.result[1].image.size;
                           $('#download-progress').prop('max', data.result[1].image.size);
                           $('#wifi-connect').hide();
                           $('#wifiLoading').hide();
                           $('#wifi-list').show();
                           $('#networkTable').show();
                        });
                     } else {
                        $('#wifiLoading').hide();
                        $('#networkTable').hide();
                        $('#wifi-connect').show();
                     }
                  });
               }
            });
            
            //Check to see if you can skip here

            sendUbusRequest('uci','get',{config:"onion",section:"console",option:"setup"},
                function(response){
               console.log(response);
               if(response.result.length == 2){
                  //Got a valid response, cuz the length is two
                  if(response.result[1].value == "1"){
                     console.log("Skip Buttons should be visible");
                     $('#skipWifiButton').css('display','block');
                     $('#setupCloudBackButton').css('display','block');
                     $('#firmwareBackButton').css('display','block');
                     //Fuck it while we are at it, lets add the back 
                      //buttons here too? Or should we always have back buttons?
                  }else{
                     console.log("Skip Buttons are hidden");
                     console.log("About to hide the setupCloudBackButton");
                     $('#setupCloudBackButton').css('display','none');
                     console.log("Hiding setupCloudBackButton");
                     $('#firmwareBackButton').css('display','none');

                  }
               } else{
                  console.log("Got a wack response from the ubus request, hid all skip buttons");
                  console.log("About to hide the setupCloudBackButton");
                  $('#setupCloudBackButton').css('display','none');
                  console.log("Hiding setupCloudBackButton");
                  $('#firmwareBackButton').css('display','none');


               }
            });
         }
      },
      { // step 4
         ready: function(){
            console.log("Ready Function for the cloud registration step gets called here");
            return false;

         },
         init: function(){
            console.log("init function for the cloud registration step gets called here ");
               $('#cloudLoading').css('display','none');
            
            sendUbusRequest('uci','get',{config:"onion",section:"cloud"},function(response){
               console.log(response);

               if(response.result.length == 2){
                  //If the secret is not anonymous then display the device ID and write change the registerDeviceButton text
                  if(response.result[1].values.secret !== "anonymous"){
                     $('#cloudText').html('<div class="alert alert-info"><p>Your device is registered with the Onion Cloud. Check out <a href="http://cloud.onion.io/" target="_blank">cloud.onion.io</a> to get started!</p></div>');
                     $('#deviceId-list').css('display','block');
                     $('#deviceId').html(response.result[1].values.deviceId);
                     
                     $('#registerDeviceButton').html('Register device again as a new device (not recommended)');
                  }
                  else {
                     $('#deviceId-list').css('display','none');
                  }
               }
            });
            
            //Add iframe source on load
            $('#iframe').attr('src','https://registerdevice.onion.io');
            window.addEventListener("message", receiveDeviceId); //Listening for message from modal

         }

      },
      { // Step 5
         ready: function () {
            return omegaOnline;
            // return true;
         },
         init: function () {
            console.log("upgradeRequired",upgradeRequired);
            console.log("binDownloaded",binDownloaded);
            $('#downloading').hide();
            $('#download-complete').hide();
            firmwareText();
         }
      },
      { // Step 6
         ready: function () {
            return binDownloaded;
         },
         init: function () {
            $('#success').hide();
            
            if (upgradeRequired === 'true' && isChecked) {
               $('#upgrade-not-required').hide();
               $('#install-console-only').hide();
               $('#upgrade-required').hide();
               $('#downloading').show();
               $('#completeBackButton').hide();
               $('#download-progress').prop('value', 0);
               
               sendUbusRequest('uci', 'set', {
               config: 'onion',
               section: 'console',
               values: {
                  install: '2' //install = 2 means that the install console package runs on reboot after the firmware update
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
               
               console.log("Upgrading");
               sendUbusRequest('onion', 'oupgrade', {
                  params: {
                     force: ''
                  }
               });
               
               checkDownload();
            }else if(upgradeRequired === 'true' && !isChecked){
               $('#upgrade-not-required').hide();
               $('#install-console-only').hide();
               $('#upgrade-required').hide();
               $('#downloading').show();
               $('#completeBackButton').hide();
               $('#download-progress').prop('value', 0);
               console.log("Upgrading");
               sendUbusRequest('onion', 'oupgrade', {
                  params: {
                     force: ''
                  }
               });
               
               checkDownload();
            } else {
               binDownloaded = true;
               if(isChecked){
                  sendUbusRequest('uci', 'set', {
                     config: 'onion',
                     section: 'console',
                     values: {
                        install: '1' //Install = 1 means that no firmware upgrade is required.
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
                  $('#upgrade-required').hide();
                  $('#upgrade-not-required').hide();
                  $('#downloading').hide();
                  $('#install-console-only').show();
                  $('#completeBackButton').show();
               } else {
                  $('#upgrade-required').hide();
                  $('#install-console-only').hide();
                  $('#downloading').hide();
                  $('#upgrade-not-required').show();
                  $('#completeBackButton').show();
               }
            }
         }
      }
   ];

