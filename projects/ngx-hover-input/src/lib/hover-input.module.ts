import { NgModule } from '@angular/core';
import { HoverInputDirective } from './hover-input.directive';
import { HoverInputNumberDirective } from './hover-input-number.directive';

@NgModule({
	declarations: [HoverInputDirective, HoverInputNumberDirective],
	imports: [],
	exports: [HoverInputDirective, HoverInputNumberDirective],
})
export class NgxHoverInputModule {}
