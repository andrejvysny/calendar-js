/*

MIT License

Copyright (c) 2020 Andrej Vysny

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

var Calendar = (function (settings = {}) {

    const today = new Date();
    let calendar = document.createElement('div');

    this.root = settings.root;
    this.days = ((typeof settings.days !== "undefined") ? settings.days : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    this.months = ((typeof settings.months !== "undefined") ? settings.months : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']);
    this.currentMonth = ((typeof settings.initMonth !== "undefined") ? settings.initMonth : today.getMonth() + 1);
    this.currentYear = ((typeof settings.initYear !== "undefined") ? settings.initYear : today.getFullYear());
    this.renderLast = ((typeof settings.renderLast !== "undefined") ? settings.renderLast : true);
    this.autoInit = ((typeof settings.autoInit !== "undefined") ? settings.autoInit : true);
    this.selectable = ((typeof settings.selectable !== "undefined") ? settings.selectable : false);
    this.minDate = ((typeof settings.minDate === "undefined") ? null : ((settings.minDate === 'today') ? (new Date().getFullYear().toString() + '-' + (new Date().getMonth() + 1).toString() + '-' + new Date().getDate().toString()) : settings.minDate));
    this.maxDate = (typeof settings.maxDate === "undefined") ? null : ((settings.maxDate === 'today') ? (new Date().getFullYear().toString() + '-' + (new Date().getMonth() + 1).toString() + '-' + new Date().getDate().toString()) : settings.maxDate);

    this.init = () => {

        document.getElementById(this.root).appendChild(renderCalendar(this.currentYear, this.currentMonth));
        /* Switch to next month */
        calendar.querySelector('#nextMonth').addEventListener('click', nextMonth);
        /* Switch to prev month */
        calendar.querySelector('#prevMonth').addEventListener('click', prevMonth);

        if (settings.selectable === true)
            selectable();

    };

    this.updateMonth = (year, month) => {
        month--;
        calendar.querySelector('span.year').innerText = year;
        calendar.querySelector('span.month').innerText = this.months[month];

        let firstDay = new Date(year, month, 1).getDay();
        let daysInMonth = new Date(year, month + 1, 0).getDate();

        let beforeDays;
        if (firstDay > 0) {
            beforeDays = firstDay - 1;
        } else {
            beforeDays = 6;
        }
        let restDays = 42 - beforeDays - daysInMonth;

        let dates = [];
        for (let i = 0; i < beforeDays; i++) {
            dates.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            dates.push(i);
        }
        for (let i = 0; i < restDays; i++) {
            dates.push(null)
        }
        let col_no = 0;
        let row_no = 0;
        let weekend = 0;
        let rows = calendar.getElementsByTagName('tr');
        for (let row of rows) {
            let cols = row.getElementsByTagName('td');
            for (let col of cols) {
                weekend++;
                if (col.style.display === 'none') {
                    col.removeAttribute('style');
                }
                col.removeAttribute('class');
                col.removeAttribute('disabled');
                col.removeAttribute('selected');
                col.innerText = dates[col_no];
                if (dates[col_no] !== null) {
                    col.setAttribute('calendar-date', `${year}-${month + 1}-${dates[col_no]}`);
                    if (weekend >= 6) {
                        col.setAttribute('class', `weekend`);
                    }
                    if (dates[col_no] === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                        col.classList.add('today');
                    }

                    if (this.minDate) {
                        let minDate = new Date(this.minDate);
                        if ((minDate.getFullYear() > year) || (minDate.getFullYear() === year && minDate.getMonth() > month)) {
                            let cellAttributeDisabled = document.createAttribute('disabled');
                            col.setAttributeNode(cellAttributeDisabled);
                        }
                        if (minDate.getDate() >= dates[col_no] + 1 && minDate.getMonth() >= month && minDate.getFullYear() >= year) {
                            let cellAttributeDisabled = document.createAttribute('disabled');
                            col.setAttributeNode(cellAttributeDisabled);
                        }
                    }

                    if (this.maxDate) {
                        let maxDate = new Date(this.maxDate);
                        if ((maxDate.getFullYear() < year) || (maxDate.getFullYear() === year && maxDate.getMonth() < month)) {
                            let cellAttributeDisabled = document.createAttribute('disabled');
                            col.setAttributeNode(cellAttributeDisabled);
                        }
                        if (maxDate.getDate() <= dates[col_no] - 1 && maxDate.getMonth() <= month && maxDate.getFullYear() <= year) {
                            let cellAttributeDisabled = document.createAttribute('disabled');
                            col.setAttributeNode(cellAttributeDisabled);
                        }
                    }


                } else {
                    col.removeAttribute('calendar-date');
                    if (this.renderLast === false && row_no !== 0) {
                        col.style.display = 'none';
                    }
                }
                if (weekend === 7) {
                    weekend = 0;
                }
                col_no++
            }
            row_no++
        }

        if (this.minDate) {
            let minDate = new Date(this.minDate);
            if (minDate.getMonth() >= month && minDate.getFullYear() >= year) {
                calendar.querySelector('#prevMonth').setAttribute('disabled', 'disabled');
            } else {
                calendar.querySelector('#prevMonth').removeAttribute('disabled');
            }
        }

        if (this.maxDate) {
            let maxDate = new Date(this.maxDate);
            if (maxDate.getMonth() <= month && maxDate.getFullYear() <= year) {
                calendar.querySelector('#nextMonth').setAttribute('disabled', 'disabled');
            } else {
                calendar.querySelector('#nextMonth').removeAttribute('disabled');
            }
        }

    };


    const renderCalendar = (year, month) => {
        month--;
        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');
        let head = document.createElement('div');
        head.setAttribute('class', 'head');
        calendar.setAttribute('class', 'calendar');

        let prev = document.createElement('button');
        let next = document.createElement('button');
        prev.setAttribute('id', 'prevMonth');
        next.setAttribute('id', 'nextMonth');
        prev.setAttribute('type', 'button');
        next.setAttribute('type', 'button');
        prev.innerText = 'prev';
        next.innerText = 'next';

        let monthSpan = document.createElement('span');
        let yearSpan = document.createElement('span');
        monthSpan.setAttribute('class', 'month');
        yearSpan.setAttribute('class', 'year');
        monthSpan.innerText = this.months[month];
        yearSpan.innerText = year;

        head.appendChild(prev);
        head.appendChild(monthSpan);
        head.appendChild(yearSpan);
        head.appendChild(next);

        let firstDay = new Date(year, month, 1).getDay();
        let daysInMonth = new Date(year, month + 1, 0).getDate();

        /* RENDER Days In WEEK*/
        for (let day of this.days) {
            let th = document.createElement('th');
            th.innerText = day;
            thead.appendChild(th);
        }

        /* Render Table Cell - DAY*/
        let cellRender = (row, date, i) => {
            let cell = document.createElement('td');

            if (this.minDate) {
                let minDate = new Date(this.minDate);

                if (minDate.getDate() >= date + 1 && minDate.getMonth() >= month && minDate.getFullYear() >= year) {
                    let cellAttributeDisabled = document.createAttribute('disabled');
                    cell.setAttributeNode(cellAttributeDisabled);
                }
            }

            if (this.maxDate) {
                let maxDate = new Date(this.maxDate);

                if (maxDate.getDate() <= date - 1 && maxDate.getMonth() <= month && maxDate.getFullYear() <= year) {
                    let cellAttributeDisabled = document.createAttribute('disabled');
                    cell.setAttributeNode(cellAttributeDisabled);
                }
            }

            let cellAttribute = document.createAttribute('calendar-date');
            cell.setAttributeNode(cellAttribute);

            if (i >= 6) {
                cell.setAttribute('class', 'weekend');
            }
            if (date === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                cell.classList.add('today');
            }
            cell.setAttribute('calendar-date', `${year}-${month + 1}-${date}`);
            cell.innerText = `${date}`;
            row.appendChild(cell);
        };

        /* Render days In MONTH */
        let date = 1;
        for (let x = 0; x < 6; x++) {
            let row = document.createElement('tr');
            for (let i = 1; i <= 7; i++) {

                if (x === 0 && i >= firstDay) {
                    if (i === 7 && firstDay === 0) {
                        cellRender(row, date, i);
                        date++;
                    } else if (i >= firstDay && firstDay !== 0) {
                        cellRender(row, date, i);
                        date++;
                    } else {

                        let cell = document.createElement('td');
                        row.appendChild(cell);
                        if (this.renderLast === false && x !== 0) {
                            cell.style.display = 'none';
                        }

                    }
                } else if (x > 0 && date <= daysInMonth) {
                    cellRender(row, date, i);
                    date++
                } else {
                    let cell = document.createElement('td');
                    row.appendChild(cell);
                    if (this.renderLast === false && x !== 0) {
                        cell.style.display = 'none';
                    }
                }
            }
            tbody.appendChild(row);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        calendar.appendChild(head);
        calendar.appendChild(table);

        if (this.minDate) {
            let minDate = new Date(this.minDate);
            if (minDate.getMonth() >= month && minDate.getFullYear() >= year) {
                calendar.querySelector('#prevMonth').setAttribute('disabled', 'disabled');
            } else {
                calendar.querySelector('#prevMonth').removeAttribute('disabled');
            }
        }

        if (this.maxDate) {
            let maxDate = new Date(this.maxDate);
            if (maxDate.getMonth() <= month && maxDate.getFullYear() <= year) {
                calendar.querySelector('#nextMonth').setAttribute('disabled', 'disabled');
            } else {
                calendar.querySelector('#nextMonth').removeAttribute('disabled');
            }
        }

        return calendar;
    };

    const prevMonth = () => {
        if (this.currentMonth > 1) {
            this.currentMonth--;
        } else {
            this.currentMonth = 12;
            this.currentYear--;
        }
        this.updateMonth(this.currentYear, this.currentMonth);
    };
    const nextMonth = () => {
        if (this.currentMonth < 12) {
            this.currentMonth++;
        } else {
            this.currentMonth = 1;
            this.currentYear++;
        }
        this.updateMonth(this.currentYear, this.currentMonth);
    };

    const selectable = () => {
        calendar.querySelector('table').setAttribute('selectable', 'true');
        const cells = calendar.querySelectorAll('td');
        const selected = document.createAttribute('selected');
        for (let cell of cells) {
            cell.addEventListener('click', function () {
                let clickedCell = this.hasAttribute('selected');
                if (cell.hasAttribute('calendar-date') && !cell.hasAttribute('disabled')) {
                    for (let cell of cells) {
                        cell.removeAttribute('selected');
                    }
                    if (!clickedCell) {
                        cell.setAttributeNode(selected);
                    }
                }

            })
        }
    };

    const settingsChecker = () => {

        let status = true;

        if (typeof settings.root === 'undefined') {
            alert('You have to set root element to render Calendar by ID !');
            status = false;
        }

        if (typeof settings.days !== "undefined")
            if (typeof settings.days !== "object" || settings.days.length < 7) {
                alert('All week Days must be in array !');
                status = false;
            }

        if (typeof settings.months !== "undefined")
            if (typeof settings.months !== "object" || settings.months.length < 12) {
                alert('All Months must be in array !');
                status = false;
            }

        if (typeof settings.initMonth !== "undefined")
            if (typeof settings.initMonth !== "number" || settings.initMonth > 12 || settings.initMonth < 1) {
                alert('initMonth must be in number format of existing Month !');
                status = false;
            }

        if (typeof settings.initYear !== "undefined")
            if (typeof settings.initYear !== "number") {
                alert('initYear must be in number format !');
                status = false;
            }

        if (typeof settings.renderLast !== "undefined")
            if (typeof settings.renderLast !== "boolean") {
                alert('renderLast must be in boolean format !');
                status = false;
            }

        if (typeof settings.autoInit !== "undefined")
            if (typeof settings.autoInit !== "boolean") {
                alert('autoInit must be in boolean format !');
                status = false;
            }

        if (typeof settings.selectable !== "undefined")
            if (typeof settings.selectable !== "boolean") {
                alert('selectable must be in boolean format !');
                status = false;
            }

        if (typeof settings.minDate !== "undefined")
            if (typeof settings.minDate !== "string") {
                alert('minDate must be in string format !');
                status = false;
            }

        if (typeof settings.maxDate !== "undefined")
            if (typeof settings.maxDate !== "string") {
                alert('maxDate must be in string format !');
                status = false;
            }

        return status;
    }

    // Constructor
    const constructor = () => {

        if (!settingsChecker()) {
            document.getElementById(this.root).innerText = 'Error in your code !';
            throw 'Error in your code !';
        }

        if (this.autoInit)
            this.init();
    };

    return constructor();
});