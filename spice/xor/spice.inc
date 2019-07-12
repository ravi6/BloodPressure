* .ac dec 10 1 10K
.tran 0.1ms 50ms 
* This directive enables to use  NMOS model
* .model MOSN NMOS level=8 version=3.3.0
.control
run
plot A, B, C
.endc
