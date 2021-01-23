import {TypedJSON} from '../../src';
import {Company} from './company.model';
import {PartTimeEmployee} from './part-time-employee.model';

describe('inheritance with circular references', () => {
    it('should deserialize correctly', () => {
        const result = TypedJSON.parse({
            owner: {
                name: 'George',
                type: 'PartTimeEmployee',
            },
        }, Company);

        expect(result.owner).toBeInstanceOf(PartTimeEmployee);
    });
});
