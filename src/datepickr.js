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

/* All the date code needed by the calendar code.
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

DPDate.firstDayOfWeek = 0; // Sunday

DPDate.prototype = {
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

    /* Returns true if this and the other date argument have the same
     * year, month and day.
     */
    isSameDay: function(otherDate) {
        return otherDate &&
            otherDate.getYear && this.getYear() === otherDate.getYear() &&
            otherDate.getMonth && this.getMonth() == otherDate.getMonth() &&
            otherDate.getDay && this.getDay() == otherDate.getDay();
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

    clamp: function(min, max) {
        if (min) {
            if (min.date) {
                min = min.date;
            }
            if (this.date < min) {
                this.date.setFullYear(min.getFullYear(), min.getMonth(), min.getDate());
            }
        }
        if (max) {
            if (max.date) {
                max = max.date;
            }
            if (this.date > max) {
                this.date.setFullYear(max.getFullYear(), max.getMonth(), max.getDate());
            }
        }
        return this;
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

    elements = datepickr.prototype.querySelectorAll(selector);

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
            dateFormat: 'F j, Y',
            altFormat: null,
            altInput: null,
            minDate: null,
            maxDate: null,
            changeMonth: false,
            changeYear: false,
            yearRange: "c-10:c+10",
            shorthandCurrentMonth: false
        },
        initConfig,
        calendarContainer = document.createElement('div'),
        navigationCurrentMonth,
        navigationCurrentYear,
        calendar = document.createElement('table'),
        calendarBody = document.createElement('tbody'),
        wrapperElement,
        dateNow = new Date(),
        wrap,
        date,
        formatDate,
        monthToStr,
        isSpecificDay,
        buildWeekdays,
        calcNumDays,
        buildDays,
        currentYearRange,
        updateNavigationChangingMonth,
        updateNavigationChangingYear,
        updateNavigationCurrentDate,
        buildNavigation,
        handleYearChange,
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

    formatDate = function (dateFormat, milliseconds) {
        var formattedDate = '',
            dateObj = new Date(milliseconds),
            formats = {
                d: function () {
                    var day = formats.j();
                    return (day < 10) ? '0' + day : day;
                },
                D: function () {
                    return self.l10n.weekdays.shorthand[formats.w()];
                },
                j: function () {
                    return dateObj.getDate();
                },
                l: function () {
                    return self.l10n.weekdays.longhand[formats.w()];
                },
                w: function () {
                    return dateObj.getDay();
                },
                F: function () {
                    return monthToStr(formats.n() - 1, false);
                },
                m: function () {
                    var month = formats.n();
                    return (month < 10) ? '0' + month : month;
                },
                M: function () {
                    return monthToStr(formats.n() - 1, true);
                },
                n: function () {
                    return dateObj.getMonth() + 1;
                },
                U: function () {
                    return dateObj.getTime() / 1000;
                },
                y: function () {
                    return String(formats.Y()).substring(2);
                },
                Y: function () {
                    return dateObj.getFullYear();
                }
            },
            formatPieces = dateFormat.split('');

        self.forEach(formatPieces, function (formatPiece, index) {
            if (formats[formatPiece] && formatPieces[index - 1] !== '\\') {
                formattedDate += formats[formatPiece]();
            } else {
                if (formatPiece !== '\\') {
                    formattedDate += formatPiece;
                }
            }
        });

        return formattedDate;
    };

    monthToStr = function (date, shorthand) {
        if (shorthand === true) {
            return self.l10n.months.shorthand[date];
        }

        return self.l10n.months.longhand[date];
    };

    isSpecificDay = function (day, month, year, comparison) {
        return day === comparison && self.currentMonthView === month && self.currentYearView === year;
    };

    buildWeekdays = function () {
        var weekdayContainer = document.createElement('thead'),
            firstDayOfWeek = self.l10n.firstDayOfWeek,
            weekdays = self.l10n.weekdays.shorthand;

        if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
            weekdays = [].concat(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
        }

        weekdayContainer.innerHTML = '<tr><th>' + weekdays.join('</th><th>') + '</th></tr>';
        calendar.appendChild(weekdayContainer);
    };

    calcNumDays = function () {
        // checks to see if february is a leap year otherwise return the respective # of days
        return self.currentMonthView === 1 && (((self.currentYearView % 4 === 0) && (self.currentYearView % 100 !== 0)) || (self.currentYearView % 400 === 0)) ? 29 : self.l10n.daysInMonth[self.currentMonthView];
    };

    buildDays = function () {
        var firstOfMonth = new Date(self.currentYearView, self.currentMonthView, 1).getDay(),
            numDays = calcNumDays(),
            calendarFragment = document.createDocumentFragment(),
            row = document.createElement('tr'),
            dayCount,
            dayNumber,
            today = '',
            selected = '',
            disabled = '',
            workingDate;

        // Offset the first day by the specified amount
        firstOfMonth -= self.l10n.firstDayOfWeek;
        if (firstOfMonth < 0) {
            firstOfMonth += 7;
        }

        dayCount = firstOfMonth;
        calendarBody.innerHTML = '';

        // Add spacer to line up the first day of the month correctly
        if (firstOfMonth > 0) {
            row.innerHTML += '<td colspan="' + firstOfMonth + '">&nbsp;</td>';
        }

        // Start at 1 since there is no 0th day
        for (dayNumber = 1; dayNumber <= numDays; dayNumber++) {
            // if we have reached the end of a week, wrap to the next line
            if (dayCount === 7) {
                calendarFragment.appendChild(row);
                row = document.createElement('tr');
                dayCount = 0;
            }

            today = isSpecificDay(dateNow.getDate(), dateNow.getMonth(), dateNow.getYear(), dayNumber) ? ' today' : '';
            if (self.selectedDate) {
                selected = isSpecificDay(self.selectedDate.day, self.selectedDate.month, self.selectedDate.year, dayNumber) ? ' selected' : '';
            }

            if (self.config.minDate || self.config.maxDate) {
                workingDate = new Date(self.currentYearView, self.currentMonthView, dayNumber);
                if ((self.config.minDate && workingDate < self.config.minDate) ||
                    (self.config.maxDate && workingDate > self.config.maxDate)) {
                    disabled = ' disabled';
                } else {
                    disabled = '';
                }
            }

            row.innerHTML += '<td class="' + today + selected + disabled + '"><span class="datepickr-day">' + dayNumber + '</span></td>';
            dayCount++;
        }

        calendarFragment.appendChild(row);
        calendarBody.appendChild(calendarFragment);
    };

    updateNavigationChangingMonth = function () {
        var html = '', month = 0, endMonth = 11, selected;

        // XXX if we're outside the range, clamp to min or max and restart DOM update
        if (self.config.minDate && new Date(self.currentYearView, 0) < self.config.minDate) {
            month = self.config.minDate.getMonth(); // start after January
        }

        if (self.config.maxDate && self.config.maxDate < new Date(self.currentYearView, 11)) {
            endMonth = self.config.maxDate.getMonth(); // end before December
        }

       for (; month <= endMonth; month++) {
            selected = (month === self.currentMonthView) ? ' selected' : '';
            html += '<option value="' + month + '"' + selected + '>';
            html += monthToStr(month, self.config.shorthandCurrentMonth);
            html += '</option>';
        }

        return html;
    };

    updateNavigationChangingYear = function () {
        var thisYear = new Date().getFullYear(),
            whatYear = function (spec) {
                var year;
                switch (spec[0]) {
                case '-':
                case '+': // relative to now
                    year = thisYear + parseInt(spec);
                    break;
                case 'c': // relative to current selection
                    year = self.currentYearView + parseInt(spec.substring(1));
                    break;
                default: // absolute year
                    year = parseInt(spec);
                    break;
                }
                return isNaN(year) ? thisYear : year;
            },
            specs = self.config.yearRange.split(':'),
            year = whatYear(specs[0]),
            endYear = whatYear(specs[1] || ''),
            html = '';

        if (self.config.minDate) {
            year = Math.max(self.config.minDate.getFullYear(), year);
        }
        if (self.config.maxDate) {
            endYear = Math.min(self.config.maxDate.getFullYear(), endYear);
        }

        for (; year <= endYear; year++) {
            html += '<option value="' + year + '"';
            if (year === self.currentYearView) {
                html += ' selected';
            }
            html += '>' + year + '</option>';
        }

        return html;
    };

    updateNavigationCurrentDate = function () {
        navigationCurrentMonth.innerHTML = self.config.changeMonth ?
            updateNavigationChangingMonth() :
            monthToStr(self.currentMonthView, self.config.shorthandCurrentMonth);

        navigationCurrentYear.innerHTML = self.config.changeYear ?
            updateNavigationChangingYear() : self.currentYearView;
    };

    buildNavigation = function () {
        var dates = document.createElement('div'),
            monthNavigation;

        monthNavigation  = '<span class="datepickr-prev-month">&lt;</span>';
        monthNavigation += '<span class="datepickr-next-month">&gt;</span>';

        dates.className = 'datepickr-dates';
        dates.innerHTML = monthNavigation;

        dates.appendChild(navigationCurrentMonth);
        dates.appendChild(navigationCurrentYear);

        updateNavigationCurrentDate();
        calendarContainer.appendChild(dates);
    };

    handleYearChange = function () {
        if (self.currentMonthView < 0) {
            self.currentYearView--;
            self.currentMonthView = 11;
        }

        if (self.currentMonthView > 11) {
            self.currentYearView++;
            self.currentMonthView = 0;
        }
    };

    rebuildCalendar = function () {
        updateNavigationCurrentDate();

        while (calendarBody.lastChild) {
            calendarBody.removeChild(calendarBody.lastChild);
        }
        buildDays();
    };

    monthChanged = function (event) {
        self.currentMonthView = parseInt(navigationCurrentMonth.value);
        // XXX clamp to range
        rebuildCalendar();
    };

    yearChanged = function (event) {
        self.currentYearView = parseInt(navigationCurrentYear.value);
        // XXX clamp to range
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
            targetClass = target.className,
            currentTimestamp;

        if (targetClass) {
            if (targetClass === 'datepickr-prev-month' || targetClass === 'datepickr-next-month') {
                if (targetClass === 'datepickr-prev-month') {
                    self.currentMonthView--;
                } else {
                    self.currentMonthView++;
                }

                handleYearChange();
                updateNavigationCurrentDate();
                buildDays();
            } else if (targetClass === 'datepickr-day' && !self.hasClass(target.parentNode, 'disabled')) {
                self.selectedDate = {
                    day: parseInt(target.innerHTML, 10),
                    month: self.currentMonthView,
                    year: self.currentYearView
                };

                currentTimestamp = new Date(self.currentYearView, self.currentMonthView, self.selectedDate.day).getTime();

                if (self.config.altInput) {
                    if (self.config.altFormat) {
                        self.config.altInput.value = formatDate(self.config.altFormat, currentTimestamp);
                    } else {
                        // I don't know why someone would want to do this... but just in case?
                        self.config.altInput.value = formatDate(self.config.dateFormat, currentTimestamp);
                    }
                }

                self.element.value = formatDate(self.config.dateFormat, currentTimestamp);

                close();
                buildDays();
            }
        }
    };

    buildCalendar = function () {
        buildNavigation();
        buildWeekdays();
        buildDays();

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
            self.addEventListener(navigationCurrentMonth, 'click', stopEvent, false);
            self.addEventListener(navigationCurrentMonth, 'change', monthChanged, false);
        }

        if (self.config.changeYear) {
            self.addEventListener(navigationCurrentYear, 'click', stopEvent, false);
            self.addEventListener(navigationCurrentYear, 'change', yearChanged, false);
        }

        self.addEventListener(self.element, getOpenEvent(), open, false);
        self.addEventListener(calendarContainer, 'click', calendarClick, false);
    };

    open = function () {
        self.addEventListener(document, 'click', documentClick, false);
        self.addClass(wrapperElement, 'open');
    };

    close = function () {
        self.removeEventListener(document, 'click', documentClick, false);
        self.removeClass(wrapperElement, 'open');
    };

    destroy = function () {
        var parent,
            element;

        self.removeEventListener(document, 'click', documentClick, false);
        self.removeEventListener(self.element, getOpenEvent(), open, false);

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
            parsedDate = new Date(parsedDate);
            self.selectedDate = {
                day: parsedDate.getDate(),
                month: parsedDate.getMonth(),
                year: parsedDate.getFullYear()
            };
            self.currentYearView = self.selectedDate.year;
            self.currentMonthView = self.selectedDate.month;
            self.currentDayView = self.selectedDate.day;
        } else {
            self.selectedDate = null;
            self.currentYearView = dateNow.getYear();
            self.currentMonthView = dateNow.getMonth();
            self.currentDayView = dateNow.getDate();
        }

        wrap();
        buildCalendar();
        bind();
    };

    init();

    return self;
};

datepickr.init.prototype = {
    hasClass: function (element, className) { return element.classList.contains(className); },
    addClass: function (element, className) { element.classList.add(className); },
    removeClass: function (element, className) { element.classList.remove(className); },
    forEach: function (items, callback) { [].forEach.call(items, callback); },
    querySelectorAll: document.querySelectorAll.bind(document),
    isArray: Array.isArray,
    addEventListener: function (element, type, listener, useCapture) {
        element.addEventListener(type, listener, useCapture);
    },
    removeEventListener: function (element, type, listener, useCapture) {
        element.removeEventListener(type, listener, useCapture);
    },
    l10n: {
        weekdays: {
            shorthand: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        months: {
            shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            longhand: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        },
        daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        firstDayOfWeek: 0
    }
};
