/*
 *  *   Extracts data from Omeron Memory Chip
 *   */

#include <stdio.h>
#include <unistd.h>
#include <sys/io.h>
#include <inttypes.h>

// Parallel Port  I/O
#define DATA  0x378 /* Data Lines */
#define STATUS DATA+1 /* status Lines */
#define CONTROL DATA+2 /* Control Lines */

#define STATUS7     0x80   /* P11 inverted*/
#define STATUS6     0x40   /* P10 */
#define STATUS5     0x20   /* P12 */
#define STATUS4     0x10   /* P13 */
#define STATUS3     0x08   /* P15 */
#define STATUS2     0x04   /*Interrupt*/
#define STATUS1     0x00   /*unused*/
#define STATUS0     0x00   /*unused*/

#define DATA0   0x01  /* pin 2 */
#define DATA1   0x02  /* pin 3 */
#define DATA2   0x04  /* pin 4 */
#define DATA3   0x08  /* pin 5 */
#define DATA4   0x10  /* pin 6 */
#define DATA5   0x20  /* pin 7 */
#define DATA6   0x40  /* pin 8 */
#define DATA7   0x80  /* pin 9 */
#define ON 1 
#define OFF 0

#define READ_CODE  0x0D       /* Read Instrunction (1100) for the Chip */
#define DT_CLK     100        /* micro second delay in 0 1 transition */
#define DT_DATA    100   /* micro seconds data ready delay */

#define CS(state)  (state) ?   outb( inb(DATA) |  DATA0 , DATA  ) :  \
                               outb( inb(DATA) & ~DATA0 , DATA )    
                      /*  Set Chip Select ... pin 2 */

#define CLK(state)  (state) ?  outb( inb(DATA) |  DATA1 , DATA  ) :  \
                              outb( inb(DATA) & ~DATA1 , DATA  )
                      /* Set Address Input .... pin 3 */

#define DI(state)  (state) ?  outb( inb(DATA) |  DATA2 , DATA  ) :  \
                               outb( inb(DATA) & ~DATA2 , DATA  )
                      /* Set Address Input .... pin 4 */

#define VCC(state)  (state) ?  outb( inb(DATA) |  DATA3 , DATA  ) :  \
                               outb( inb(DATA) & ~DATA3 , DATA  )
                      /* Set Address Input .... pin 5 */

#define DO ((inb(STATUS) & STATUS5) ? 1 : 0)  /* Get Register data ...  P12 */

#define TICK  CLK(OFF) ;   usleep(DT_CLK) ; CLK(ON) ; usleep(DT_CLK) ;     

union Data
{
    unsigned int i ;
    char      txt[2];
};

//=======================================
unsigned int read_register (unsigned int address)
//=======================================
{
  unsigned  int data ;
  unsigned char  state   ;    
  int i ;
  
  CLK(OFF) ;  // prepare Clock 
  CS(OFF) ; usleep(100) ; CS(ON) ; usleep(100) ;
 

  // Clockin Read Code
  for (i=3 ; i>=0 ; i--)
  {
     state = READ_CODE & (1 << i) ? ON : OFF ;
     printf("%i",state);
     DI(state) ; usleep(DT_DATA) ; 
     TICK ;   /* clock in the bit */
  }

     printf("-");
  // Clock in Address (Most significant bit first)
  for (i=6 ; i>=0 ; i--)
  {
     state = address & (1 << i) ? ON : OFF ;
     printf("%i",state);
     DI(state) ; usleep(DT_DATA) ; TICK ;  
  }

     printf(" >> ");
  // Clock out Data
  data = 0x00 ;
    printf (" :%i: ", DO) ;

  for (i=15 ; i>=0 ; i--)
  {
     TICK;
     if ( DO == 0 )
         data = data  & ~(1 << i) ;
     else
         data = data | (1 << i) ;
       printf("%i",DO) ;
  }
       printf("   ") ;
       return(data);
} // end of read_register


//===============================
 int test()
//===============================
{

  int i ;
  int delay ;

  delay = 3e5  ; // micro seconds
 
  /* Get access to the ports */
    if (ioperm(STATUS, 3, 1)) {perror("ioperm"); return(1); }
    if (ioperm(DATA,   3, 1)) {perror("ioperm"); return(1); }
       
     printf("Initial DATA: %x\n", inb(DATA));
     printf("Initial STATUS: %x\n", inb(STATUS));

     printf("Cycling DI and CS  and CLK lines \n");

   for (i=0; i<100 ; i++)
   {
      DI(ON) ; usleep(delay) ; DI(OFF) ; usleep(delay);
      CS(ON) ; usleep(delay) ; CS(OFF) ; usleep(delay);
      CLK(ON) ; usleep(delay) ; CLK(OFF) ; usleep(delay);
      VCC(ON) ; usleep(delay) ; VCC(OFF) ; usleep(delay);

      // Looping CLK back to DO test 
      CLK(ON); usleep(delay) ; printf("DO Line is : %i \n", DO);
      CLK(OFF);usleep(delay) ;  printf("DO Line is : %i \n", DO);

   }
  printf("Enter a val >>");
  scanf("%i", &i);
      
 /* We don't need the ports anymore  */
   if (ioperm(STATUS, 3, 0)) {perror("ioperm"); return(1);}
   if (ioperm(DATA,   3, 0)) {perror("ioperm"); return(1);}
       return(0);
}

//===============================
 int main(int argc, char* argv[])
//===============================
{

    int i ;
    unsigned int data ;
    union Data udata ;
     

  /* Get access to the ports */
    if (ioperm(STATUS, 3, 1)) {perror("ioperm"); return(1); }
    if (ioperm(DATA,   3, 1)) {perror("ioperm"); return(1); }
       
   VCC(ON) ; usleep(1000) ; CS(OFF) ; usleep(100) ; CS(ON); 
//   test() ;   /* Just in case you are back to square one */
   for (i=0 ; i< 128; i++)
  {
       data =  read_register(i) ;
       printf("Register  (%i)  >>>   %#x\n", i, data) ;
       //udata.i = data ;
       //printf("Register  (%i)  >>>   %s\n", i, udata.txt) ;
  }

    
 /* We don't need the ports anymore  */
   if (ioperm(STATUS, 3, 0)) {perror("ioperm"); return(1);}
   if (ioperm(DATA,   3, 0)) {perror("ioperm"); return(1);}
       return(0);
}
