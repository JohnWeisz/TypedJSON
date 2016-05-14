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
    var SmallNode = (function () {
        function SmallNode() {
        }
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', Number)
        ], SmallNode.prototype, "x", void 0);
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', Number)
        ], SmallNode.prototype, "y", void 0);
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', String)
        ], SmallNode.prototype, "inputType", void 0);
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', String)
        ], SmallNode.prototype, "outputType", void 0);
        SmallNode = __decorate([
            typed_json_1.JsonObject, 
            __metadata('design:paramtypes', [])
        ], SmallNode);
        return SmallNode;
    }());
    var BigNode = (function () {
        function BigNode() {
            this.inputs = [];
            this.outputs = [];
        }
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', Number)
        ], BigNode.prototype, "x", void 0);
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', Number)
        ], BigNode.prototype, "y", void 0);
        __decorate([
            typed_json_1.JsonMember({ elements: String }), 
            __metadata('design:type', Array)
        ], BigNode.prototype, "inputs", void 0);
        __decorate([
            typed_json_1.JsonMember({ elements: String }), 
            __metadata('design:type', Array)
        ], BigNode.prototype, "outputs", void 0);
        BigNode = __decorate([
            typed_json_1.JsonObject, 
            __metadata('design:paramtypes', [])
        ], BigNode);
        return BigNode;
    }());
    var GraphGrid = (function () {
        function GraphGrid() {
            this.points = [];
        }
        __decorate([
            typed_json_1.JsonMember({ elements: Object, refersAbstractType: true }), 
            __metadata('design:type', Array)
        ], GraphGrid.prototype, "points", void 0);
        __decorate([
            typed_json_1.JsonMember({ refersAbstractType: true }), 
            __metadata('design:type', Object)
        ], GraphGrid.prototype, "root", void 0);
        GraphGrid = __decorate([
            typed_json_1.JsonObject({
                knownTypes: [BigNode, SmallNode]
            }), 
            __metadata('design:paramtypes', [])
        ], GraphGrid);
        return GraphGrid;
    }());
    function randPortType() {
        var types = [
            "string",
            "integer",
            "float",
            "boolean",
            "void"
        ];
        return types[Math.floor(Math.random() * types.length)];
    }
    function test(log) {
        var graph = new GraphGrid();
        for (var i = 0; i < 20; i++) {
            var point = void 0;
            if (Math.random() < 0.25) {
                var bigNode = new BigNode();
                bigNode.inputs = [
                    randPortType(),
                    randPortType(),
                    randPortType()
                ];
                bigNode.outputs = [
                    randPortType(),
                    randPortType()
                ];
                point = bigNode;
            }
            else {
                var smallNode = new SmallNode();
                smallNode.inputType = randPortType();
                smallNode.outputType = randPortType();
                point = smallNode;
            }
            point.x = Math.random();
            point.y = Math.random();
            if (i === 0) {
                graph.root = point;
            }
            else {
                graph.points.push(point);
            }
        }
        typed_json_1.TypedJSON.config({
            enableTypeHints: true
        });
        var json = typed_json_1.TypedJSON.stringify(graph);
        var clone = typed_json_1.TypedJSON.parse(json, GraphGrid);
        if (log) {
            console.log("Test: polymorphism with interface property types...");
            console.log(graph);
            console.log(JSON.parse(json));
            console.log(clone);
            console.log("Test finished.");
        }
        return object_compare_1.isEqual(graph, clone);
    }
    exports.test = test;
});
