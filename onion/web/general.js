(function () {

   //======================
   // General
   //======================

   var getRequestCounter = function () {
      var returnValue = $.sessionStorage.isSet('OmegaRequestCounter') ? $.sessionStorage.get('OmegaRequestCounter') : 0;
      $.sessionStorage.set('OmegaRequestCounter', returnValue + 1);
      return returnValue;
   };

   var isTokenExpired = function () {
      if ($.sessionStorage.isSet('OmegaTokenExpires')) {
         return (new Date()).getTime() > $.sessionStorage.get('OmegaTokenExpires');
      } else {
         return true;
      }
   };

   var sendUbusRequest = function (packageName, methodName, params, callback) {
      callback = callback || $.noop;

      if (!isTokenExpired()) {
         $.sessionStorage.set('OmegaTokenExpires', (new Date()).getTime() + 300000);
      }

      var request = $.ajax({
         type: 'POST',
         contentType: 'application/json',
         url: window.location.origin + '/ubus',
         data: JSON.stringify({
            jsonrpc: '2.0',
            id: getRequestCounter(),
            method: 'call',
            params: [
               $.sessionStorage.isSet('OmegaToken') ? $.sessionStorage.get('OmegaToken') : '00000000000000000000000000000000', 
               packageName, 
               methodName, 
               params
            ]
         }),
         dataType: 'json'
      });

      request.done(function (data) {
         callback(data);
      });

      request.fail($.noop);
      request.always($.noop);

      return request;
   };

   //======================
   // Introductory Card
   //======================

   $('#skipIntro').click(function(e){
      gotoStep(nextStep);
   });

   //======================
   // Step 1: Login
   //======================

   var showLoginMessage = function (message) {
      $('#login-message').append($('<div class="alert alert-warning alert-dismissible fade in" role="alert"> \
         <button type="button" class="close" data-dismiss="alert" aria-label="Close"> \
            <span aria-hidden="true">&times;</span> \
            <span class="sr-only">Close</span> \
         </button> \
         <strong>Error:</strong> ' + message + ' \
      </div>'));
   };

   $('#login-form').submit(function (e) {
      e.preventDefault();
      $('#loginButton').prop('disabled', true);
      sendUbusRequest('session', 'login', {
         username: $('#login-username').val(),
         password: $('#login-password').val()
      }, function (data) {
         console.log(data);
         if (data && data.error) {
            showLoginMessage(data.error.message);
            $('#loginCard').removeClass('shakeClass')
            setTimeout(function(){
               $('#loginCard').addClass('shakeClass');
            },100);
         } else if (data && data.result) {
            var returnCode = data.result[0];

            if (returnCode === 0) {
               $.sessionStorage.set('OmegaToken', data.result[1].ubus_rpc_session);
               $.sessionStorage.set('OmegaTokenExpires', (new Date()).getTime() + data.result[1].expires * 1000);

               gotoStep(nextStep);
            } else {
               $('#loginButton').prop('disabled', false);
               showLoginMessage('Login failed.');
               $('#loginCard').removeClass('shakeClass')
               setTimeout(function(){
                  $('#loginCard').addClass('shakeClass');
               },100);
            }
         }
      });
   });

   $('#login-username').keypress(function (e) {
      if (e.which === 13) {
         e.preventDefault();
         $('#login-password').focus();

         return false;
      }
   });


   //======================
   // Step 2: Setup Wi-Fi
   //======================

   var availableWifiNetworks,
      fileSize = '0',
      omegaOnline = false,
      apNetworkIndex,
      currentNetworkIndex,
      currentNetworkSsid;
      
   //Used to display error messages in an alert box
   var showWifiMessage = function (type, message) {
      $('#wifi-message').append($('<div class="alert alert-' + type + ' alert-dismissible fade in" role="alert"> \
         <button type="button" class="close" data-dismiss="alert" aria-label="Close"> \
            <span aria-hidden="true">&times;</span> \
            <span class="sr-only">Close</span> \
         </button> \
         ' + message + ' \
      </div>'));
   };

   //Used to display error messages in an alert box
   var showWifiMessageModal = function (type, message) {
      $('#wifi-message-modal').append($('<div class="alert alert-' + type + ' alert-dismissible fade in" role="alert"> \
         <button type="button" class="close" data-dismiss="alert" aria-label="Close"> \
            <span aria-hidden="true">&times;</span> \
            <span class="sr-only">Close</span> \
         </button> \
         ' + message + ' \
      </div>'));
   };
   
   //Adds an empty network config to the wireless config file
   var addWirelessNetwork = function (params, bEnabled) {
      var overwrite = 0;
      var overwriteIndex;
      $.each(savedWifiNetworks, function(key, value) {
         if(value.ssid === params.ssid){
            overwriteIndex = key;
            overwrite = 1;
         }
      });
      if(overwrite === 1){
         sendUbusRequest('uci', 'set', {
            config: 'wireless',
            section: savedWifiNetworks[overwriteIndex][".name"],
            values: params
         }, function (result) {
               sendUbusRequest('uci', 'set', {
                  config: 'wireless',
                  section: savedWifiNetworks[apNetworkIndex][".name"],
                  values: {
                     ApCliEnable: '1',
                     ApCliSsid: savedWifiNetworks[overwriteIndex].ssid,
                     ApCliAuthMode: savedWifiNetworks[overwriteIndex].encryption,
                     ApCliPassWord: savedWifiNetworks[overwriteIndex].key
                  }
               }, function(response){
                  sendUbusRequest('uci', 'commit', {
                        config: 'wireless'
                  }, function (response){
                     currentNetworkSsid = savedWifiNetworks[overwriteIndex].ssid;
                     sendUbusRequest('file', 'exec', {
                        command: 'wifi',
                        params: []
                     }, function(){
                        refreshNetworkList();
                     });
                  });
               });
            });
      }else {
         sendUbusRequest('uci', 'add', {
            config: 'wireless',
            type: 'wifi-config',
            values: params
         }, function (result) {
            if (bEnabled) {
               sendUbusRequest('uci', 'set', {
                  config: 'wireless',
                  section: '@wifi-iface[0]',
                  values: {
                     ApCliEnable: '1',
                     ApCliSsid: params.ssid,
                     ApCliPassWord: params.key,
                     ApCliAuthMode: params.encryption
                  }
               })
            }
            console.log('uci add wireless result:', result);
            if (result.result[0] === 0) {
               sendUbusRequest('uci', 'commit', {
                     config: 'wireless'
               }, function (result) {
                  if (result.result[0] === 0) {
                     savedWifiNetworks = [];
                     sendUbusRequest('uci','get',{config:"wireless"},function(response){
                        console.log('added wireless network');
                     });
                  } else {
                     console.log('Unable to add wireless network.');
                  }
               });
            } else {
               console.log('Unable to add wireless network.');
            }
         });
      }
   };
   
   //Generates the parameters for the uci set wireless ubus call
   var genUciNetworkParams = function (ssid, password, auth, bApNetwork, bEnabled) {
      var params = {};
      // set the basic info
      params.ssid       = ssid;
      params.encryption    = auth;
      // set the network parameters based on if AP or STA type   
      // generate the values to set based on the encryption type
      if (auth === 'wep') {
         params.encryption    = auth;
         params.key       = '1';
         params.key1    = password;
      }
      else if (auth === 'psk') {
         params.encryption    = 'WPA1PSK';
         params.key       = password;
      }
      else if (auth === 'psk2') {
         params.encryption    = 'WPA2PSK';
         params.key       = password;
      }
      else {
         params.encryption    = 'NONE';
         params.key       = '';
      }

      return params;
   };
   
   //Function to generate params and set wireless config
   var setupWifiNetwork = function (ssid, password, auth, uciId) {
      var params          = genUciNetworkParams(ssid, password, auth, false);
      var wirelessPromise   = addWirelessNetwork(params, true);
   };
   
   // Check to see if the Omega is online!!
   var checkOnlineRequest;
   var isOnline = function (callback) {
      console.log('checking online...');

      if (checkOnlineRequest) {
         checkOnlineRequest.abort();
         checkOnlineRequest = null;
      }

      checkOnlineRequest = sendUbusRequest('file', 'exec', {
         command: 'wget',
         params: ['--spider', 'http://repo.onion.io/omega2/images']
      }, function (data){
         //checkOnlineRequest = null;

         if (data.result[1].code === 0) {
            omegaOnline = true;
         }
         callback(data);
      });
         
   };

   //Displays the list of networks in the dropdown after a scan
   var showScanMessage = function (message) {
      $('#wifi-select').empty();
      $('#wifi-select').append($('<option value="" disabled selected>' + message + '</option>'));
   };

   var showScanMessageModal = function (message) {
      $('#wifi-select-modal').empty();
      $('#wifi-select-modal').append($('<option value="" disabled selected>' + message + '</option>'));
   };

   //Scans for available wlan0 networks using wifi-scan
   var scanWifiNetwork = function () {
      showScanMessage('Scanning...');
      $('#wifi-scan-btn').prop('disabled', true);
      $('#wifi-scan-icon').addClass('rotate');

      sendUbusRequest('onion', 'wifi-scan', {
         device: 'ra0'
      }, function (data) {
         $('#wifi-scan-icon').removeClass('rotate');
         $('#wifi-scan-btn').prop('disabled', false);

         if (data && data.error) {
            showScanMessage('No Wi-Fi network found');

         } else if (data && data.result) {
            var returnCode = data.result[0];

            if (returnCode === 0 && data.result[1].results.length !== 0) {
               availableWifiNetworks = data.result[1].results;
               
               showScanMessage('Choose Wi-Fi Network:');

               for (var i = 0; i < availableWifiNetworks.length; i++) {
                  if (availableWifiNetworks[i].ssid) {
                     $('#wifi-select').append($('<option value="' + i + '">' + availableWifiNetworks[i].ssid + '</option>'));
                  }
               }
            } else {
               showScanMessage('No Wi-Fi network found');
            }
         }
      });
   };
   
   //Scans for available wlan0 networks using wifi-scan. TODO: Clean up into one function that takes in parameter (id)
   var scanWifiNetworkModal = function () {
      showScanMessageModal('Scanning...');
      $('#wifi-scan-btn-modal').prop('disabled', true);
      $('#wifi-scan-icon-modal').addClass('rotate');

      sendUbusRequest('onion', 'wifi-scan', {
         device: 'ra0'
      }, function (data) {
         $('#wifi-scan-icon-modal').removeClass('rotate');
         $('#wifi-scan-btn-modal').prop('disabled', false);

         if (data && data.error) {
            showScanMessageModal('No Wi-Fi network found');

         } else if (data && data.result) {
            var returnCode = data.result[0];

            if (returnCode === 0 && data.result[1].results.length !== 0) {
               availableWifiNetworks = data.result[1].results;
               
               showScanMessageModal('Choose Wi-Fi Network:');

               for (var i = 0; i < availableWifiNetworks.length; i++) {
                  if (availableWifiNetworks[i].ssid) {
                     $('#wifi-select-modal').append($('<option value="' + i + '">' + availableWifiNetworks[i].ssid + '</option>'));
                  }
               }
            } else {
               showScanMessageModal('No Wi-Fi network found');
            }
         }
      });
   };

   //On click functions for the scan button
   $('#wifi-scan-btn').click(scanWifiNetwork);
   $('#wifi-scan-btn-modal').click(scanWifiNetworkModal);

   //Reads the information of the selected network from the dropdown and displays it in fields for the user
   $('#wifi-select').change(function () {
      var index = $('#wifi-select').val();
      var network = availableWifiNetworks[index];

      $('#wifi-ssid').val(network.ssid);
      $('#wifi-key').val('');

      if (network.encryption === 'NONE') {
         $('#wifi-encryption').val('none');
      } else if (network.encryption.indexOf('WPA2') !== -1) {
         $('#wifi-encryption').val('psk2');
      } else if (network.encryption.indexOf('WPA') !== -1) {
         $('#wifi-encryption').val('psk');
      } else if (network.encryption.indexOf('WEP') !== -1) {
         $('#wifi-encryption').val('wep');
      }
   });
   
   //Reads the information of the selected network from the dropdown and displays it in fields for the user. TODO: Cleanup into one function that takes ID as param modal
   $('#wifi-select-modal').change(function () {
      var index = $('#wifi-select-modal').val();
      var network = availableWifiNetworks[index];

      $('#wifi-ssid-modal').val(network.ssid);
      $('#wifi-key-modal').val('');

      if (network.encryption === 'NONE') {
         $('#wifi-encryption-modal').val('none');
      } else if (network.encryption.indexOf('WPA2') !== -1) {
         $('#wifi-encryption-modal').val('psk2');
      } else if (network.encryption.indexOf('WPA') !== -1) {
         $('#wifi-encryption-modal').val('psk');
      } else if (network.encryption.indexOf('WEP') !== -1) {
         $('#wifi-encryption-modal').val('wep');
      }
   });


   //WiFi form submission function disables buttons to avoid conflicts
   //Then adds the network and enables it
   //Then tests the connection and updates the upgradeRequired variable and others
   $('#wifi-form').submit(function (e) {
      e.preventDefault();
      $('#wifi-message > .alert').alert('close');
      
      var clearFields = function () {
         $('#wifi-ssid').val('');
         $('#wifi-key').val('');
         $('#wifi-encryption').val('None');
      };
      
      var postCheck = function () {
         // clearInterval(animationInterval);
         $('#wifi-config-button').html('Configure Wi-Fi');
         $('#wifi-config-button').prop('disabled', false);
         // $('#skipStepTestButton').prop('disabled', false);
         $('#wifi-loading').css('display','none');
      };

      $('#wifi-config-button').prop('disabled', true);
      // $('#skipStepTestButton').prop('disabled', true);
      $('#wifi-config-button').html('Configuring<div id="wifi-loading" class="wifiLoad" style="display: block;">');

      
      if ($('#wifi-ssid').val() === ''){
         if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessage('danger', 'Please enter an SSID.');
      }else if ($('#wifi-encryption').val() === 'psk2' || $('#wifi-encryption').val() === 'psk'){
         if($('#wifi-key').val().length < 8 || $('#wifi-key').val().length > 63){
            if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessage('danger', 'Please enter a valid password. (WPA and WPA2 passwords are between 8 and 63 characters)');
         }
      }else if($('#wifi-encryption').val() === 'wep'){
         if($('#wifi-key').val().length !== 5){
            if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessage('danger', 'Please enter a valid password. (WEP passwords are 5 or 13 characters long)');
         }else if($('#wifi-key').val().length !== 13){
            if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessage('danger', 'Please enter a valid password. (WEP passwords are 5 or 13 characters long)');
         }
      }
         if(checkOnlineRequest !== null){
            var connectionCheckInterval = setInterval(function () {
               isOnline(function () {
                  if (omegaOnline) {
                     clearTimeout(connectionCheckTimeout);
                     clearInterval(connectionCheckInterval);
                     
                     console.log("Checking for upgrade");
                     sendUbusRequest('onion', 'oupgrade', {
                        params: {
                           check: ''
                        }
                     }, function (data) {
                        binName = data.result[1].image.local;
                        upgradeRequired = data.result[1].upgrade;
                        fileSize = data.result[1].image.size;
                        $('#download-progress').prop('max', data.result[1].image.size);
                        postCheck();
                        clearFields();
                        gotoStep(nextStep);
                     });
                  }
               });
            }, 10000);

            var connectionCheckTimeout = setTimeout(function () {
               clearInterval(connectionCheckInterval);
               if (checkOnlineRequest) {
                  checkOnlineRequest.abort();
                  checkOnlineRequest = null;
               }
                  postCheck();
                  showWifiMessage('warning', 'Unable to connect to ' + $('#wifi-ssid').val() + '. Please try again.');
            }, 60000);
            
            
            //Connect to the network
            setupWifiNetwork($('#wifi-ssid').val(), $('#wifi-key').val(), $('#wifi-encryption').val());
         }
   });
   
   $('#wifi-form-modal').submit(function (e) {
      e.preventDefault();
      $('#wifi-message > .alert').alert('close');
      
      var clearFields = function () {
         $('#wifi-ssid-modal').val('');
         $('#wifi-key-modal').val('');
         $('#wifi-encryption-modal').val('None');
      };
      
      var postCheck = function () {
         // clearInterval(animationInterval);
         $('#wifi-config-button-modal').html('Configure Wi-Fi');
         $('#wifi-config-button-modal').prop('disabled', false);
         $('#skipWifiButton').prop('disabled', false);
         $('#wifi-loading').css('display','none');
      };

      $('#wifi-config-button-modal').prop('disabled', true);
      $('#skipWifiButton').prop('disabled', true);
      $('#wifi-config-button-modal').html('Connecting<div id="wifi-loading" class="wifiLoad">');

      //Checks if the ssid is blank and if the password entered is valid for each encryption type
      if ($('#wifi-ssid-modal').val() === ''){
         if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessageModal('danger', 'Please enter an SSID.');
      }else if ($('#wifi-encryption-modal').val() === 'psk2' || $('#wifi-encryption-modal').val() === 'psk'){
         if($('#wifi-key-modal').val().length < 8 || $('#wifi-key-modal').val().length > 63){
            if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessageModal('danger', 'Please enter a valid password. (WPA and WPA2 passwords are between 8 and 63 characters)');
         }
         
      }else if($('#wifi-encryption-modal').val() === 'wep'){
         if($('#wifi-key-modal').val().length !== 5){
            if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessageModal('danger', 'Please enter a valid password. (WEP passwords are 5 or 13 characters long)');
         }else if($('#wifi-key-modal').val().length !== 13){
            if (checkOnlineRequest) {
               checkOnlineRequest.abort();
               checkOnlineRequest = null;
            }
            postCheck();
            showWifiMessageModal('danger', 'Please enter a valid password. (WEP passwords are 5 or 13 characters long)');
         }
      }
         if(checkOnlineRequest !== null){
            var connectionCheckInterval = setInterval(function () {
               isOnline(function () {
                  if (omegaOnline) {
                     clearTimeout(connectionCheckTimeout);
                     clearInterval(connectionCheckInterval);
                     
                     console.log("Checking for upgrade");
                     sendUbusRequest('onion', 'oupgrade', {
                        params: {
                           check: ''
                        }
                     }, function (data) {
                        binName = data.result[1].image.local;
                        upgradeRequired = data.result[1].upgrade;
                        fileSize = data.result[1].image.size;
                        $('#download-progress').prop('max', data.result[1].image.size);
                        postCheck();
                        clearFields();
                        $('#wifiModal').modal('hide');
                        gotoStep(nextStep);
                     });
                  // });
                  }
               });
            }, 10000);

            var connectionCheckTimeout = setTimeout(function () {
               clearInterval(connectionCheckInterval);
               if (checkOnlineRequest) {
                  checkOnlineRequest.abort();
                  checkOnlineRequest = null;
               }
                  postCheck();
                  showWifiMessage('warning', 'Unable to connect to ' + $('#wifi-ssid').val() + '. Please try again.');
            }, 60000);
            
            
            //Connect to the network
            var params = genUciNetworkParams($('#wifi-ssid-modal').val(), $('#wifi-key-modal').val(), $('#wifi-encryption-modal').val(), false, false);
            addWirelessNetwork(params);
         }

   });
   
