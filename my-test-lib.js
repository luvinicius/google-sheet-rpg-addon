const { RSA_NO_PADDING } = require('constants');
const { equal } = require('assert');

function _eq_(v1, v2) {
    if (Array.isArray(v1)) {
        if (Array.isArray(v2)
            && v1.length == v2.length) {
            for (i in v1) {
                if (_eq_(v1[i], v2[i]) != true) {
                    return false;
                }
            }
            return true;
        } else {
            return false;
        }
    } else {
        return v1 == v2;
    }
}

var nTests = 0, nSuccess = 0, nFails = 0, nErrors = 0;

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

/**
 * @param {string} description 
 * @param {function} assert A function that return AssertResult and dont need
 * any parameter, you can ecapsulate return of AssertResult in assert() ou group() methods
 */
function test(description, assert) {
    Logger.log("------------------------------------------------------",
        "\n\t", description,
        "\n------------------------------------------------------");
    nTests++;
    try {
        if (assert().pass) {
            nSuccess++;
            Logger.log("Pass!");
        } else {
            nFails++;
            Logger.log("Fail!");
        }
    } catch (err) {
        Logger.log(err);
        nErrors++;
    }
}

var assert = {
    if: function (value) {
        return {
            isEqualTo: (args) => () => isEqualTo(value, ...args)
        }
    },
    ifResultOf: (func) => assert.if(func())
}

function add(result){
    return {
        if: function (value) {
            return {
                isEqual: (args) => () => isEqualTo(value, ...args)
            }
        },
        ifResult: (func) => assert.if(func())
    }
}

/**
 * 
 * @param {string} label 
 * @param  {...function} asserts 
 */
function group(label, ...asserts) {
    return () => {
        var nGroupTests = 0, nGroupSuccess = 0, nGroupFails = 0, nGroupErrors = 0;
        if (label) Logger.log("\t", label);
        var groupSuccess = asserts.reduce((before, current, i) => {

            var currentSuccessed = false;

            nGroupTests++;
            try {
                var result = current();
                result.prefix = `${i+1})`+result.prefix;
                if(result.description) Logger.log(result.simbol,"\t", result.prefix, result.description);
                if(!result.pass && result.failMsg) Logger.log(result.failMsg);
                currentSuccessed = result.pass;
                if (currentSuccessed) {
                    nGroupSuccess++
                } else {
                    nGroupFails++;
                }
            } catch (err) {
                Logger.log(err);
                nGroupErrors++;

            }

            return before &= currentSuccessed;
        }, true);
        Logger.log("\nTotal:\t", nGroupTests, "\nSucess:\t", nGroupSuccess, "\nFails:\t", nGroupFails, "\nErrors:\t", nGroupErrors);
        return new AssertResult(groupSuccess);
    };
}
/**
 * 
 * @param  {...AssertResult} asserts 
 */
function and(...asserts) {
    var pass = true;
    var description = "";
    var failMsg = "";
    for (var i = 0; i < asserts.length; i++) {
        var current = asserts[i];
        pass &= current.pass;
        if (i > 0) description = description.cocat(" and ");
        description = description.cocat(current.description);
        if (failMsg.length > 0) failMsg = failMsg.concat(" and ");
        if (!current.pass) failMsg = failMsg.concat(current.failMsg);
    }

    return new AssertResult(pass, description, failMsg);
}

/**
 * 
 * @param  {...AssertResult} asserts 
 */
function or(...asserts) {
    var pass = false;
    var description = "";
    var failMsg = "";
    for (var i = 0; i < asserts.length; i++) {
        var current = asserts[i];
        pass |= current.pass;
        if (i > 0) {
            description = description.cocat(" or ");
            failMsg = failMsg.concat(" and ");
        }
        description = description.cocat(current.description);
        failMsg = failMsg.concat(current.failMsg);
    }

    return new AssertResult(pass, description, failMsg);
}

/**
 * @param {*} valueA 
 * @param {*} valueB 
 * @param {string} aliasValueA 
 * @param {string} aliasValueB 
 * @param {string} prefix 
 */
function isEqualTo(valueA, valueB, aliasValueA, aliasValueB, prefix) {

    if (aliasValueA == undefined) aliasValueA = Logger.stringfy(valueA);
    if (aliasValueB == undefined) aliasValueB = Logger.stringfy(valueB);
    var description = `${aliasValueA} is equal to ${aliasValueB}`;

    var failMsg = `${aliasValueA}  is ${Logger.stringfy(valueA)} and it was expected to be ${Logger.stringfy(valueB)}`;

    return new AssertResult(_eq_(valueA, valueB),
        description, failMsg, prefix
    );

}


class Assertation{
    constructor(test){
        this.test=test;
    }
}
class AssertParameters{

}
class AssertResult {
    /**
     * 
     * @param {boolean} pass 
     * @param {string} description 
     * @param {string} failMsg 
     * @param {string} prefix 
     */
    constructor(pass, description, failMsg, prefix) {
        this.pass = pass;
        this.description = description;
        this.failMsg = failMsg;
        this.prefix = prefix;
    }
    get simbol() {
        return this.pass ? "(✓)" : "(✗)";
    }

    and(otherAsertResult) {
        return add(this, otherAsertResult);
    }

    or(otherAsertResult) {
        return or(this, otherAsertResult);
    }

}

/**
 * 
 */
function displayResults() {
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
    test, assert, group, and, or, isEqual: isEqualTo,
    displayResults, saveLog
}