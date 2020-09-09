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
            let str = val.toString();
            if(typeof val == "function"){
                if(str.match(/(function[ \s\t]*\(\)[ \s\t]*\{|\([^\)]*?\)[ \s\t]*\=\>[ \s\t]*\{)/)){
                    str = str.replace(/\n?[ \s\t]*\}$/,"");
                }
                str = str.replace(/function[ \s\t]*\(\)[ \s\t]*\{(\n[ \s\t]*)?[ \s\t]*(return)?/,"");
                //str = str.replace(/function[ \s\t]*\([^\)]*?\)(\n[ \s\t]*)?\{(\n[ \s\t]*)?(return)?/,"");
                str = str.replace(/\([^\)]*?\)[ \s\t]*\=\>[ \s\t]*\{?(\n[ \s\t]*)?(return)?/,"");
                str = str.replace(/^[ \s\t]*/,"");
                str = str.replace(/;[ \s\t]*$/,"");
            }
            return str;
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
var passedTests = [];
var nTests = 0, nSuccess = 0, nFails = 0, nErrors = 0;


/**
 * @returns {number} The index id of the text
 * @param {string} description 
 * @param {Assertion} assertion use execute to build assertions
 * @param {number..., Array<number>...} executeIfPassed,... index id (or ids) of test that must to be passased to execute this test
 */
function test(description, assertion, ...executeIfPassed) {
    if (assertion instanceof Assertion) {
        return tests.push(function () {
            if (executeIfPassed && !executeIfPassed.every((test) => passedTests.includes(test))) return false;

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
            __displayAssertionResult_(assertion, pass, assertionError);
            if (pass) Logger.log("Test Pass!");
            else Logger.log("Test Fail!");
            return pass;
        }) - 1;
    } else throw new Error("assertion must be instance of Assertion");
}

function __displayAssertionResult_(assertion, pass, assertionError, descriptionPrefix) {
    let indicator = pass ? "(✓)" : "(✗)";
    if (typeof descriptionPrefix != "string") descriptionPrefix = "";
    if (assertion.title) descriptionPrefix = `${descriptionPrefix}${assertion.title}\n\t`;
    descriptionPrefix = `${descriptionPrefix}Expect `;
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

            __displayAssertionResult_(assertion, pass, assertionError, `${i + 1})`);
            allAssertsTrue &= pass;
        }

        Logger.log("\nTotal:\t", nGroupTests, "\tSucess:\t", nGroupSuccess, "\tFails:\t", nGroupFails, "\tErrors:\t", nGroupErrors);
        return allAssertsTrue;
    }
    return expect.toReturnTrue(test);
}


class AssertationBuilder {
    constructor() { }

    get valueParameters() {
        return this._valueParameters_;
    }

    set valueParameters(valueParameters) {
        if (!valueParameters instanceof AssertionValuedParameters) throw new Error("valueParameters must be instance of " + AssertionValuedParameters.name);
        this._valueParameters_ = valueParameters;
    }

    value(value, aliasValue) {
        this._valueParameters_ = new AssertionValuedParameters(value, aliasValue);
        return this;
    }

    resultOf(functionForValue, aliasValue) {
        this._valueParameters_ = new AssertionValuedParameters(undefined, aliasValue, functionForValue);
        return this;
    }

    index(i, aliasIndex) {
        if (!this.valueParameters instanceof AssertionValuedParameters) throw new Error("valueParameters must be defined to call index. You can call value or resultOf to define valueParameters");
        this.valueParameters.mapValue = (value) => value[i];
        this.valueParameters.aliasMapValue = aliasIndex;
        return this;
    }

    key(keyName, aliasKeyName) {
        if (!this.valueParameters instanceof AssertionValuedParameters) throw new Error("valueParameters must be defined to call keyName. You can call value or resultOf to define valueParameters");
        this.valueParameters.mapValue = (value) => value[keyName];
        this.valueParameters.aliasMapValue = aliasKeyName;
        return this;
    }

    mapedTo(func, aliasMap) {
        if (!this.valueParameters instanceof AssertionValuedParameters) throw new Error("valueParameters must be defined to call keyName. You can call value or resultOf to define valueParameters");
        this.valueParameters.mapValue = func;
        this.valueParameters.aliasMapValue = aliasMap;
        return this;
    }

    toBeEqual(valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper) {
        return this._toBe_(MustBeEqualAssertion, valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper);
    }

    _toBe_(mustBeConstructor, valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper) {
        if (!this.valueParameters instanceof AssertionValuedParameters) throw new Error("valueParameters must be defined to call to be. You can call value or resultOf to define valueParameters");
        let valueParametersB = new AssertionValuedParameters(valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper);
        let mustBeParameters = new MustBeAssertionParameters(this.valueParameters, valueParametersB);
        return this._build_(new mustBeConstructor(mustBeParameters));
    }

    _build_(assertion) {
        if (this.deny === true) assertion = new NotAssertion(assertion);
        assertion.builder = this;

        if (this.assertion instanceof AssertionGroup) {
            this.assertion.append(assertion);
        } else this.assertion = assertion;
        return this.assertion;
    }

    toBeEqualResultOf(functionForValueB, aliasFunctionForValueB, valueBMapper, aliasForValueBMapper) {
        return this.toBeEqual(undefined, aliasFunctionForValueB, functionForValueB, valueBMapper, aliasForValueBMapper);
    }

    toBeTrue() {
        return this.toBeEqual(true, "True");
    }

    toBeFalse() {
        return this.toBeEqual(true, "False");
    }

    toBeGreaterThan(valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper) {
        return this._toBe_(MustBeGreatherAssertion, valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper);
    }

    toBeEqualOrGreaterThan(valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper) {
        return this._toBe_(MustBeEqualOrGreatherAssertion, valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper);
    }

    toBeLessThan(valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper) {
        return this._toBe_(MustBeLessAssertion, valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper);
    }

    toBeEqualOrLessThan(valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper) {
        return this._toBe_(MustBeEqualOrLessAssertion, valueB, aliasValueB, functionForValueB, valueBMapper, aliasForValueBMapper);
    }

    get not() {
        this.deny = this.deny === true ? false : true;
        return this;
    }

    all(...assertions) {
        return this._build_(new AndAssertion(undefined, ...assertions));
    }

    any(...assertions) {
        return this._build_(new OrAssertion(undefined, ...assertions));
    }

    returnToBeTrue(testFunction, description, failMsg) {
        return this._build_(new TestAssertion(testFunction, description, failMsg));
    }

    set assertion(assertion) {
        this._assertion_ = assertion;
    }

    get assertion() { return this._assertion_; }

}

var expect = {
    value: function (value, aliasValue) {
        return new AssertationBuilder().value(value, aliasValue);
    },
    resultOf: function (functionForValue, aliasValue) {
        return new AssertationBuilder().resultOf(functionForValue, aliasValue);
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
        this._description_ = undefined;
        this._failMsg_ = undefined;
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
            this.builder.assertation = new AndAssertion(undefined, this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

    get or() {
        if (this.builder) {
            this.builder.assertation = new OrAssertion(undefined, this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }

    get description() { return this._description_; }
    set description(description) { this._description_ = description; }
    setDescription(description) {
        this._description_ = description;
        return this;
    }
    get failMsg() { return this._failMsg_; }
    set failMsg(failMsg) { this._failMsg_ = failMsg; }
    setFailMsg(failMsg) {
        this._failMsg_ = failMsg;
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    get title() {
        return this._title_;
    }

    set title(title) {
        this._title_ = title;
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
class AssertionValuedParameters {
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
        this.functionToGetValue = functionToGetValue;
        if (aliasValue == undefined) this.aliasValue = functionToGetValue ? Logger.stringfy(functionToGetValue) : Logger.stringfy(value);
        else this.aliasValue = aliasValue;
        this.mapValue = mapValue;
        this.aliasMapValue = aliasMapValue;
    }
}

class MustBeAssertionParameters {
    /**
     * 
     * @param {AssertionValuedParameters} valueParametersA 
     * @param {AssertionValuedParameters} valueParametersB 
     */
    constructor(valueParametersA, valueParametersB) {
        if (!valueParametersA instanceof AssertionValuedParameters) throw new Error("valueParameters must be instance of " + AssertionValuedParameters.name);
        if (!valueParametersB instanceof AssertionValuedParameters) throw new Error("valueParameters must be instance of " + AssertionValuedParameters.name);
        this.valueParametersA = valueParametersA;
        this.valueParametersB = valueParametersB;
    }

    get aliasValueA() { return this.valueParametersA.aliasValue; }
    set aliasValueA(aliasValueA) { this.valueParametersA.aliasValue = aliasValueA; }
    get valueA() { return this.valueParametersA.value; }
    set valueA(valueA) { this.valueParametersA.value = valueA; }
    get functionToGetValueA() { return this.valueParametersA.functionToGetValue; }
    set functionToGetValueA(functionToGetValueA) { this.valueParametersA.functionToGetValue = functionToGetValueA; }
    get mapValueA() { return this.valueParametersA.mapValue; }
    set mapValueA(mapValueA) { this.valueParametersA.mapValue = mapValueA; }
    get aliasMapValueA() { return this.valueParametersA.aliasMapValue; }
    set aliasMapValueA(aliasMapValueA) { this.valueParametersA.aliasMapValue = aliasMapValueA; }

    get aliasValueB() { return this.valueParametersB.aliasValue; }
    set aliasValueB(aliasValueB) { this.valueParametersB.aliasValue = aliasValueB; }
    get valueB() { return this.valueParametersB.value; }
    set valueB(valueB) { this.valueParametersB.value = valueB; }
    get functionToGetValueB() { return this.valueParametersB.functionToGetValue; }
    set functionToGetValueB(functionToGetValueB) { this.valueParametersB.functionToGetValue = functionToGetValueB; }
    get mapValueB() { return this.valueParametersB.mapValue; }
    set mapValueB(mapValueB) { this.valueParametersB.mapValue = mapValueB; }
    get aliasMapValueB() { return this.valueParametersB.aliasMapValue; }
    set aliasMapValueB(aliasMapValueB) { this.valueParametersB.aliasMapValue = aliasMapValueB; }
}

class MustBeAssertion extends Assertion {
    /**
     * 
     * @param {MustBeAssertionParameters} parameters 
     * @param {string} cmpDescription 
     */
    constructor(parameters, cmpDescription) {
        super();
        if (!parameters instanceof MustBeAssertionParameters) throw new Error("valueParameters must be instance of " + MustBeAssertionParameters.name);
        this.parameters = parameters;
        this.cmpDescription = cmpDescription;
        super.description = `{aliasValueA}{aliasMapValueA} to be ${cmpDescription} {aliasValueB}{aliasMapValueB}`;
        super.failMsg = `{aliasValueA}{aliasMapValueA} is {valueAFinal} not ${cmpDescription} {valueBFinal} as expected`;
    }

    _format_(text) {
        text = text
            .replace(/\{aliasValueA\}/g, this.aliasValueA ? this.aliasValueA : "")
            .replace(/\{aliasMapValueA\}/g, this.aliasMapValueA ? this.aliasMapValueA : "")
            .replace(/\{aliasValueB\}/g, this.aliasValueB ? this.aliasValueB : "")
            .replace(/\{aliasMapValueB\}/g, this.aliasMapValueB ? this.aliasMapValueB : "");
        if (text.match(/\{valueAFinal\}/)) {
            text = text.replace(/\{valueAFinal\}/g, Logger.stringfy(this.valueAFinal));
        }
        if (text.match(/\{valueBFinal\}/)) {
            text = text.replace(/\{valueBFinal\}/g, Logger.stringfy(this.valueBFinal));
        }
        return text;
    }

    get description() {
        return this._format_(super.description);
    }


    get failMsg() {
        return this._format_(super.failMsg);
    }

    test() {
        return this.cmp(this.valueAFinal, this.valueBFinal);
    }

    cmp(valueA, valueB) { throw new Error("Must Be cmp must be overrided"); }

    index(i, aliasIndex) {
        this.mapValueB = (value) => value[i];
        this.aliasMapValueB = aliasIndex;
        return this;
    }

    key(keyName, aliasKeyName) {
        this.mapValueB = (value) => value[keyName];
        this.aliasMapValueB = aliasKeyName;
        return this;
    }

    mapedTo(func, aliasMap) {
        this.mapValueB = func;
        this.aliasMapValueB = aliasMap;
        return this;
    }


    get aliasValueA() { return this.parameters.aliasValueA; }
    set aliasValueA(aliasValueA) { this.parameters.aliasValueA = aliasValueA; }
    get valueA() { return this.parameters.valueA; }
    get valueAFinal() {
        if (this._valueAFinal_ === undefined) {
            this._valueAFinal_ = this.valueA;
            if (this.functionToGetValueA) this._valueAFinal_ = this.functionToGetValueA();
            if (this.mapValueA) this._valueAFinal_ = this.mapValueA(this._valueAFinal_);
        }
        return this._valueAFinal_;
    }
    set valueA(valueA) { this.parameters.valueA = valueA; }
    get functionToGetValueA() { return this.parameters.functionToGetValueA; }
    set functionToGetValueA(functionToGetValueA) { this.parameters.functionToGetValueA = functionToGetValueA; }
    get mapValueA() { return this.parameters.mapValueA; }
    set mapValueA(mapValueA) { this.parameters.mapValueA = mapValueA; }
    get aliasMapValueA() { return this.parameters.aliasMapValueA; }
    set aliasMapValueA(aliasMapValueA) { this.parameters.aliasMapValueA = aliasMapValueA; }

    get aliasValueB() { return this.parameters.aliasValueB; }
    set aliasValueB(aliasValueB) { this.parameters.aliasValueB = aliasValueB; }
    get valueB() { return this.parameters.valueB; }
    set valueB(valueB) { this.parameters.valueB = valueB; }
    get functionToGetValueB() { return this.parameters.functionToGetValueB; }
    set functionToGetValueB(functionToGetValueB) { this.parameters.functionToGetValueB = functionToGetValueB; }
    get mapValueB() { return this.parameters.mapValueB; }
    set mapValueB(mapValueB) { this.parameters.mapValueB = mapValueB; }
    get aliasMapValueB() { return this.parameters.aliasMapValueB; }
    set aliasMapValueB(aliasMapValueB) { this.parameters.aliasMapValueB = aliasMapValueB; }
    get valueBFinal() {
        if (this._valueBFinal_ === undefined) {
            this._valueBFinal_ = this.valueB;
            if (this.functionToGetValueB) this._valueBFinal_ = this.functionToGetValueB();
            if (this.mapValueB) this._valueBFinal_ = this.mapValueA(this._valueBFinal_);
        }
        return this._valueBFinal_;
    }
}

class MustBeEqualAssertion extends MustBeAssertion {
    constructor(config) { super(config, "equal to"); }

    cmp(valueA, valueB) {
        if (Array.isArray(valueA)) {
            if (Array.isArray(valueB)
                && valueA.length == valueB.length) {
                for (let i = 0; i < valueA.length; i++) {
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
    constructor(config) { super(config, "greater than"); }
    cmp(valueA, valueB) { return valueA > valueB }
}

class MustBeEqualOrGreatherAssertion extends MustBeAssertion {
    constructor(config) { super(config, "equal or greater than"); }
    cmp(valueA, valueB) { return valueA >= valueB }
}

class MustBeLessAssertion extends MustBeAssertion {
    constructor(config) { super(config, "less than"); }
    cmp(valueA, valueB) { return valueA < valueB }
}

class MustBeEqualOrLessAssertion extends MustBeAssertion {
    constructor(config) { super(config, "equal or less than"); }
    cmp(valueA, valueB) { return valueA <= valueB }
}


class AssertionGroup extends Assertion {
    constructor(superGroup, descriptionDelimiter, failMsgDelimiter, ...assertions) {
        super();
        this.superGroup = superGroup;
        this.descriptionDelimiter = descriptionDelimiter;
        this.failMsgDelimiter = failMsgDelimiter;
        this._assertions_ = assertions ? assertions : [];
    }

    append(assertion) {
        if (assertion instanceof Assertion) {
            this._assertions_.push(assertion);
        } else throw new Error("And must recieve a instance of Assertion");
        return this;
    }

    get description() {
        let msg = ''

        for (let i = 0; i < this._assertions_.length; i++) {
            let current = this._assertions_[i];
            let description = current.description;
            msg = `${msg}${i > 0 ? this.descriptionDelimiter : ''}${description}`
        }
        return msg;
    }

    get failMsg() {
        let msg = ''
        let builders = [];
        for (i in this._assertions_) {
            let current = this._assertions_[i];
            if (!current.builder || !builders.includes(current.builder)) {
                builders.push(current.builder);
                msg = `${msg}${i > 0 ? this.failMsgDelimiter : ''}${current.failMsg}`
            }
        }
        return msg;
    }

    get and() {
        if (this.builder) {
            this.builder.assertation = new AndAssertion(this, this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

    get or() {
        if (this.builder) {
            this.builder.assertation = new OrAssertion(this, this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }
}

class AndAssertion extends AssertionGroup {
    constructor(superGroup, ...assertions) { super(superGroup, " and ", "\nand ", ...assertions); }

    test() { return this._assertions_.reduce((beforeTrue, current) => beforeTrue && current.true, true); }

    get and() {
        if (this.builder) {
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

}

class OrAssertion extends Assertion {
    constructor(superGroup, ...assertions) { super(superGroup, " or ", "\nand ", ...assertions) }

    test() { return this.assertions.reduce((beforeTrue, current) => beforeTrue || current.true, false); }

    get or() {
        if (this.builder) {
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }
}

/**
 * 
 */
function displayResults() {
    tests.forEach((test, i) => { if (test()) passedTests.push(i) });

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