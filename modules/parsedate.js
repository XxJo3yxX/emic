var EXPORTED_SYMBOLS = ["parseDate"];

// parse a date in "dd.mm.yyyy hh:mm:ss" format
function parseDate(input) {
    var parts = input.split(/\D+/); //RegExp => anything but number
    for (var i = 0; i < 6; ++i)
        if (!parts[i])
            parts[i] = "";

    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]]) // months are 0-based
    if(parts[2].length >= 4)
        return new Date(parts[2], parts[1] - 1, parts[0], parts[3], parts[4], parts[5]);

    return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
}
