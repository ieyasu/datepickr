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
        calendarContainer,
        calendarBody,
        navigationCurrentMonth,
        navigationCurrentYear,
        showingDate,
        selectedDate;

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

        for (var html = '<tr>'; ; calDay.nextDay()) {
            html += '<td' + tdClasses() + '><span class="datepickr-day">';
            html += calDay.getDay() + '</span></td>';

            if (calDay.isSameDay(calLast)) break;

            if (calDay.getDayOfWeek() == DPDate.lastDayOfWeek()) {
                html += "</tr><tr>";
            }
        }

        calendarBody.innerHTML = html + '</tr>';
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

    // clamp showingDate to min/max then fix nav & days
    function rebuildCalendar() {
        if (showingDate.compare(config.minDate) < 0) {
            showingDate = config.minDate.clone();
        } else if (0 < showingDate.compare(config.maxDate)) {
            showingDate = config.maxDate.clone();
        }

        updateNavigationCurrentDate();
        buildDaysInMonth();
    }

    function buildCoreUI() {
        calendarContainer = newElem('div', '-calendar');

        // current date display/navigation
        var dates = newElem('div', '-dates');
        dates.innerHTML = '<span class="datepickr-prev-month">&lt;</span>' +
            '<span class="datepickr-next-month">&gt;</span>';
        dates.appendChild(navigationCurrentMonth);
        dates.appendChild(navigationCurrentYear);
        calendarContainer.appendChild(dates);

        var calendar = newElem('table');
        calendar.innerHTML = '<thead><tr><th>' + DPDate.weekdaysInCalendarOrder().join('</th><th>') + '</th></tr></thead>';

        // XXX needed as var to set innerHTML
        calendarBody = newElem('tbody');
        calendar.appendChild(calendarBody);

        calendarContainer.appendChild(calendar);

        var elemParent = self.element.parentNode;
        elemParent.appendChild(calendarContainer);

        rebuildCalendar(); // XXX really here?
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
        var target = event.target, targetClass = target.className;

        event.preventDefault(); // prevents elementClicked from firing
        // XXX we want to do this every time we handle an event here.
        // XXX I'm pretty sure there's no case where we don't want to do that
        // XXX maybe if

        if (targetClass === 'datepickr-prev-month' ||
            targetClass === 'datepickr-next-month') {

            if (targetClass === 'datepickr-prev-month') {
                showingDate.prevMonth();
            } else {
                showingDate.nextMonth();
            }
            rebuildCalendar();
            return;
        } else if (targetClass === 'datepickr-day' &&
                   !target.parentNode.classList.contains('disabled')) {
            selectedDate = showingDate.clone().setDay(
                parseInt(target.innerHTML, 10));

            if (config.altInput) {
                config.altInput.value = selectedDate.strftime(config.altFormat);
            }
            self.element.value = selectedDate.strftime(config.dateFormat);

            close();

            buildDaysInMonth(); // XXX why here?!
            return;
        }

        // see if user clicked outside calendar
        var parent = target; // .parentNode;
        while (parent !== self.element && parent !== calendarContainer) {
            parent = parent.parentNode;
            if (parent === null) {
                close();
                break;
            }
        }
    }

    var calendarIsOpen = null; // XXX still need?

    function open() {
        if (!calendarIsOpen) {
            calendarIsOpen = true;

            document.addEventListener('click', documentClick);
            calendarContainer.classList.add('open');

            // position calendar relative to element (with focus outline)
            // XXX would be nice if we didn't have to assume outline size
            var off = (self.element.nodeName === 'INPUT') ? 3 : 0;
            var br = self.element.getBoundingClientRect();
            calendarContainer.style.left = (br.left - off) + "px";
            calendarContainer.style.top = (br.bottom + off) + "px";

            // XXX recreate calendar bits here?
        }
    }

    function close() {
        if (!calendarIsOpen) {
            console.log("calendar is not open ?!");
        }

        // XXX yes, we do need this!
        calendarIsOpen = false;

        document.removeEventListener('click', documentClick);
        calendarContainer.classList.remove('open');
    }

    function bind() { // only called once below
        if (config.changeMonth) {
            navigationCurrentMonth.addEventListener('change', monthChanged);
        }
        if (config.changeYear) {
            navigationCurrentYear.addEventListener('change', yearChanged);
        }

        self.element.addEventListener('click', open);

        if (self.element.nodeName === 'INPUT') {
            self.element.addEventListener('focus', open);

            // Esc button -> close dialog

            // element#blur->close causes tons of trouble
            // if we want to close calendar after focusing another element,
            // handle it by closing another calendar instance before opening
            // the calendar from another instance
        }
    }

    self.destroy = function() { // export for us in datepickr()
        document.removeEventListener('click', documentClick);
        if (self.element.nodeName === 'INPUT') {
            self.element.removeEventListener('focus', open);
        }
        self.element.removeEventListener('click', open);

        var parent = self.element.parentNode;
        parent.removeChild(calendarContainer); // XXX might get calendarContainer another way and not need variable

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

        buildCoreUI();
        bind();
    }
    init();

    return self;
};
