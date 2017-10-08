'use strict';
<script src="general.js"></script>
<script src="network.js"></script>
<script src="register.js"></script>
<script src="firmware.js"></script>
   //=====================
   //Step 5: Setup Complete
   //======================

   $('#completeBackButton').click(function(){
      console.log("complete back button gets called");
      gotoStep(preStep);
   })
   
   function startTimer(){
      var time = 0;
      var timerBar = setInterval(function () {
         time = time + 1;
         
         $('#time').prop('value', time.toString());

         if (time >= 2400) {
            $('#time').hide();
            $('#warning').hide();
            $('#success').show();
            clearInterval(timerBar);
         }
      }, 100);
      
   }

   //======================
   // Steps Management
   //======================

   var currentStep = 0;
   var nextStep;
   var preStep;
   var savedWifiNetworks = [];
   var currentNetworkIndex;

   <script src="firmware.js"></script>

   var gotoStep = function (step) {
      if(preStep != step){
         var bSlideLeft = true;
      }
      if (currentStep !== step || ( (currentStep==0) && (step ==0))) {
         currentStep = step;
         preStep = currentStep - 1;
         nextStep = currentStep + 1;

         var indicators = $('#steps-indicator').children(),
            controls = $('#steps').children();

         for (var i = 0; i < indicators.length; i++) {
            if (i <= (step - 1)) {
               $(indicators[i]).addClass('completed');
            } else {
               $(indicators[i]).removeClass('completed');
            }
         }

         steps[step].init();
         console.log("The value of bSlideLeft is:",bSlideLeft);
         if(step == 0){
            $(controls[step]).show();
         } else{
            if(bSlideLeft){
               console.log("Should be going forward");
               $(controls[step - 1]).show().removeClass('shiftLeftIn').removeClass('shiftLeftOut').removeClass('shiftRightOut').removeClass('shiftRightIn').addClass('shiftLeftOut');
               setTimeout(function(){
                  $(controls[step - 1]).hide();
                  $(controls[step]).show().removeClass('shiftLeftIn').removeClass('shiftLeftOut').removeClass('shiftRightOut').removeClass('shiftRightIn').addClass('shiftLeftIn').css('height','auto');
               },1000);

            } else{
               $(controls[step + 1]).show().removeClass('shiftLeftIn').removeClass('shiftLeftOut').removeClass('shiftRightOut').removeClass('shiftRightIn').addClass('shiftRightOut');
               setTimeout(function(){
                  $(controls[step + 1]).hide();
                  $(controls[step]).show().removeClass('shiftLeftIn').removeClass('shiftLeftOut').removeClass('shiftRightOut').removeClass('shiftRightIn').addClass('shiftRightIn').css('height','auto');

               },1000);
            }
         }
      }
   };

   $(function () {
      // Check which step we are in
      console.log("this part of the script gets executed");
      for (var i = 0; i < steps.length; i++) {
         // Test to see if current Step finished
         if (!steps[i].ready()) {
            break;
         }
      }
      console.log(i);

      gotoStep(i);
   });

})();
<script src="firmware.js"></script>
