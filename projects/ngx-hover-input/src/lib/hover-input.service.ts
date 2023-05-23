import { EventEmitter, Injectable, OnDestroy } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class HoverInputService implements OnDestroy {
	private receivers = new WeakMap<HTMLElement, EventEmitter<number>>();

	private mouseX = 0;
	private mouseY = 0;

	constructor() {
		document.addEventListener('mousemove', this.handleMousemove, {
			passive: true,
		});
		document.addEventListener('keydown', this.handleKeydown);
	}

	addReceiver(element: HTMLElement, eventEmitter: EventEmitter<number>) {
		this.receivers.set(element, eventEmitter);
	}

	removeReceiver(element: HTMLElement) {
		this.receivers.delete(element);
	}

	stringToNumber(text: string): number {
		return text === 'm' ? Number.MAX_SAFE_INTEGER : parseInt(text, 10);
	}

	findClosestReceiver(element: HTMLElement): HTMLElement | null {
		let parentElement: HTMLElement | null = element;
		do {
			if (this.receivers.has(parentElement)) {
				return parentElement;
			}
			parentElement = parentElement.parentElement;
		} while (parentElement != null);

		return null;
	}

	private handleMousemove = (event: MouseEvent) => {
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;
	};

	private handleKeydown = (event: KeyboardEvent) => {
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement
		) {
			return;
		}

		const value = this.stringToNumber(event.key);

		if (Number.isNaN(value)) {
			return;
		}

		const hoveredElement = document.elementFromPoint(this.mouseX, this.mouseY);

		if (!(hoveredElement instanceof HTMLElement)) {
			return;
		}

		const receiverElement = this.findClosestReceiver(hoveredElement);
		if (receiverElement != null) {
			event.preventDefault();
			this.receivers.get(receiverElement)?.emit(value);
		}
	};

	ngOnDestroy() {
		document.removeEventListener('mousemove', this.handleMousemove);
		document.removeEventListener('keydown', this.handleKeydown);
	}
}
