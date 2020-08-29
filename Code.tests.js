const pushColumn = require('./Code.js').pushColumn;
const pushRow = require('./Code.js').pushRow;
const equalizeNumbeOfColumns = require('./Code.js').equalizeNumbeOfColumns;
const SPLIT2D = require('./Code.js').SPLIT2D;

const test = require("./my-test-lib").test;
const and = require("./my-test-lib").and;
const assert = require("./my-test-lib").assert;
const group = require("./my-test-lib").group;
const isEqual = require("./my-test-lib").isEqual;
const displayResults = require("./my-test-lib").displayResults;
const saveLog = require("./my-test-lib").saveLog;

test("teste equalizeNumberOfRows",
    group("", assert.if(equalizeNumbeOfColumns([[1, 2, 3], [1, 2], [1]]))
        .isEqualTo([[1, 2, 3], [1, 2, ""], [1, "", ""]]
            , "equalizeNumbeOfColumns([[1,2,3],[1,2],[1]])")
    ));

/*test("Testando push column", () => group(undefined,
    assert.equal(
        pushColumn([["a"]], "b"), [["a", "b"]],
        '[["a"]] + "b"', undefined,
        "1)"),
    assert.equal(
        pushColumn([["a"]], ["b"]), [["a", "b"]],
        '[["a"]]+ ["b"]', undefined,
        "2)"),
    assert.equal(
        pushColumn("a", "b"), [["a", "b"]],
        '"a"+ "b"', undefined,
        "3)"),
    assert.equal(
        pushColumn(["a"], "b"), [["a", "b"]],
        '["a"]+ "b"', undefined,
        "4)"),
    assert.equal(
        pushColumn("a", [["b"]]), [["a", "b"]],
        '"a"+ [["b"]]', undefined,
        "5)"),
    assert.equal(
        pushColumn([["a"], [0], [1]], [["b"], [0], [1]]),
        [["a", "b"], [0, 0], [1, 1]],
        '[["a"], [0], [1]] + [["b"], [0], [0]]', undefined,
        "6)"),
    assert.equal(
        pushColumn([["a"], [0], [1]], "b"),
        [["a", "b"], [0, ""], [1, ""]],
        '[["a"], [0], [1]] + "b"', undefined,
        "7)"),
    assert.equal(
        pushColumn([["a"]], [["b"], [0], [1]]),
        [["a", "b"], ["", 0], ["", 1]],
        '[["a"]], [["b"], [0], [1]]) + [["a", "b"], ["", 0], ["", 1]]', undefined,
        "8)"),
    assert.equal(
        pushColumn([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0, 0], [1, 1]]),
        [["a", "b", "c", "d", "e"], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
        '[["a","b","c"],[0,0,0],[1,1,1]] + [["d","e"], [0,0], [1,1]]', undefined,
        "9)"),
    assert.equal(
        pushColumn([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0], [1]]),
        [["a", "b", "c", "d", "e"], [0, 0, 0, 0, ""], [1, 1, 1, 1, ""]],
        '[["a","b","c"],[0,0,0],[1,1,1]] + [["d","e"], [0], [1]]', undefined,
        "10)")

));

test("Testando push row",
    assert.equal(
        pushRow([["a"]], "b"),
        [["a"], ["b"]],
        "1)",
        '[["a"]] + "b"'
    ));*/


displayResults();
saveLog("Code.tests");
