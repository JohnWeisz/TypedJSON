import {jsonMember, jsonObject} from '../../src/typedjson';

export enum JustEnum {
    One,
    Two,
    Four = 4,
}

export const enum ConstEnum {
    One,
    Two,
    Four = 4,
}

export enum StrEnum {
    One = 'ONE',
    Two = 'TWO',
    Four = 'FOUR',
}

export const enum ConstStrEnum {
    One = 'ONE',
    Two = 'TWO',
    Four = 'FOUR',
}

export enum HeteroEnum {
    One = 1,
    Two,
    Four = 'FOUR',
}

export const enum ConstHeteroEnum {
    One = 1,
    Two,
    Four = 'FOUR',
}

export const symbolProp: unique symbol = Symbol('symbolProp');

export interface IEverything {
    strProp: string;
    numProp: number;
    boolProp: boolean;
    dateProp: Date;
    // nullable is not supported, use optional instead
    // nullable: {}|null;
    optional?: {};
    undefinable: {} | undefined;
    enum: JustEnum;
    constEnum: ConstEnum;
    strEnum: StrEnum;
    constStrEnum: ConstStrEnum;

    // Heterogenous enums are not supported right now
    // heteroEnum: HeteroEnum;
    // heteroEnum2: HeteroEnum;
    // constHeteroEnum: ConstHeteroEnum;
    // constHeteroEnum2: ConstHeteroEnum;

    // Symbol props are not supported
    // [symbolProp]: string;
}

@jsonObject
export class Everything implements IEverything {
    @jsonMember
    strProp: string;
    @jsonMember
    numProp: number;
    @jsonMember
    boolProp: boolean;
    @jsonMember
    dateProp: Date;
    // @jsonMember
    // nullable: {}|null;
    @jsonMember
    optional?: {};
    @jsonMember
    undefinable: {} | undefined;
    @jsonMember
    enum: JustEnum;
    @jsonMember
    constEnum: ConstEnum;
    @jsonMember
    strEnum: StrEnum;
    @jsonMember
    constStrEnum: ConstStrEnum;
    // @jsonMember
    // heteroEnum: HeteroEnum;
    // @jsonMember
    // heteroEnum2: HeteroEnum;
    // @jsonMember
    // constHeteroEnum: ConstHeteroEnum;
    // @jsonMember
    // constHeteroEnum2: ConstHeteroEnum;
    // @jsonMember
    // [symbolProp]: string;

    constructor(init?: IEverything) {
        if (init !== undefined) {
            Object.assign(this, init);
        }
    }

    static create(): IEverything {
        return {
            strProp: 'string',
            numProp: 123,
            boolProp: true,
            dateProp: new Date(1543912019),
            // nullable: null,
            undefinable: undefined,
            enum: JustEnum.Four,
            constEnum: ConstEnum.Four,
            strEnum: StrEnum.Four,
            constStrEnum: ConstStrEnum.Four,
            // heteroEnum: HeteroEnum.Two,
            // heteroEnum2: HeteroEnum.Four,
            // constHeteroEnum: ConstHeteroEnum.Two,
            // constHeteroEnum2: ConstHeteroEnum.Four,
            // [symbolProp]: 'symbol string',
        };
    }

    static expected(): Everything {
        const obj = Everything.create();
        // properties that are undefined are not serialized
        delete obj.undefinable;
        return new Everything(obj);
    }

    foo() {
        return 'Just to be sure';
    }
}
