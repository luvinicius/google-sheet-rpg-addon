
const equalizeNumberOfColumns = require('./Code.js').equalizeNumberOfColumns;
const equalizeNumberOfRows = require('./Code.js').equalizeNumberOfRows;
const pushColumn = require('./Code.js').pushColumn;
const pushRow = require('./Code.js').pushRow;
const safeAppend = require('./Code.js').safeAppend;

const SPLIT2D = require('./Code.js').SPLIT2D;

const test = require("./my-test-lib").test;
const expect = require("./my-test-lib").expect;
const displayResults = require("./my-test-lib").displayResults;
const saveLog = require("./my-test-lib").saveLog;

test("teste equalizeNumbeOfColumns", expect.group(
    expect.thatResultOf(() => {
        var arrayA = [[1, 2, 3], [1, 2], [1]];
        equalizeNumberOfColumns(arrayA);
        return arrayA;
    },
        "equalizeNumbeOfColumns([[1, 2, 3], [1, 2], [1]])")
        .toBeEqual([[1, 2, 3], [1, 2, ""], [1, "", ""]]),

    expect.thatResultOf(() => {
        var arrayA = [[1, 2, 3], [1, 2], [1]];
        var arrayB = [["a"], ["b"]];
        equalizeNumberOfColumns(arrayA, arrayB);
        return [arrayA, arrayB];
    }).toBeEqual([[[1, 2, 3], [1, 2, ""], [1, "", ""]],
    [["a", "", ""], ["b", "", ""]]])

));

test("teste equalizeNumberOfRows", expect.group(
    expect.thatResultOf(() => {
        var arrayA = [[1, 2, 3], [1, 2], [1]];
        var arrayB = [["a"], ["b"]];
        equalizeNumberOfRows(arrayA, arrayB);
        return [arrayA, arrayB];
    }).toBeEqual([[[1, 2, 3], [1, 2], [1]],
    [["a"], ["b"], [""]]])

));

test("test equalizeNumbeOfColumns and equalizeNumberOfRows", expect.group(
    expect.thatResultOf(() => {
        var arrayA = [[1, 2, 3], [1, 2], [1]];
        var arrayB = [["a"], ["b"]];
        equalizeNumberOfColumns(arrayA, arrayB);
        equalizeNumberOfRows(arrayA, arrayB);
        return [arrayA, arrayB];
    }).toBeEqual([[[1, 2, 3], [1, 2, ""], [1, "", ""]],
    [["a", "", ""], ["b", "", ""], ["", "", ""]]])

));

test("Testing push column", expect.group(
    expect.thatResultOf(() => pushColumn([["a"]], "b"), '[["a"]] + "b"')
        .toBeEqual([["a", "b"]]),
    expect.thatResultOf(() => pushColumn([["a"]], ["b"]), '[["a"]]+ ["b"]')
        .toBeEqual([["a", "b"]]),
    expect.thatResultOf(() => pushColumn("a", "b"), '"a"+ "b"')
        .toBeEqual([["a", "b"]]),
    expect.thatResultOf(() => pushColumn(["a"], "b"), '["a"]+ "b"')
        .toBeEqual([["a", "b"]]),
    expect.thatResultOf(() => pushColumn("a", [["b"]]), '"a"+ [["b"]]')
        .toBeEqual([["a", "b"]]),
    expect.thatResultOf(() => pushColumn([["a"], [0], [1]], [["b"], [0], [1]]),
        '[["a"], [0], [1]] + [["b"], [0], [0]]')
        .toBeEqual([["a", "b"], [0, 0], [1, 1]]),
    expect.thatResultOf(() => pushColumn([["a"], [0], [1]], "b"),
        '[["a"], [0], [1]] + "b"')
        .toBeEqual([["a", "b"], [0, ""], [1, ""]]),
    expect.thatResultOf(() => pushColumn([["a"]], [["b"], [0], [1]]),
        '[["a"]],[["b"] + [0], [1]]')
        .toBeEqual([["a", "b"], ["", 0], ["", 1]]),
    expect.thatResultOf(() => pushColumn([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0, 0], [1, 1]]),
        '[["a","b","c"],[0,0,0],[1,1,1]] + [["d","e"], [0,0], [1,1]]')
        .toBeEqual([["a", "b", "c", "d", "e"], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1]]),
    expect.thatResultOf(() => pushColumn([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0], [1]]),
        '[["a","b","c"],[0,0,0],[1,1,1]] + [["d","e"], [0], [1]]')
        .toBeEqual([["a", "b", "c", "d", "e"], [0, 0, 0, 0, ""], [1, 1, 1, 1, ""]])
));

test("Testing push row",
    expect.thatResultOf(() => pushRow([["a"]], "b"), '[["a"]] + "b"')
        .toBeEqual([["a"], ["b"]])
);


displayResults();
saveLog("Code.tests");
