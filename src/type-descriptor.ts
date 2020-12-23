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

export function isTypelike(type: any): type is Typelike {
    return type != null && (typeof type === 'function' || type instanceof TypeDescriptor);
}

export function ensureTypeDescriptor(type: Typelike): TypeDescriptor {
    return type instanceof TypeDescriptor ? type : new ConcreteTypeDescriptor(type);
}
