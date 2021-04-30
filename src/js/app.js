$(function () {
    // Selectpickers
    $('[data-toggle="selectpicker"]').selectpicker();

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
            let start, end;
            const range = $(this).val();
            if (range.match(/^\d+\/\d+\/\d+( \d+:\d+ (\w+)?)? - \d+\/\d+\/\d+( \d+:\d+ (\w+)?)?$/)) {
                start = range.split(' - ')[0];
                end = range.split(' - ')[1];
            } else {
                start = moment().startOf('month');
                end = moment();
            }

            $(this).daterangepicker({
                startDate: start,
                endDate: end,
                timePicker: true,
                opens: $(this).data('opens'),
                ranges: {
                    'Today': [moment().startOf('day'), moment()],
                    'Yesterday': [moment().startOf('day').subtract(1, 'days'), moment().startOf('day')],
                    'Last 7 Days': [moment().subtract(7, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(30, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment()],
                    'Prev Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                },
                locale: {
                    format: 'YYYY/MM/DD hh:mm A',
                }
            });
        }
    });

    // Hotpatch to make Livewire work
    $('[data-toggle="daterangepicker"]').on('hide.daterangepicker', function (event) {
        $(this)[0].dispatchEvent(new Event('input'))
    });


    // Tooltips
    $('body').tooltip({
        selector: '[data-toggle="tooltip"]',
        container: 'body',
        html: true
    });

    // Hide all tooltips when clicking on links (prevent stalled tooltips)
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
});
