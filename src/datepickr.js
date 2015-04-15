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
    function mkPickr(element) {
        return new datepickr.init(element, config);
    }

    if (selector.nodeName) {
        return mkPickr(selector);
    }

    var elements = document.querySelectorAll(selector);
    var instances = [];

    for (var i = 0; i < elements.length; i++) {
        instances.push(mkPickr(elements[i]));
    }
    return (instances.length === 1) ? instances[0] : instances;
};

datepickr.init = function(element, userConfig) {
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
        container, // outermost <div> for the calender
        calendarBody, // where days on the calendar go
        navMonth, navYear, // <span>s or drop-down menus
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
            var classes = 'datepickr-day';
            if (calDay.isSameDay(today)) {
                classes += ' today';
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
            html += '<td' + tdClasses() + '>';
            html += calDay.getDay() + '</td>';

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

        // still need to clamp
        var md = config.minDate;
        if (md && year < md.getYear()) year = md.getYear();
        md = config.maxDate;
        if (md && endYear > md.getYear()) endYear = md.getYear();

        for (; year <= endYear; year++) {
            html += '<option value="' + year + '"';
            if (showingYear === year) {
                html += ' selected';
            }
            html += '>' + year + '</option>';
        }
        return html;
    }

    // clamp showingDate to min/max then fix nav & days
    function rebuild() {
        if (showingDate.compare(config.minDate) < 0) {
            showingDate = config.minDate.clone();
        } else if (0 < showingDate.compare(config.maxDate)) {
            showingDate = config.maxDate.clone();
        }

        navMonth.innerHTML = config.changeMonth ?
            updateMonthMenu() : config.monthNames[showingDate.getMonth()];

        navYear.innerHTML = config.changeYear ?
            updateYearMenu() : showingDate.getYear();

        // XXX disable next/prev month buttons if outside min/max

        buildDaysInMonth();
    }

    function buildUISkel() {
        function newElem(tagName, parent, cls) {
            var e = document.createElement(tagName);
            parent.appendChild(e);
            if (cls) e.className = 'datepickr' + cls;
            return e;
        }

        container = newElem('div', element.parentNode, '-calendar');

        // current date display/navigation
        var dates = newElem('div', container, '-dates');
        dates.innerHTML = '<span class="datepickr-prev-month">&lt;</span>' +
            '<span class="datepickr-next-month">&gt;</span>';

        var tagName = config.changeMonth ? 'select' : 'span';
        navMonth = newElem(tagName, dates, '-current-month');

        tagName = config.changeYear ? 'select' : 'span';
        navYear = newElem(tagName, dates, '-current-year');

        var wrap = newElem('div', container, '-wrap')
        var table = newElem('table', wrap);
        table.innerHTML = '<thead><tr><th>' + DPDate.weekdaysInCalendarOrder().join('</th><th>') + '</th></tr></thead>';

        calendarBody = newElem('tbody', table);
    }

    function monthChanged() {
        showingDate.setMonth(parseInt(navMonth.value));
        rebuild();
    }

    function yearChanged() {
        showingDate.setYear(parseInt(navYear.value));
        rebuild();
    }

    function anyClick(event) {
        var target = event.target, targetClass = target.className;

        // prevents a snarl of events propagating to the input element, notably
        // when clicking on date navigation or after the calendar is closed
        event.preventDefault();

        if (targetClass === 'datepickr-prev-month') {
            showingDate.prevMonth();
            rebuild();
        } else if (targetClass === 'datepickr-next-month') {
            showingDate.nextMonth();
            rebuild();
        } else if (targetClass === 'datepickr-day' &&
                   !target.classList.contains('disabled')) {
            selectedDate = showingDate.clone().setDay(
                parseInt(target.innerHTML, 10));

            if (config.altInput) {
                config.altInput.value = selectedDate.strftime(config.altFormat);
            }
            if (element.value) {
                element.value = selectedDate.strftime(config.dateFormat);
            }

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

    function closeOnEsc(event) {
        // MDN says the below are deprecated in favor of .key, but the latter
        // isn't implemented in enough browsers as of April 2015
        var code = event.keyCode || event.which;
        if (code === 27) close();
    }

    function open() {
        // position calendar relative to element (with focus outline)
        // XXX would be nice if we didn't have to assume outline size
        var off = (element.nodeName === 'INPUT') ? 2 : 0;
        var br = element.getBoundingClientRect();
        container.style.left = (br.left - off) + "px";
        container.style.top = (br.bottom + off) + "px";

        rebuild();

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

        if (config.changeMonth) caller(navMonth, 'change', monthChanged);
        if (config.changeYear) caller(navYear, 'change', yearChanged);

        caller(element, 'click', open);
        if (element.nodeName === 'INPUT') {
            caller(element, 'focus', open);
            caller(element, 'keypress', closeOnEsc);

            // element#blur->close causes tons of trouble
            // if we want to close calendar after focusing another element,
            // handle it by closing another calendar instance before opening
            // the calendar from another instance
        }
    }

    self.destroy = function() { // export for use in datepickr()
        close();
        events('remove');
        container.parentNode.removeChild(container);
        // XXX may need to null out some vars for GC
    }.bind(self);

    (function() {
        if (element._datepickr) { // destroy old calendar if exists
            element._datepickr.destroy();
        }
        element._datepickr = self;

        // set up our config
        if (userConfig) {
            config = {};
            for (var key in defaultConfig) {
                config[key] = userConfig[key] || defaultConfig[key];
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
