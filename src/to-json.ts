import {TypedJSON} from './parser';

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
export function toJson<T extends Object>(target: Function): void;
/**
 * Decorator factory that accepts the options interface.
 * @param options for configuring the toJSON creation.
 */
export function toJson<T extends Object>(options: IToJsonOptions): ((target: Function) => void);
export function toJson<T extends Object>(
    optionsOrTarget: IToJsonOptions | Function,
): ((target: Function) => void) | void {
    if (typeof optionsOrTarget === 'function') {
        // used directly
        toJsonDecorator(optionsOrTarget, {});
        return;
    }
    // used as a factory
    return (target: Function) => {
        toJsonDecorator(target, optionsOrTarget);
    };
}

function toJsonDecorator<T extends Object>(target: Function, options: IToJsonOptions): void {
    if (options.overwrite !== true && target.prototype.toJSON !== undefined) {
        throw new Error(`${target.name} already has toJSON defined!`);
    }
    target.prototype.toJSON = function toJSON() {
        return TypedJSON.toPlainJson(this, Object.getPrototypeOf(this).constructor);
    };
}
