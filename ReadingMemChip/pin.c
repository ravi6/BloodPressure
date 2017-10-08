/*
 *  *   Read Clock Signal
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

//#define CS (read_status(6))  /*P10*/
//#define CLK (read_status(5)) /*P12*/
//#define DI (read_status(4))  /*P13*/
//#define DO (read_status(3))  /*P15*/
#define CS (inb(STATUS) & STATUS6)
#define CLK (inb(STATUS) & STATUS5)
#define DI (inb(STATUS) & STATUS4)
#define DO (inb(STATUS) & STATUS3)

//===========================
void set_data(int i, int bit)
//===========================
{ /* set DATA line bits */
int mask[8] = {DATA0, DATA1, DATA2, DATA3, DATA4, \
               DATA5, DATA6, DATA7} ;
if (i)
     outb( (inb(DATA) | mask[bit]), DATA ) ; /*ON*/
else
    outb( (inb(DATA) & ~mask[bit]), DATA ) ; /*OFF*/
} // end set_data


//===============================
int main(int argc, char* argv[])
//===============================
{
 int N , k;
 N = atoi(argv[1]);  
      
     unsigned int i ;
  /* Get access to the ports */
    if (ioperm(STATUS, 3, 1)) {perror("ioperm"); return(1); }
    if (ioperm(DATA, 3, 1)) {perror("ioperm"); return(1); }
       
     outb(N, DATA);
     printf("Initial DATA: %x\n", inb(DATA));
     printf("Initial STATUS: %x\n", inb(STATUS));

 /* We don't need the ports anymore  */
   if (ioperm(STATUS, 3, 0)) {perror("ioperm"); return(1);}
     if (ioperm(DATA, 3, 0)) {perror("ioperm"); return(1);}
       return(0);

}
