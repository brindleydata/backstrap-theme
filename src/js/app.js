$(function () {
    // Selectpickers
    $('[data-toggle="selectpicker"]').selectpicker();

    Livewire.on('update', function() {
        $('[data-toggle="selectpicker"]').selectpicker();
    });


    // Daterangepickers
    $('[data-toggle="daterangepicker"]').each(function(item) {
        if ($(this).data('mode') == 'single') {
            $(this).daterangepicker({
                singleDatePicker: true,
                timePicker: true,
                opens: $(this).data('opens'),
                locale: {
                    format: 'YYYY/MM/DD hh:mm A',
                }
            });
        } else {
            $(this).daterangepicker({
                startDate: moment().startOf('month'),
                endDate: moment(),
                timePicker: true,
                opens: $(this).data('opens'),
                ranges: {
                    'Today': [moment().startOf('day'), moment()],
                    'Yesterday': [moment().startOf('day').subtract(1, 'days'), moment().startOf('day')],
                    'Last 7 Days': [moment().subtract(7, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(30, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment()],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
                locale: {
                    format: 'YYYY/MM/DD hh:mm A',
                }
            });
        }
    });

    $('[data-toggle="daterangepicker"]').on('hide.daterangepicker', function (event) {
        $(this)[0].dispatchEvent(new Event('input'))
    });


    // Tooltips
    $('body').tooltip({
        selector: '[data-toggle="tooltip"]',
        container: 'body',
        html: true
    });

    $(document).on('click', 'a', function (event) {
        $('.tooltip').tooltip('hide');
    });



    // Legacy stuff
    $.ajaxSetup({
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        }
    });

    $('form.delete').on('submit', function (event, options) {
        options = options || {};

        if (!options.do_actual_run) {
            event.preventDefault();

            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                showCancelButton: true,
                allowEnterKey: false,
                focusCancel: true
            }).then((result) => {
                if (result.value) {
                    $(this).trigger('submit', {do_actual_run: true});
                }
            });
        }
    });

    $.getAllUrlParams = function (url) {
        let obj = {};
        let queryString = url ? url.split('?')[1] : window.location.search.slice(1);

        if (queryString) {
            queryString = queryString.split('#')[0];

            var arr = queryString.split('&');
            for (var i = 0; i < arr.length; i++) {
                var a = arr[i].split('=');
                var paramName = a[0];
                var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

                paramName = paramName.toLowerCase();
                if (typeof paramValue === 'string') {
                    paramValue = paramValue.toLowerCase();
                }

                // if the paramName ends with square brackets, e.g. colors[] or colors[2]
                if (paramName.match(/\[(\d+)?\]$/)) {
                    var key = paramName.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) {
                        obj[key] = [];
                    }

                    // if it's an indexed array e.g. colors[2]
                    if (paramName.match(/\[\d+\]$/)) {
                        // get the index value and add the entry at the appropriate position
                        var index = /\[(\d+)\]/.exec(paramName)[1];
                        obj[key][index] = paramValue;
                    } else {
                        // otherwise add the value to the end of the array
                        obj[key].push(paramValue);
                    }
                } else {
                    // we're dealing with a string
                    if (!obj[paramName]) {
                        // if it doesn't exist, create property
                        obj[paramName] = paramValue;
                    } else if (obj[paramName] && typeof obj[paramName] === 'string') {
                        // if property does exist and it's a string, convert it to an array
                        obj[paramName] = [obj[paramName]];
                        obj[paramName].push(paramValue);
                    } else {
                        // otherwise add the property
                        obj[paramName].push(paramValue);
                    }
                }
            }
        }

        return obj;
    }
});
