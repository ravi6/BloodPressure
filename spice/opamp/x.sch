v 20150930 2
C 47900 45800 1 0 0 resistor-1.sym
{
T 48200 46200 5 10 0 0 0 0 1
device=RESISTOR
T 48200 46100 5 10 1 1 0 0 1
value=10K
T 47900 46100 5 10 1 1 0 0 1
refdes=R1
}
C 48400 43700 1 0 0 resistor-1.sym
{
T 48700 44100 5 10 0 0 0 0 1
device=RESISTOR
T 49100 43500 5 10 1 1 0 0 1
value=10K
T 48800 43500 5 10 1 1 0 0 1
refdes=R2
}
C 49400 42400 1 270 0 vdc-1.sym
{
T 50600 42450 5 10 1 1 180 0 1
refdes=VCC
T 50250 41700 5 10 0 0 270 0 1
device=VOLTAGE_SOURCE
T 50450 41700 5 10 0 0 270 0 1
footprint=none
T 50200 42650 5 10 1 1 180 0 1
value=DC 5V
}
C 49500 42500 1 180 0 gnd-1.sym
C 50400 45900 1 0 0 spice-include-1.sym
{
T 50500 46200 5 10 0 1 0 0 1
device=include
T 50500 46300 5 10 1 1 0 0 1
refdes=A1
T 50900 46000 5 10 1 1 0 0 1
file=spice.inc
}
C 46900 44700 1 0 0 vpwl-1.sym
{
T 47600 45350 5 10 1 1 0 0 1
refdes=V1
T 47600 45550 5 10 0 0 0 0 1
device=vpwl
T 47600 45750 5 10 0 0 0 0 1
footprint=none
T 47600 45150 5 10 0 1 0 0 1
value=pwl (0 0 20ms 0  20ms 1.2  40ms  1.2 40ms 0) r=0
}
C 49700 44100 1 0 0 aop-spice-1.sym
{
T 50400 44900 5 10 1 1 0 0 1
refdes=X1
T 50800 44400 5 10 0 0 0 0 1
model-name=lm324
}
C 49300 43700 1 0 0 resistor-1.sym
{
T 49600 44100 5 10 0 0 0 0 1
device=RESISTOR
T 50000 43500 5 10 1 1 0 0 1
value=10K
T 49700 43500 5 10 1 1 0 0 1
refdes=R3
}
N 50700 43800 50700 44500 4
{
T 50650 43400 5 10 0 0 90 0 1
netname=out
}
N 50700 43800 50200 43800 4
C 47000 44100 1 270 0 vdc-1.sym
{
T 47900 43450 5 10 1 1 0 0 1
refdes=V2
T 47850 43400 5 10 0 0 270 0 1
device=VOLTAGE_SOURCE
T 48050 43400 5 10 0 0 270 0 1
footprint=none
T 47900 43350 5 10 1 1 180 0 1
value=DC 1V
}
C 47100 44100 1 180 0 gnd-1.sym
C 47100 44400 1 0 0 gnd-1.sym
N 47200 45900 47900 45900 4
{
T 47300 45950 5 10 0 0 0 0 1
netname=in1
}
C 50300 45200 1 180 0 gnd-1.sym
N 50600 42100 51200 42100 4
N 51200 42100 51200 44100 4
{
T 51150 42200 5 10 0 0 90 0 1
netname=VCC
}
N 51200 44100 50200 44100 4
T 47850 44600 8 10 0 0 90 0 1
netname=0
C 50500 45200 1 0 0 spice-include-1.sym
{
T 50600 45500 5 10 0 1 0 0 1
device=include
T 50600 45600 5 10 1 1 0 0 1
refdes=A2
T 51000 45300 5 10 1 1 0 0 1
file=model/lm324.cir
}
N 49300 43800 49300 44300 4
N 49300 44300 49700 44300 4
N 49700 45900 49700 44700 4
C 48900 45700 1 270 0 resistor-1.sym
{
T 49300 45400 5 10 0 0 270 0 1
device=RESISTOR
T 49200 45400 5 10 1 1 270 0 1
value=10K
T 49200 45700 5 10 1 1 270 0 1
refdes=R4
}
N 47200 44800 49000 44800 4
N 48200 43800 48400 43800 4
{
T 48300 43850 5 10 0 0 0 0 1
netname=in2
}
N 49400 42100 49400 42200 4
N 49000 45700 49000 45900 4
N 48800 45900 49700 45900 4
