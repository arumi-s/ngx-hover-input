import { TestBed } from '@angular/core/testing';

import { HoverInputService } from './hover-input.service';

describe('HoverInputService', () => {
	let service: HoverInputService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(HoverInputService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('method stringToNumber convert string to integer', () => {
		expect(service.stringToNumber('0')).toEqual(0);
		expect(service.stringToNumber('1')).toEqual(1);
		expect(service.stringToNumber('23')).toEqual(23);
		expect(service.stringToNumber('m')).toEqual(Number.MAX_SAFE_INTEGER);
		expect(service.stringToNumber('a')).toBeNaN();
		expect(service.stringToNumber('x')).toBeNaN();
	});
});
