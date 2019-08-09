* Test Simulation with OPAMP
.tran 0.01ms 20ms 
.control
run
plot v(in1) v(in2) v(out) (v(in1) - v(in2))
.endc
