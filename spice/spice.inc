* .ac dec 10 1 10K
.tran 0ms 200ms 
* This directive enables to use  NMOS model
.model MOSN NMOS level=8 version=3.3.0
.control
run
save Vout, Vin
.endc
