#include "serial.h"

// USB RS232 cable from FTDI
/* CTS# Brown ...   input to my cable 
 * RTS# Green ...   output from my cable
 * GND#	Black ...   Ground
 * RED# Power ..    5V
 * ORNG# TxD
 * YELL# RxD
 */

void set_RTS(int fd, int state)
{

int status;
ioctl(fd, TIOCMGET, &status);  // get modem status

if (state)
  status |= TIOCM_RTS;	      //  RTS Up
else   
  status &= ~TIOCM_RTS;	      //  RTS down

ioctl(fd, TIOCMSET, &status);  //  set modem status
} // end rts


int get_CTS(int fd)
{
// Read CTS state
int status;
ioctl(fd, TIOCMGET, &status);  // get modem status
  if ( (status & TIOCM_CTS) == 0 ) 
      return 0 ;
  else
      return 1 ;	      
} // end get_CTS


int open_port(char *port)
{
//  Serial port
  int fd ;

  fd = open(port, O_RDWR | O_NOCTTY | O_NDELAY);
  if (fd == -1)
    {
      printf ("Unable to open %s \n", port);
    }
  else
    {
      fcntl(fd, F_SETFL, 0);
      printf ("opened %s \t fd=%i\n", port,fd);
    }
  return(fd) ;
} // end open port


void setup(int fd)
{
  // Configure Serial Port
  struct termios options ;

  tcgetattr(fd, &options) ;  // Get current options
  cfsetispeed(&options, B9600) ; // Set Baudrate


  options.c_cflag &= ~PARENB ; /* No Parity */
  options.c_cflag &= ~CSTOPB ; /* 1 Stop Bit */
  options.c_cflag &= ~CSIZE  ; /* Mask the character size bits */
  options.c_cflag |= CS8     ; /* Select 8 data bits */
  options.c_cflag |= CRTSCTS ; /* Enable CTS,RTS */
  options.c_iflag &= ~(IXON | IXOFF | IXANY) ; /* No Xon Xoff */
  options.c_lflag &= ~(ICANON | ECHO | ECHOE | ISIG); /* Raw Input */
  options.c_oflag &= ~OPOST; /* Raw Output Mode */
  options.c_cflag |= (CLOCAL | CREAD) ; //Enable Receiver
  tcsetattr(fd, TCSANOW, &options) ; // Apply  new options


}// End setup


void read_port(int fd, int nbytes)
{
 // ioctl(fd, FIONREAD, &bytes);  /* Get no of bytes in read buffer */
// Reading Serial Input buffer
fcntl(fd, F_SETFL, FNDELAY); /* prevent blocking if no bytes */
// use fcntl(fd, F_SETFL, 0) ; /* use this for blocking */
}

void write_port(int fd)
{
int n ;
n = write(fd, "ATZ\r", 4); // sends data and returns no.bytes sent
if (n < 0)
  fputs("write() of 4 bytes failed!\n", stderr);
}
