
const to2DArray = require('./Code.js').to2DArray;
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

let testTo2DArray = test("tests to2DArray", expect.group(
    expect
        .resultOf(() => to2DArray("a"))
        .toBeEqual([["a"]]),
    expect
        .resultOf(() => to2DArray(["a"]))
        .toBeEqual([["a"]]),
    expect
        .resultOf(() => to2DArray(["a", "b", "c"]))
        .toBeEqual([["a"], ["b"], ["c"]]),
    expect
        .resultOf(() => to2DArray([["a"]]))
        .toBeEqual([["a"]])
));

let testEqualizeNumberOfColumns = test("teste equalizeNumbeOfColumns", expect.group(
    expect
        .resultOf(() => equalizeNumberOfColumns([[1, 2, 3], [1, 2], [1]]))
        .toBeEqual([[1, 2, 3], [1, 2, ""], [1, "", ""]]),
    expect
        .resultOf(() => equalizeNumberOfColumns([[1, 2, 3], [1, 2], [1]], [["a"], ["b"]]))
        .toBeEqual([
            [[1, 2, 3], [1, 2, ""], [1, "", ""]],
            [["a", "", ""], ["b", "", ""]]
        ]),
    /*.index(0, "arrayA")
.toBeEqual([[1, 2, 3], [1, 2, ""], [1, "", ""]])
    .and
    .index(1, "arrayB")
.toBeEqual([["a", "", ""], ["b", "", ""]])
    .setTitle('With arrayA = [[1, 2, 3], [1, 2], [1]] and arrayB = [["a"], ["b"]]\n\tby calling equalizeNumberOfColumns(arrayA, arrayB)')*/

    expect
        .resultOf(() => { return equalizeNumberOfColumns([["a"], [0], [1]], "b"); })
        .toBeEqual([
            [["a"], [0], [1]],
            [["b"]]
        ]),
    expect
        .resultOf(() => {
            return equalizeNumberOfColumns([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"]]);
        })
        .toBeEqual([
            [["a", "b", "c"], [0, 0, 0], [1, 1, 1]],
            [["d", "e", ""]]
        ]),
    expect
        .resultOf(function () { return equalizeNumberOfColumns([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0], [1]]) })
        .toBeEqual([
            [["a", "b", "c"], [0, 0, 0], [1, 1, 1]],
            [["d", "e", ""], [0, "", ""], [1, "", ""]]
        ]),
    expect
        .resultOf(function () {
            return equalizeNumberOfColumns([["a"]], "b");
        })
        .toBeEqual([
            [["a"]],
            [["b"]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfColumns("a", [["b", 0, 1]]))
        .toBeEqual([
            [["a", "", ""]],
            [["b", 0, 1]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfColumns([["a", 0, 1]], "b"))
        .toBeEqual([
            [["a", 0, 1]],
            [["b", "", ""]]
        ])
), testTo2DArray);

let testEqualizeNumberOfRows = test("test equalizeNumberOfRows", expect.group(
    expect
        .resultOf(() => equalizeNumberOfRows([[1, 2, 3], [1, 2], [1]], [["a"], ["b"]]))
        .toBeEqual([
            [[1, 2, 3], [1, 2], [1]],
            [["a"], ["b"], [""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows([["a"], [0], [1]], "b"))
        .toBeEqual([
            [["a"], [0], [1]],
            [["b"], [""], [""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"]]))
        .toBeEqual([
            [["a", "b", "c"], [0, 0, 0], [1, 1, 1]],
            [["d", "e"], ["", ""], ["", ""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0]]))
        .toBeEqual([
            [["a", "b", "c"], [0, 0, 0], [1, 1, 1]],
            [["d", "e"], [0], ["", ""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows([["a"]], "b"))
        .toBeEqual([
            [["a"]],
            [["b"]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows("a", [["b"], [1], [2]]))
        .toBeEqual([
            [["a"], [""], [""]],
            [["b"], [1], [2]]
        ])
), testTo2DArray);

test("test equalizeNumbeOfColumns and equalizeNumberOfRows", expect.group(
    expect
        .resultOf(() => equalizeNumberOfRows(...equalizeNumberOfColumns([[1, 2, 3], [1, 2], [1]], [["a"], ["b"]])))
        .toBeEqual([
            [[1, 2, 3], [1, 2, ""], [1, "", ""]],
            [["a", "", ""], ["b", "", ""], ["", "", ""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows(...equalizeNumberOfColumns([["a", "e"], [0], [1]], "b")))
        .toBeEqual([
            [["a", "e"], [0, ""], [1, ""]],
            [["b", ""], ["", ""], ["", ""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows(...equalizeNumberOfColumns([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"]])))
        .toBeEqual([
            [["a", "b", "c"], [0, 0, 0], [1, 1, 1]],
            [["d", "e", ""], ["", "", ""], ["", "", ""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows(...equalizeNumberOfColumns([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0], [1]])))
        .toBeEqual([
            [["a", "b", "c"], [0, 0, 0], [1, 1, 1]],
            [["d", "e", ""], [0, "", ""], [1, "", ""]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows(...equalizeNumberOfColumns([["a"]], "b")))
        .toBeEqual([
            [["a"]],
            [["b"]]
        ]),
    expect
        .resultOf(() => equalizeNumberOfRows(...equalizeNumberOfColumns([["a", "b"]], [["c", "d", "e"], [0, 0, 0], [1, 1, 1]])))
        .toBeEqual([
            [["a", "b", ""], ["", "", ""], ["", "", ""]],
            [["c", "d", "e"], [0, 0, 0], [1, 1, 1]]
        ])

), testEqualizeNumberOfColumns, testEqualizeNumberOfRows);

test("Testing push column", expect.group(
    expect
        .resultOf(() => pushColumn([["a"]], "b"), '[["a"]] + "b"')
        .toBeEqual([["a", "b"]]),
    expect
        .resultOf(() => pushColumn([["a"]], ["b"]), '[["a"]]+ ["b"]')
        .toBeEqual([["a", "b"]]),
    expect
        .resultOf(() => pushColumn("a", "b"), '"a"+ "b"')
        .toBeEqual([["a", "b"]]),
    expect
        .resultOf(() => pushColumn(["a"], "b"), '["a"]+ "b"')
        .toBeEqual([["a", "b"]]),
    expect
        .resultOf(() => pushColumn("a", [["b"]]), '"a"+ [["b"]]')
        .toBeEqual([["a", "b"]]),
    expect
        .resultOf(() => pushColumn([["a"], [0], [1]], [["b"], [0], [1]]),
            '[["a"], [0], [1]] + [["b"], [0], [0]]')
        .toBeEqual([["a", "b"], [0, 0], [1, 1]]),
    expect
        .resultOf(() => pushColumn([["a"], [0], [1]], "b"),
            '[["a"], [0], [1]] + "b"')
        .toBeEqual([["a", "b"], [0, ""], [1, ""]]),
    expect
        .resultOf(() => pushColumn([["a"]], [["b"], [0], [1]]),
            '[["a"]],[["b"] + [0], [1]]')
        .toBeEqual([["a", "b"], ["", 0], ["", 1]]),
    expect
        .resultOf(() => pushColumn([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0, 0], [1, 1]]),
            '[["a","b","c"],[0,0,0],[1,1,1]] + [["d","e"], [0,0], [1,1]]')
        .toBeEqual([["a", "b", "c", "d", "e"], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1]]),
    expect
        .resultOf(() => pushColumn([["a", "b", "c"], [0, 0, 0], [1, 1, 1]], [["d", "e"], [0], [1]]),
            '[["a","b","c"],[0,0,0],[1,1,1]] + [["d","e"], [0], [1]]')
        .toBeEqual([["a", "b", "c", "d", "e"], [0, 0, 0, 0, ""], [1, 1, 1, 1, ""]])
));

test("Testing push row", expect.group(
    expect
        .resultOf(() => pushRow("a", "b"))
        .toBeEqual([["a"], ["b"]]),
    expect
        .resultOf(() => pushRow([["a"]], "b"))
        .toBeEqual([["a"], ["b"]]),
    expect
        .resultOf(() => pushRow("a", ["b"]))
        .toBeEqual([["a"], ["b"]]),
    expect
        .resultOf(() => pushRow([["a", 0, 1]], "b"))
        .toBeEqual([["a", 0, 1], ["b", "", ""]]),
    expect
        .resultOf(() => pushRow(["a", 0, 1], "b"))
        .toBeEqual([["a"], [0], [1], ["b"]])
)
);


displayResults();
saveLog("Code.tests");
