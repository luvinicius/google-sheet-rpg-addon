const { type } = require('os');

var Logger = {
    text: "",
    stringfy: function (val, cottedString) {
        if (Array.isArray(val)) {
            return val.reduce((v, vi, i) => `${v}${i > 0 ? ", " : ""}${this.stringfy(vi, true)}`
                , "[")
                + "]";
        } else if (val === undefined) {
            return "undefined";
        } else if (cottedString === true && typeof val === "string") {
            return '"' + val + '"'
        } else if (typeof val.toString == "function") {
            return val.toString();
        } else {
            return typeof val;
        }
    },
    log: function (...str) {
        this.text = str.reduce((t, i) => `${t}${this.stringfy(i)}`, this.text)
            .concat("\n");
        console.log(...str);
    }
}

var tests = [];
var nTests = 0, nSuccess = 0, nFails = 0, nErrors = 0;


/**
 * @param {string} description 
 * @param {Assertion} assertion A function that return AssertResult and dont need
 * any parameter, you can ecapsulate return of AssertResult in assert() ou group() methods
 */
function test(description, assertion) {
    if (assertion instanceof Assertion) {
        tests.push(function () {
            Logger.log("------------------------------------------------------",
                "\n\t", description,
                "\n------------------------------------------------------");

            let pass = false;
            let assertionError = undefined;

            nTests++;
            try {
                pass = assertion.true;
                if (pass) nSuccess++;
                else nFails++;
            } catch (err) {
                assertionError = err;
                Logger.log(err);
                nErrors++;
            }
            __displayAssertionResult_(assertion, pass, assertionError, ` Expect ${assertion.prefix ? assertion.prefix : ''}`);
            if (pass) Logger.log("Test Pass!");
            else Logger.log("Test Fail!");
        });
    } else throw new Error("assertion must be instance of Assertion");
}

function __displayAssertionResult_(assertion, pass, assertionError, descriptionPrefix) {
    let indicator = pass ? "(✓)" : "(✗)";
    if (typeof descriptionPrefix != "string") descriptionPrefix = "";
    if (assertion.description) Logger.log(indicator, "\t", descriptionPrefix, assertion.description);
    if (assertionError) {
        if (assertionError.message) Logger.log(assertionError.message);
        if (assertionError.stack) Logger.log(assertionError.stack);
    } else if (!pass && assertion.failMsg) Logger.log("\t", assertion.failMsg);
}

/**
 * @param  {...Assertion} assertions 
 */
function agroup(...assertions) {
    let test = () => {
        let nGroupTests = 0, nGroupSuccess = 0, nGroupFails = 0, nGroupErrors = 0;

        let allAssertsTrue = true;
        for (var i = 0; i < assertions.length; i++) {
            let assertion = assertions[i];
            let pass = false;
            let assertionError = undefined;

            nGroupTests++;
            try {
                pass = assertion.true;
                if (pass) nGroupSuccess++
                else nGroupFails++;
            } catch (err) {
                assertionError = err;
                nGroupErrors++;
            }

            __displayAssertionResult_(assertion, pass, assertionError, `${i + 1}) Expect ${assertion.prefix ? assertion.prefix : ''}`);
            allAssertsTrue &= pass;
        }

        Logger.log("\nTotal:\t", nGroupTests, "\tSucess:\t", nGroupSuccess, "\tFails:\t", nGroupFails, "\tErrors:\t", nGroupErrors);
        return allAssertsTrue;
    }
    return expect.toReturnTrue(test);
}

class AssertationBuilder {
    /**
     * @param {AssertionValuedParameters=} valueParameters 
     */
    constructor(valueParameters) {
        if(valueParameters){
            if(!valueParameters instanceof AssertionValuedParameters) throw new Error("valueParameters must be instance of "+ AssertionValuedParameters.name);
            this.valueParameters = valueParameters;
        }
    }

    toBeEqual(valueB, aliasValueB, functionForValueB) {
        return this._toBe_(MustBeEqualAssertion, valueB, aliasValueB, functionForValueB);
    }

    _toBe_(mustBeConstructor, valueB, aliasValueB, functionForValueB) {
        if (!this.valueA && !this.functionForValueA) throw new Error("must to be defined valueA before call isEqualTo, con do it by calling if");
        return this._build_(new mustBeConstructor(this.valueA, valueB, this.aliasValueA, aliasValueB, this.functionForValueA, functionForValueB));
    }

    _build_(assertion) {
        if (this.deny === true) assertion = new NotAssertion(assertion);
        assertion.builder = this;

        if (this.assertion instanceof AssertionGroup) {
            this.assertion.append(assertion);
        } else this.assertion = assertion;
        return this.assertion;
    }
    get true() {
        if (this._true_ == undefined) this._true_ = this.test(this);
        return this._true_;
    }
    toBeEqualResultOf(functionForValueB, aliasFunctionForValueN) {
        return this.toBeEqual(undefined, aliasFunctionForValueN, functionForValueB);
    }

    toBeTrue() {
        return this.toBeEqual(true, "True");
    }

    toBeFalse() {
        return this.toBeEqual(true, "False");
    }

    toBeGreaterThan(valueB, aliasValueB, functionForValueB) {
        return this._toBe_(MustBeGreatherAssertion, valueB, aliasValueB, functionForValueB);
    }

    toBeEqualOrGreaterThan(valueB, aliasValueB, functionForValueB) {
        return this._toBe_(MustBeEqualOrGreatherAssertion, valueB, aliasValueB, functionForValueB);
    }

    toBeLessThan(valueB, aliasValueB, functionForValueB) {
        return this._toBe_(MustBeLessAssertion, valueB, aliasValueB, functionForValueB);
    }

    toBeEqualOrLessThan(valueB, aliasValueB, functionForValueB) {
        return this._toBe_(MustBeEqualOrLessAssertion, valueB, aliasValueB, functionForValueB);
    }

    get not() {
        this.deny = this.deny === true ? false : true;
        return this;
    }

    all(...assertions) {
        return this._build_(new AndAssertion(...assertions));
    }

    any(...assertions) {
        return this._build_(new OrAssertion(...assertions));
    }

    returnToBeTrue(testFunction, description, failMsg) {
        return this._build_(new TestAssertion(testFunction, description, failMsg));
    }

    get expect() { return expect; }

    set assertion(assertion) {
        this._assertion_ = assertion;
    }

    get assertion() { return this._assertion_; }

}

var expect = {
    value: function (value, aliasValue) {
        return new AssertationBuilder(value, aliasValue);
    },
    thatResultOf: function (functionForValue, aliasValue) {
        return new AssertationBuilder(undefined, aliasValue, functionForValue);
    },
    group: agroup,
    all: function (...assertions) {
        return new AssertationBuilder().all(...assertions);
    },
    any: function (...assertions) {
        return new AssertationBuilder().any(...assertions);
    },
    toReturnTrue: function (testFunction, description, failMsg) {
        return new AssertationBuilder().returnToBeTrue(testFunction, description, failMsg);
    }
};


class Assertion {

    constructor() {
        this.description = undefined;
        this.failMsg = undefined;
    }

    test() {
        throw new Error("Assertion test must be overrided");
    }

    get true() {
        if (this._true_ == undefined) this._true_ = this.test(this);
        return this._true_;
    }

    get and() {
        if (this.builder) {
            this.builder.assertation = new AndAssertion().append(this).putPrefix(this.prefix);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

    get or() {
        if (this.builder) {
            this.builder.assertation = new OrAssertion().append(this).putPrefix(this.prefix);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }

    get prefix() {
        return this._prefix_;
    }

    putPrefix(prefix) {
        this._prefix_ = prefix;
        return this;
    }

    setDescription(description){
        this.description = description;
        return this;
    }

}

class TestAssertion extends Assertion {
    constructor(test, description, failMsg) {
        super();
        this.test = test;
        this.description = description;
        this.failMsg = failMsg;
    }
}

class AssertionGroup extends Assertion {
    constructor(superGroup, descriptionDelimiter, failMsgDelimiter, ...assertions) {
        super();
        this.superGroup = superGroup;
        this.descriptionDelimiter = descriptionDelimiter;
        this.failMsgDelimiter = failMsgDelimiter;
        this.assertions = assertions ? assertions : [];
    }

    append(assertion) {
        if (assertion instanceof Assertion) {
            this.assertions.push(assertion);
        } else throw new Error("And must recieve a instance of Assertion");
        return this;
    }

    get description() {
        let msg = ''

        for (let i = 0; i < this.assertions.length; i++) {
            let current = this.assertions[i];
            let description = current.description;
            if (i > 0
                && this.assertions[i - 1].builder == current.builder
                && description.match(/to be .*$/)) {

                description = description.match(/to be .*$/)[0];
            }

            msg = `${msg}${i > 0 ? this.descriptionDelimiter : ''}${description}`
        }
        return msg;
    }

    get failMsg() {
        let msg = ''
        let builders = [];
        for (i in this.assertions) {
            let current = this.assertions[i];
            if (!current.builder || !builders.includes(current.builder)) {
                builders.push(current.builder);
                msg = `${msg}${i > 0 ? this.failMsgDelimiter : ''}${current.failMsg}`
            }
        }
        return msg;
    }

    get and() {
        if (this.builder) {
            this.builder.assertation = new AndAssertion(this).append(this).putPrefix(this.prefix);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

    get or() {
        if (this.builder) {
            this.builder.assertation = new OrAssertion(this).append(this).putPrefix(this.prefix);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }
}

class AndAssertion extends AssertionGroup {
    constructor(superGroup, ...assertions) { super(superGroup, " and ", " and ", ...assertions); }

    test() { return this.assertions.reduce((beforeTrue, current) => beforeTrue && current.true, true); }

    get and() {
        if (this.builder) {
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

}

class OrAssertion extends Assertion {
    constructor(superGroup, ...assertions) { super(superGroup, " or ", " and ", ...assertions) }

    test() { return this.assertions.reduce((beforeTrue, current) => beforeTrue || current.true, false); }

    get or() {
        if (this.builder) {
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }
}

class NotAssertion extends Assertion {
    constructor(assertation) { this.assertation = assertation; }
    test() {
        return !assertion.test();
    }

    get description() {
        return this.assertation.replace(/to be/g, "not to be");
    }

    get failMsg() {
        return this.assertation.failMsg;
    }
}
class AssertionValuedParameters{
    /**
     * 
     * @param {*=} value 
     * @param {string=} aliasValue 
     * @param {function=} functionToGetValue 
     * @param {function=} mapValue a function to recieve value and tranform it, can be use to get a index into a array value or get a property in a object value
     * @param {string=} aliasMapValue 
     */
    constructor(value, aliasValue, functionToGetValue, mapValue, aliasMapValue) {
        this.value = value;
        this.functionToGetValueA = functionToGetValue;
        if (aliasValue == undefined) this.aliasValue = functionToGetValue ? Logger.stringfy(functionToGetValue) : Logger.stringfy(value);
        this.mapValue = mapValue;
        this.aliasMapValue = aliasMapValue;
    }
}

class MustBeAssertionParameters extends AssertionValuedParameters{
    /**
     * 
     * @param {AssertionValuedParameters} valueParametersA 
     * @param {AssertionValuedParameters} valueParametersB 
     */
    constructor(valueParametersA, valueParametersB) {
        if(!valueParametersA instanceof AssertionValuedParameters) throw new Error("valueParameters must be instance of "+ AssertionValuedParameters.name);
        if(!valueParametersB instanceof AssertionValuedParameters) throw new Error("valueParameters must be instance of "+ AssertionValuedParameters.name);
        this.valueParametersA = valueParametersA;
        this.valueParametersB = valueParametersB;

        this.valueA = valueA;
        this.valueB = valueB;
        this.functionToGetValueA = functionToGetValueA;
        this.functionToGetValueB = functionToGetValueB;
        if (aliasValueA == undefined) aliasValueA = functionToGetValueA ? Logger.stringfy(functionToGetValueA) : Logger.stringfy(valueA);
        if (aliasValueB == undefined) aliasValueB = functionToGetValueB ? Logger.stringfy(functionToGetValueB) : Logger.stringfy(valueB);
        this.mapValue = mapValueA;
        this.aliasMapValue = aliasMapValueA;
        this.mapValueB = mapValueB;
        this.aliasMapValueB = aliasMapValueB;

    }
    get aliasValueA(){ return this.valueParametersA.aliasValue;}
    get valueA(){ return this.valueParametersA.value;}
    get functionToGetValueA(){ return this.valueParametersA.functionToGetValue;}
    get mapValueA(){return this.valueParametersA.mapValue;}
    get aliasMapValueA(){return this.valueParametersA.aliasMapValue;}

    get aliasValueA(){ return this.valueParametersA.aliasValue;}
    get valueA(){ return this.valueParametersA.value;}
    get functionToGetValueA(){ return this.valueParametersA.functionToGetValue;}
    get mapValueA(){return this.valueParametersA.mapValue;}
    get aliasMapValueA(){return this.valueParametersA.aliasMapValue;}
}

class MustBeAssertion extends Assertion {
    /**
     * 
     * @param {MustBeAssertionParameters} config 
     * @param {string} cmpDescription 
     */
    constructor(config, cmpDescription) {
        super();
        if(!valueParametersB instanceof MustBeAssertionParameters) throw new Error("valueParameters must be instance of "+ MustBeAssertionParameters.name);
        this.config = config;
        this.cmpDescription = cmpDescription;
    }

    get aliasValueA(){}
    get aliasMapValueA(){}
    get aliasValueB(){}
    get aliasMapValueB(){}

    get description() {
        return `${this.aliasValueA}${this.aliasMapValueA ? this.aliasMapValueA : ''} to be ${this.cmpDescription} ${this.aliasValueB}${this.aliasMapValueB ? this.aliasMapValueB : ''}`;
    }

    test() {
        this.valueA = this.config.valueA;
        this.valueA = this.config.valueB;
        if (this.config.functionToGetValueA) this.valueA = this.config.functionToGetValueA();
        if (this.config.functionToGetValueB) this.valueA = this.config.functionToGetValueB();
        if (this.config.mapValueA) this.valueA = this.config.mapValueA(this.valueA);
        if (this.config.mapValueB) this.valueB = this.config.mapValueB(this.valueB);
        return this.cmp(this.valueA, this.valueB);
    }

    cmp(valueA, valueB) { throw new Error("Must Be cmp must be overrided"); }

    get failMsg() {
        return `${aliasValueA} is ${Logger.stringfy(this.valueA)}`;
    }
}

class MustBeEqualAssertion extends MustBeAssertion {
    constructor(config) { super(config, "equal to");}

    cmp(valueA, valueB) {
        if (Array.isArray(valueA)) {
            if (Array.isArray(valueB)
                && valueA.length == valueB.length) {
                for (i in valueA) {
                    if (this.cmp(valueA[i], valueB[i]) != true) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        } else {
            return valueA == valueB;
        }
    }
}

class MustBeGreatherAssertion extends MustBeAssertion {
    constructor(config) { super(config, "greater than");}
    cmp(valueA, valueB) { return valueA > valueB }
}

class MustBeEqualOrGreatherAssertion extends MustBeAssertion {
    constructor(config) { super(config, "equal or greater than");}
    cmp(valueA, valueB) { return valueA >= valueB }
}

class MustBeLessAssertion extends MustBeAssertion {
    constructor(config) { super(config, "less than");}
    cmp(valueA, valueB) { return valueA < valueB }
}

class MustBeEqualOrLessAssertion extends MustBeAssertion {
    constructor(config) { super(config, "equal or less than");}
    cmp(valueA, valueB) { return valueA <= valueB }
}


/**
 * 
 */
function displayResults() {
    for (i in tests) tests[i]();

    Logger.log("------------------------------------------------------\n\n");
    Logger.log("------------------------------------------------------\n\t\t\t\tFINAL RESULTS\n------------------------------------------------------")
    Logger.log("Total:\t", nTests, "\tSucess:\t", nSuccess, "\tFails:\t", nFails, "\tErrors:\t", nErrors);
}

/**
 * 
 * @param {string} fileName 
 */
function saveLog(fileName) {
    fs = require('fs');
    var fileName = (fileName ? fileName : "tests").concat(".log")
    fs.writeFile(fileName, Logger.text, 'utf-8', () => console.log("Log saved at ", fileName));
}

module.exports = {
    test, expect, displayResults, saveLog
}