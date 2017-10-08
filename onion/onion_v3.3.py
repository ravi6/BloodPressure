#My Omeron BP measurer
    # Python Script to process BP meter
    # signals from patched hardware to 
    # decipher LCD display line data
    #  Author: Ravi Saripalli
    #  22nd Jul. 2017
    #  Version: 3.3
    #  Last Modified 2nd Oct. 2017
# 
# Learnt a bit about Python classes
#  functions, indents, lists, print
#  Not my preferred langauge but will get by

# LOGS - to jogg memory
# Monday - 25th Sep. 2017
# What works ... and not to be tinkered with
# Segment number selection to Mux select and
# and Mux select signal decoding is robust and bug free
# Segment number index starts with 0 ...(Never forget this)

# Looking for a 2ms pulse in 16ms cycle is still not 
# proven. Tried oversampling with frencey of 10samp/sec
# and looking for 4/2 consecutive signals did not work
# reverted back to on shot success with slow sampling
# of 2samp/sec.




import omega_gpio

testing = 0    # barebones test to get bit pattern
debug   = 0    # set this to 1 if you want mux stuff

class Omeron:

  # Onion output pin Pin order should be MSB to LSB
  muxSigSelectPins = [11, 3, 2]  
  muxEnablePins =[0, 1]

  # Onion Input Pins used to see the segment state
  # The pin order should be from C0 to C3 on Omeron
  onionSegStatePins = [17, 16, 15, 46]


  # This will identify the digits 0 to 9 on LCD
  # notice the fourth most significant bit is zero
  # in all that is the decimal point
  # added 'hook' bit to 7 binary

  bitpat=[
   '11010111', '00000110', '11100011', '10100111', 
   '00110110', '10110101', '11110101', '00010111', 
   '11110111', '10110111'] 


  def __init__(self):
    # print "My String is %s" % self.bitpat[9]
    print "Omeron Object Initialized\n"


  #------------------------
  def confIOPins(self):
  #------------------------
    # Configure I/O pins for the Onion
    for pin in self.muxSigSelectPins:
      omega_gpio.initpin(pin,'out')

    for pin in self.muxEnablePins:
      omega_gpio.initpin(pin,'out')

    for pin in self.onionSegStatePins:
      omega_gpio.initpin(pin,'in')

  #------------------------
  def closeIOPins(self):
  #------------------------
    # Release all I/O pins 
    for pin in self.muxSigSelectPins:
      omega_gpio.closepin(pin)

    for pin in self.muxEnablePins:
      omega_gpio.closepin(pin)

    for pin in self.onionSegStatePins:
      omega_gpio.closepin(pin)


  #------------------------
  def selSeg(self, segNum):
  #------------------------
    import time
    "Set pinout to select a LCD segment"
    mux0 = segNum < 8
    if debug:
      print "Set mux 0 Enable  %i "  %mux0
    omega_gpio.setoutput(self.muxEnablePins[0], not(mux0))  #note inverted signal
    if debug:
      print "Set mux 1 Enable %i \n" %(not mux0)
    omega_gpio.setoutput(self.muxEnablePins[1], mux0)  #note inverted signal

    if mux0:
     for i in range(2, -1, -1):
      x = segNum  >> i & 1
      if debug:
        print "Set Mux0 sigSelect Pin %i to  %i \n" \
              %(self.muxSigSelectPins[i], x) 
      omega_gpio.setoutput(self.muxSigSelectPins[i], x)
    else:
      for i in range(2, -1, -1):
        x = (segNum - 8)  >> i & 1
        if debug:
          print "Set Mux0 sigSelect Pin %i to  %i \n" \
              %(self.muxSigSelectPins[i], x) 
        omega_gpio.setoutput(self.muxSigSelectPins[i], x)

    time.sleep(0.01)  # add some delay for i/o pins to change state

  #------------------------
  def getPinState(self, pin):
  #------------------------
    import time  
  #, random

  # This reads the state of Onion pin
    delay = 0.5 * 1e-3    # 1 milli second
    state = 0 
    for i in range(1, 32):  # we wait for a cycle 16 ms 
      # state = random.randint(0, 100) # replace with read
      #Take two samples in succession (delay apart)
      state1 = omega_gpio.readinput(pin)
      time.sleep(delay)
#      print "Read pin %i as %i try=%i\n" %(pin, state, i) 
#     Bail out if you get two consecutive ones
      if state1: 
           state = 1
           return state
    return state

  #------------------------
  def readSeg(self):
  #------------------------
     "Read the state of LCD segments connected to C0-C3"
     "The reson we flip the array content is to make C0 the least significant bit
     states = list("----")
     for i in range(0,4):
       states[3-i] = \
       self.getPinState(self.onionSegStatePins[i])
     return states

#====================================
# Start Using our Omeron Device
#====================================
om = Omeron()
om.confIOPins()

# Dan's Test area
if testing:
  #  for j in range(0,15):
  #     pause = raw_input('Press <Enter>')
  #     om.selSeg(j)
  #     bitpat = om.readSeg()
  #     print  "Pin = ", str(32-j), " --->  ", bitpat

    for j in [0, 2, 4, 6, 8, 10, 12, 14]:
       om.selSeg(j)
       RHS = om.readSeg()
       om.selSeg(j+1)
       LHS = om.readSeg()
       print "Bit Pat = ", RHS, LHS
    exit()


#Let us now iterrogate the LCD signals
#Get the Readings

#==================================
# Get first digit of Systolic
#==================================
om.selSeg(0)          # pin 32 of bp meter
segR = om.readSeg()
j = 3
k = 1 
if (segR[j] == 0) & (segR[k] == 0):
    digit = "0"
if (segR[j] == 1) & (segR[k] == 1):
    digit = "1"
if (segR[j] == 0) & (segR[k] ==1):
    digit = "y"
if (segR[j] == 1) & (segR[k] ==0):
    digit = "z"

systolic = digit

#==================================
# Get next two digits of Systolic
#==================================
for j in [1, 3]:
      om.selSeg(j)          # pin 31/29 of bp meter
      segL = om.readSeg()
      om.selSeg(j+1)          # pin 30/28 of bp meter
      segR = om.readSeg()
      segR[0] = 0           # mask the dot
      bitpat = segL + segR   
      bitpatS =  ''.join(str(e) for e in bitpat) #stringify

      try:
        digit =  str(om.bitpat.index(bitpatS))
      except:
        digit = "x"
        print "Got Bit Paatern -> %s" % bitpat

      systolic = systolic + digit

#==================================
# Get first digit of Diastolic
# LHS and RHS are reversed
#==================================
dystolic = ""
j = 5
om.selSeg(j)          # pin 27 of bp meter
segR = om.readSeg()
segR[0] = 0           # mask the dot
segR[3] = 0           # C0 masked - heart symol
om.selSeg(j+1)        # pin 26 of bp meter
segL = om.readSeg()
segL[3] = 0           # C0 masked -- pulse symbol
bitpat = segL + segR   
bitpatS =  ''.join(str(e) for e in bitpat) #stringify

try:
  digit =  str(om.bitpat.index(bitpatS))
except:
  digit = "m"
  print "Got Bit Paatern -> %s" % bitpat

dystolic = dystolic + digit

#==================================
# Get next two digit of Diastolic
#==================================

for j in [7, 9]:
      om.selSeg(j)          # pin 25/23 of bp meter
      segL = om.readSeg()
      om.selSeg(j+1)          # pin 24/22 of bp meter
      segR = om.readSeg()
      segR[0] = 0           # mask the dot
      bitpat = segL + segR   
      bitpatS =  ''.join(str(e) for e in bitpat) #stringify

      try:
        digit =  str(om.bitpat.index(bitpatS))
      except:
        digit = "x"
        print "Got Bit Paatern -> %s" % bitpat

      dystolic = dystolic + digit



#==================================
# Get next two digit of pulse
#==================================

pulse = ""
prepend = ""

for j in [11, 13]:
      om.selSeg(j)          # pin 21/19 of bp meter
      segL = om.readSeg()
      om.selSeg(j+1)          # pin 20/18 of bp meter
      segR = om.readSeg()
      if j==11 & (segR[3] == 1): # for pin 20 when dot is on prepend 1 to reading
          prepend = "1"
      segR[0] = 0           # mask the dot
      bitpat = segL + segR   
      bitpatS =  ''.join(str(e) for e in bitpat) #stringify

      try:
        digit =  str(om.bitpat.index(bitpatS))
      except:
        digit = "x"
        print "Got Bit Paatern -> %s" % bitpat

      pulse = pulse + digit
pulse = prepend + pulse   # In case your heart bets >=100 beats


print "Systolic = %s" % systolic
print "Dystolic = %s" % dystolic
print "Pulse    = %s" % pulse
om.closeIOPins()

#mystr =   '10110111' mystr =   '11110111' # 
#print om.bitpat.index(mystr)
