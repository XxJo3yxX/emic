var EXPORTED_SYMBOLS = ["parseDate"];

// parse a date in "dd.mm.yyyy hh:mm:ss" format
function parseDate(input) {
    var parts = input.split(/\D/); //RegEx => anything but number
    for (var i = 0; i < 6; ++i)
        if (!parts[i])
            parts[i] = "";
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[2], parts[1]-1, parts[0], parts[3], parts[4], parts[5]); // months are 0-based
}