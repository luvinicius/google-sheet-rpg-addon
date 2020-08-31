const { RSA_NO_PADDING } = require('constants');
const { equal } = require('assert');

var Logger = {
    text: "",
    stringfy: function (val) {
        var str = "";
        if (Array.isArray(val)) {
            str = val.reduce((v, vi, i) => v.concat(i > 0 ? ", " : "").concat(this.stringfy(vi)), "[")
                .concat("]");
        } if (val === undefined) {
            str = "undefined";
        } else if (typeof val.toString == "function") {
            str = val.toString();
        } else {
            str = typeof val;
        }

        return str;
    },
    log: function (...str) {
        this.text = str.reduce((t, i) => t.concat(this.stringfy(i)), this.text)
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
                pass = expect.true;
                if (pass) {
                    nSuccess++;
                    Logger.log("Assertion Pass!");
                } else {
                    nFails++;
                    Logger.log("Assertion Fail!");
                }
            } catch (err) {
                assertionError = err;
                Logger.log(err);
                nErrors++;
            }
            __displayAssertionResult_(assertion, pass, assertionError);
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
        for (i in assertions) {
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

        Logger.log("\nTotal:\t", nGroupTests, "\nSucess:\t", nGroupSuccess, "\nFails:\t", nGroupFails, "\nErrors:\t", nGroupErrors);
        return allAssertsTrue;
    }
    return new Assertion(test);
}

class AssertationBuilder {
    constructor(valueA, aliasValueA, functionForValueA) {
        this.valueA = valueA;
        this.aliasValueA = aliasValueA;
        this.functionForValueA = functionForValueA;
    }



    toBeEqual(valueB, aliasValueB, functionForValueB) {
        return this._toBe_(MustBeEqualAssertion, valueB, aliasValueB, functionForValueB);
    }

    _toBe_(mustBeConstructor, valueB, aliasValueB, functionForValueB) {
        if (!this.valueA && !this.functionForValueA) throw new Error("must to be defined valueA before call isEqualTo, con do it by calling if");
        return this._build_(new mustBeConstructor(this.valueA, valueB, this.aliasValueA, aliasValueB, this.functionForValueA, functionForValueB));
    }

    _build_(assertion) {
        if (this.deny === true) assertation = new NotAssertion(assertion);
        assertion.builder = this;

        if (this.assertion instanceof AssertionGroup) {
            this.assertion.append(assertation);
        } else this.assertion = assertation;
        return this.assertion;
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
    }

};


class Assertion {

    constructor() {
        this.description = "";
        this.failMsg = "";
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
            this.builder.assertation = new AndAssertion().append(this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

    get or() {
        if (this.builder) {
            this.builder.assertation = new OrAssertion().append(this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }

}

class AssertionGroup {
    constructor(descriptionDelimiter, failMsgDelimiter, ...assertions) {
        super();
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
        return this.assertions.reduce((before, current, i) => `${before}${i > 0 ? this.descriptionDelimiter : ''}${current.description}`, '');
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
}

class AndAssertion extends AssertionGroup {
    constructor(...assertions) { super(" and ", " and ", ...assertions); }

    test() { return this.assertions.reduce((beforeTrue, current) => beforeTrue && current.true, true); }

    get and() {
        if (this.builder) {
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

    get or() {
        if (this.builder) {
            this.builder.assertation = new OrAssertion().append(this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }

}

class OrAssertion extends Assertion {
    constructor(...assertions) { super(" or ", " and ", ...assertions) }
    get and() {
        if (this.builder) {
            this.builder.assertation = new AndAssertion().append(this);
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use and instruction");
    }

    get or() {
        if (this.builder) {
            return this.builder;
        } else throw Error("Assertion must be build by a builder to use or instruction");
    }
    test() { return this.assertions.reduce((beforeTrue, current) => beforeTrue || current.true, false); }
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



class MustBeAssertion extends Assertion {
    constructor(valueA, valueB, aliasValueA, aliasValueB,
        functionToGetValueA, functionToGetValueB,
        cmpDescription) {
        super();
        this.valueA = valueA;
        this.valueB = valueB;
        this.functionToGetValueA = functionToGetValueA;
        this.functionToGetValueB = functionToGetValueB;
        if (aliasValueA == undefined) aliasValueA = functionToGetValueA ? Logger.stringfy(functionToGetValueA) : Logger.stringfy(valueA);
        if (aliasValueB == undefined) aliasValueB = valueB ? functionToGetValueB.stringfy(functionToGetValueB) : Logger.stringfy(valueB);
        this.description = `${aliasValueA} to be ${cmpDescription} ${aliasValueB}`;
        this.failMsg = `${aliasValueA} is ${Logger.stringfy(valueA)}`;
    }

    cmp(valueA, valueB) { throw Error("Must Be cmp must be overrided"); }


    test() {
        if (this.functionToGetValueA) this.valueA = this.functionToGetValueA();
        if (this.functionToGetValueB) this.valueA = this.functionToGetValueB();
        return this.cmp(this.valueA, this.valueB);
    }
}

class MustBeEqualAssertion extends MustBeAssertion {
    constructor(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB) {
        super(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB,
            "equal to");
    }

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
    constructor(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB) {
        super(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB,
            "greater than");
    }

    cmp(valueA, valueB) { return valueA > valueB }
}

class MustBeEqualOrGreatherAssertion extends MustBeAssertion {
    constructor(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB) {
        super(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB, "equal or greater than");
    }
    cmp(valueA, valueB) { return valueA >= valueB }
}

class MustBeLessAssertion extends MustBeAssertion {
    constructor(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB) {
        super(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB,
            "less than");
    }

    cmp(valueA, valueB) { return valueA < valueB }
}

class MustBeEqualOrLessAssertion extends MustBeAssertion {
    constructor(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB) {
        super(valueA, valueB, aliasValueA, aliasValueB, functionToGetValueA, functionToGetValueB, "equal or less than");
    }
    cmp(valueA, valueB) { return valueA <= valueB }
}


/**
 * 
 */
function displayResults() {
    for (i in tests) tests[i]();

    Logger.log("------------------------------------------------------\n\n");
    Logger.log("------------------------------------------------------\n\t\t\t\tFINAL RESULTS\n------------------------------------------------------")
    Logger.log("Total:\t", nTests, "\nSucess:\t", nSuccess, "\nFails:\t", nFails, "\nErrors:\t", nErrors);
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