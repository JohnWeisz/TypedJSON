import {JsonObjectMetadata} from './metadata';
import {Serializable} from './types';

export interface ObjectInheritanceOptions {

    /**
     * Function to be used to mutate the resulting serialization given the source object.
     */
    onSerializeType?: (source: any, result: {[k: string]: any}) => {[k: string]: any};

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
     * An arrow function returning an object with as key the discriminator and value the type to
     * instantiate.
     */
    types: () => {[k: string]: Serializable<any>};
}

/**
 * Handle subtype lookup by matching the value of the given property to the types map. e.g.
 * ```
 * discriminatorProperty({
 *     property: 'type',
 *     types: () => ({
 *         foo: Foo,
 *         bar: Bar,
 *     }),
 * })
 * ```
 * with the following data:
 * ```
 * {
 *     "type": "foo"
 * }
 * ```
 * This will result in TypedJSON looking up the value of `data.type`, here `foo`, in the map
 * provided by `types`, resulting in an object of type `Foo`. When serializing `Foo`, the `type`
 * property will be added with value `foo`.
 */
export function discriminatorProperty(
    {property, types}: DiscriminatorPropertyOptions,
): ObjectInheritanceOptions {
    let resolvedTypes: {[k: string]: Serializable<any>} | undefined;
    let reverseMapping: Map<Function, string> | undefined;

    const getResolvedTypes = () => {
        if (resolvedTypes === undefined) {
            resolvedTypes = types();
        }

        return resolvedTypes;
    };

    // Create a map for O(1) type-to-discriminator-lookup once.
    const getReverseMapping = () => {
        if (reverseMapping === undefined) {
            const reverseMapItems: Array<[Function, string]> = Object.keys(getResolvedTypes())
                .map(discriminator => {
                    return [getResolvedTypes()[discriminator].prototype.constructor, discriminator];
                });
            reverseMapping = new Map<Function, string>(reverseMapItems);
        }

        return reverseMapping;
    };

    return {
        onSerializeType: (source, result) => {
            result[property] = getReverseMapping().get(source.constructor);
            return result;
        },
        resolveType: data => {
            return getResolvedTypes()[data[property]];
        },
    };
}
