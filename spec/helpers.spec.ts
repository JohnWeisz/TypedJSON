import {shouldOmitParseString} from '../src/typedjson/helpers';

describe('helpers', () => {
    describe('shouldOmitParseString', () => {
        it('should handle plain numbers', () => {
            expect(shouldOmitParseString('50', Number)).toEqual(false);
        });
        it('should handle numbers with decimal places', () => {
            expect(shouldOmitParseString('50.120', Number)).toEqual(false);
        });
        it('should handle negative numbers', () => {
            expect(shouldOmitParseString('-50', Number)).toEqual(false);
        });
        it('should handle negative numbers with decimal places', () => {
            expect(shouldOmitParseString('-50.120', Number)).toEqual(false);
        });
        it('should handle numbers with a plus', () => {
            expect(shouldOmitParseString('-50', Number)).toEqual(false);
        });
        it('should handle negative numbers with a plus and decimal places', () => {
            expect(shouldOmitParseString('+50.120', Number)).toEqual(false);
        });
        it('should handle exponential notation', () => {
            expect(shouldOmitParseString('1e2', Number)).toEqual(false);
        });
        it('should handle exponential notation with decimal places', () => {
            expect(shouldOmitParseString('1.120e2', Number)).toEqual(false);
        });
        it('should handle negative exponential notation', () => {
            expect(shouldOmitParseString('-1e2', Number)).toEqual(false);
        });
        it('should handle negative exponential notation with decimal places', () => {
            expect(shouldOmitParseString('-1.120e2', Number)).toEqual(false);
        });
        it('should handle positive exponential notation', () => {
            expect(shouldOmitParseString('+1e2', Number)).toEqual(false);
        });
        it('should handle positive exponential notation with decimal places', () => {
            expect(shouldOmitParseString('+1.120e2', Number)).toEqual(false);
        });

        it('should handle plain numeric dates', () => {
            expect(shouldOmitParseString('50', Date)).toEqual(false);
        });
        it('should handle negative dates', () => {
            expect(shouldOmitParseString('-50', Date)).toEqual(false);
        });
        it('should handle dates with a plus', () => {
            expect(shouldOmitParseString('-50', Date)).toEqual(false);
        });
        it('should handle dates in exponential notation', () => {
            expect(shouldOmitParseString('1e2', Date)).toEqual(false);
        });
        it('should handle dates in negative exponential notation', () => {
            expect(shouldOmitParseString('-1e2', Date)).toEqual(false);
        });
        it('should handle dates in positive exponential notation', () => {
            expect(shouldOmitParseString('+1e2', Date)).toEqual(false);
        });
    });
});
