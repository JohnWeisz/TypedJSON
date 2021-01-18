import {JsonObjectMetadata} from './metadata';
import {Serializable} from './types';

export interface ObjectInheritanceOptions {

    /**
     * Given the data to be parsed, return the matching subtype.
     */
    resolveType: (type: any) => Serializable<any> | undefined;
}

export function jsonObjectInheritance(options: ObjectInheritanceOptions) {
    return (target: Serializable<any>) => {
        const objectMetadata = JsonObjectMetadata.ensurePresentInPrototype(target.prototype);

        objectMetadata.resolveType = options.resolveType;
    };
}
