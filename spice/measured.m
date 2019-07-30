function  measured()

   signals.pin1.v = [ 0.8  1.4  0.0  2.6  0.5   1.6  1.4   1.4 ] ;
   signals.pin2.v = [ 0.8  1.5  0.0  2.6  0.0  -0.1  1.2  -0.1 ] ;

    [x,y1] = Data(signals.pin1.v) ;
    plot(x,y1, ";pin1;") ;
    grid on ; hold on ;
    [x,y2] = Data(signals.pin2.v) ;
    plot(x,y2, ";pin2;") ;
    hold off ;

    figure ;
    plot(x,(y1-y2),";v1-v2;");
    grid on ;
   
end

function [x, y] = Data (v)
    i = 1 ;
    k = 1 ;

    while (i < 34)
      for j = 1 : 2
       if (mod(i,2) == 0)
          x(i) = i+1 ;
       else
          x(i) = i  ;
       endif
       y(i) = v(k) ;
       i = i + 1;
      endfor

      k = k + 1 ;
      if (k > size(v,2))  
        k = 1 ; 
      endif
    endwhile
end
