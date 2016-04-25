define(["require", "exports", "./typed-json/polyfill", "./typed-json/json-metadata", "./typed-json/decorators/json-member", "./typed-json/decorators/json-object", "./typed-json/serializer", "./typed-json/deserializer"], function (require, exports, polyfill_1, json_metadata_1, json_member_1, json_object_1, serializer_1, deserializer_1) {
    "use strict";
    exports.JsonMember = json_member_1.JsonMember;
    exports.JsonObject = json_object_1.JsonObject;
    if (!JSON) {
        JSON = polyfill_1.JSONpolyfill();
    }
    var TypedJSON = {
        stringify: function (value, settings) {
            if (json_metadata_1.JsonObjectMetadata.getJsonObjectMetadataFromInstance(value)) {
                // Use Serializer for custom serialization.
                return serializer_1.Serializer.writeObject(value, settings);
            }
            else {
                // Call original 'JSON.stringify'.
                return JSON.stringify.apply(JSON, arguments);
            }
        },
        parse: function (text, type, settings) {
            var metadata = json_metadata_1.JsonObjectMetadata.getJsonObjectMetadataFromType(type);
            if (typeof type === "function" && metadata && metadata.classType === type) {
                // Use Deserializer for custom deserialization using the provided class type.
                return deserializer_1.Deserializer.readObject(text, type, settings);
            }
            else {
                // Call original 'JSON.parse'.
                return JSON.parse.apply(JSON, arguments);
            }
        }
    };
    exports.TypedJSON = TypedJSON;
});
