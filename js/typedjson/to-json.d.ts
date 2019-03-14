/**
 * Options for the @toJson decorator.
 */
export interface IToJsonOptions {
    /**
     * When set to true it will overwrite any toJSON already existing on the prototype.
     */
    overwrite?: boolean;
}
/**
 * Decorator that will generate toJSON function on the class prototype that allows
 * JSON.stringify to be used instead of TypedJSON.stringify. Under the hood it will
 * simply delegate to TypedJSON.
 * By default it will throw if the prototype already has a toJSON function defined.
 * @param target the class which prototype should be modified.
 */
export declare function toJson<T extends Object>(target: Function): void;
/**
 * Decorator factory that accepts the options interface.
 * @param options for configuring the toJSON creation.
 */
export declare function toJson<T extends Object>(options: IToJsonOptions): ((target: Function) => void);
