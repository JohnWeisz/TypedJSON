import {LAZY_TYPE_EXPLANATION} from './helpers';
import {Serializable} from './types';

export abstract class TypeDescriptor {
    protected constructor(readonly ctor: Function) {
    }

    getTypes(): Array<Function> {
        return [this.ctor];
    }

    hasFriendlyName(): boolean {
        return this.ctor.name !== 'Object';
    }
}

export type Typelike = TypeDescriptor | Function;

export class ConcreteTypeDescriptor extends TypeDescriptor {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(ctor: Function) {
        super(ctor);
    }
}

export abstract class GenericTypeDescriptor extends TypeDescriptor {
    protected constructor(ctor: Function) {
        super(ctor);
    }
}

export class ArrayTypeDescriptor extends GenericTypeDescriptor {
    constructor(readonly elementType: TypeDescriptor) {
        super(Array);
    }

    getTypes(): Array<Function> {
        return super.getTypes().concat(this.elementType.getTypes());
    }
}

export function ArrayT(elementType: Typelike): ArrayTypeDescriptor {
    return new ArrayTypeDescriptor(ensureTypeDescriptor(elementType));
}

export class SetTypeDescriptor extends GenericTypeDescriptor {
    constructor(readonly elementType: TypeDescriptor) {
        super(Set);
    }

    getTypes(): Array<Function> {
        return super.getTypes().concat(this.elementType.getTypes());
    }
}

export function SetT(elementType: Typelike): SetTypeDescriptor {
    return new SetTypeDescriptor(ensureTypeDescriptor(elementType));
}

export const enum MapShape {
    /**
     * A map will be serialized as an array of {key: ..., value: ...} objects.
     */
    ARRAY,

    /**
     * A map will be serialized as a JSON object.
     */
    OBJECT,
}

export interface MapOptions {
    /**
     * How the map should be serialized. Default is ARRAY.
     */
    shape: MapShape;
}

export class MapTypeDescriptor extends GenericTypeDescriptor {
    constructor(
        readonly keyType: TypeDescriptor,
        readonly valueType: TypeDescriptor,
        readonly options?: Partial<MapOptions>,
    ) {
        super(Map);
    }

    getTypes(): Array<Function> {
        return super.getTypes().concat(this.keyType.getTypes(), this.valueType.getTypes());
    }

    getCompleteOptions(): MapOptions {
        return {
            shape: this.options?.shape ?? MapShape.ARRAY,
        };
    }
}

export function MapT(
    keyType: Typelike,
    valueType: Typelike,
    options?: Partial<MapOptions>,
): MapTypeDescriptor {
    return new MapTypeDescriptor(
        ensureTypeDescriptor(keyType),
        ensureTypeDescriptor(valueType),
        options,
    );
}

export const AnyT = new ConcreteTypeDescriptor(() => undefined);

// TODO support for dictionary types ie. maps that are plain objects
// export class DictionaryTypeDescriptor extends GenericTypeDescriptor {
//     constructor(public readonly elementType: TypeDescriptor) {
//         super(Object);
//     }
//
//     getTypes(): Function[] {
//         return super.getTypes().concat(this.elementType.getTypes());
//     }
// }
//
// export function DictT(elementType: Typelike): DictionaryTypeDescriptor {
//     return new DictionaryTypeDescriptor(ensureTypeDescriptor(elementType));
// }

export type TypeThunk = () => Serializable<any> | TypeDescriptor;
export type MaybeTypeThunk = Serializable<any> | TypeDescriptor | TypeThunk;

export function isTypelike(type: any): type is Typelike {
    return type != null && (typeof type === 'function' || type instanceof TypeDescriptor);
}

export function isTypeThunk(candidate: any): candidate is TypeThunk {
    return typeof candidate === 'function' && candidate.name === '';
}

export function ensureTypeDescriptor(type: Typelike): TypeDescriptor {
    return type instanceof TypeDescriptor ? type : new ConcreteTypeDescriptor(type);
}

export function ensureTypeThunk(
    typeThunkOrSerializable: MaybeTypeThunk | null | undefined,
    decoratorName: string,
): TypeThunk {
    if (typeThunkOrSerializable == null) {
        throw new Error(`No type given on ${decoratorName}. ${LAZY_TYPE_EXPLANATION}`);
    }

    if (isTypeThunk(typeThunkOrSerializable)) {
        return typeThunkOrSerializable;
    }

    return () => typeThunkOrSerializable;
}
