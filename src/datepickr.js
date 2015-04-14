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
        return new datepickr.init(element, config);
    }

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
        config,
        calendarContainer = newElem('div', '-calendar'),
        calendar = newElem('table'),
        calendarBody = newElem('tbody'),
        navigationCurrentMonth,
        navigationCurrentYear,
        wrapperElement,
        showingDate,
        selectedDate;

var openTID = null, closeTID = null;
var cancelOpen = false, cancelClose = false;

    if (element._datepickr) {
        element._datepickr.destroy();
    }
    element._datepickr = this;

    if (instanceConfig) {
        config = {};
        for (var key in defaultConfig) {
            config[key] = instanceConfig[key] || defaultConfig[key];
        }
    } else {
        config = defaultConfig;
    }

    // convert from Date to DPDate
    if (config.minDate && config.minDate.getTime) {
        config.minDate = new DPDate(config.minDate.getTime());
    }
    if (config.maxDate && config.maxDate.getTime) {
        config.maxDate = new DPDate(config.maxDate.getTime());
    }

    if (config.altInput && !config.altFormat) {
        config.altFormat = config.dateFormat;
    }

    config.monthNames = config.abbreviateMonth ?
        DPDate.monthAbbrevs : DPDate.months;

    (function() {
        var tagName;

        tagName = config.changeMonth ? 'select' : 'span';
        navigationCurrentMonth = newElem(tagName, '-current-month');

        tagName = config.changeYear ? 'select' : 'span';
        navigationCurrentYear = newElem(tagName, '-current-year');
    })();

    function newElem(tagName, cls) {
        var e = document.createElement(tagName);
        if (cls) e.className = 'datepickr' + cls;
        return e;
    }

    // each day in the month, and overlap
    function buildDaysInMonth() {
        var sd = showingDate,
            calDay = sd.firstCalendarDay(),
            calLast = sd.lastCalendarDay(),
            today = new DPDate(),
            mFirst = sd.firstOfMonth(),
            firstEnabled = (mFirst.compare(config.minDate) < 0) ?
                config.minDate : mFirst,
            mLast = sd.lastOfMonth(),
            lastEnabled = (mLast.compare(config.maxDate) < 0) ?
                mLast : config.maxDate;

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

        for (var html = '<tbody><tr>'; ; calDay.nextDay()) {
            html += '<td' + tdClasses() + '><span class="datepickr-day">';
            html += calDay.getDay() + '</span></td>';

            if (calDay.isSameDay(calLast)) {
                break;
            }

            if (calDay.getDayOfWeek() == DPDate.lastDayOfWeek()) {
                html += "</tr><tr>";
            }
        }

        calendarBody.innerHTML = html + '</tr></tbody>';
    }

    function updateMonthMenu() {
        var startDate = showingDate.firstOfYear(),
            month = (startDate.compare(config.minDate) < 0) ?
                config.minDate.getMonth() : 0,
            endDate = showingDate.lastOfYear(),
            endMonth = (0 < endDate.compare(config.maxDate)) ?
                config.maxDate.getMonth() : 11,
            html = '';

        for (; month <= endMonth; month++) {
            html += '<option value="' + month + '"';
            if (showingDate.getMonth() === month) {
                html += ' selected';
            }
            html += '>' + config.monthNames[month];
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
            specs = config.yearRange.split(':'),
            year = whatYear(specs[0]),
            endYear = whatYear(specs[1] || ''),
            showingYear = showingDate.getYear(),
            html = '';

        if (config.minDate && year < config.minDate.getYear()) {
            year = config.minDate.getYear();
        }
        if (config.maxDate && endYear > config.maxDate.getYear()) {
            endYear = config.maxDate.getYear();
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
        navigationCurrentMonth.innerHTML = config.changeMonth ?
            updateMonthMenu() : config.monthNames[showingDate.getMonth()];

        navigationCurrentYear.innerHTML = config.changeYear ?
            updateYearMenu() : showingDate.getYear();

        // XXX disable next/prev month buttons if outside min/max
    }

    function rebuildCalendar() {
        if (showingDate.compare(config.minDate) < 0) {
            showingDate = config.minDate.clone();
        } else if (0 < showingDate.compare(config.maxDate)) {
            showingDate = config.maxDate.clone();
        }

        updateNavigationCurrentDate();
        buildDaysInMonth();
    }

    function buildNavigation() {
        var dates = newElem('div', '-dates');
        dates.innerHTML = '<span class="datepickr-prev-month">&lt;</span>' +
            '<span class="datepickr-next-month">&gt;</span>';

        dates.appendChild(navigationCurrentMonth);
        dates.appendChild(navigationCurrentYear);
        calendarContainer.appendChild(dates);
    }

    // Sun/Mon Tue ... Fri Sat/Sun column headers
    function buildDaysOfWeek() {
        var weekdayContainer = newElem('thead'),
            dayNames = DPDate.weekdaysInCalendarOrder();

        weekdayContainer.innerHTML = '<tr><th>' + dayNames.join('</th><th>') + '</th></tr>';
        calendar.appendChild(weekdayContainer);
    }

    function buildCalendar() {
        buildNavigation();
        buildDaysOfWeek();
        rebuildCalendar();

        calendar.appendChild(calendarBody);
        calendarContainer.appendChild(calendar);

        wrapperElement.appendChild(calendarContainer);
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
console.log('documentClick');
        var target = event.target, targetClass = target.className;

        if (targetClass === 'datepickr-prev-month' ||
            targetClass === 'datepickr-next-month') {

            if (targetClass === 'datepickr-prev-month') {
                showingDate.prevMonth();
            } else {
                showingDate.nextMonth();
            }
            rebuildCalendar();
            cancelClose = true; // if input#blur(?)
console.log('prev/next month clicked, close canceling');
            return;
        } else if (targetClass === 'datepickr-day' &&
                   !target.parentNode.classList.contains('disabled')) {
            selectedDate = showingDate.clone().setDay(
                parseInt(target.innerHTML, 10));

            if (config.altInput) {
                config.altInput.value = selectedDate.strftime(config.altFormat);
            }
            self.element.value = selectedDate.strftime(config.dateFormat);

            // delay until input#focus has fired
            close();
            // XXX need to temporarily suppress opening
            cancelOpen = true;
console.log('day clicked, canceling open');

            buildDaysInMonth(); // XXX why here?!
console.log('selected a day and cal should be closed');
            return;
        }

        // see if user clicked outside calendar and wrapper
        var parent = target.parentNode;
        while (parent !== wrapperElement) {
            parent = parent.parentNode;
            if (parent === null) {
console.log('    close - docClick');
                // XXX need to cancel open?
                close();
                break;
            }
        }

        // stops year/month drop-downs from closing prematurely
        event.preventDefault();

        // XXX cancel close?
    }

    function menuFocused() {
console.log('menu focused');
        // XXX cancel close from input:blur, not others(?)
        cancelClose = true;
    }

    function inputFocus() {
console.log('input focused');
        open();
    }

    function inputBlur() {
console.log('input blur');
        close();
    }

    function elementClick() {
console.log('input click');
        open(); // XXX or do we need to set a timer?
    }

    function open() {
console.log('request open');
        if (typeof openTID === "number") {
            console.log("  already have open timeout going");
            return;
        }

        openTID = window.setTimeout(function() {
            if (cancelOpen) {
                console.log('    open cancelled');
                cancelOpen = false;
            } else {
console.log('actual open');
                // XXX recreate calendar bits here?
                document.addEventListener('click', documentClick);
                wrapperElement.classList.add('open');
            }
            openTID = null;
        }, 100);
console.log('created open timeout:', openTID);
    }

    function close() {
console.log('request close');
        if (typeof closeTID === "number") {
            console.log("  already have close timeout going");
            return;
        }

        closeTID = window.setTimeout(function() {
            if (cancelClose) {
                console.log('  close cancelled');
                cancelClose = false;
            } else {
console.log('actual close');
                document.removeEventListener('click', documentClick);
                wrapperElement.classList.remove('open');
            }
            closeTID = null;
        }, 100);
console.log('created close timeout:',closeTID);
    }

    function getOpenEvent() {
        return (self.element.nodeName === 'INPUT') ? 'focus' : 'click';
    }

    function bind() { // only called once below
        if (config.changeMonth) {
            navigationCurrentMonth.addEventListener('change', monthChanged);
            navigationCurrentMonth.addEventListener('focus', menuFocused);
        }

        if (config.changeYear) {
            navigationCurrentYear.addEventListener('change', yearChanged);
            navigationCurrentYear.addEventListener('focus', menuFocused);
        }

        if (self.element.nodeName === 'INPUT') {
            self.element.addEventListener('focus', inputFocus);
            self.element.addEventListener('blur', inputBlur);
        }
        self.element.addEventListener('click', elementClick);
    }

    self.destroy = function() { // export for us in datepickr()
        document.removeEventListener('click', documentClick);
        if (self.element.nodeName === 'INPUT') {
            self.element.removeEventListener('focus', inputFocus);
            self.element.removeEventListener('blur', inputBlur);
        }
        self.element.removeEventListener('click', elementClick);

        var parent = self.element.parentNode;
        parent.removeChild(calendarContainer);
        var element = parent.removeChild(self.element);
        parent.parentNode.replaceChild(element, parent);
    }

    function wrap() { // only called once below
        wrapperElement = newElem('div', '-wrapper');
        self.element.parentNode.insertBefore(wrapperElement, self.element);
        wrapperElement.appendChild(self.element);
    }

    function init() {
        var parsedDate;

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
