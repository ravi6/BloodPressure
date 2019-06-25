#include <linux/interrupt.h>

int request_irq(unsigned int irq,
	        irqreturn_t (*handler)(int, void *, struct pt_regs *),
		unsigned long flags,
		const char *dev_name,
		void *dev_id);
void free_irq(unsigned int irq, void *dev_id) ;


if (short_irq >= 0) {
	result = request_irq(short_irq, short_interrupt,
				SA_INTERRUPT, "short", NULL);
	if (result) {
  	   printk(KERN_INFO "short: can't get assigned irq %i\n", short_irq)
	short_irq = -1;
}
else { /* actually enable it -- assume this *is* a parallel port */
	outb(0x10,short_base+2);
}
}
