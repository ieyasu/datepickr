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

function datepickr(selector, config) {
    'use strict';
    var elements,
        createInstance,
        instances = [],
        i;

    function createInstance(element) {
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
datepickr.init = function(element, instanceConfig) {
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
        calendarContainer = document.createElement('div'),
        navigationCurrentMonth,
        navigationCurrentYear,
        calendar = document.createElement('table'),
        calendarBody = document.createElement('tbody'),
        wrapperElement,
        showingDate,
        selectedDate;

    function initConfig() {
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
    }

    initConfig();

    calendarContainer.className = 'datepickr-calendar';

    (function() {
        var tagName;

        tagName = self.config.changeMonth ? 'select' : 'span';
        navigationCurrentMonth = document.createElement(tagName);
        navigationCurrentMonth.className = 'datepickr-current-month';

        tagName = self.config.changeYear ? 'select' : 'span';
        navigationCurrentYear = document.createElement(tagName);
        navigationCurrentYear.className = 'datepickr-current-year';
    })();

    function wrap() {
        wrapperElement = document.createElement('div');
        wrapperElement.className = 'datepickr-wrapper';
        self.element.parentNode.insertBefore(wrapperElement, self.element);
        wrapperElement.appendChild(self.element);
    }

    // Sun/Mon Tue ... Fri Sat/Sun column headers
    function buildDaysOfWeek() {
        var weekdayContainer = document.createElement('thead'),
            dayNames = DPDate.weekdaysInCalendarOrder();

        weekdayContainer.innerHTML = '<tr><th>' + dayNames.join('</th><th>') + '</th></tr>';
        calendar.appendChild(weekdayContainer);
    }

    // each day in the month, and overlap
    function buildDaysInMonth() {
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
    }

    function updateMonthMenu() {
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
    }

    function updateYearMenu() {
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
    }

    function updateNavigationCurrentDate() {
        navigationCurrentMonth.innerHTML = self.config.changeMonth ?
            updateMonthMenu() : self.config.monthNames[showingDate.getMonth()];

        navigationCurrentYear.innerHTML = self.config.changeYear ?
            updateYearMenu() : showingDate.getYear();

        // XXX disable next/prev month buttons if outside min/max
    }

    function rebuildCalendar() {
        if (showingDate.compare(self.config.minDate) < 0) {
            showingDate = self.config.minDate.clone();
        } else if (0 < showingDate.compare(self.config.maxDate)) {
            showingDate = self.config.maxDate.clone();
        }

        updateNavigationCurrentDate();
        buildDaysInMonth();
    }

    function monthChanged() {
        showingDate.setMonth(parseInt(navigationCurrentMonth.value));
        rebuildCalendar();
    }

    function yearChanged() {
        showingDate.setYear(parseInt(navigationCurrentYear.value));
        rebuildCalendar();
    }

    function documentClick(event) {
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
    }

    function calendarClick(event) {
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
    }

    function buildNavigation() {
        var dates = document.createElement('div');
        dates.innerHTML = '<span class="datepickr-prev-month">&lt;</span>' +
            '<span class="datepickr-next-month">&gt;</span>';
        dates.className = 'datepickr-dates';

        dates.appendChild(navigationCurrentMonth);
        dates.appendChild(navigationCurrentYear);
        calendarContainer.appendChild(dates);
    }

    function buildCalendar() {
        buildNavigation();
        buildDaysOfWeek();
        rebuildCalendar();

        calendar.appendChild(calendarBody);
        calendarContainer.appendChild(calendar);

        wrapperElement.appendChild(calendarContainer);
    }

    function getOpenEvent() {
        if (self.element.nodeName === 'INPUT') {
            return 'focus';
        }
        return 'click';
    }

    function bind() {
        function stopEvent(ev) { ev.preventDefault(); };

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
    }

    function open() {
        document.addEventListener('click', documentClick);
        wrapperElement.classList.add('open');
    }

    function close() {
        document.removeEventListener('click', documentClick);
        wrapperElement.classList.remove('open');
    }

    function destroy() {
        var parent,
            element;

        document.removeEventListener('click', documentClick);
        self.element.removeEventListener(getOpenEvent(), open);

        parent = self.element.parentNode;
        parent.removeChild(calendarContainer);
        element = parent.removeChild(self.element);
        parent.parentNode.replaceChild(element, parent);
    }

    function init() {
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
    }
    init();

    return self;
};
