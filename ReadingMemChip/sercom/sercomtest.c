#include "serial.h"

void main()
{
  int i , fd;
  //struct timespec ts ;

  fd = open_port("/dev/ttyUSB0") ;
  setup(fd) ;

  if (fd != -1) 
    {
       printf("Toggling cts 10ms period\n");
       //ts.tv_sec = 0 ; ts.tv_nsec = 1e6 ; // 1ms delay
       while(1)
         {
          set_RTS(fd, ON) ; 
          usleep(1e5) ;
          set_RTS(fd, OFF) ;  
          usleep(1e5) ; //         nanosleep(&ts, NULL);
         };
    }
 
    close(fd);
    printf("Port Closed\n");
}
