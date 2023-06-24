import { EventEmitter, Injectable, OnDestroy } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class HoverInputService implements OnDestroy {
	private receivers = new WeakMap<HTMLElement, EventEmitter<KeyboardEvent>>();
	private numberReceivers = new WeakMap<HTMLElement, EventEmitter<number>>();

	private mouseX = 0;
	private mouseY = 0;

	constructor() {
		document.addEventListener('mousemove', this.handleMousemove, {
			passive: true,
		});
		document.addEventListener('keydown', this.handleKeydown);
	}

	addReceiver(element: HTMLElement, eventEmitter: EventEmitter<KeyboardEvent>) {
		this.receivers.set(element, eventEmitter);
	}

	removeReceiver(element: HTMLElement) {
		this.receivers.delete(element);
	}

	addNumberReceiver(element: HTMLElement, eventEmitter: EventEmitter<number>) {
		this.numberReceivers.set(element, eventEmitter);
	}

	removeNumberReceiver(element: HTMLElement) {
		this.numberReceivers.delete(element);
	}

	findClosestReceiver(element: HTMLElement): HTMLElement | null {
		let parentElement: HTMLElement | null = element;
		do {
			if (
				this.receivers.has(parentElement) ||
				this.numberReceivers.has(parentElement)
			) {
				return parentElement;
			}
			parentElement = parentElement.parentElement;
		} while (parentElement != null);

		return null;
	}

	stringToNumber(text: string): number {
		return text === 'm' ? Number.MAX_SAFE_INTEGER : parseInt(text, 10);
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

		const hoveredElement = document.elementFromPoint(this.mouseX, this.mouseY);

		if (!(hoveredElement instanceof HTMLElement)) {
			return;
		}

		const receiverElement = this.findClosestReceiver(hoveredElement);
		if (receiverElement != null) {
			const receiver = this.receivers.get(receiverElement);
			if (receiver) {
				receiver.emit(event);
			}

			const numberReceiver = this.numberReceivers.get(receiverElement);
			if (numberReceiver) {
				const value = this.stringToNumber(event.key);

				if (!Number.isNaN(value)) {
					event.preventDefault();
					numberReceiver.emit(value);
				}
			}
		}
	};

	ngOnDestroy() {
		document.removeEventListener('mousemove', this.handleMousemove);
		document.removeEventListener('keydown', this.handleKeydown);
	}
}
