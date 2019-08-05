* Test Simulation with OPAMP
.tran 0.1ms 220ms 
.control
run
plot v(in1)
plot v(in2)
plot v(out)
.endc
