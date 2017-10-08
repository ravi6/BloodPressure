#include <stdio.h>
int  main()
{
  int N=6360 ;
  int sdi[N], sdo[N] ;
  int i, j, k, dummy ;

// Readup all of the data
  for (i=0 ; i<N ; i++)
  scanf("%i %i %i", &dummy, &sdi[i], &sdo[i]);

  k = 0 ;
  while (k < N)
{
// Look for di pattern [011]
  while ( (sdi[k]!=0 || sdi[k+1]!=1 || sdi[k+2]!=1) )
   {
      k = k + 1 ;
   }
// Now show the input instruction
   printf("DI ");
   for (i=0 ; i<3 ; i++) printf("%i",sdi[k+i]);
   printf("-");
   for (i=0 ; i<7 ; i++) printf("%i",sdi[k+i+4]);
   printf("\n");
   k = k + 64 ;  // Pointer to next reading
} // we are done looking
}
