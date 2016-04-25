import { SerializerSettings } from "./types";
export declare abstract class Deserializer {
    /**
     * Deserialize a JSON string into the provided type.
     * @param json The JSON string to deserialize.
     * @param type The type to deserialize into.
     * @param settings Serializer settings.
     * @throws Error if the provided type is not decorated with JsonObject.
     * @throws Error if 'settings' specifies 'maxObjects', and the JSON string exceeds that limit.
     */
    static readObject<T>(json: string, type: {
        new (...args: any[]): T;
    }, settings?: SerializerSettings): T;
    private static countObjects(value);
    private static readJsonToInstance<T>(json, settings);
    private static valueIsDefined(value);
    private static trimTypeHintNamespace(typeHintValue, typeHintSyntax);
}
