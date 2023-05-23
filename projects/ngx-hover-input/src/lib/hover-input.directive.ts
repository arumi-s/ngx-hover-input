import {
	Directive,
	ElementRef,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core';

import { HoverInputService } from './hover-input.service';

@Directive({
	selector: '[hiHoverInput]',
})
export class HoverInputDirective implements OnInit, OnDestroy {
	@Output()
	hiHoverInput = new EventEmitter<number>();

	constructor(
		private readonly service: HoverInputService,
		private readonly elementRef: ElementRef<HTMLElement>
	) {}

	ngOnInit(): void {
		this.service.addReceiver(this.elementRef.nativeElement, this.hiHoverInput);
	}

	ngOnDestroy(): void {
		this.service.removeReceiver(this.elementRef.nativeElement);
	}
}
