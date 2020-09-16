
const to2DArray = require('./Code.js').to2DArray;
const equalizeNumberOfColumns = require('./Code.js').equalizeNumberOfColumns;
const equalizeNumberOfRows = require('./Code.js').equalizeNumberOfRows;
const pushColumn = require('./Code.js').pushColumn;
const pushRow = require('./Code.js').pushRow;
const safeAppend = require('./Code.js').safeAppend;
const matchPosition = require('./Code.js').matchPosition;
const offiset = require('./Code.js').offiset;

const OFFSETLOOKUP = require('./Code.js').OFFSETLOOKUP;
const FLATARRAY = require('./Code.js').FLATARRAY;
const LOOKUPFORKEY = require('./Code.js').LOOKUPFORKEY;
const LOOKUPFORKEYSANDREPLACETHEYINTEXT = require('./Code.js').LOOKUPFORKEYSANDREPLACETHEYINTEXT;
const REPLACEKEYSFORVALUESSINLOOKUPRANGE = require('./Code.js').REPLACEKEYSFORVALUESSINLOOKUPRANGE;
const APPLYMODIFIERS = require('./Code.js').APPLYMODIFIERS;

const SPLIT2D = require('./Code.js').SPLIT2D;

const test = require("./my-test-lib").test;
const expect = require("./my-test-lib").expect;
const displayResults = require("./my-test-lib").displayResults;
const saveLog = require("./my-test-lib").saveLog;

var range1 = [
    /*0*/["Header1", "", "Header2", "Header3", ""],
    /*1*/["Value1", "", "Value2", "Value3", ""],
    /*2*/["A", 10, 0, 0, "Lista B"],
    /*3*/["B", 11, 55, 1, "Item B.A"],
    /*4*/["C", 12, 2, 99, "Item B.B"],
    /*5*/["D", 13, 3, 3, "Item B.C"],
    /*6*/["E", 14, 4, 4, "Item B.D"],
    /*7*/["F", 15, 5, 5, "Item B.E"],
    /*8*/["Lista A", "pts", "", "", "Item B.F"],
    /*9*/["Item A.A", 0, "", "", "Item B.G"],
    /*10*/["Item A.B", 1, "", "", "Item B.H"],
    /*11*/["Item A.C", 2, "", "", "Item B.I"],
    /*12*/["Item A.D", 3, "", "", "Lista A"],
    /*13*/["Item A.E", 4, "", "", "Item Z.1"],
    /*14*/["A", 66, 33, 22, "Item Z.2"],
];

var range1Config = [
["Header1"],
["Header2"],
["Header3"],
["A"],
["B"],
["C"],
["D"],
["E"],
["F"],
["Lista A"],
["Lista B"],
["A2"],
["Lista A2"],
];

var range2 = [["Value1", "Value2", "Value3", 0, 1, 2, 3, 4, 5, "Item A.A,Item A.B,Item A.C,Item A.D,Item A.E", "0,1,2,3,4"]]


var testMatchPosition = test("Testing matchPosition", expect.group(
    expect
        .resultOf(() => matchPosition("Lista A", range1))
        .toBeEqual({ row: 8, column: 0 }),
    expect
        .resultOf(() => matchPosition("A", range1, "LAST"))
        .toBeEqual({ row: 14, column: 0 }),
    expect
        .resultOf(() => matchPosition("A", range1, "ALL"))
        .toBeEqual([{ row: 2, column: 0 }, { row: 14, column: 0 }]),

    expect
        .resultOf(() => matchPosition("Lista A", range1, "LAST"))
        .toBeEqual({ row: 12, column: 4 }),
    expect
        .resultOf(() => matchPosition("Lista A", range1, "ALL"))
        .toBeEqual([{ row: 8, column: 0 }, { row: 12, column: 4 }])
));

var testOffiset = test("Testing offiset", expect.group(
    expect
        .resultOf(() => offiset(range1, 14, 0, 0, 1, 1, 1))
        .toBeEqual(66),
    expect
        .resultOf(() => offiset(range1, 14, 0, 0, 2, 1, 1))
        .toBeEqual(33),
    expect
        .resultOf(() => offiset(range1, 14, 0, 0, 3, 1, 1))
        .toBeEqual(22),
    expect
        .resultOf(() => offiset(range1, 12, 4, 1, 0, 0, 1))
        .toBeEqual([["Item Z.1"], ["Item Z.2"]]),
));

var testOFFSETLOOKUP = test("Testing OFFSETLOOKUP", expect.group(
    expect
        .resultOf(() => OFFSETLOOKUP("A", range1, 0, 1))
        .toBeEqual(10),
    expect
        .resultOf(() => OFFSETLOOKUP("B", range1, 0, 2))
        .toBeEqual(55),
    expect
        .resultOf(() => OFFSETLOOKUP("C", range1, 0, 3))
        .toBeEqual(99),
    expect
        .resultOf(() => OFFSETLOOKUP("D", range1, 0, 1, 1, 3))
        .toBeEqual([[13, 3, 3]]),
    expect
        .resultOf(() => OFFSETLOOKUP("Header1", range1, 1, 0, 1, 1))
        .toBeEqual("Value1"),
    expect
        .resultOf(() => OFFSETLOOKUP("Header2", range1, 1, 0, 1, 1))
        .toBeEqual("Value2"),
    expect
        .resultOf(() => OFFSETLOOKUP("Lista B", range1, 1, 0, 9, 0))
        .toBeEqual([["Item B.A"], ["Item B.B"], ["Item B.C"], ["Item B.D"], ["Item B.E"], ["Item B.F"], ["Item B.G"], ["Item B.H"], ["Item B.I"]]),
    expect
        .resultOf(() => OFFSETLOOKUP("Lista A", range1, 1, 0, -1, 2))
        .toBeEqual([["Item A.A", 0], ["Item A.B", 1], ["Item A.C", 2], ["Item A.D", 3], ["Item A.E", 4]]),
    expect
        .resultOf(() => OFFSETLOOKUP("A", range1, 0, 1, 1, 1, "LAST"))
        .toBeEqual(66),
    expect
        .resultOf(() => OFFSETLOOKUP("A", range1, 0, 1, 1, 1, "ALL"))
        .toBeEqual([[10], [66]]),
    expect
        .resultOf(() => OFFSETLOOKUP("A", range1, 0, 1, 1, 3, "ALL"))
        .toBeEqual([[10, 0, 0], [66, 33, 22]]),
    expect
        .resultOf(() => OFFSETLOOKUP("Lista A", range1, 1, 0, 0, 1, "LAST"))
        .toBeEqual([["Item Z.1"], ["Item Z.2"]]),
    expect
        .resultOf(() => OFFSETLOOKUP("Lista A", range1, 1, 0, 0, 1, "ALL"))
        .toBeEqual([["Item A.A"], ["Item A.B"], ["Item A.C"], ["Item A.D"], ["Item A.E"], ["A"], ["Item Z.1"], ["Item Z.2"]]),

), testMatchPosition, testOffiset);


let testFLATARRAY = test("tests FLATARRAY", expect.group(
    expect
        .resultOf(() => FLATARRAY("a"))
        .toBeEqual(["a"]),
    expect
        .resultOf(() => FLATARRAY(["a"]))
        .toBeEqual(["a"]),
    expect
        .resultOf(() => FLATARRAY([["a"]]))
        .toBeEqual(["a"]),
    expect
        .resultOf(() => FLATARRAY([["a"], ["b"], ["c"], ["d"]]))
        .toBeEqual(["a", "b", "c", "d"]),
    expect
        .resultOf(() => FLATARRAY([["a", "b"], ["c", "d"]]))
        .toBeEqual(["a", "b", "c", "d"]),
    expect
        .resultOf(() => FLATARRAY([["a", "b"], ["c"], "d"]))
        .toBeEqual(["a", "b", "c", "d"]),
    expect
        .resultOf(() => FLATARRAY([["a", "b", "c", "d"]]))
        .toBeEqual(["a", "b", "c", "d"]),
    expect
        .resultOf(() => FLATARRAY(["a", "b", "c", "d"]))
        .toBeEqual(["a", "b", "c", "d"]),
    expect
        .resultOf(() => FLATARRAY(["a", ["b"], ["c", "d"]]))
        .toBeEqual(["a", "b", "c", "d"])
));

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
));

var testSafeAppend = test("Testing safe Append", expect.group(
    expect
        .resultOf(() => safeAppend("a", "b"))
        .toBeEqual([["a"], ["b"]]),
    expect
        .resultOf(() => safeAppend([["a"], ["b"]], "c"))
        .toBeEqual([["a"], ["b"], ["c"]]),
    expect
        .resultOf(() => safeAppend([["a"], ["b"]], [["c"], ["d"], ["e"]]))
        .toBeEqual([["a"], ["b"], ["c"], ["d"], ["e"]]),
    expect
        .resultOf(() => safeAppend("a", [["b", "c"]]))
        .toBeEqual([["a", ""], ["b", "c"]]),
    expect
        .resultOf(() => safeAppend("a", "b", true))
        .toBeEqual([["a", "b"]]),
    expect
        .resultOf(() => safeAppend([["a"], ["b"]], "c", true))
        .toBeEqual([["a", "c"], ["b", ""]]),
    expect
        .resultOf(() => safeAppend([["a"], ["b"]], [["c"], ["d"], ["e"]], true))
        .toBeEqual([["a", "c"], ["b", "d"], ["", "e"]]),
    expect
        .resultOf(() => safeAppend("a", [["b", "c"]], true))
        .toBeEqual([["a", "b", "c"]]),
));

var testLOOKUPFORKEY = test("Testing LOOKUPFORKEY", expect.group(
    expect
    .resultOf(() => LOOKUPFORKEY("A",[],range1))
    .toBeEqual([["a", "c"], ["b", "d"], ["", "e"]]),
));

displayResults();
saveLog("Code.tests");
