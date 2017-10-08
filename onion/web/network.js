// Network Related stuff
//     change/delete/add Nettwork,  etc ...
//
   $('#skipWifiButton').click(function(){
         console.log("skipWifiButton gets called");
         console.log("nextStep in skip TestButton is nextStep",nextStep);
         console.log(preStep);
         gotoStep(nextStep);

   });
   
   //Changes the network by disabling the current network, followed by enabling the selected network, and refreshing the network list
   var changeNetwork = 
    function (index, currentIndex, deleteConnectedNetwork, refresh) {

      sendUbusRequest('uci', 'set', 
        {config: 'wireless',
          section: savedWifiNetworks[apNetworkIndex][".name"],
          values: {
            ApCliEnable: '1',
            ApCliSsid: savedWifiNetworks[index].ssid,
            ApCliAuthMode: savedWifiNetworks[index].encryption,
            ApCliPassWord: savedWifiNetworks[index].key } }, 
        function(response){
         sendUbusRequest('uci', 'commit', 
             {config: 'wireless'},
             function (response){
                 currentNetworkSsid = savedWifiNetworks[index].ssid;
                 sendUbusRequest('file', 'exec', 
                     {command: 'wifi', params: [] },
                     function(response){
                        if(deleteConnectedNetwork){
                            deleteNetwork(currentNetworkIndex); //If the currently connected network is to be deleted, delete it and continue
                        }
                        if(refresh){
                           refreshNetworkList(); //Otherwise refresh the network list and continue
                        }
                        currentNetworkIndex = index;
                      });
              });
         });
   }; // end ChangeNetWork

   //Removes the network at "index"
   var deleteNetwork = 
    function(index) 
     {
      sendUbusRequest('uci', 'delete', 
                       {config: 'wireless',
                        // section: savedWifiNetworks[index][".name"]
                        section: savedWifiNetworks[index]},
                       function(response){
                            if(response.result[0] === 0)
                             {
                              sendUbusRequest('uci', 'commit', {config: 'wireless'},
                                               function(response){
                                                   refreshNetworkList(); });
                             } }
                      );
     }
   
   //Refreshes the network list to show most recent network configurations (icons, etc)
   var refreshNetworkList = function () {
      savedWifiNetworks = [];
      $('div').remove('#network-list');
      $('#networkTable').append(" <div class='list-group-item layout horizontal end' id='network-list'></div> ");
      sendUbusRequest('uci','get',{config:"wireless"},function(response){
         $.each( response.result[1].values, function( key, value ) {
            savedWifiNetworks.push(value);
         });
         $.each(savedWifiNetworks, function(key, value) {
            if(value.type === 'ralink')
               return;
            if(value.mode === "ap") {
               apNetworkIndex = value['.index'];
               currentNetworkSsid = value.ApCliSsid;
               $('#network-list').append(" <div class='list-group-item layout horizontal end'><span id='connectedNetwork'class='glyphicons glyphicons-wifi'></span><span>"+ value.ApCliSsid +"</span><div id='" + value['.index'] + "'><a class='glyphicons glyphicons-remove' href='#' data-toggle='tooltip' title='Delete Network'></a></div></div>");
               if (($('#network-list > div').length) <= 1) {
                  $('.glyphicons-remove').hide();
               } else {
                  $('.glyphicons-remove').show();
               }
               return;
            }
            else {
               if (value.ssid === currentNetworkSsid) {
                  currentNetworkIndex = Number(value['.index']);
                  return;
               }else{
                  $('#network-list').append(" <div class='list-group-item layout horizontal end'><span class='glyphicons glyphicons-wifi'></span><span>"+ value.ssid +"</span><div id='" + value['.index'] + "'><a class='glyphicons glyphicons-remove' href='#' data-toggle='tooltip' title='Delete Network'></a><a class='glyphicons glyphicons-ok' href='#' data-toggle='tooltip' title='Enable Network'></a></div></div> ");
                  if (($('#network-list > div').length) <= 1) {
                     $('.glyphicons-remove').hide();
                  } else {
                     $('.glyphicons-remove').show();
                  }
                  return;
               }
            }
            
         });
      });
      $('#wifi-list').show();
      $('#wifiLoading').hide();
   }
   
   //On click function for the enable network icon (checkmark)
   $('#networkTable').on('click', '.glyphicons-ok', function() {
      $('#wifi-list').hide();
      $('#wifiLoading').show();
      var index = Number($(this).closest('div').prop('id'));
      changeNetwork(index, currentNetworkIndex, false, true); //Enable the selected network and update the network list
   });
   
   
   //On click function for the remove network icon (X)
   $('#networkTable').on('click', '.glyphicons-remove', function() {
      $('#wifi-list').hide();
      $('#wifiLoading').show();
      var index = Number($(this).closest('div').prop('id'));
      if(index === currentNetworkIndex && savedWifiNetworks[index+1]){ //In the case that the deleted network is currently connected and another network is currently configured
         changeNetwork(index+1, currentNetworkIndex, true, true); // Connect to the next network and flag the current network for deletion
      } else {
         deleteNetwork(index);
      }
   });


   // ==================
   // Step 3: Cloud Registration
   //===================
   $('#openCloudButton').click(function(){
      // Open the window.
      var win = window.open("https://cloud.onion.io");
   });

   $('#skipCloudReg').click(function(){
      // steps[3].init();
      gotoStep(nextStep);
   });

   $('#setupCloudBackButton').click(function(){
      console.log("preStep",preStep);
      console.log("Back Button from the cloud setup gets called");
      gotoStep(preStep);
   });

