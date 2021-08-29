#!/bin/ash
# Author: Ravi Saripalli
# Date: 26th Aug. 2021

# pwm pins GPIO18/GPIO19
#omega2-ctrl gpiomux set pwm0/1 pwm
# I am using GPIO19 with pwm channel 1
#This is where all hardware control happens
 PWMDIR=/sys/class/pwm/pwmchip0

if [ "$#" -eq  0 ]; then
   if [[ -d $PWMDIR/pwm1 ]]; then 
     echo  PWM GPIO 19 is already set
   else
    #Configure pwm1 ... on GPIO19
     omega2-ctrl gpiomux set pwm1 pwm
    #This will be Channel 1
     echo 1 > $PWMDIR/export
     echo  PWM GPIO 19 is set
    fi
   exit
fi

# Sets PWM on GPIO18 given
# Frequency (Hz) and %Duty

Hz=$1
duty=$2
period=`echo $Hz | awk '{printf "%d\n", 1e9/$1}'`
dutyTime=`echo $Hz $duty | awk '{printf "%d\n", $2 * 1e7 / $1}'`

  echo 0 > $PWMDIR/pwm1/enable
  echo $period > $PWMDIR/pwm1/period
  echo $dutyTime > $PWMDIR/pwm1/duty_cycle
  echo 1 > $PWMDIR/pwm1/enable
  echo {Hz: $1, Duty: $2}

