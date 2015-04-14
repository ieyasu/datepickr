QUnit.test("lastDayOfWeek", function(assert) {
    DPDate.firstDayOfWeek = 0; // Sunday
    assert.equal(DPDate.lastDayOfWeek(), 6); // Saturday

    DPDate.firstDayOfWeek = 1; // Monday
    assert.equal(DPDate.lastDayOfWeek(), 0); // Sunday

    DPDate.firstDayOfWeek = 3; // Wednesday
    assert.equal(DPDate.lastDayOfWeek(), 2); // Tuesday
});

QUnit.test("weeksInCalendarOrder", function(assert) {
    DPDate.firstDayOfWeek = 0;
    var days = DPDate.weekdaysInCalendarOrder();
    assert.deepEqual(days, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

    DPDate.firstDayOfWeek = 1;
    var days = DPDate.weekdaysInCalendarOrder();
    assert.deepEqual(days, ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

    DPDate.firstDayOfWeek = 0; // reset to default
});

QUnit.test("DPDate Constructor", function(assert) {
    var d, now;

    d = new DPDate();
    now = new Date();
    assert.equal(d.getYear(), now.getFullYear());
    assert.equal(d.getMonth(), now.getMonth());
    assert.equal(d.getDay(), now.getDate());

    d = new DPDate(1428191546529);
    assert.equal(d.getYear(), 2015);
    assert.equal(d.getMonth(), 3);
    assert.equal(d.getDay(), 4);
    assert.equal(d.getDayOfWeek(), 6); // Saturday
    
    d = new DPDate(2013, 0);
    assert.equal(d.getYear(), 2013);
    assert.equal(d.getMonth(), 0);
    assert.equal(d.getDay(), 1);
    assert.equal(d.getDayOfWeek(), 2); // Tuesday

    d = new DPDate(2013, 3, 5);
    assert.equal(d.getYear(), 2013);
    assert.equal(d.getMonth(), 3);
    assert.equal(d.getDay(), 5);
    assert.equal(d.getDayOfWeek(), 5); // Friday

    d = new DPDate("May 22, 2016");
    assert.equal(d.getYear(), 2016);
    assert.equal(d.getMonth(), 4);
    assert.equal(d.getDay(), 22);
    assert.equal(d.getDayOfWeek(), 0); // Sunday
});


QUnit.test("clone", function(assert) {
    var d = new DPDate(1999, 9, 9), e = d.clone();

    e.setYear(2010).setMonth(8).setDay(23);
    assert.notDeepEqual(d, e, "changing clone's date doesn't affect original");
});

QUnit.test("setYear", function(assert) {
    var d = new DPDate(1993, 3, 7);
    d.setYear(1995);
    assert.equal(d.getYear(), 1995);
    assert.equal(d.getMonth(), 3);
    assert.equal(d.getDay(), 7);
});

QUnit.test("setMonth", function(assert) {
    var d = new DPDate(1993, 7, 9);
    d.setMonth(5);
    assert.equal(d.getYear(), 1993);
    assert.equal(d.getMonth(), 5);
    assert.equal(d.getDay(), 9);

    d = new DPDate(1993, 5, 15);
    d.setMonth(13);
    assert.equal(d.getYear(), 1994, "wraps to next year");
    assert.equal(d.getMonth(), 1, "wraps to next year");
    assert.equal(d.getDay(), 15);

    d = new DPDate(1993, 1, 15);
    d.setMonth(-1);
    assert.equal(d.getYear(), 1992, "wraps to prev year");
    assert.equal(d.getMonth(), 11, "wraps to prev year");
    assert.equal(d.getDay(), 15);
});

QUnit.test("setDay", function(assert) {
    var d = new DPDate(1994, 9, 12);
    d.setDay(13);
    assert.equal(d.getYear(), 1994);
    assert.equal(d.getMonth(), 9);
    assert.equal(d.getDay(), 13);

    d.setDay(33);
    assert.equal(d.getMonth(), 10, "wraps to next month");
    assert.equal(d.getDay(), 2, "wraps to next month");

    d = new DPDate(1993, 8, 18);
    d.setDay(0);
    assert.equal(d.getMonth(), 7, "wraps to prev month");
    assert.equal(d.getDay(), 31, "wraps to prev month");

    d = new DPDate(1993, 8, 18);
    d.setDay(-1);
    assert.equal(d.getMonth(), 7, "wraps to prev month");
    assert.equal(d.getDay(), 30, "wraps to prev month");
});

QUnit.test("compare", function(assert) {
    var d, e;

    d = new DPDate(2014, 3, 3);
    e = new DPDate(2014, 3, 3);
    assert.ok(d.compare(e) == 0, "same date = 0");

    e = new DPDate(2014, 3, 5);
    assert.ok(d.compare(e) < 0, "second date later (d < e == negative)");

    e = new DPDate(2014, 3, 1);
    assert.ok(d.compare(e) > 0, "second date earlier > 0 (d > e == positive)");

    e = new DPDate(2014, 4, 3);
    assert.ok(d.compare(e) < 0, "month different => !0");

    e = new DPDate(2013, 3, 3);
    assert.ok(d.compare(e) > 0, "year different => !0");

    e = null;
    assert.ok(d.compare(e) === null, "falsy second date => null");
});

QUnit.test("isSameDay", function(assert) {
    var d, e;

    d = new DPDate(2014, 5, 5);
    e = new DPDate("June 5, 2014");
    assert.ok(d.isSameDay(e));

    d = new DPDate(2014, 5, 5);
    e = new DPDate(2015, 5, 5);
    assert.ok(!d.isSameDay(e));

    d = new DPDate(2014, 5, 5);
    e = new DPDate(2014, 6, 5);
    assert.ok(!d.isSameDay(e));

    d = new DPDate(2013, 5, 5);
    e = new DPDate(2014, 5, 6);
    assert.ok(!d.isSameDay(e));

    d = new DPDate(2013, 7, 9);
    e = new DPDate(2014, 5, 6);
    assert.ok(!d.isSameDay(e));

    d = new DPDate();
    e = new DPDate(d.date.getTime() - 5467);
    assert.ok(d.isSameDay(e), "ignores anything finer than day");
});

QUnit.test("isLeapYear", function(assert) {
    assert.ok((new DPDate(1996, 0)).isLeapYear(),
              "divisble by four = leap");

    [1995, 1997, 1998, 1999].forEach(function(year) {
        assert.ok(!(new DPDate(year, 0)).isLeapYear(),
                  "not divisble by four not leap");
    });

    [1700, 1800, 1900].forEach(function(year) {
        assert.ok(!(new DPDate(year, 0)).isLeapYear(),
                  "centuries not divisible by 400 not leaps");
    });

    assert.ok((new DPDate(2000, 0)).isLeapYear(), "centuries divisible by 400 are leaps");
});

QUnit.test("daysThisMonth", function(assert) {
    assert.equal((new DPDate(1997, 3)).daysThisMonth(), 30);
    assert.equal((new DPDate(1997, 1)).daysThisMonth(), 28);

    assert.equal((new DPDate(1996, 0)).daysThisMonth(), 31);
    assert.equal((new DPDate(1996, 1)).daysThisMonth(), 29);
});

QUnit.test("nextDay", function(assert) {
    var d, e;

    d = new DPDate(2013, 0, 5);
    e = new DPDate(2013, 0, 6);
    assert.deepEqual(d.nextDay(), e);

    d = new DPDate(2013, 0, 31);
    e = new DPDate(2013, 1, 1);
    assert.deepEqual(d.nextDay(), e, "wraps to next month");

    d = new DPDate(2013, 11, 31);
    e = new DPDate(2014, 0, 1);
    assert.deepEqual(d.nextDay(), e, "wraps to next year");
});

QUnit.test("nextMonth", function(assert) {
    var d, e;

    d = new DPDate(2013, 3, 4);
    e = new DPDate(2013, 4, 4);
    assert.deepEqual(d.nextMonth(), e);

    d = new DPDate(2013, 11, 5);
    e = new DPDate(2014, 0, 5);
    assert.deepEqual(d.nextMonth(), e, "wraps to next year");
});

QUnit.test("prevMonth", function(assert) {
    var d, e;

    d = new DPDate(2013, 4, 4);
    e = new DPDate(2013, 3, 4);
    assert.deepEqual(d.prevMonth(), e);

    d = new DPDate(2014, 0, 5);
    e = new DPDate(2013, 11, 5);
    assert.deepEqual(d.prevMonth(), e, "wraps to prev year");
});

QUnit.test("firstOfYear", function(assert) {
    var d, e;

    d = new DPDate("October 8, 2012");
    e = new DPDate("Jan 1, 2012");
    assert.deepEqual(d.firstOfYear().date, e.date);
});

QUnit.test("lastOfYear", function(assert) {
    var d, e;

    d = new DPDate("Nov, 3, 2013");
    e = new DPDate("Dec 31, 2013");
    assert.deepEqual(d.lastOfYear().date, e.date);
});

QUnit.test("firstCalendarDay", function(assert) {
    var d = new DPDate("Mar 3, 2015");
    var first = d.firstCalendarDay();
    assert.deepEqual(first, new DPDate(2015, 2, 1), "first of the month");

    var d = new DPDate("Dec 3, 2014");
    var first = d.firstCalendarDay();
    assert.deepEqual(first, new DPDate(2014, 10, 30), "last of prev month");

    var d = new DPDate("Apr 3, 2015");
    var first = d.firstCalendarDay();
    assert.deepEqual(first, new DPDate(2015, 2, 29), "prev month");
});

QUnit.test("lastCalendarDay", function(assert) {
    var d = new DPDate("Feb 1, 2015");
    var last = d.lastCalendarDay();
    assert.deepEqual(last, new DPDate(2015, 1, 28), "last of the month");

    var d = new DPDate("Apr 1, 2015");
    var last = d.lastCalendarDay();
    assert.deepEqual(last, new DPDate(2015, 4, 2), "into next month");
});

QUnit.test("strftime", function(assert) {
    var d = new DPDate(2015, 3, 9), fmt;

    fmt = "%A, %B %d %Y";
    assert.equal(d.strftime(fmt), "Thursday, April 09 2015");

    fmt = "%a, %b %e '%y";
    assert.equal(d.strftime(fmt), "Thu, Apr  9 '15");

    fmt = "%m-%s-%u";
    assert.equal(d.strftime(fmt), "04-1428559200-4");

    fmt = "foom %% %Q%";
    assert.equal(d.strftime(fmt), "foom % %Q%", "doesn't format non-format chars");

    d = new DPDate(2015, 3, 5);
    fmt = "%u";
    assert.equal(d.strftime(fmt), "7", "sunday = 7");

    d = new DPDate(2000, 4, 23);
    fmt = "%d*%e";
    assert.equal(d.strftime(fmt), "23*23");

    // XXX timezone? use Date's info to figure out what current TZ is
});

