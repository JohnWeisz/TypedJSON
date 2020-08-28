import {RequiredNoNull} from './helpers';

/**
 * This options cascade through the annotations. Options set
 * in the more specific place override the previous option.
 * Ex. @jsonMember overrides TypedJson options.
 */
export interface OptionsBase {
    /**
     * Whether to preserve null in the JSON output. When false it
     * will not emit nor store the property if its value is null.
     * Default: false.
     */
    preserveNull?: boolean | null;
}

const kAllOptions: Array<keyof OptionsBase> = [
    'preserveNull',
];

export function extractOptionBase(
    from: {[key: string]: any} & OptionsBase,
): OptionsBase | undefined {
    const options = Object.keys(from)
        .filter(key => (kAllOptions as Array<string>).indexOf(key) > -1)
        .reduce((obj, key) => {
            obj[key] = from[key];
            return obj;
        }, {} as any);
    return Object.keys(options).length > 0 ? options : undefined;
}

export function getDefaultOptionOf<K extends keyof OptionsBase>(
    key: K,
): RequiredNoNull<OptionsBase>[K] {
    switch (key) {
        case 'preserveNull':
            return false;
    }
    // never reached
    return null as any;
}

export function getOptionValue<K extends keyof OptionsBase>(
    key: K,
    options?: OptionsBase | null,
): RequiredNoNull<OptionsBase>[K] {
    if (options != null && options[key] as any != null) {
        return options[key]!;
    }

    return getDefaultOptionOf(key);
}

export function mergeOptions(
    existing?: OptionsBase,
    moreSpecific?: OptionsBase | null,
): OptionsBase | undefined {
    return moreSpecific == null
        ? existing
        : {

            ...existing,
            ...moreSpecific,
        };
}
