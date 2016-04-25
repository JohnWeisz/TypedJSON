import { SerializerSettings } from "./types";
export declare abstract class Deserializer {
    static readObject<T>(json: string, type: {
        new (): T;
    }, settings?: SerializerSettings): T;
    private static readJsonToInstance(value, objectMetadata?, knownTypes?, settings?);
}
