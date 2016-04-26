define(["require", "exports", "./typed-json/polyfill", "./typed-json/json-metadata", "./typed-json/decorators/json-member", "./typed-json/decorators/json-object", "./typed-json/serializer", "./typed-json/deserializer"], function (require, exports, polyfill_1, json_metadata_1, json_member_1, json_object_1, serializer_1, deserializer_1) {
    "use strict";
    exports.JsonMember = json_member_1.JsonMember;
    exports.JsonObject = json_object_1.JsonObject;
    if (!JSON) {
        JSON = polyfill_1.JSONpolyfill();
    }
    var TypedJSON = {
        stringify: function (value, settings) {
            if (json_metadata_1.JsonObjectMetadata.getFromInstance(value)) {
                return serializer_1.Serializer.writeObject(value, settings);
            }
            else {
                return JSON.stringify.apply(JSON, arguments);
            }
        },
        parse: function (text, type, settings) {
            var metadata = json_metadata_1.JsonObjectMetadata.getFromType(type);
            if (typeof type === "function" && metadata && metadata.classType === type) {
                return deserializer_1.Deserializer.readObject(text, type, settings);
            }
            else {
                return JSON.parse.apply(JSON, arguments);
            }
        }
    };
    exports.TypedJSON = TypedJSON;
});
