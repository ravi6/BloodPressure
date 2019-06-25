org     0x000 
         goto    init 
         
     ISR_DATA udata_shr 
     SAVE_W      res     1 
     SAVE_STATUS res     1 
     SAVE_PCLATH res     1 
     gOneMsTicks res     4 
         
     ISR_CODE code 
         org     0x004 
     ;   
     ; Save interrupt context 
     ;   
         movwf   SAVE_W 
         movfw   STATUS 
         movwf   SAVE_STATUS 
         movfw   PCLATH 
         movwf   SAVE_PCLATH 
         
     ; Handle interrupt requests 
         
     ;   
     ; TIMER0 interrupt handler 
     ;   
         clrf    STATUS 
         clrf    PCLATH 
         btfsc   INTCON,T0IE 
         btfss   INTCON,T0IF 
         goto    ISR_TMR0_Done 
         bcf     INTCON,T0IF 
         incf    gOneMsTicks,F 
         skpnz 
         incf    gOneMsTicks+1,F 
         skpnz 
         incf    gOneMsTicks+2,F 
         skpnz 
         incf    gOneMsTicks+3,F 
         movlw   -62 
         addwf   TMR0,F 
     ISR_TMR0_Done: 
     ;   
     ; Next interrupt handler goes here 
     ;   
         
     ;   
     ; Restore interrupt context 
     ;   
     ISR_Done: 
         movfw   SAVE_PCLATH 
         movwf   PCLATH 
         movfw   SAVE_STATUS 
         movwf   STATUS 
         swapf   SAVE_W,F 
         swapf   SAVE_W,W 
         retfie 
         
     INIT_CODE code 
     init: 
         banksel OPTION_REG 
         bsf     OPTION_REG,PS0 
         bsf     OPTION_REG,PS1 
         bcf     OPTION_REG,PS2  ; TMR0 prescale 1:16 
         bcf     OPTION_REG,PSA  ; TIMER0 prescale 
         bcf     OPTION_REG,T0CS ; TIMER0 clock source is FCYC, (FOSC/4) 
         clrf    TRISA           ; Make all GPIOs outputs 
         clrf    TRISB 
         banksel CMCON 
         movlw   0x07            ; turn off comparator 
         movwf   CMCON 
         bcf     INTCON,T0IF 
         bsf     INTCON,T0IE 
         clrf    gOneMsTicks 
         clrf    gOneMsTicks+1 
         clrf    gOneMsTicks+2 
         clrf    gOneMsTicks+3 
         nop 
         nop 
         movlw   -60 
         movwf   TMR0 
         
         bsf     INTCON,GIE 
         goto    main 
         
     MAIN_DATA   udata 
     TimeStamp   res     1 
     Count10ms   res     1 
         
     MAIN_CODE   code    
     ;   
     ; Main application loop 
     ;   
     ; This is a simple test application that 
     ; counts 10 millisecond intervals. 
     ;   
     main: 
         banksel Count10ms 
         clrf    Count10ms 
         
     loop: 
         movfw   gOneMsTicks         ; Sample the system tick 
         movwf   TimeStamp 
         
     WaitFor10ms: 
         movfw   TimeStamp           ; Calculate the delta time 
         subwf   gOneMsTicks,W       ; from sample. 
         addlw   -10                 ; Check if the delta is 
         skpc                        ; more than 10 milliseconds. 
         goto    WaitFor10ms 
         incf    Count10ms,F         ; Count each 10 millisecond interval. 
         
         goto    loop 
         
         end 
     
