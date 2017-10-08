#include <stdio.h>
#include <unistd.h>
void main()
{
   unsigned int data ;
   int i, j ;
  for (j=0 ; j<8 ; j++)
  {
      for (i=0 ; i<8 ; i++)
      {
         scanf("%x", &data);
         printf("%04x ",data);
      }
         printf("\n", j, i);
   }

}
