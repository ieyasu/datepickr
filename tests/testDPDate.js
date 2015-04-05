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
    assert.ok(d.nextDay().isSameDay(e), "next day of month");

    d = new DPDate(2013, 0, 31);
    e = new DPDate(2013, 1, 1);
    assert.ok(d.nextDay().isSameDay(e), "wraps to next month");

    d = new DPDate(2013, 11, 31);
    e = new DPDate(2014, 0, 1);
    assert.ok(d.nextDay().isSameDay(e), "wraps to next year");
});

QUnit.test("nextMonth", function(assert) {
    var d, e;

    d = new DPDate(2013, 3, 4);
    e = new DPDate(2013, 4, 4);
    assert.ok(d.nextMonth().isSameDay(e));

    d = new DPDate(2013, 11, 5);
    e = new DPDate(2014, 0, 5);
    assert.ok(d.nextMonth().isSameDay(e), "wraps to next year");
});

QUnit.test("prevMonth", function(assert) {
    var d, e;

    d = new DPDate(2013, 4, 4);
    e = new DPDate(2013, 3, 4);
    assert.ok(d.prevMonth().isSameDay(e));

    d = new DPDate(2014, 0, 5);
    e = new DPDate(2013, 11, 5);
    assert.ok(d.prevMonth().isSameDay(e), "wraps to prev year");
});

QUnit.test("clamp", function(assert) {
    var d, e, min, max;

    d = new DPDate(2010, 5, 9);
    e = Object.create(d);
    min = new DPDate(2010, 2, 1);
    max = new DPDate(2011, 1, 1);
    assert.ok(d.clamp(min, max).isSameDay(e), "doesn't change date inside range");

    d = new DPDate(1970, 1, 1);
    min = new DPDate(1976, 2, 3);
    max = new DPDate(1979, 3, 4);
    assert.ok(d.clamp(min, max).isSameDay(min), "clamps earlier date");

    d = new DPDate(1980, 6, 6);
    min = new DPDate(1976, 2, 3);
    max = new DPDate(1979, 3, 4);
    assert.ok(d.clamp(min, max).isSameDay(max), "clamps later date");

    d = new DPDate(2000, 1, 2);
    e = Object.create(d);
    max = new DPDate();
    assert.ok(d.clamp(null, max).isSameDay(e), "ignores missing min");

    d = new DPDate(2002, 2, 4);
    e = Object.create(d);
    min = new DPDate(1990, 9, 9);
    assert.ok(d.clamp(min, null).isSameDay(e), "ignores missing max");
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

