* Test Simulation with OPAMP
.tran 0.01ms 220ms 
.control
run
plot v(in1)
plot v(in2)
plot v(out)
plot v(in2) - v(in1)
.endc
