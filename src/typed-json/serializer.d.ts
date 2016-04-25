import { SerializerSettings } from "./types";
export declare abstract class Serializer {
    static writeObject(object: any, settings?: SerializerSettings): string;
    /**
     * Convert a @JsonObject class instance to a JSON object for serialization.
     * @param object The instance to convert.
     * @param settings Settings defining how the instance should be serialized.
     */
    private static writeToJsonObject<T>(object, settings);
    private static getTypeHint(typeHint, value);
}
