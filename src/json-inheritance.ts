import {JsonObjectMetadata} from './metadata';
import {Serializable} from './types';

export interface ObjectInheritanceOptions {

    /**
     * Function to be used to mutate the resulting serialization given the source object.
     */
    onSerializeType?: (source: any, result: {[k: string]: any}) => void;

    /**
     * Given the data to be parsed, return the matching subtype.
     */
    resolveType: (data: any) => Serializable<any> | undefined;
}

export function jsonInheritance(options: ObjectInheritanceOptions) {
    return (target: Serializable<any>) => {
        const objectMetadata = JsonObjectMetadata.ensurePresentInPrototype(target.prototype);

        objectMetadata.onSerializeType = options.onSerializeType;
        objectMetadata.resolveType = options.resolveType;
    };
}

export interface DiscriminatorPropertyOptions {
    /**
     * The name of the property containing the discriminator.
     */
    property: string;

    /**
     * An arrow function returning an object matching a discriminator to its subtype.
     */
    types: () => {[k: string]: Serializable<any>};
}

export function discriminatorProperty(
    {property, types}: DiscriminatorPropertyOptions,
): ObjectInheritanceOptions {
    let reverseMapping: Map<Function, string> | undefined;

    // Create a map for O(1) type-to-discriminator-lookup once.
    const getReverseMapping = () => {
        if (reverseMapping === undefined) {
            const reverseMapItems: Array<[Function, string]> = Object.keys(types())
                .map(discriminator => {
                    return [types()[discriminator].prototype.constructor, discriminator];
                });
            reverseMapping = new Map<Function, string>(reverseMapItems);
        }

        return reverseMapping;
    };

    return {
        onSerializeType: (source, result) => {
            result[property] = getReverseMapping().get(source.constructor);
        },
        resolveType: data => {
            return types()[data[property]];
        },
    };
}
