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
define(["require", "exports", "./object-compare", "../typed-json"], function (require, exports, object_compare_1, typed_json_1) {
    "use strict";
    var Person = (function () {
        function Person() {
        }
        return Person;
    }());
    var Employee = (function (_super) {
        __extends(Employee, _super);
        function Employee(salary, joined) {
            _super.call(this);
            if (salary && joined) {
                this.salary = salary;
                this.joined = joined;
            }
        }
        __decorate([
            typed_json_1.JsonMember(), 
            __metadata('design:type', Number)
        ], Employee.prototype, "salary", void 0);
        __decorate([
            typed_json_1.JsonMember(), 
            __metadata('design:type', Date)
        ], Employee.prototype, "joined", void 0);
        Employee = __decorate([
            typed_json_1.JsonObject(), 
            __metadata('design:paramtypes', [Number, Date])
        ], Employee);
        return Employee;
    }(Person));
    var PartTimeEmployee = (function (_super) {
        __extends(PartTimeEmployee, _super);
        function PartTimeEmployee() {
            _super.apply(this, arguments);
        }
        __decorate([
            typed_json_1.JsonMember({ name: "work-hours" }), 
            __metadata('design:type', Number)
        ], PartTimeEmployee.prototype, "workHours", void 0);
        PartTimeEmployee = __decorate([
            typed_json_1.JsonObject({ name: "part-time-employee" }), 
            __metadata('design:paramtypes', [])
        ], PartTimeEmployee);
        return PartTimeEmployee;
    }(Employee));
    var Investor = (function (_super) {
        __extends(Investor, _super);
        function Investor(investAmount) {
            _super.call(this);
            this.investAmount = investAmount || 0;
        }
        __decorate([
            typed_json_1.JsonMember({ name: "invest-amount" }), 
            __metadata('design:type', Number)
        ], Investor.prototype, "investAmount", void 0);
        Investor = __decorate([
            typed_json_1.JsonObject(), 
            __metadata('design:paramtypes', [Number])
        ], Investor);
        return Investor;
    }(Person));
    var Company = (function () {
        function Company() {
            this.employees = [];
        }
        __decorate([
            typed_json_1.JsonMember(), 
            __metadata('design:type', String)
        ], Company.prototype, "name", void 0);
        __decorate([
            typed_json_1.JsonMember({ elementType: Employee }), 
            __metadata('design:type', Array)
        ], Company.prototype, "employees", void 0);
        __decorate([
            typed_json_1.JsonMember(), 
            __metadata('design:type', Person)
        ], Company.prototype, "owner", void 0);
        Company = __decorate([
            typed_json_1.JsonObject({ name: "company", knownTypes: [PartTimeEmployee, Investor, Employee] }), 
            __metadata('design:paramtypes', [])
        ], Company);
        return Company;
    }());
    var company = new Company();
    company.name = "Json Types";
    switch (Math.floor(Math.random() * 4)) {
        case 0:
            company.owner = new Employee(240000, new Date(1992, 5, 27));
            break;
        case 1:
            company.owner = new Investor(1700000);
            break;
        case 2:
            company.owner = new PartTimeEmployee(160000, new Date(1992, 5, 27));
            break;
        default:
            company.owner = new Person();
            break;
    }
    for (var j = 0; j < 20; j++) {
        if (Math.random() < 0.2) {
            var newPartTimeEmployee = new PartTimeEmployee(Math.floor(Math.random() * 80000), new Date(Date.now() - Math.floor(Math.random() * 80000)));
            newPartTimeEmployee.workHours = Math.floor(Math.random() * 40);
            company.employees.push(newPartTimeEmployee);
        }
        else {
            company.employees.push(new Employee(Math.floor(Math.random() * 80000), new Date(Date.now() - Math.floor(Math.random() * 80000))));
        }
    }
    var json = typed_json_1.TypedJSON.stringify(company);
    var reparsed = typed_json_1.TypedJSON.parse(json, Company);
    console.log("Test 6: @JsonObject extending non-@JsonObject with custom names.");
    console.log(company);
    console.log(typed_json_1.TypedJSON.parse(json));
    console.log(reparsed);
    console.log("Match: " + object_compare_1.isEqual(company, reparsed));
});
