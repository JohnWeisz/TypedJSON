var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports", "./object-compare", "../typed-json"], factory);
    }
})(function (require, exports) {
    "use strict";
    var object_compare_1 = require("./object-compare");
    var typed_json_1 = require("../typed-json");
    var Person = (function () {
        function Person(firstName, lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }
        Person.prototype.getFullname = function () {
            return this.firstName + " " + this.lastName;
        };
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', String)
        ], Person.prototype, "firstName", void 0);
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', String)
        ], Person.prototype, "lastName", void 0);
        Person = __decorate([
            typed_json_1.JsonObject, 
            __metadata('design:paramtypes', [String, String])
        ], Person);
        return Person;
    }());
    function test(log) {
        var person = new Person("John", "Doe");
        var json = typed_json_1.TypedJSON.stringify(person);
        var clone = typed_json_1.TypedJSON.parse(json, Person);
        if (log) {
            console.log("Test: single class...");
            console.log(person);
            console.log(JSON.parse(json));
            console.log(clone);
            console.log("Test finished.");
        }
        return object_compare_1.isEqual(person, clone);
    }
    exports.test = test;
});
