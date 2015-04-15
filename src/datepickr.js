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
        config = defaultConfig,
        container,
        calendarBody,
        navCurrentMonth,
        navCurrentYear,
        showingDate,
        selectedDate = null;

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

    function updateNavCurrentDate() {
        navCurrentMonth.innerHTML = config.changeMonth ?
            updateMonthMenu() : config.monthNames[showingDate.getMonth()];

        navCurrentYear.innerHTML = config.changeYear ?
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

        updateNavCurrentDate();
        buildDaysInMonth(); // XXX only called here
    }

    function buildUISkel() {
        function newElem(tagName, cls) {
            var e = document.createElement(tagName);
            if (cls) e.className = 'datepickr' + cls;
            return e;
        }

        container = newElem('div', '-calendar');

        // current date display/navigation
        var dates = newElem('div', '-dates');
        dates.innerHTML = '<span class="datepickr-prev-month">&lt;</span>' +
            '<span class="datepickr-next-month">&gt;</span>';

        var tagName = config.changeMonth ? 'select' : 'span';
        navCurrentMonth = newElem(tagName, '-current-month');

        tagName = config.changeYear ? 'select' : 'span';
        navCurrentYear = newElem(tagName, '-current-year');

        dates.appendChild(navCurrentMonth);
        dates.appendChild(navCurrentYear);
        container.appendChild(dates);

        var table = newElem('table');
        table.innerHTML = '<thead><tr><th>' + DPDate.weekdaysInCalendarOrder().join('</th><th>') + '</th></tr></thead>';

        // XXX needed as var to set innerHTML
        calendarBody = newElem('tbody');
        table.appendChild(calendarBody);

        container.appendChild(table);

        element.parentNode.appendChild(container);
    }

    function monthChanged() {
        showingDate.setMonth(parseInt(navCurrentMonth.value));
        rebuildCalendar();
    }

    function yearChanged() {
        showingDate.setYear(parseInt(navCurrentYear.value));
        rebuildCalendar();
    }

    function anyClick(event) {
        var target = event.target, targetClass = target.className;

        // prevents a snarl of events propagating to the input element, notably
        // when clicking on date navigation or after the calendar is closed
        event.preventDefault();

        if (targetClass === 'datepickr-prev-month') {
            showingDate.prevMonth();
            rebuildCalendar();
        } else if (targetClass === 'datepickr-next-month') {
            showingDate.nextMonth();
            rebuildCalendar();
        } else if (targetClass === 'datepickr-day' &&
                   !target.parentNode.classList.contains('disabled')) {
            selectedDate = showingDate.clone().setDay(
                parseInt(target.innerHTML, 10));

            if (config.altInput) {
                config.altInput.value = selectedDate.strftime(config.altFormat);
            }
            element.value = selectedDate.strftime(config.dateFormat);

            close();
        } else { // see if user clicked outside calendar
            while (target !== element && target !== container) {
                target = target.parentNode;
                if (target === null) {
                    close();
                    break;
                }
            }
        }
    }

    function open() {
        // position calendar relative to element (with focus outline)
        // XXX would be nice if we didn't have to assume outline size
        var off = (element.nodeName === 'INPUT') ? 3 : 0;
        var br = element.getBoundingClientRect();
        container.style.left = (br.left - off) + "px";
        container.style.top = (br.bottom + off) + "px";

        rebuildCalendar();

        document.addEventListener('click', anyClick);
        container.classList.add('open');
    }

    function close() {
        document.removeEventListener('click', anyClick);
        container.classList.remove('open');
    }

    function events(what) {
        what += 'EventListener';
        function caller(elem, name, cb) { elem[what].call(elem, name, cb) }

        if (config.changeMonth) caller(navCurrentMonth, 'change', monthChanged);
        if (config.changeYear) caller(navCurrentYear, 'change', yearChanged);

        caller(element, 'click', open);
        if (element.nodeName === 'INPUT') {
            caller(element, 'focus', open);

            // Esc button -> close dialog

            // element#blur->close causes tons of trouble
            // if we want to close calendar after focusing another element,
            // handle it by closing another calendar instance before opening
            // the calendar from another instance
        }
    }

    self.destroy = function() { // export for us in datepickr()
        events('remove');
        container.parentNode.removeChild(container);
        // XXX may need to null out some vars for GC
    }.bind(self);

    (function() {
        if (element._datepickr) { // destroy old calendar if exists
            element._datepickr.destroy();
        }
        element._datepickr = self;

        if (instanceConfig) {
            config = {};
            for (var key in defaultConfig) {
                config[key] = instanceConfig[key] || defaultConfig[key];
            }
        }

        if (config.altInput && !config.altFormat) {
            config.altFormat = config.dateFormat;
        }

        config.monthNames = config.abbreviateMonth ?
            DPDate.monthAbbrevs : DPDate.months;

        // initialize selected and showing dates
        if (element.value) {
            var parsedDate = Date.parse(element.value);
        }
        if (parsedDate && !isNaN(parsedDate)) {
            selectedDate = showingDate = new DPDate(parsedDate);
        } else {
            showingDate = new DPDate();
        }

        buildUISkel();
        events('add');
    })();

    return self;
};
