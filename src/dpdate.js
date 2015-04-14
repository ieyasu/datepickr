/* dpdate.js - Date wrapper-class with date calculation code needed by the
 *             datepickr calender-proper.
 * 
 *  Copyright (C) 2015 Matthew Bishop <mattsbishop@gmail.com>
 *  This program is free software. It comes without any warranty, to
 *  the extent permitted by applicable law. You can redistribute it
 *  and/or modify it under the terms of the Do What The Fuck You Want
 *  To Public License, Version 2, as published by Sam Hocevar. See
 *  http://www.wtfpl.net/ for more details.
 */

function DPDate(year, month, day) {
    // bruteforce bullshit - any better way?
    if (day !== undefined) {
        this.date = new Date(year, month, day);
    } else if (month !== undefined) {
        this.date = new Date(year, month);
    } else if (year !== undefined) {
        this.date = new Date(year);
    } else {
        this.date = new Date();
    }
    // the below just won't work right, no idea why
    //this.date = new (Date.bind.apply(Date, arguments));
}

DPDate.weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                   'Friday', 'Saturday'];
DPDate.weekdayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

DPDate.months = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November',
                 'December'];
DPDate.monthAbbrevs = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

DPDate.daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

DPDate.firstDayOfWeek = 0; // Sunday; range 0-6

DPDate.lastDayOfWeek = function() { // range 0-6
    return (DPDate.firstDayOfWeek + 6) % 7;
};

/* Rearranges DPDate.weekdayAbbrevs if DPDate.firstDayOfWeek > 0
 * so that first day is the first element of the array.
 */
DPDate.weekdaysInCalendarOrder = function() {
    if (DPDate.firstDayOfWeek < 0 || DPDate.firstDayOfWeek > 7) {
        throw "DPDate.firstDayOfWeek is outside range 0-6 (" +
              DPDate.firstDayOfWeek + ")";
    }

    var days = DPDate.weekdayAbbrevs;
    if (DPDate.firstDayOfWeek > 0) {
        days = days.slice(DPDate.firstDayOfWeek).concat(
            days.slice(0, DPDate.firstDayOfWeek));
    }
    return days;
};

DPDate.prototype = {
    clone: function() {
        return new DPDate(this.date.getTime());
    },

    getYear: function() {
        return this.date.getFullYear();
    },
    getMonth: function() {
        return this.date.getMonth();
    },
    getDay: function() {
        return this.date.getDate();
    },
    getDayOfWeek: function() {
        return this.date.getDay(); // 0 = Sunday
    },

    setYear: function(year) {
        this.date.setFullYear(year);
        return this;
    },
    setMonth: function(month) {
        this.date.setMonth(month);
        return this;
    },
    setDay: function(dayOfMonth) {
        this.date.setDate(dayOfMonth);
        return this;
    },

    compare: function(other) {
        if (!other || !other.date || !other.date.getTime) return null;
        return this.date.getTime() - other.date.getTime();
    },

    /* Returns true if this and the other date argument have the same
     * year, month and day.
     */
    isSameDay: function(otherDate) {
        return otherDate &&
            (this.getYear() === otherDate.getYear()) &&
            (this.getMonth() === otherDate.getMonth()) &&
            (this.getDay() === otherDate.getDay());
    },

    isLeapYear: function() {
        var year = this.getYear();
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    },

    daysThisMonth: function() {
        return (this.getMonth() === 1 && this.isLeapYear()) ?
            29 :
            DPDate.daysInMonth[this.getMonth()];
    },

    // return new DPDate advancing or receding by the nominal amount
    // JS's Date handles wrapping for us
    nextDay: function() {
        this.date.setDate(this.getDay() + 1);
        return this;
    },
    nextMonth: function() {
        this.date.setMonth(this.getMonth() + 1);
        return this;
    },
    prevMonth: function() {
        this.date.setMonth(this.getMonth() - 1);
        return this;
    },

    firstOfYear: function() {
        return new DPDate(this.getYear(), 0, 1);
    },
    lastOfYear: function() {
        return new DPDate(this.getYear(), 11, 31);
    },

    firstOfMonth: function() {
        return new DPDate(this.date.getTime()).setDay(1);
    },
    lastOfMonth: function() {
        return new DPDate(this.getYear(), this.getMonth(),
                          this.daysThisMonth());
    },

    firstCalendarDay: function() {
        var first = this.firstOfMonth();
        // relative to first day of week without wrapping back to 0
        var day = (first.getDayOfWeek() + DPDate.firstDayOfWeek) %
            (DPDate.firstDayOfWeek + 7);
        if (day > DPDate.firstDayOfWeek) { // first day in prev month
            first.setDay(first.getDay() - (day - DPDate.firstDayOfWeek));
        }
        return first;
    },

    lastCalendarDay: function() {
        var last = this.lastOfMonth();
        // relative to first day of week without wrapping back to 0
        var lastDayOfWeek = DPDate.firstDayOfWeek + 6;
        var day = (last.getDayOfWeek() + DPDate.firstDayOfWeek) %
            (DPDate.firstDayOfWeek + 7); // same range as lastDayOfWeek
        if (day < lastDayOfWeek) { // last day on calendar is in next month
            last.setDay(last.getDay() + (lastDayOfWeek - day));
        }
        return last;
    },

    /* Partial implementation of strftime() from C.
     */
    strftime: function(fmt) {
        var self = this;
        function formatByChar(c) {
            switch (c) {
            case 'A': // full weekday name
                return DPDate.weekdays[self.getDayOfWeek()];
            case 'a': // abbreviated weekday name
                return DPDate.weekdayAbbrevs[self.getDayOfWeek()];
            case 'B': // full month name
                return DPDate.months[self.getMonth()];
            case 'b': // abbreviated month name
                return DPDate.monthAbbrevs[self.getMonth()];
            case 'd': // 0-filled 2-char day of month
                var day = self.getDay();
                return (day < 10) ? '0' + day : day;
            case 'e': // space-filled 2-char day of month
                var day = self.getDay();
                return (day < 10) ? ' ' + day : day;
            case 'm': // 0-filled month number (01-12)
                var month = self.getMonth() + 1;
                return (month < 10) ? '0' + month : month;
            case 's': // seconds since the Epoch (UTC)
                return Math.round(self.date.getTime() / 1000);
            case 'u': // day of week (1-7), 1 = Monday, 7 = Sunday
                var day = self.getDayOfWeek();
                return (day == 0) ? 7 : day;
            case 'w': // day of week (0-6), 0 = Sunday, 6 = Saturday
                return self.getDayOfWeek();
            case 'Y': // year with century
                return self.getYear();
            case 'y': // year without century (00-99)
                return self.date.getFullYear().toString().substr(2);
            case 'z': // time zone offset from UTC
                var off = -self.date.getTimezoneOffset();
                var min = Math.abs(off) % 60, hour = Math.floor(off / 60);
                if (min < 10) min = '0' + min;
                if (Math.abs(hour) < 10) hour = '0' + hour;
                if (hour > -1) hour = '+' + hour;
                return hour + min;
            case '%': // escaped '%'
                return '%';
            default: // unrecognized fmt char, don't process
                return undefined;
            }
        };

        var s = '';
        for (var i = 0; i < fmt.length; i++) {
            if (fmt[i] === '%' && i < fmt.length - 1) {
                s += formatByChar(fmt[i + 1]) || fmt.substr(i, 2);
                i++;
            } else {
                s += fmt[i];
            }
        }

        return s;
    }
};
