import { RequiredNoNull } from './helpers';
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
export declare function extractOptionBase(from: {
    [key: string]: any;
} & OptionsBase): OptionsBase | undefined;
export declare function getDefaultOptionOf<K extends keyof OptionsBase>(key: K): RequiredNoNull<OptionsBase>[K];
export declare function getOptionValue<K extends keyof OptionsBase>(key: K, options?: OptionsBase | null): RequiredNoNull<OptionsBase>[K];
export declare function mergeOptions(existing?: OptionsBase, moreSpecific?: OptionsBase | null): OptionsBase | undefined;
