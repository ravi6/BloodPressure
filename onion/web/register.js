   //Get deviceId and Secret from modal window app
   var receiveDeviceId = function (result) {
      if (result.origin !== "https://registerdevice.onion.io")
      return;
      
      //Checking to see if cloud section exists in config files
      sendUbusRequest('uci', 'get', {
            config:"onion",
            section:"cloud"
         }, function (response) {
            if(response.result.length !== 2){
            sendUbusRequest('uci', 'add', {
               config: 'onion',
               type: 'cloud',
               name: 'cloud'
            }, function () {
               //Setting values in config file to the values from modal window
               sendUbusRequest('uci', 'set', {
                  config: 'onion',
                  section: 'cloud',
                  values: {
                     deviceId: result.data.content.deviceId,
                     secret: result.data.content.deviceSecret
                  }
               }, function (result) {
                  console.log('uci set onion.cloud result:', result);
                  if (result.result[0] === 0) {
                     sendUbusRequest('uci', 'commit', {
                           config: 'onion'
                     }, function (result) {
                        if (result.result[0] === 0) {
                           console.log('cloud settings set');
                           sendUbusRequest('file', 'exec', {
                              command: '/etc/init.d/device-client',
                              params: ['restart']
                           }, function () {
                           window.removeEventListener("message", receiveDeviceId);
                           window.addEventListener("message", waitForConnect)
                           });
                        } else {
                           console.log('Unable to commit cloud settings.');
                        }
                     });
                  } else {
                     console.log('Unable to set cloud settings.');
                  }
               });
            });
         } else {
            console.log('Cloud settings added')
            sendUbusRequest('uci', 'set', {
               config: 'onion',
               section: 'cloud',
               values: {
                  deviceId: result.data.content.deviceId,
                  secret: result.data.content.deviceSecret
               }
            }, function (result) {
               console.log('uci set onion.cloud result:', result);
               if (result.result[0] === 0) {
                  sendUbusRequest('uci', 'commit', {
                        config: 'onion'
                  }, function (result) {
                     if (result.result[0] === 0) {
                        console.log('cloud settings set');
                        sendUbusRequest('file', 'exec', {
                           command: '/etc/init.d/device-client',
                           params: ['restart']
                        }, function () {
                        console.log('Waiting for connection...');
                        window.removeEventListener("message", receiveDeviceId);
                        window.addEventListener("message", waitForConnect);
                        });
                     } else {
                        console.log('Unable to commit cloud settings.');
                     }
                  });
               } else {
                  console.log('Unable to set cloud settings.');
               }
            });
         }
      });
   }

   //Function to go to next step after button in modal is clicked
   var waitForConnect = function(result) {
      if (result.origin !== "https://registerdevice.onion.io")
      return;
      $('#myModal').modal('hide');
      gotoStep(nextStep);
      window.removeEventListener("message", waitForConnect);
      window.addEventListener("message", receiveDeviceId);
   }

