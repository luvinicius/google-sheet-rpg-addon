function logDefinitions() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var range = sheet.getActiveRange();
    var cell = sheet.getRange(1, 1, 5, 5).getCell(1, 1);
    var namedRange = ss.getSheetByName("Personagens").getRange("Lourdes");
    var namedRange2 = ss.getSheetByName("Personagens").getNamedRanges()[0];
    var singleColumnRange = sheet.getRange(1, 1, 5);

    Logger.log("Spreadsheet : ", ss, isSpreadsheet_(ss));
    Logger.log("Sheet : ", sheet, isSheet_(sheet));
    Logger.log("Range : ", range, isRange_(range));
    Logger.log("Cell : ", cell, isRange_(cell));
    Logger.log("NamedRange by A1 Notation : ", namedRange, isRange_(namedRange));
    Logger.log("NamedRange from NamedRange Array : ", namedRange2, isNamedRange_(namedRange2));
    Logger.log("SingleColumnRange.values : ", is2DArray_(singleColumnRange.getValues()));
    Logger.log("Values of NamedRange by A1 Notation : ", is2DArray_(namedRange.getValues()));
    Logger.log("Values of NamedRange from NamedRange Array : ", is2DArray_(namedRange2.getRange().getValues()));

}

function isSpreadsheet_(value) { return typeof value == "object" && value == "Spreadsheet"; }

function isSheet_(value) { return typeof value == "object" && value == "Sheet"; }

function isRange_(value) { return typeof value == "object" && value == "Range"; }

function isNamedRange_(value) { return typeof value == "object" && value == "NamedRange"; }

function isSafe2DArray_(value) {
    return is2DArray_(value) && value.every(withLength_(value[0].length));
}

function is2DArray_(value) { return Array.isArray(value) && Array.isArray(value[0]); }

function isInt_(value) {
    return (Number.isInteger(value) || (typeof value == 'string' && value.match(/^[0-9]+$/))) ? true : false;
}

function isEmpty_(value) {
    if (value == null || value == undefined) {
        return true;
    } else if (typeof (value) == "string") {
        return value.replace(/[\t\s ]/g, '').length == 0;
    } else if (Array.isArray(value)) {
        return value.every(isEmpty_);
    } else {
        return false;
    }
}

function default_(defaultValue) {
    return {
        for_: function (value, treatment) {
            return {
                if_: function (...func) {
                    var reduceConditions = function (total, current) { return total || current(value); }.bind(this);
                    var returnDefault = func.reduce(reduceConditions, false);
                    return returnDefault ? defaultValue : typeof treatment === "function" ? treatment(value) : value;
                }.bind(this),
                ifIsEmpty: function () { return default_(defaultValue).for_(value, treatment).if_(isEmpty_); }.bind(this),
                ifIsEmptyOr_: function (...func) { return default_(defaultValue).for_(value, treatment).if_(isEmpty_, ...func); }.bind(this)
            };
        }.bind(this)
    };
}


function not_(conditional) {
    if (typeof conditional === "boolean") return !conditional;
    if (typeof conditional === "function") return function (...args) { return !conditional(...args) }.bind(this);
    else throw Error("not_ parameter must be a boolean or a function");
}

function and_(...conditional) {
    if (conditional.length > 0) {
        if (conditional.every(typeOf_("boolean"))) {
            return conditional.reduce(function (total, currentValue, index, arr) { return total && currentValue; });
        }
        if (conditional.every(typeOf_("function"))) {
            return function (...args) {
                return conditional.reduce(function (total, currentValue, index, arr) { return total && currentValue(...args); }, true);
            }.bind(this);
        }
    }
    throw Error("and_ parameter must be all booleans or all functions");
}

function or_(...conditional) {
    if (conditional.length > 0) {
        if (conditional.every(typeOf_("boolean"))) {
            return conditional.reduce(function (total, currentValue, index, arr) { return total || currentValue; });
        }
        if (conditional.every(typeOf_("function"))) {
            return function (...args) {
                return conditional.reduce(function (total, currentValue, index, arr) { return total || currentValue(...args); }, false);
            }.bind(this);
        }
    }
    throw Error("and_ parameter must be all booleans or all functions");
}

function in_(...options) {
    return function (arg) { return options.includes(arg); }.bind(this);
}

function typeOf_(type) {
    return function (arg) { return typeof arg === type; }.bind(this);
}

function withLength_(length) {
    return function (arg) { return arg.length === length; }.bind(this);
}

function withPropertyBetween_(property, begin, end) {
    return function (arg) { return typeof arg[property] === "number" && arg[property] >= begin && arg[property] <= end; }.bind(this);
}

function toString_(value) { return typeof value.toString === "function" ? value.toString() : typeof value; }

/**
* Remove empty rows from a array
* @param {Array<object>|Array<Array<object>>} values An array of values or array of array (lines and columns)
* @return The same list without the blank lines
* @customfunction
*/
function REMOVE_EMPTYROWS(values) {
    if (Array.isArray(values)) {
        values = values.filter(not_(isEmpty_));
    }
    return values;
}

/**
* Remove empty columns from a two dimensional array
* @param {Array<Array<object>>} values Must be a two dimensional array
* @return The same array without empty columns
* @customfunction
*/
function REMOVE_EMPTYCOLUMNS(values) {
    if (isSafe2DArray_(values)) {
        values = FLIP_TABLE(REMOVE_EMPTYROWS(FLIP_TABLE(values)));
    }
    return values;
}


/**
* Remove rows from a two dimensional array with the specified column is empty
* @param {number|Array<number>} column Must be a index number that represent the columns index which must be checked for empty values.
* Start in 0 position.
* Can be a list of columns index, in that case will remove the line if one of the column is empty.
* @param {Array<Array<object>>} values Must be a two dimensional array
* @return The same list without the removed lines 
* @customfunction
*/
function REMOVEROWS_WITH_EMPTYCOLUMN(column, values) {
    if (isSafe2DArray_(values)) {
        var filter;
        if (Array.isArray(column)) {
            column = FLATARRAY(column);
            filter = function (row) {
                var pass = true;
                for (pos in column) {
                    pass &= not_(isEmpty_(row[column[pos]]));
                }
                return pass;
            }.bind(this);
        } else {
            filter = function (row) {
                return not_(isEmpty_(row[column]));
            }.bind(this);
        }
        values = values.filter(filter);
    }
    return values;
}

/**
* Turn a tow dimensional array into a list
* @param {Array<object>|Array<Array<object>>} array Must be a list or tow dimensional array
* @return An array list where the items of values with a sub lists as value will be concatenated as root items from the new array. 
* @customfunction
*/
function FLATARRAY(array) {
    var newArray = new Array();
    for (i in array) {
        if (Array.isArray(array[i])) {
            newArray = newArray.concat(array[i]);
        } else {
            newArray.push(array[i]);
        }
    }
    return newArray;
}

/**
*Switch the columns by the rows
*@param {Array<Array<object>>} values Must be a two dimensional array
*@return A two dimensional array which one the lines will be the columns of values and the columns will be the lines.
*@customfunction
*/
function FLIP_TABLE(values) {
    if (isSafe2DArray_(values)) {
        var ncolumns = values[0].length;
        var newRows = [];
        for (var column = 0; column < ncolumns; column++) {
            var newRow = [];
            for (row in values) {
                newRow.push(values[row][column]);
            }
            newRows.push(newRow);
        }
        return newRows;
    } else {
        return values;
    }
}

/**
*@customfunction
*/

function SPLIT2D(text) {
    if (typeof text === "string") {
        if (text.match(";")) {
            if (text.match(",")) {
                return text.split(";").map(function (e) { return e.split(",") });
            } else {
                return text.split(";");
            }
        } else if (text.match(",")) {
            text.split(",")
        }
    }
    return text;
}

/**
*Extracts matching substrings according to a regular expression.
*@param {string} text The input text.
*@param {string} regular_expression The parts of text that matches this expression will be returned separated by delimiter
*@param {string|boolean=false} delimiter [optional] If defined as string will bring all the occurrences in same cell separated by the delimiter, otherwise if there is more than one ocurrency will bring at separated rows, as an array.
* @customfunction
*/
function REGEXEXTRACTALL(text, regular_expression, delimiter) {
    delimiter = default_(false).for_(delimiter).ifIsEmptyOr_(not_(typeOf_("string")));
    if (typeof text !== "string" || typeof regular_expression !== "string") throw new Error("text and regular_expression must be plain text values");
    var regex = new RegExp("(" + regular_expression + ")", "g");
    var match = text.match(regex);
    if (match) {
        var extracted = delimiter === false ? [] : "";
        for (i in match) {
            if (delimiter === false) {
                extracted.push(match[i]);
            } else {
                if (extracted.length > 0) extracted += delimiter;
                extracted += match[i];
            }
        }
        return extracted;
    }
    return undefined;
}

/**
* Filter rows of a two dimensional array whose the specified column is equal the specified value
* @param {number|Array<number>} column Must be a index number that represent the columns index which must be checked if it value is equal to specified value.
* Start in 0 position.
* Can be a list of columns index.
* @param {object|Array<object>} value Is the value that will be search in the column.
* If you want to search one specific value in more than one column, inform a list of column and only one value.
* But if you want to search a specific values for wich column, must the inform a list of values with the same size from the list of column.
* @param {Array<Array<object>>} values Must be a two dimensional array
* @return The filtered list
* @customfunction
*/
function FILTERROWS_COLUMNEQUAL(column, value, values) {
    if (is2DArray_(values)) {
        var filterLines;
        if (Array.isArray(column)) {
            column = FLATARRAY(column);
            var everyColumn;
            if (Array.isArray(value)) {
                value = FLATARRAY(value);
                if (value.length < column.length) { return values; }
                everyColumn = function (column, i, columns) { return column == value[i]; }.bind(this);
            } else {
                everyColumn = function (column, i, columns) { return column == value; }.bind(this);
            }
            filterLines = function (row) { return row.every(everyColumn); }.bind(this);
        } else {
            filterLines = function (row) { return row[column] == value; }.bind(this);
        }

        values = values.filter(filterLines);
    }
    return values;
}

/**
* Filter lines of a two dimensional array whose the specified column value match the specified patttern
* @return The filtered list
* @param {number|Array<number>} column Must be a index number that represent the columns index which must be checked if it value match pattern.
* Start in 0 position.
* Can be a list of columns index.
* @param {string|Array<string>} pattern Is the the string that represents a pattern to be match with column value.
* If you want to search one specific pattern in more than one column, inform a list of column and only one pattern.
* But if you want to search a specific pattern for wich column, must the inform a list of patterns with the same size from the list of column.
* @param {Array<Array<object>>} values Must be a two dimensional array
* @param {boolean=false} case_insensitive [Optional] Ignore the letter case for pattern match
* @param {boolean=false} multiline [Optional] match multilines values
 
* @customfunction
*/
function FILTERROWS_COLUMNMATCHPATTERN(column, pattern, values, case_insensitive, multiline) {
    var patternModifier = [];
    if (case_insensitive == true) patternModifier.push("i");
    if (multiline == true) patternModifier.push("m");

    if (is2DArray_(values)) {
        var filterLines;
        if (Array.isArray(column)) {
            column = FLATARRAY(column);
            var everyColumn;
            if (Array.isArray(pattern)) {
                pattern = FLATARRAY(pattern);
                if (pattern.length < column.pattern) { return values; }
                var mapPatternToRegex = function (patternItem) { return new RegExp(patternItem, ...patternModifier); }.bind(this);
                var regex = pattern.map(mapPatternToRegex);
                everyColumn = function (column, i, columns) {
                    var value = default_("").for_(column, toString_).ifIsEmpty();
                    return value.match(regex[i]);
                }.bind(this);
            } else {
                var regex = new RegExp(pattern, ...patternModifier);
                everyColumn = function (column, i, columns) {
                    var value = default_("").for_(column, toString_).ifIsEmpty();
                    return value.match(regex);
                }.bind(this);
            }
            filterLines = function (row) { return row.every(everyColumn); }.bind(this);
        } else {
            var regex = new RegExp(pattern, ...patternModifier);
            filterLines = function (row) {
                var value = default_("").for_(row[column], toString_).ifIsEmpty();
                return value.match(regex);
            }.bind(this);
        }

        values = values.filter(filterLines);
    }

    return values;
}

/**
* Create a new array only with the required columns
*@param {number|Array<number>} column Must be a index number that represent the columns index which must be returned in the new array.
*Start in 0 position.
*Can be a list of columns index.
*@param {Array<Array<object>>} data Must be a two dimensional array
*@result A new array with only the column informed
*@customfunction
*/
function MAPTOCOLUMN(column, data) {
    if (isSafe2DArray_(data)) {
        var collumnMapper = function (line) {
            if (Array.isArray(column)) {
                column = FLATARRAY(column);
                var newLine = [];
                for (i in column) {
                    newLine.push(line[column[i]]);
                }
                return newLine;
            } else {
                return line[column];
            }
        }.bind(this);
        data = data.map(collumnMapper);
    }
    return data;
}


/**
* Tests an expression against a list of between cases and returns the corresponding value of the first value between begin and end case, with an optional default value if nothing else is met.
*@param {number} expression The value to be checked.
*@param {number} begin_case1  The first case begin to be checked against expression.
*@param {number} end_case1  The first case end to be checked against expression.
*@param {object} value1 The corresponding value to be returned if value between case1.
*@param {number} [others_ranges_or_default,...] [optional] Additional begin cases, end cases to try if the expression isn't between the previous ones and values to be returned for these ranges. 
*Or an optional default value to be returned if none of the between cases.
*@customfunction
*/
function SWITCHBETWEEN(expression, begin_case1, end_case1, value1, ...others_ranges_or_default) {
    for (var i = 1; i < arguments.length; i += 3) {
        if (arguments.length - (i + 2) > 0) {
            if (ISBETWEEN(expression, arguments[i], arguments[i + 1])) {
                return arguments[i + 2];
            }
        }
        if (arguments.length - 1 == i) {
            return arguments[i];
        }
    }
    return undefined;
}

/**
*Check if numeric value is between interval
*@param {number} value value to be tested
*@param {number} begin the value that the interval to be tested start
*@param {number} end the value that the interval to be tested end
*@customfunction
*/
function ISBETWEEN(value, begin, end) {
    if (begin > end) {
        return value >= begin || value <= end;
    }
    return value >= begin && value <= end;
}

/**
*Checks if value is one of choices.
*@return Will return TRUE if it's or FALSE otherwise.
*@param {Object} value value to be tested
*@param {Object} validValues,... A potential valid value. May be a reference to a cell or an individual value.
*@customfunction
*/
function ISONEOF(value, ...validValues) {
    for (var i = 0; i < validValues.length; i++) if (value == validValues[i]) return true;
    return false;
}

/**
*@param
*@param
*@customfunction
*/
function LOOKUPFORKEYSANDREPLACETHEYINTEXT(text, keys_config, range, applyModifiers) {
    if (isSafe2DArray_(keys_config)) {
        var pattern = keys_config.reduce(function (total, currentValue, index, arr) { return total + (index > 0 ? '|' : '') + currentValue[0] }, '(') + ')';
        var regex = new RegExp(pattern, "g");
    }

    return text;

}

function APPLYMODIFIERS(val, range, key) {

}

/**
*Looks through a range for a key and returns a range reference shifted a specified number of rows and columns from the starting position of the referenced key.
*Its use the keys_config to know wich keys must to 
*@param {Array<string>|string} search_key Must be text to search inside the range. This key will match the entire value in cell of range, so, it's can be a regex pattern, but be aware that will always start with ^ and end with $. Can be also a list of string.
*@param {Array<Array<object>>|string} keys_config Must be a dataset with one row for each valid key and for each row must have columns by key name and the other rows must be index or offset_row,  offset column [optional], height [optional] and width [optional].
*@param {Array<Array<object>>|string} data Can que be a two dimensional arrays of values, a A1Notation string, In Google Script can be also a Range or NamedRange object
*@param {boolean=false} concatBySide [optional] if true and search_key be an list will bring values side by side
*@customfunction
*/
function LOOKUPFORKEY(search_key, keys_config, data, concatBySide) {
    if (typeof search_key != "string" && !Array.isArray(search_key)) throw new Error("search_key Must be a plain text or a list of plain texts");
    if (!isSafe2DArray_(keys_config) && keys_config.every(withPropertyBetween_("length", 2, 5))) throw new Error("keysconfig Must be a dataset with one row for each valid key and for each row must have columns by key name, index or offset_row, offset column [optional], height [optional], width [optional]");
    concatBySide = default_(false).for_(concatBySide).ifIsEmptyOr_(not_(typeOf_("boolean")));

    keys_config.sort(function (a, b) { return a[0].length - b[0].length });
    var keys = keys_config.map(function (keyCondig) { return keyCondig[0]; });


    if (Array.isArray(search_key) && keys_config) {
        search_key = FLATARRAY(search_key);
        search_key.sort(function (a, b) { return a.length - b.length });
        var dataToReturn = [];
        for (i in search_key) {
            var row = LOOKUPFORKEY(search_key[i], keys_config, data);
            if (row) { safeAppend_(dataToReturn, row, concatBySide); }
        }
        if (not_(isEmpty_(dataToReturn))) return dataToReturn;
    } else if (keys.includes(search_key)) {
        var keyConfig = keys_config.find(function (currentValue, index, arr) { return this == currentValue[0] }, search_key);
        if (keyConfig.length == 2) {
            if (is2DArray_(data)) {
                return data[0][keyConfig[1]];
            } else if (Array.isArray(data)) {
                return data[keyConfig[1]];
            }
        } else {
            return rangeLookup_(data, ...keyConfig);
        }
    }
    return undefined;
}

function safeAppend_(array, value, concatBySide) {
    if (Array.isArray(value)) {
        if (array.some(function (item) { return Array.isArray(item); })) {

            // TODO
        } else if (array.some(function (item) { return !Array.isArray(item); })) {
            // TODO
        } else {
            if (concatBySide === true) {
                // concatBySide_(array, value);
            } else {
                array.concat(value);
            }
        }
    } else {
        if (array.some(function (item) { return Array.isArray(item); })) {
            // TODO
        } else {
            if (concatBySide == true) {
                array[0] = [array[0], value];
            } else {
                array.push(value);
            }
        }
    }
}
/**
 * Put the two arrays side by side in a new tow dimensional array, with the same numbers of rows.
 * @returns will allways return a safe two dimensional. 
 * @param {object|Array<object>|Array<Array<object>>} arrayA fist array, if it's not will become one 
 * @param {object|Array<object>|Array<Array<object>>} arrayB second array, if it's not will become one
 */
function pushColumn_(arrayA, arrayB) {
    equalizeNumbeOfColumns_(arrayA);
    equalizeNumbeOfColumns_(arrayB);
    equalizeNumbeOfRows_(arrayA, arrayB);

    var newArray = [];
    for (var i = 0; i < arrayA.length; i++) {
        newArray.push([].concat(arrayA[i]).concat(arrayB[i]));
    }

    return newArray;
}

/**
 * Make the both array have the same number of columns
 * @param {Array<Array<*>>} arrays,... one or more array to equalize number os columns
 */
function equalizeNumbeOfColumns_(...arrays) {
    for (i in arrays) {
        arrays[i] = to2DArray(arrays[i]);
    }
    var nColumns = arrays.reduce(
        function (previus, current) {
            return current.reduce(_to_max_length_, previus);
        }, 0);

    for (i in arrays) {
        var array = arrays[i];
        for (j in array) {
            var row = array[j];
            while (row.length < nColumns) {
                row.push("");
            }
        }
    }
    if (arrays.length == 1) return arrays[i];
}

/**
 * Tranform the object into a two dimentional array
 * @param {*} array 
 */
function to2DArray(array) {
    if (!is2DArray_(array)) {
        if (Array.isArray(array)) {
            return array.map(function (value) { return [value] });
        } else {
            return [[array]];
        }
    }
    return array;
}

/**
 * To be used with reduce method for a array of arrays
 * @returns Return the bigger length of all arrays
 * @param {number} previus must be a length
 * @param {Array<*>} current current value
 */
var _to_max_length_ = function (previus, current) {
    return current
        ? current.length > previus
            ? current.length
            : previus
        : previus;
}

/**
 * Make the both array have the same number of rows
 * @param {Array<<*>>} arrayA 
 * @param {Array<<*>>} arrayB 
 */
function equalizeNumbeOfRows_(arrayA, arrayB) {
    if (arrayA.length != arrayB.length) {
        var nColumns = arrayA.reduce(_to_max_length_, 0);
        nColumns = arrayB.reduce(_to_max_length_, nColumns);

        if (arrayA.length > arrayB.length)
            while (arrayA.length > arrayB.length) {
                var row = [];
                for (var i = 0; i < nColumns; i++) row.push("");
                arrayB.push(row);

            }
        if (arrayB.length > arrayA.length)
            while (arrayB.length > arrayA.length) {
                var row = [];
                for (var i = 0; i < nColumns; i++) row.push("");
                arrayA.push(row);
            }
    }
}


/**
 * Put the the first array aove the second in a new tow dimensional array, with the same numbers of columns.
 * @result will allways return a safe two dimensional. 
 * @param {object|Array<object>|Array<Array<object>>} arrayA fist array, if it's not will become one 
 * @param {object|Array<object>|Array<Array<object>>} arrayB second array, if it's not will become one
 */
function pushRow_(arrayA, arrayB) {
    equalizeNumbeOfColumns_(arrayA);
    equalizeNumbeOfColumns_(arrayB);

    var newArray = [];
    for (var i = 0; i < arrayA.length; i++) {
        newArray.push([].concat(arrayA[i]).concat(arrayB[i]));
    }

    return newArray;

}




function rangeLookup_(range, search_key, offset_rows, offset_columns, height, width) {
    return OFFSETLOOKUP(search_key, range, offset_rows, offset_columns, height, width);
}

/**
*Looks through a range for a key and returns a range reference shifted a specified number of rows and columns from the starting position of the referenced key.
*@result Can be a single value if width and height be one or a two dimensional array otherwise. If the position method be ALL, even if the width and height be 1, the result will be an array.
*@param {string} search_key Must be text to search inside the range. This key will match the entire value in cell of range, so, it's can be a regex pattern, but be aware that will always start with ^ and end with $.
*@param {Array<Array<object>>|string} range Can que be a two dimensional arrays of values, a A1Notation string, In Google Script can be also a Range or NamedRange object
*@param {number=0} offset_rows The number of rows to offset by.
*@param {number=0} offset_columns The number of columns to offset by
*@param {number=1} height The height of the range to return starting at the offset target. If it's be 0 os less will bring all values below the starting position minus this height.
*@param {number=1} width The width of the range to return starting at the offset target. If it's be 0 os less will bring all values to right the starting position minus this width.
*@param {string=FIRST} match The method used to bring the first position, can be FIRST, LAST or ALL
*@customfunction
*/
function OFFSETLOOKUP(search_key, range, offset_rows, offset_columns, height, width, match) {
    if (isRange_(range)) range = range.getValues();
    else if (isNamedRange_(range)) range = range.getRange().getValues();
    else if (typeof range == "string") range = SpreadsheetApp.getActiveSpreadsheet().getRange(range).getValues();
    if (!isSafe2DArray_(range)) return undefined;

    offset_rows = default_(0).for_(offset_rows, parseInt).ifIsEmptyOr_(not_(isInt_));
    offset_columns = default_(0).for_(offset_columns, parseInt).ifIsEmptyOr_(not_(isInt_));
    height = default_(1).for_(height, parseInt).ifIsEmptyOr_(not_(isInt_));
    width = default_(1).for_(width, parseInt).ifIsEmptyOr_(not_(isInt_));

    match = default_("FIRST").for_(match).ifIsEmptyOr_(not_(in_("FIRST", "LAST", "ALL")));
    search_key = default_("").for_(search_key, toString_).ifIsEmpty();

    var regex = new RegExp("^" + search_key + "$");

    var position_row = match === "ALL" ? [] : undefined;
    var position_column = match === "ALL" ? [] : undefined;
    var findAll = false;
    var starting_row = match === "LAST" ? range.length - 1 : 0;
    var end_row = match === "LAST" ? 0 : range.length;
    var conditional = match === "LAST" ?
        function (findAll, current, last) { return findAll === false && current >= last; }
        : function (findAll, current, last) { return findAll === false && current < last; };
    var starting_column = match === "LAST" ? range[0].length - 1 : 0;
    var end_column = match === "LAST" ? 0 : range[0].length;
    var step = match === "LAST" ? -1 : 1;

    for (var row = starting_row; conditional(findAll, row, end_row); row += step) {
        for (var column = starting_column; conditional(findAll, column, end_column); column += step) {
            var value = range[row][column];
            value = default_("").for_(value, toString_).ifIsEmpty();
            if (value.match(regex)) {
                if (match === "ALL") {
                    position_row.push(row);
                    position_column.push(row);
                } else {
                    position_row = row;
                    position_column = column;
                    findAll = true;
                }
            }
        }
    }

    if ((match === "ALL" && position_row.length === 0) || findAll === false || position_row === undefined) {
        throw new Error("Not find key " + search_key + " in range");
    }

    var first_row = match === "ALL" ? position_row[0] : position_row;
    var first_column = match === "ALL" ? position_column[0] : position_column;

    var finded = getPositionOfficet_(first_row, first_column, range, offset_rows, offset_columns, height, width);

    if (match === "ALL") {
        for (var index = 1; index < position_row.length; index++) {
            var nextRow = position_row(index);
            var nextColumn = position_column(index);
            if (!is2DArray_(finded)) { finded = [[finded]]; }
            var next = getPositionOfficet_(nextRow, nextColumn, range, offset_rows, offset_columns, height, width);
            if (!is2DArray(next)) { next = [[next]]; }
            finded.concat(next);
        }
    }
    if ((Array.isArray(finded) && isSafe2DArray_(finded)) || not_(isEmpty_(finded))) {
        return finded;
    }
    return undefined;

}

function getPositionOfficet_(row, column, range, offset_rows, offset_columns, offsetHeight, offsetWidth) {
    row += offset_rows;
    column += offset_columns;

    var rangeHeight = range.length;
    var rangeWidth = range[0].length;

    if (offsetHeight <= 0) offsetHeight = rangeHeight + offsetHeight - row;
    if (offsetWidth <= 0) offsetWidth = rangeWidth + offsetWidth - column;



    var offsetRange;
    if (offsetHeight == 1 && offsetWidth == 1) {
        offsetRange = range[row][column];
    } else {
        offsetRange = [];
        for (var nextRow = row; nextRow < row + offsetHeight && nextRow < rangeHeight; nextRow++) {
            var offsetRow = [];
            for (var nextColumn = column; nextColumn < column + offsetWidth && nextColumn < rangeWidth; nextColumn++) {
                if (not_(isEmpty_(range[nextRow][nextColumn]))) {
                    offsetRow.push(range[nextRow][nextColumn]);
                } else {
                    offsetRow.push("");
                }
            }
            if (not_(isEmpty_(offsetRow))) {
                offsetRange.push(offsetRow)
            }
        }
    }

    return offsetRange;
}





/**
*Replaces part of a text string with a different text, the parts will be replace are the ones with {}, or {number} if 
*Format text, replacing the next { } for the value iformed, if it's have more than one value, you can ordenate the order o appearence in using the row position of value. 
*Examples:  1) text {}
*@param {string} text The text, a part of which will be replaced.
*@param {string|Array<string>} replacement The text which will be inserted into the original text.
*@param {boolean=false} splitComma [optional] Split comma in replacement if it's not already an array
*@customfunction
*/
function FORMAT(text, replacement, splitComma) {
    return format_(text, replacement, splitComma);
}


/**
*@param {string} text A text to be formated
*@param {string|Array<string>} replacement the value or values to put inside the text
*@param {boolean=false} splitComma [optional] Split comma in replacement if it's not already an array
*@param {number=1} pos [optional] Don't need to inform, it's control the index of {} that will be formatted, if 1 will change {1} for value, if 2 will change {2}, and so on.
*/
function format_(text, replacement, splitComma, pos) {
    if (typeof text != "string") throw Error("Text must to be string");
    if (typeof replacement != "string" && !Array.isArray(replacement)) throw Error("Replacement must to be string or Array");
    if (Array.isArray(replacement)) { replacement = FLATARRAY(replacement); }
    splitComma = default_(false).for_(splitComma).ifIsEmpty();
    pos = default_(1).for_(pos).ifIsEmpty();

    if (typeof replacement === "string" && splitComma === true && replacement.match(/\s*,\s*/)) {
        replacement = replacement.split(/\s*,\s*/);
    }

    if (Array.isArray(replacement)) {
        for (i in replacement) {
            text = format_(text, replacement[i], splitComma, pos);
            pos++;
        }
    } else {
        replacement = toString_(replacement);
        text = text.replace(/\{\s*\}/, replacement);
        text = text.replace(new RegExp("{\s*" + pos + "\s*}", "g"), replacement);
    }

    return text;
}

/**
*
**@customfunction
*/
function REPLACEKEYSFORVALUESSINLOOKUPRANGE(text, keys, range, offsets_rows, offsets_columns, heights, widths, match) {
    for (var i = 0; i < keys.length; i++) {

    }
}


/**
*Get the result of a roll dice
*@param {number} numberOfFaces number of faces of dice to be roll
*@customfunction
*/
function DICEROLL(numberOfFaces) {
    return Math.round(1 + (Math.random() * (numberOfFaces - 1)));

}

var REGEX_DICE = /([\+\-]?)([1-9][0-9]*)?([dD][1-9][0-9]*)/ig;
/*                    1        2                3            */
var REGEX_DICE_COMMAND = /(([\+\-]?)([1-9][0-9]*)?([dD][1-9][0-9]*)|([\+\-])([1-9][0-9]*))/ig;
/*                             2        oes not ma   3              4             5          6         */


/**
* Calculate a dice roll operation. Accepts sum and subtraction operation
*@return An Array where the first position is the final result
*@param {string} command Example 1D6+4
*@customfunction
*/
function CALCDISCEROLLOP(command) {
    var rolls = {};
    var total = 0;
    while ((match = REGEX_DICE_COMMAND.exec(command)) !== null) {
        if (match[4]) {
            var numeroRolagens = isInt_(match[3]) ? parseInt(match[3]) : 1;
            if (numeroRolagens == 0) numeroRolagens = 1;
            var subTotal = 0;
            for (var i = 0; i < numeroRolagens; i++) {
                var numeroFaces = parseInt(match[4].replace(/[dD]/i, ''));
                var rolagem = DICEROLL(numeroFaces);
                subTotal += rolagem;

                var key = match[4].toUpperCase();
                if (rolls[key] == undefined) rolls[key] = [];
                if (match[2] == '-') {
                    rolagem *= -1;
                }
                rolls[key].push(rolagem);
            }
            if (match[2] == '-') {
                total -= subTotal;
            } else {
                total += subTotal;
            }
        } else if (match[6]) {
            if (rolls['estatico'] == undefined) rolls['estatico'] = [];
            var valorEstatico = parseInt(match[6]);
            if (match[5] == '-') valorEstatico *= -1;
            total += valorEstatico;
            rolls['estatico'].push(valorEstatico);
        }
    }
    var result = [];
    result[0] = total;
    for (key in rolls) {
        if (Array.isArray(rolls[key]) && key != 'estatico') {
            result.push([key].concat(...rolls[key]));
        }
    }
    if (rolls['estatico']) result.push(['Estatico'].concat(...rolls['estatico']));

    return result;
}



/**
*Extract the dices from a text
*@retrun a text with the dices to be rolled separated by comma, Ex. For text 1D6+4+2D4, will return 1D6,2D4 and ignore the static 2.
*@param {string} text a text like 1D6+4+2D4
*@customfunction
*/
function EXTRACTDICES(text) {
    var pattern = /(([1-9][0-9]*)([dD][1-9][0-9]*))/g;
    var dices = text.match(pattern);
    if (dices) {
        return dices.join(", ");
    } else {
        return "";
    }

}

/**
*Replaces all the dices 
*@param{string} text a text like 1D6+4+2D4
*@param{string} key a key like d or {} to be used in format 
*@customfunction
*/
function REPLACEDICECOMMANDFORKEYS(text, key) {
    var pattern = /(([1-9][0-9]*)?([dD][1-9][0-9]*))/g;
    var dices = text.match(pattern);
    if (dices) {
        for (i in dices) {
            text = text.replace(dices[i], key);
        }
    }
    return text;
}

function RESOLVE_CRITERIO(apelido, criterio, atributo = undefined, modificador = undefined, dado = undefined) {
    if (atributo) {
        if (Array.isArray(atributo)) {
            criterio = pformat_(criterio, atributo, /a/);
        } else {

            criterio = criterio.replace(/a/g, atributo);
        }
    }
    criterio = criterio.replace(/a/g, 0);

    criterio = RESOLVE_ATRIBUTOS(apelido, criterio);

    if (modificador) {
        if (Array.isArray(modificador)) {
            criterio = pformat_(criterio, modificador, /m/);
        } else {
            criterio = criterio.replace(/m/g, modificador);
        }
    }
    criterio = criterio.replace(/m/g, 0);

    var rolls = criterio.match(REGEX_DICE);
    for (i in rolls) {
        var rollDice = rolls[i];
        criterio = criterio.replace(rollDice, DICE_COMMNAD(rollDice)[0]);
    }

    if (dado || dado == 0) {
        if (Array.isArray(dado)) {
            criterio = pformat_(criterio, dado, /d/);
        } else {
            criterio = criterio.replace(/d/g, dado);
        }
    }
    criterio = criterio.replace(/d/g, '0');

    criterio = criterio.replace(/(\+\s*\-|\-\s*\+)/g, '-');
    criterio = criterio.replace(/(\+\s*\+|\-\s*\-)/g, '+');

    return criterio;
}

/**
*Evaluate a matematical formula inside brakets
*@param text such a text like (2+2*(4+5))
*@customfunction
*/
function EVALMATHINBRACKETS(text) {
    if (typeof text !== "string") {
        throw new Error("value must be a text");
    } else {
        var pattern = /\([0-9]+(\.[0-9]+)?(\s*[\+\-\*\/]\s*[0-9]+(\.[0-9]+)?)+\)/g;
        if (text.match(pattern)) {
            var replace = text.match(pattern);
            while (not_(isEmpty_(replace))) {
                replace = replace[0];
                text = text.replace(replace, eval(replace));
                replace = text.match(pattern);
            }
        }
        return text;
    }
}

/**
*Evaluate a matematical formula without brakets
*@param {string} text Such a text like 2+4 or 2*2+3
*@customfunction
*/
function EVALSIMPLEMATH(text) {
    if (typeof text !== "string") {
        throw new Error("value must be a text");
    } else {
        var pattern = /[0-9]+(\.[0-9]+)?(\s*[\+\-\*\/]\s*[0-9]+(\.[0-9]+)?)+/g;
        if (text.match(pattern)) {
            var replace = text.match(pattern);
            while (not_(isEmpty_(replace))) {
                replace = replace[0];
                text = text.replace(replace, eval(replace));
                replace = text.match(pattern);
            }
        }
        return text;
    }
}

/**
*Evaluate a matematical formula
*@param {string} text Such a text like 2+4 or 2*2+3 or 2*(2/4)
*@customfunction
*/
function EVALMATH(text) {
    text = EVALMATHINBRACKETS(text);
    text = EVALSIMPLEMATH(text);
    return text;
}

/**
*Evaluate a matematical formula.
*Valid comparisons: > Greater then; < Less then; >= Greater or equal than; <= Less or equal than; == equal than; != not equal than; 
*@param {string} text Something like 3 > 1 or 2 < 4 or 4 != 6 or 4 == 6
*@customfunction
*/
function EVALLOGICS(text) {
    if (typeof text !== "string") {
        throw new Error("value must be a text");
    } else {
        var pattern = /\-?[0-9]+(\.[0-9]+)?\s*([\<\>]\=?|\={2,3}|\!\={1,2})\s*\-?[0-9]+(\.[0-9]+)?/g;
        if (text.match(pattern)) {
            var replace = text.match(pattern);
            while (not_(isEmpty_(replace))) {
                replace = replace[0];
                text = text.replace(replace, eval(replace));
                replace = text.match(pattern);
            }
        }
        return text;
    }
}

/**
*Evaluate conditional statements with pattern = true or false ? 'Value if True' : 'Value if False'
*@param {string} text A text like true?'TRUE VALUE':'FALSE VALUE'. 
*Works fine with nested conditional statements into true value like in true?true?'EXTRA BIGGER':'BIGGER':'LESS',
* But will crash if you try to put another conditional statements nested into false value,
* something like true?'BIGGER':true?'EXTRA LESSER':'LESSER', so, don't do that.
*@customfunction
*/
function EVALIF(text) {
    if (typeof text !== "string") {
        throw new Error("value must be a text");
    } else {
        var pattern = /\(?(true|false)\?(.+)\:(.+)\)?/;
        if (text.match(pattern)) {
            var match = text.match(pattern);
            while (not_(isEmpty_(match))) {
                var replace = match[0];
                var conditional = eval(match[1]);
                var ifTrue = match[2];
                var ifFalse = match[3];
                text = text.replace(replace, conditional ? ifTrue : ifFalse);
                match = text.match(pattern);
            }
        }
        return text;
    }
}

/**
*Evaluate math operations, logical comparison or conditional statements with pattern = true or false ? 'Value if True' : 'Value if False'
*@customfunction
*/
function EVAL(text) {
    text = EVALMATH(text);
    text = EVALLOGICS(text);
    text = EVALIF(text);
    return text;
}


/*Botoes*/
function PlanilhaJogar_btn_atribuirEstado() {

}

function PlanilhaJogar_btn_removerEstado() {

}

function PlanilhaJogar_btn_rolarAtaque() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Jogar');
    var texto = sheet.getRange(5, 2).getCell(1, 1).getValue();
    var resultado = DICE_COMMNAD(texto);
    sheet.getRange(5, 3).setValue(resultado.total);
}

function PlanilhaJogar_btn_rolarDefesa() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Jogar');
    var texto = sheet.getRange(8, 2).getValue();
    var resultado = DICE_COMMNAD(texto);
    sheet.getRange(8, 3).setValue(resultado.total);
}

function PlanilhaJogar_btn_receberDano() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Jogar');
    var apelido = sheet.getRange(7, 1).getCell(1, 1).getValue();
    if (GET_TIPO_ATOR(apelido) == 'Personagem') {

    } else {

    }
}

function PlanilhaJogar_btn_rolarTeste() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Jogar');
    var texto = sheet.getRange(14, 1).getCell(1, 1).getValue();
    var resultado = DICE_COMMNAD(texto);
    sheet.getRange(12, 5).getCell(1, 1).setValue(resultado.total);
}

function PlanilhaJogar_btn_passaTurno() {

}

function PlanilhaJogar_btn_passaOrdem() {

}

function PlanilhaJogar_btn_usarItemIventario() {

}

function PlanilhaJogar_btn_resetarJogadores() {

}

function PlanilhaJogar_btn_rolarIniciativaAdiversarios() {

}

function PlanilhaJogar_btn_adicionarInimigos() {

}

function PlanilhaJogar_btn_aplicarInimigos() {

}

function PlanilhaJogar_btn_aplicarJogadores() {

}

/*Triggers*/
function onEdit(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = ss.getActiveSheet().getName();
    var activeCell = ss.getActiveCell();
    var column = activeCell.getColumn();
    var row = activeCell.getRow();


    var newValue;
    var oldValue;

    if (column == 3 && row >= 2 && sheetName == "Inimigos") {
        newValue = e.value;
        oldValue = e.oldValue;
        if (!e.value) {
            activeCell.setValue("");
        }
        else {
            if (!e.oldValue) {
                activeCell.setValue(newValue);
            }
            else {
                activeCell.setValue(oldValue + ', ' + newValue);
            }
        }
    }
}

function onOpen() {
    var config = {
        player_sheet: {
            name: "Personagens",
            type: "NamedRange",
            attr:
                [
                    { name: "F", c_pad: 3, l_pad: 0 },
                    { name: "H", c_pad: 3, l_pad: 0 },
                    { name: "R", c_pad: 3, l_pad: 0 },
                    { name: "A", c_pad: 3, l_pad: 0 },
                    { name: "PDF", c_pad: 3, l_pad: 0 },
                    { name: "FM", c_pad: 3, l_pad: 0 },
                    { name: "PVE", c_pad: 3, l_pad: 0 },
                    { name: "PME", c_pad: 3, l_pad: 0 },
                    { name: "PV", c_pad: 1, l_pad: 0 },
                    { name: "PM", c_pad: 1, l_pad: 0 },
                    { name: "DF", c_pad: 1, l_pad: 0 },
                    { name: "DPDF", c_pad: 1, l_pad: 0 },
                    { name: "DAM", c_pad: 1, l_pad: 0 },
                    { name: "DEF", c_pad: 1, l_pad: 0 },
                    { name: "ESQ", c_pad: 1, l_pad: 0 },
                    { name: "INI", c_pad: 1, l_pad: 0 },
                    { name: "PC", c_pad: 1, l_pad: 0 },
                    { name: "PP", c_pad: 1, l_pad: 0 },
                    { name: "PO", c_pad: 1, l_pad: 0 },
                    { name: "INT", c_pad: 1, l_pad: 0 },
                    { name: "CAR", c_pad: 1, l_pad: 0 },
                    { name: "REP", c_pad: 1, l_pad: 0 },
                    { name: "LVLG", c_pad: 1, l_pad: 0 }
                ],
            fields:
                [
                    { name: "Nome", c_pad: 0, l_pad: 1 },
                    { name: "Jogador", c_pad: 0, l_pad: 1 },
                    { name: "Raça", c_pad: 0, l_pad: 1 },
                    { name: "Classe", c_pad: 0, l_pad: 1 }
                ],
            lists:
                [
                    { name: "Aspectos", orientation: "VERTICAL", pad: "DOWN" },
                    { name: "Novos Aspectos", orientation: "VERTICAL", pad: "DOWN" },
                    { name: "Iventário", orientation: "VERTICAL", pad: "DOWN" }
                ],
            tables:
                [
                    { name: "ataques", headers: ["Equipamento/ Técnicas/ Magias", "Tipo", "Efeito", "Dano", "Custo Uso"], orientation: "VERTICAL", pad: "DOWN" }
                ],
            usable_itens: { name: "Iventário", type: "list" },
            wearable_itens: { name: "ataques", type: "list" },
            collectible_itens: { name: "Iventário", type: "list" },
            attacks: { name: "ataques", type: "list" },
        }
    }

    PropertiesService.getScriptProperties().setProperty("config", config);

    /*SpreadsheetApp.getUi()
        .createMenu('RPG')
        .addItem('Abrir Assistente', 'showRPGSideBar')
        .addToUi();*/
}

/*Pages*/
function showRPGSideBar() {
    var htmlOutput = HtmlService.createHtmlOutputFromFile("RPGSideBar")
        .setTitle('Assistente RPG')
        .setWidth(400)
        .setSandboxMode(HtmlService.SandboxMode.NATIVE)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    SpreadsheetApp.getUi().showSidebar(htmlOutput);
}

function getProperty(key) {
    return PropertiesService.getScriptProperties().getProperty(key);
}

function getEvalProperty(key) {
    return eval(PropertiesService.getScriptProperties().getProperty(key));
}

function getJSONProperty(key) {
    return JSON.parse(PropertiesService.getScriptProperties().getProperty(key));
}

function setProperties(key, value) {
    if (typeof (value) == "object" || Array.isArray(value)) {
        value = JSON.stringify(value);
    } else {
        value = value.toString();
    }

    PropertiesService.getScriptProperties().setProperty(key, value)
}

function commit() {

}


module.exports = {
    safeAppend: safeAppend_,
    pushColumn: pushColumn_,
    pushRow: pushRow_,
    equalizeNumbeOfColumns: equalizeNumbeOfColumns_,
    REMOVE_EMPTYROWS: REMOVE_EMPTYROWS,
    REMOVE_EMPTYCOLUMNS: REMOVE_EMPTYCOLUMNS,
    REMOVEROWS_WITH_EMPTYCOLUMN: REMOVEROWS_WITH_EMPTYCOLUMN,
    FLATARRAY: FLATARRAY,
    FLIP_TABLE: FLIP_TABLE,
    SPLIT2D: SPLIT2D,
    REGEXEXTRACTALL: REGEXEXTRACTALL,
    FILTERROWS_COLUMNEQUAL: FILTERROWS_COLUMNEQUAL,
    FILTERROWS_COLUMNMATCHPATTERN: FILTERROWS_COLUMNMATCHPATTERN,
    MAPTOCOLUMN: MAPTOCOLUMN,
    SWITCHBETWEEN: SWITCHBETWEEN,
    ISBETWEEN: ISBETWEEN,
    ISONEOF: ISONEOF,
    LOOKUPFORKEYSANDREPLACETHEYINTEXT: LOOKUPFORKEYSANDREPLACETHEYINTEXT,
    APPLYMODIFIERS: APPLYMODIFIERS,
    LOOKUPFORKEY: LOOKUPFORKEY,
    OFFSETLOOKUP: OFFSETLOOKUP,
    FORMAT: FORMAT,
    REPLACEKEYSFORVALUESSINLOOKUPRANGE: REPLACEKEYSFORVALUESSINLOOKUPRANGE,
    DICEROLL: DICEROLL,
    CALCDISCEROLLOP: CALCDISCEROLLOP,
    EXTRACTDICES: EXTRACTDICES,
    REPLACEDICECOMMANDFORKEYS: REPLACEDICECOMMANDFORKEYS,
    RESOLVE_CRITERIO: RESOLVE_CRITERIO,
    EVALMATHINBRACKETS: EVALMATHINBRACKETS,
    EVALSIMPLEMATH: EVALSIMPLEMATH,
    EVALMATH: EVALMATH,
    EVALLOGICS: EVALLOGICS,
    EVALIF: EVALIF,
    EVAL: EVAL
}