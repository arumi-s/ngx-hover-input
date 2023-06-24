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
	selector: '[hiHoverInputNumber]',
})
export class HoverInputNumberDirective implements OnInit, OnDestroy {
	@Output()
	hiHoverInputNumber = new EventEmitter<number>();

	constructor(
		private readonly service: HoverInputService,
		private readonly elementRef: ElementRef<HTMLElement>
	) {}

	ngOnInit(): void {
		this.service.addNumberReceiver(
			this.elementRef.nativeElement,
			this.hiHoverInputNumber
		);
	}

	ngOnDestroy(): void {
		this.service.removeNumberReceiver(this.elementRef.nativeElement);
	}
}
