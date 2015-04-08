/*
    datepickr 3.0 - pick your date not your nose

    https://github.com/joshsalverda/datepickr

    Copyright © 2014 Josh Salverda <josh.salverda@gmail.com>
    This program is free software. It comes without any warranty, to
    the extent permitted by applicable law. You can redistribute it
    and/or modify it under the terms of the Do What The Fuck You Want
    To Public License, Version 2, as published by Sam Hocevar. See
    http://www.wtfpl.net/ for more details.
*/

/* All the date code needed by the calendar.
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
        return this.compare(otherDate) === 0;
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


var datepickr = function (selector, config) {
    'use strict';
    var elements,
        createInstance,
        instances = [],
        i;

    datepickr.prototype = datepickr.init.prototype;

    createInstance = function (element) {
        if (element._datepickr) {
            element._datepickr.destroy();
        }
        element._datepickr = new datepickr.init(element, config);
        return element._datepickr;
    };

    if (selector.nodeName) {
        return createInstance(selector);
    }

    elements = document.querySelectorAll(selector);

    if (elements.length === 1) {
        return createInstance(elements[0]);
    }

    for (i = 0; i < elements.length; i++) {
        instances.push(createInstance(elements[i]));
    }
    return instances;
};

/**
 * @constructor
 */
datepickr.init = function (element, instanceConfig) {
    'use strict';
    var self = this,
        defaultConfig = {
            dateFormat: '%B %e, %Y',
            altFormat: null,
            altInput: null,
            minDate: null,
            maxDate: null,
            changeMonth: false,
            changeYear: false,
            yearRange: "c-10:c+10",
            abbreviateMonth: false
        },
        initConfig,
        calendarContainer = document.createElement('div'),
        navigationCurrentMonth,
        navigationCurrentYear,
        calendar = document.createElement('table'),
        calendarBody = document.createElement('tbody'),
        wrapperElement,
        showingDate,
        selectedDate,
        wrap,
        buildDaysOfWeek,
        buildDaysInMonth,
        updateMonthMenu,
        updateYearMenu,
        updateNavigationCurrentDate,
        buildNavigation,
        rebuildCalendar,
        monthChanged,
        yearChanged,
        documentClick,
        calendarClick,
        buildCalendar,
        getOpenEvent,
        bind,
        open,
        close,
        destroy,
        init;

    initConfig = function () {
        var config;

        instanceConfig = instanceConfig || {};

        self.config = {};

        for (config in defaultConfig) {
            self.config[config] = instanceConfig[config] || defaultConfig[config];
        }

        // convert from Date to DPDate
        if (self.config.minDate && self.config.minDate.getTime) {
            self.config.minDate = new DPDate(self.config.minDate.getTime());
        }
        if (self.config.maxDate && self.config.maxDate.getTime) {
            self.config.maxDate = new DPDate(self.config.maxDate.getTime());
        }

        if (self.config.altInput && !self.config.altFormat) {
            self.config.altFormat = self.config.dateFormat;
        }

        self.config.monthNames = self.config.abbreviateMonth ?
            DPDate.monthAbbrevs : DPDate.months;
    };

    initConfig();

    calendarContainer.className = 'datepickr-calendar';

    (function () {
        var tagName;

        tagName = self.config.changeMonth ? 'select' : 'span';
        navigationCurrentMonth = document.createElement(tagName);
        navigationCurrentMonth.className = 'datepickr-current-month';

        tagName = self.config.changeYear ? 'select' : 'span';
        navigationCurrentYear = document.createElement(tagName);
        navigationCurrentYear.className = 'datepickr-current-year';
    })();

    wrap = function () {
        wrapperElement = document.createElement('div');
        wrapperElement.className = 'datepickr-wrapper';
        self.element.parentNode.insertBefore(wrapperElement, self.element);
        wrapperElement.appendChild(self.element);
    };

    // Sun/Mon Tue ... Fri Sat/Sun column headers
    buildDaysOfWeek = function () {
        var weekdayContainer = document.createElement('thead'),
            dayNames = DPDate.weekdaysInCalendarOrder();

        weekdayContainer.innerHTML = '<tr><th>' + dayNames.join('</th><th>') + '</th></tr>';
        calendar.appendChild(weekdayContainer);
    };

    // each day in the month, and overlap
    buildDaysInMonth = function () {
        var sd = showingDate,
            calDay = sd.firstCalendarDay(),
            calLast = sd.lastCalendarDay(),
            today = new DPDate(),
            mFirst = sd.firstOfMonth(),
            firstEnabled = (mFirst.compare(self.config.minDate) < 0) ?
                self.config.minDate : mFirst,
            mLast = sd.lastOfMonth(),
            lastEnabled = (mLast.compare(self.config.maxDate) < 0) ?
                mLast : self.config.maxDate;

        function tdClasses() {
            var classes = '';
            if (calDay.isSameDay(today)) {
                classes += 'today';
            }
            if (calDay.isSameDay(selectedDate)) {
                classes += ' selected';
            }
            if (calDay.compare(firstEnabled) < 0 ||
                calDay.compare(lastEnabled) > 0) {
                classes += ' disabled';
            }

            if (classes.length > 0) {
                classes = ' class="' + classes + '"';
            }
            return classes;
        }

        var html = '<tbody><tr>';
        for (; ; calDay.nextDay()) {
            html += '<td' + tdClasses() + '><span class="datepickr-day">';
            html += calDay.getDay() + '</span></td>';

            if (calDay.isSameDay(calLast)) {
                break;
            }

            if (calDay.getDayOfWeek() == DPDate.lastDayOfWeek()) {
                html += "</tr><tr>";
            }
        }
        html += '</tr></tbody>';

        calendarBody.innerHTML = html;
    };

    updateMonthMenu = function () {
        var startDate = showingDate.firstOfYear(),
            month = (startDate.compare(self.config.minDate) < 0) ?
                self.config.minDate.getMonth() : 0,
            endDate = showingDate.lastOfYear(),
            endMonth = (0 < endDate.compare(self.config.maxDate)) ?
                self.config.maxDate.getMonth() : 11,
            html = '';

        for (; month <= endMonth; month++) {
            html += '<option value="' + month + '"';
            if (showingDate.getMonth() === month) {
                html += ' selected';
            }
            html += '>' + self.config.monthNames[month];
            html += '</option>';
        }

        return html;
    };

    updateYearMenu = function () {
        function whatYear(spec) {
            var c = spec[0], year;
            if (c == '-' || c == '+') { // relative to now
                year = thisYear + parseInt(spec);
            } else if (c == 'c') { // relative to current selection
                year = showingDate.getYear() + parseInt(spec.substring(1));
            } else { // absolute year
                year = parseInt(spec);
            }
            return isNaN(year) ? thisYear : year;
        };

        var thisYear = new Date().getFullYear(),
            specs = self.config.yearRange.split(':'),
            year = whatYear(specs[0]),
            endYear = whatYear(specs[1] || ''),
            showingYear = showingDate.getYear(),
            html = '';

        if (self.config.minDate && year < self.config.minDate.getYear()) {
            year = self.config.minDate.getYear();
        }
        if (self.config.maxDate && endYear > self.config.maxDate.getYear()) {
            endYear = self.config.maxDate.getYear();
        }

        for (; year <= endYear; year++) {
            html += '<option value="' + year + '"';
            if (showingYear === year) {
                html += ' selected';
            }
            html += '>' + year + '</option>';
        }
        return html;
    };

    updateNavigationCurrentDate = function () {
        navigationCurrentMonth.innerHTML = self.config.changeMonth ?
            updateMonthMenu() : self.config.monthNames[showingDate.getMonth()];

        navigationCurrentYear.innerHTML = self.config.changeYear ?
            updateYearMenu() : showingDate.getYear();

        // XXX disable next/prev month buttons if outside min/max
    };

    rebuildCalendar = function () {
        if (showingDate.compare(self.config.minDate) < 0) {
            showingDate = self.config.minDate.clone();
        } else if (0 < showingDate.compare(self.config.maxDate)) {
            showingDate = self.config.maxDate.clone();
        }

        updateNavigationCurrentDate();
        buildDaysInMonth();
    };

    monthChanged = function () {
        showingDate.setMonth(parseInt(navigationCurrentMonth.value));
        rebuildCalendar();
    };

    yearChanged = function () {
        showingDate.setYear(parseInt(navigationCurrentYear.value));
        rebuildCalendar();
    };

    documentClick = function (event) {
        var parent;
        if (event.target !== self.element && event.target !== wrapperElement) {
            parent = event.target.parentNode;
            if (parent !== wrapperElement) {
                while (parent !== wrapperElement) {
                    parent = parent.parentNode;
                    if (parent === null) {
                        close();
                        break;
                    }
                }
            }
        }
    };

    calendarClick = function (event) {
        var target = event.target,
            targetClass = target.className;

        if (targetClass) {
            if (targetClass === 'datepickr-prev-month' ||
                targetClass === 'datepickr-next-month') {

                if (targetClass === 'datepickr-prev-month') {
                    showingDate.prevMonth();
                } else {
                    showingDate.nextMonth();
                }

                rebuildCalendar();
            } else if (targetClass === 'datepickr-day' &&
                       !target.parentNode.classList.contains('disabled')) {
                selectedDate = showingDate.clone().setDay(
                    parseInt(target.innerHTML, 10));

                if (self.config.altInput) {
                    self.config.altInput.value = selectedDate.strftime(self.config.altFormat);
                }
                self.element.value = selectedDate.strftime(self.config.dateFormat);

                close();
                buildDaysInMonth();
            }
        }
    };

    buildNavigation = function () {
        var dates = document.createElement('div');
        dates.innerHTML = '<span class="datepickr-prev-month">&lt;</span>' +
            '<span class="datepickr-next-month">&gt;</span>';
        dates.className = 'datepickr-dates';

        dates.appendChild(navigationCurrentMonth);
        dates.appendChild(navigationCurrentYear);
        calendarContainer.appendChild(dates);
    };

    buildCalendar = function () {
        buildNavigation();
        buildDaysOfWeek();
        rebuildCalendar();

        calendar.appendChild(calendarBody);
        calendarContainer.appendChild(calendar);

        wrapperElement.appendChild(calendarContainer);
    };

    getOpenEvent = function () {
        if (self.element.nodeName === 'INPUT') {
            return 'focus';
        }
        return 'click';
    };

    bind = function () {
        var stopEvent = function (ev) { ev.preventDefault(); };

        if (self.config.changeMonth) {
            navigationCurrentMonth.addEventListener('click', stopEvent);
            navigationCurrentMonth.addEventListener('change', monthChanged);
        }

        if (self.config.changeYear) {
            navigationCurrentYear.addEventListener('click', stopEvent);
            navigationCurrentYear.addEventListener('change', yearChanged);
        }

        self.element.addEventListener(getOpenEvent(), open);
        calendarContainer.addEventListener('click', calendarClick);
    };

    open = function () {
        document.addEventListener('click', documentClick);
        wrapperElement.classList.add('open');
    };

    close = function () {
        document.removeEventListener('click', documentClick);
        wrapperElement.classList.remove('open');
    };

    destroy = function () {
        var parent,
            element;

        document.removeEventListener('click', documentClick);
        self.element.removeEventListener(getOpenEvent(), open);

        parent = self.element.parentNode;
        parent.removeChild(calendarContainer);
        element = parent.removeChild(self.element);
        parent.parentNode.replaceChild(element, parent);
    };

    init = function () {
        var parsedDate;

        self.destroy = destroy;

        self.element = element;

        if (self.element.value) {
            parsedDate = Date.parse(self.element.value);
        }

        if (parsedDate && !isNaN(parsedDate)) {
            selectedDate = showingDate = new DPDate(parsedDate);
        } else {
            selectedDate = null;
            showingDate = new DPDate();
        }

        wrap();
        buildCalendar();
        bind();
    };

    init();

    return self;
};
