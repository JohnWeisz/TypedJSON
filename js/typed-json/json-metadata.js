define(["require", "exports", "./helpers"], function (require, exports, Helpers) {
    "use strict";
    var JsonMemberMetadata = (function () {
        function JsonMemberMetadata() {
        }
        return JsonMemberMetadata;
    }());
    exports.JsonMemberMetadata = JsonMemberMetadata;
    var JsonObjectMetadata = (function () {
        function JsonObjectMetadata() {
            this._dataMembers = {};
            this._knownTypes = [];
            this._knownTypeCache = null;
        }
        JsonObjectMetadata.getJsonObjectName = function (type, inherited) {
            if (inherited === void 0) { inherited = true; }
            var metadata = this.getFromType(type, inherited);
            if (metadata !== null) {
                return metadata.className;
            }
            else {
                return Helpers.getClassName(type);
            }
        };
        JsonObjectMetadata.getFromType = function (target, inherited) {
            if (inherited === void 0) { inherited = true; }
            var targetPrototype;
            if (typeof target === "function") {
                targetPrototype = target.prototype;
            }
            else {
                targetPrototype = target;
            }
            if (!targetPrototype) {
                return null;
            }
            if (targetPrototype.hasOwnProperty("__typedJsonJsonObjectMetadataInformation__")) {
                return targetPrototype.__typedJsonJsonObjectMetadataInformation__;
            }
            else if (inherited && targetPrototype.__typedJsonJsonObjectMetadataInformation__) {
                return targetPrototype.__typedJsonJsonObjectMetadataInformation__;
            }
            return null;
        };
        JsonObjectMetadata.getFromInstance = function (target, inherited) {
            if (inherited === void 0) { inherited = true; }
            return this.getFromType(Object.getPrototypeOf(target), inherited);
        };
        JsonObjectMetadata.getKnownTypeNameFromType = function (target) {
            var metadata = this.getFromType(target, false);
            if (metadata) {
                return metadata.className;
            }
            else {
                return Helpers.getClassName(target);
            }
        };
        JsonObjectMetadata.getKnownTypeNameFromInstance = function (target) {
            var metadata = this.getFromInstance(target, false);
            if (metadata) {
                return metadata.className;
            }
            else {
                return Helpers.getClassName(target.constructor);
            }
        };
        Object.defineProperty(JsonObjectMetadata.prototype, "dataMembers", {
            get: function () {
                return this._dataMembers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonObjectMetadata.prototype, "className", {
            get: function () {
                if (this._className !== null && typeof this._className !== "undefined") {
                    return this._className;
                }
                else {
                    return this.classType.toString().match(/function (\w*)/)[1];
                }
            },
            set: function (value) {
                this._className = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonObjectMetadata.prototype, "knownTypes", {
            get: function () {
                var knownTypes;
                var knownTypeName;
                if (false && this._knownTypeCache) {
                    return this._knownTypeCache;
                }
                else {
                    knownTypes = {};
                    this._knownTypes.forEach(function (knownType) {
                        knownTypeName = JsonObjectMetadata.getKnownTypeNameFromType(knownType);
                        knownTypes[knownTypeName] = knownType;
                    });
                    this._knownTypeCache = knownTypes;
                    return knownTypes;
                }
            },
            enumerable: true,
            configurable: true
        });
        JsonObjectMetadata.prototype.setKnownType = function (type) {
            if (this._knownTypes.indexOf(type) === -1) {
                this._knownTypes.push(type);
                this._knownTypeCache = null;
            }
        };
        JsonObjectMetadata.prototype.addMember = function (member) {
            var _this = this;
            Object.keys(this._dataMembers).forEach(function (propertyKey) {
                if (_this._dataMembers[propertyKey].name === member.name) {
                    throw new Error("A member with the name '" + member.name + "' already exists.");
                }
            });
            this._dataMembers[member.key] = member;
        };
        JsonObjectMetadata.prototype.sortMembers = function () {
            var _this = this;
            var memberArray = [];
            Object.keys(this._dataMembers).forEach(function (propertyKey) {
                memberArray.push(_this._dataMembers[propertyKey]);
            });
            memberArray = memberArray.sort(this.sortMembersCompare);
            this._dataMembers = {};
            memberArray.forEach(function (dataMember) {
                _this._dataMembers[dataMember.key] = dataMember;
            });
        };
        JsonObjectMetadata.prototype.sortMembersCompare = function (a, b) {
            if (typeof a.order !== "number" && typeof b.order !== "number") {
                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
            }
            else if (typeof a.order !== "number") {
                return 1;
            }
            else if (typeof b.order !== "number") {
                return -1;
            }
            else {
                if (a.order < b.order) {
                    return -1;
                }
                else if (a.order > b.order) {
                    return 1;
                }
                else {
                    if (a.name < b.name) {
                        return -1;
                    }
                    else if (a.name > b.name) {
                        return 1;
                    }
                }
            }
            return 0;
        };
        return JsonObjectMetadata;
    }());
    exports.JsonObjectMetadata = JsonObjectMetadata;
});
