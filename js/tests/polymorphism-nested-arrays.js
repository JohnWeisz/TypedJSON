var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    var Node = (function () {
        function Node() {
        }
        __decorate([
            typed_json_1.JsonMember, 
            __metadata('design:type', String)
        ], Node.prototype, "name", void 0);
        return Node;
    }());
    var SmallNode = (function (_super) {
        __extends(SmallNode, _super);
        function SmallNode() {
            _super.apply(this, arguments);
        }
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
    }(Node));
    var BigNode = (function (_super) {
        __extends(BigNode, _super);
        function BigNode() {
            _super.call(this);
            this.inputs = [];
            this.outputs = [];
        }
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
    }(Node));
    var Graph = (function () {
        function Graph() {
            this.items = [];
            this.smallItems = [];
        }
        __decorate([
            typed_json_1.JsonMember({ elements: { elements: Node } }), 
            __metadata('design:type', Array)
        ], Graph.prototype, "items", void 0);
        __decorate([
            typed_json_1.JsonMember({ elements: { elements: SmallNode } }), 
            __metadata('design:type', Array)
        ], Graph.prototype, "smallItems", void 0);
        Graph = __decorate([
            typed_json_1.JsonObject({ knownTypes: [BigNode, SmallNode] }), 
            __metadata('design:paramtypes', [])
        ], Graph);
        return Graph;
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
        var graph = new Graph();
        for (var i = 0; i < 20; i++) {
            graph.smallItems.push([]);
            for (var j = 0; j < 8; j++) {
                var node = new SmallNode();
                node.name = "smallnode_" + i + "_" + j;
                node.inputType = randPortType();
                node.outputType = randPortType();
                graph.smallItems[i].push(node);
            }
        }
        for (var i = 0; i < 20; i++) {
            graph.items.push([]);
            for (var j = 0; j < 8; j++) {
                var node = void 0;
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
                    node = bigNode;
                }
                else {
                    var smallNode = new SmallNode();
                    smallNode.inputType = randPortType();
                    smallNode.outputType = randPortType();
                    node = smallNode;
                }
                node.name = "node_" + i + "_" + j;
                graph.items[i].push(node);
            }
        }
        typed_json_1.TypedJSON.config({
            enableTypeHints: true
        });
        var json = typed_json_1.TypedJSON.stringify(graph);
        if (log) {
            console.log("Test: polymorphism with nested arrays...");
            console.log(graph);
            console.log(JSON.parse(json));
        }
        var clone = typed_json_1.TypedJSON.parse(json, Graph);
        if (log) {
            console.log(clone);
            console.log("Test finished.");
        }
        return object_compare_1.isEqual(graph, clone);
    }
    exports.test = test;
});
