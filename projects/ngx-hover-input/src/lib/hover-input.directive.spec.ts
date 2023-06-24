import {
	ComponentFixture,
	ComponentFixtureAutoDetect,
	TestBed,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { HoverInputDirective } from './hover-input.directive';
import { HoverInputService } from './hover-input.service';
import { Component } from '@angular/core';

@Component({
	selector: 'hi-test-container',
	template: `
		<div>
			<div id="empty">empty</div>
			<div id="box1" (hiHoverInput)="value1 = $event">
				<div id="value1">{{ value1?.key ?? 'null' }}</div>
				<input id="input1" type="text" />
				<textarea id="textarea1"></textarea>
				<summary id="summary1"></summary>
			</div>
			<div id="box2" (hiHoverInput)="value2 = $event">
				<div id="value2">{{ value2?.key ?? 'null' }}</div>
			</div>
			<div id="box3" (hiHoverInput)="value3 = $event">
				<div id="value3">{{ value3?.key ?? 'null' }}</div>
				<div id="box4" (hiHoverInput)="value4 = $event">
					<div id="value4">{{ value4?.key ?? 'null' }}</div>
				</div>
			</div>
		</div>
	`,
})
class ContainerComponent {
	value1: KeyboardEvent | null = null;
	value2: KeyboardEvent | null = null;
	value3: KeyboardEvent | null = null;
	value4: KeyboardEvent | null = null;
}

describe('HoverInputDirective', () => {
	let service: HoverInputService;
	let fixture: ComponentFixture<ContainerComponent>;
	let container: ContainerComponent;
	let element: HTMLElement;
	let document: Document;
	let emptyElement: HTMLElement;
	let value1Element: HTMLElement;
	let value2Element: HTMLElement;
	let value3Element: HTMLElement;
	let value4Element: HTMLElement;

	const EventHelper = {
		moveMouseToElement(element: HTMLElement) {
			const rect = element.getBoundingClientRect();
			return EventHelper.moveMouseToPoint(
				rect.left + rect.width / 2,
				rect.top + rect.height / 2
			);
		},
		moveMouseToPoint(x: number, y: number) {
			return document.dispatchEvent(
				new MouseEvent('mousemove', {
					clientX: x,
					clientY: y,
					cancelable: true,
				})
			);
		},
		focusElement(element: HTMLElement) {
			element.click();
			element.focus();
		},
		typeText(text: string, delay: number) {
			const result: boolean[] = [];
			for (let index = 0; index < text.length; index++) {
				if (index !== 0) {
					tick(delay);
				}
				result.push(...EventHelper.pressKey(text[index]));
			}
			return result;
		},
		pressKey(key: string) {
			const element = document.activeElement ?? document;
			const result: boolean[] = [];
			result.push(
				element.dispatchEvent(
					new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
				)
			);
			result.push(
				element.dispatchEvent(
					new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true })
				)
			);

			if (
				element instanceof HTMLInputElement ||
				element instanceof HTMLTextAreaElement
			) {
				element.value += key;
				element.dispatchEvent(
					new InputEvent('input', { bubbles: false, cancelable: true })
				);
			}
			return result;
		},
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [ContainerComponent, HoverInputDirective],
			providers: [
				HoverInputService,
				{ provide: ComponentFixtureAutoDetect, useValue: true },
			],
		});

		service = TestBed.inject(HoverInputService);
		fixture = TestBed.createComponent(ContainerComponent);
		container = fixture.componentInstance;
		element = fixture.nativeElement;
		document = element.ownerDocument;

		fixture.detectChanges();

		emptyElement = <HTMLDivElement>element.querySelector('#empty');
		value1Element = <HTMLDivElement>element.querySelector('#value1');
		value2Element = <HTMLDivElement>element.querySelector('#value2');
		value3Element = <HTMLDivElement>element.querySelector('#value3');
		value4Element = <HTMLDivElement>element.querySelector('#value4');
	});

	it('should create component with default value', () => {
		expect(container.value1).toBeNull();
		expect(container.value2).toBeNull();
		expect(container.value3).toBeNull();
		expect(container.value4).toBeNull();
		expect(value1Element.innerText).toEqual('null');
		expect(value2Element.innerText).toEqual('null');
		expect(value3Element.innerText).toEqual('null');
		expect(value4Element.innerText).toEqual('null');
	});

	it('should output KeyboardEvent to the hovered element (box1)', () => {
		EventHelper.moveMouseToElement(value1Element);
		const event1Proceeded = EventHelper.pressKey('5');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([true, true]);
		expect(container.value1).toBeInstanceOf(KeyboardEvent);
		expect(container.value2).toBeNull();
		expect(container.value3).toBeNull();
		expect(container.value4).toBeNull();
		expect(value1Element.innerText).toEqual('5');
		expect(value2Element.innerText).toEqual('null');
		expect(value3Element.innerText).toEqual('null');
		expect(value4Element.innerText).toEqual('null');
	});

	it('should output KeyboardEvent to the hovered element (box3)', () => {
		EventHelper.moveMouseToElement(value3Element);
		const event1Proceeded = EventHelper.pressKey('g');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([true, true]);
		expect(container.value1).toBeNull();
		expect(container.value2).toBeNull();
		expect(container.value3).toBeInstanceOf(KeyboardEvent);
		expect(container.value4).toBeNull();
		expect(value1Element.innerText).toEqual('null');
		expect(value2Element.innerText).toEqual('null');
		expect(value3Element.innerText).toEqual('g');
		expect(value4Element.innerText).toEqual('null');
	});

	it('should output KeyboardEvent to the hovered element (box4)', () => {
		EventHelper.moveMouseToElement(value4Element);
		const event1Proceeded = EventHelper.pressKey('Enter');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([true, true]);
		expect(container.value1).toBeNull();
		expect(container.value2).toBeNull();
		expect(container.value3).toBeNull();
		expect(container.value4).toBeInstanceOf(KeyboardEvent);
		expect(value1Element.innerText).toEqual('null');
		expect(value2Element.innerText).toEqual('null');
		expect(value3Element.innerText).toEqual('null');
		expect(value4Element.innerText).toEqual('Enter');
	});
});
