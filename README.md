## datepickr

A simple JavaScript date picker, with changes by [Matt Bishop](https://github.com/ieyasu/datepickr).

Sample implementations: http://joshsalverda.github.io/datepickr

Major changes:

- Month and year drop-down config options, compatible with JQuery UI's [Datepicker widget](http://api.jqueryui.com/datepicker/)
- Lifted date calculations into DPDate class, with units tests for same
- Date formatting is now strftime()-compatible instead of PHP-like
- Removed browser compatibility shims
- Pressing the Escape key closes the calendar


### Quick Start

The simplest method to get up and running:

```
datepickr('#inputElementId');
```

Replace 'inputElementId' with the id of the input element you will be using.  You can pass in any selector that is supported by [querySelectorAll](https://developer.mozilla.org/en/docs/Web/API/Document.querySelectorAll).

```
datepickr('#some .complex [selector]');
```

You can also pass in a node directly:

```
datepickr(document.getElementById('myId'));
```


### Miscellaneous

If your input has a value attribute on page load, or anytime before the datepickr instance is created, then datepickr will use that date as the default selected one. As long as Date.parse can read the value.

DPDate handles leap years according to the [algorithm](http://en.wikipedia.org/wiki/Leap_year#Algorithm) given by Wikipedia for the Gregorian Calendar.

datepickr.js is minified using [UglifyJS2](https://github.com/mishoo/UglifyJS2) and [minifier](https://www.npmjs.com/package/minifier) for the CSS.


### Browser Support

Only recent browsers are supported.


### Localization

You can localize Datepickr by changing properties of the DPDate class.

| DPDate Property | Description | Default |
| --------------- |------------ | ------------- | ------------- |
| weekdays        | Full weekday names | ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] |
| weekdayAbbrevs  | Abbreviated weekday names | ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] |
| months          | Full month names | ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] |
| monthAbbrevs    | Abbreviated month names | ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] |
| firstDayOfWeek  | 0-6, 0 = Sunday, 6 = Saturday | 0 |

For example, changing weekday names to French:

```
<script>
    DPDate.weekdays = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    datepickr('#yourId');
</script>
```

Start the calendar on Monday instead of Sunday:

```
<script>
    DPDate.firstDayOfWeek = 1;
    datepickr('#yourId');
</script>
```


### Config Options

You can also customize each datepickr instance by passing in some extra config options. The default values that can be overridden are:

| Config Option | Type | Default | Description |
| ------------- | ----------- | ------------- | ------------- |
| dateFormat | string | '%B %e, %Y' | How the date will be displayed in the input box.  The format is given below. |
| altInput | node | null | A reference to another input element. This can be useful if you want to show the user a readable date, but return something totally different to the server. |
| altFormat | string | null | Same as dateFormat, but for the altInput field |
| minDate | DPDate | null | The earliest date that a user can start picking from, as a DPDate. |
| maxDate | DPDate | null | The latest date that a user can pick from, as a DPDate. |
| changeMonth | boolean | false | If true, the month displayed in the titlebar becomes a dropdown menu that lets the user jump to an arbitrary month of the current year. |
| changeYear | boolean | false | Like changeMonth, but displays some number of years to jump to.  The range of years is controlled by yearRange. |
| yearRange | string | 'c-10:c+10' | The range of years displayed in the year dropdown menu. More below. |
| abbreviateMonth | boolean | false | Use abbreviated month names. |

Change the default date format:

```
<script>
    datepickr('.someClassName', { dateFormat: '%e %B %Y' }); // 15 January 2014
</script>
```

Specify a min and max date:

```
<script>
    var now = new Date().getTime();
    datepickr('#minAndMax', {
        // few days ago
        minDate: new DPDate(now - 2.592e8),
        // few days from now
        maxDate: new DPDate(now + 2.592e8)
    });
</script>
```

Use an alternate input and format:

```
<input id="userInput">
<input id="altInput" type="hidden">

<script>
    datepickr('#userInput', {
        dateFormat: '%A, %B %e, %Y', // Wednesday, January 15, 2014
        altInput: document.getElementById('altInput'),
        altFormat: '%Y-%m-%d' // 2014-01-15
    });
</script>
```

#### yearRange

The yearRange config option supports three syntaxes for year limits: relative to now, relative to the displayed month, and absolute years:

- Years relative to now are integers prefixed with '+' or '-'
- Years relative to the displayed month are integers prefixed with 'c+' or 'c-' ('c' for 'current')
- Absolute years are integers without any prefix

The limits are separated with a colon (':') as min:max.  You can mix or match the syntaxes, e.g. 'c-10:+2' will start at 10 years less than the currently display year, stopping two years from now.


### Date Format

The DPDate class uses a subset of C's [strftime](http://linux.die.net/man/3/strftime) format specifiers:

| Conversion Spec. | Description | Example |
| ---------------- | ----------- | ------------- |
| %A | Full weekday name | Monday |
| %a | abbreviated weekday name | Mon |
| %B | Full month name | January |
| %b | abbreviated month name | Jan |
| %d | day of month, 0-filled | 01-31
| %e | day of month, space-filled | 1-31 |
| %m | month number, 0-filled | 01-12 |
| %s | seconds since Unix Epoch | 1413704993 |
| %u | numeric day of week | 1-7, 1 = Monday, 7 = Sunday |
| %w | numeric day of week | 0-6, 0 = Sunday, 6 = Saturday |
| %Y | year with century | 1999 or 2003 |
| %y | year without century | 99 or 03 |
| %% | escaped '%' | |

A date format string consists of normal characters and conversion specifiers beginning with '%'.  Normal characters are copied to the output string while conversion specifiers are converted as above with the values in the DPDate instance.
