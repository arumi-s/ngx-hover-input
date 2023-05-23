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
				<div id="value1">{{ value1 }}</div>
				<input id="input1" type="text" />
				<textarea id="textarea1"></textarea>
				<summary id="summary1"></summary>
			</div>
			<div id="box2" (hiHoverInput)="value2 = $event">
				<div id="value2">{{ value2 }}</div>
			</div>
			<div id="box3" (hiHoverInput)="value3 = $event">
				<div id="value3">{{ value3 }}</div>
				<div id="box4" (hiHoverInput)="value4 = $event">
					<div id="value4">{{ value4 }}</div>
				</div>
			</div>
		</div>
	`,
})
class ContainerComponent {
	value1 = -1;
	value2 = -2;
	value3 = -3;
	value4 = -4;
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
		expect(container.value1).toEqual(-1);
		expect(container.value2).toEqual(-2);
		expect(container.value3).toEqual(-3);
		expect(container.value4).toEqual(-4);
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	});

	it('should output pressed key to the hovered element (box1)', () => {
		EventHelper.moveMouseToElement(value1Element);
		const event1Proceeded = EventHelper.pressKey('5');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([false, true]);
		expect(container.value1).toEqual(5);
		expect(container.value2).toEqual(-2);
		expect(container.value3).toEqual(-3);
		expect(container.value4).toEqual(-4);
		expect(value1Element.innerText).toEqual('5');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	});

	it('should output pressed key to the hovered element (box3)', () => {
		EventHelper.moveMouseToElement(value3Element);
		const event1Proceeded = EventHelper.pressKey('7');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([false, true]);
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('7');
		expect(value4Element.innerText).toEqual('-4');
	});

	it('should output Infinity to the hovered element when "m" is pressed', fakeAsync(() => {
		EventHelper.moveMouseToElement(value4Element);
		const event4Proceeded = EventHelper.pressKey('m');

		fixture.detectChanges();

		expect(event4Proceeded).toEqual([false, true]);
		expect(container.value1).toEqual(-1);
		expect(container.value2).toEqual(-2);
		expect(container.value3).toEqual(-3);
		expect(container.value4).toEqual(Number.MAX_SAFE_INTEGER);
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual(Number.MAX_SAFE_INTEGER.toString());
	}));

	it('should output the last pressed key to the hovered element', fakeAsync(() => {
		EventHelper.moveMouseToElement(value2Element);
		const event2Proceededs = EventHelper.typeText('123456', 100);

		fixture.detectChanges();

		expect(event2Proceededs).toEqual([
			false,
			true,
			false,
			true,
			false,
			true,
			false,
			true,
			false,
			true,
			false,
			true,
		]);
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('6');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	}));

	it('should ignore non numeric input', fakeAsync(() => {
		EventHelper.moveMouseToElement(value4Element);
		const event4Proceeded = EventHelper.pressKey('x');

		fixture.detectChanges();

		expect(event4Proceeded).toEqual([true, true]);
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	}));

	it('should handle multiple input to different elements', fakeAsync(() => {
		EventHelper.moveMouseToElement(value1Element);
		const event1Proceeded = EventHelper.pressKey('2');
		tick(100);
		EventHelper.moveMouseToElement(value2Element);
		const event2Proceeded = EventHelper.pressKey('4');
		tick(100);
		EventHelper.moveMouseToElement(value3Element);
		const event3Proceeded = EventHelper.pressKey('6');
		tick(100);
		EventHelper.moveMouseToElement(value4Element);
		const event4Proceeded = EventHelper.pressKey('8');
		tick(100);

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([false, true]);
		expect(event2Proceeded).toEqual([false, true]);
		expect(event3Proceeded).toEqual([false, true]);
		expect(event4Proceeded).toEqual([false, true]);
		expect(value1Element.innerText).toEqual('2');
		expect(value2Element.innerText).toEqual('4');
		expect(value3Element.innerText).toEqual('6');
		expect(value4Element.innerText).toEqual('8');
	}));

	it('should ignore input to <input> elements', () => {
		const targetElement = <HTMLInputElement>element.querySelector('#input1');
		EventHelper.moveMouseToElement(targetElement);
		EventHelper.focusElement(targetElement);
		const event1Proceeded = EventHelper.pressKey('4');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([true, true]);
		expect(targetElement.value).toEqual('4');
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	});

	it('should ignore input to <textarea> elements', () => {
		const targetElement = <HTMLTextAreaElement>(
			element.querySelector('#textarea1')
		);
		EventHelper.moveMouseToElement(targetElement);
		EventHelper.focusElement(targetElement);
		const event1Proceeded = EventHelper.pressKey('4');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([true, true]);
		expect(targetElement.value).toEqual('4');
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	});

	it('should ignore out of viewport', fakeAsync(() => {
		EventHelper.moveMouseToPoint(100000, 100000);
		const event1Proceeded = EventHelper.pressKey('5');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([true, true]);
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	}));

	it('should ignore other elements', () => {
		EventHelper.moveMouseToElement(emptyElement);
		const event1Proceeded = EventHelper.pressKey('4');

		fixture.detectChanges();

		expect(event1Proceeded).toEqual([true, true]);
		expect(value1Element.innerText).toEqual('-1');
		expect(value2Element.innerText).toEqual('-2');
		expect(value3Element.innerText).toEqual('-3');
		expect(value4Element.innerText).toEqual('-4');
	});
});
