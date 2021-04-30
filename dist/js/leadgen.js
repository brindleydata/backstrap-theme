$(function () {
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

    $('select[name="industries[]"]').selectpicker();

    $('select[name="statuses[]"]').on('change', function(event) {
        $('#filters').submit();
    });

    $(document).on('click', 'a[href="#debug"]', function (event) {
        event.preventDefault();

        const id = $(this).data('id');
        const type = $(this).data('type');
        const campaign = $(this).data('campaign');
        const row = $(this).parent().parent();

        $(this).after(`
            <i class="loading glyphicon glyphicon-refresh mr-2" role="status">
                <span class="sr-only">Loading...</span>
            </i>`);

        $(this).remove();

        $.get(`/leadgen/search?type=${type}&id=${id}&campaign=${campaign}`, function (data) {
            row.after(`<tr class="debug results"><td colspan="6">${data}</td></tr>`);
            $('i.loading').remove();
        });
    });

    $(document).on('click', 'a[href="#hide"]', function (event) {
        event.preventDefault();

        const id = $(this).data('id');
        const row = $(this).parent().parent();

        $(this).remove();
        $.get(`/leadgen/hide?id=${id}`, function (data) {
            if (row.next().hasClass('results')) {
                row.next().remove();
            }

            row.remove();
        });
    });

    $(document).on('click', 'a[href="#status"]', function (event) {
        event.preventDefault();

        const campaign = $(this).data('campaign');
        const company = $(this).data('company');
        const status = $(this).data('status');
        const row = $(this).parent().parent();

        $(this).addClass('font-weight-bold');
        $.post(`/leadgen/status`, {
            campaign: campaign,
            company: company,
            status: status
        }, function (data) {
            if (!$('select[name="statuses[]"]').find('option[value="' + status + '"]').is(':selected')) {
                if (row.next().hasClass('debug')) {
                    row.next().remove();
                }

                row.remove();
            }
        });
    });

    $(document).on('click', 'a[href="#make_card"]', function (event) {
        event.preventDefault();

        const campaign_id = $(this).data('campaign');
        const company_id = $(this).data('company');
        const type = $(this).data('type');
        const script = $(this).data('script');
        const id = $(this).data('id');
        const link = $(this).prev().attr('href');
        const row = $(this).parent().parent().parent().parent().parent().parent();

        $('[data-toggle="tooltip"], .tooltip').tooltip("hide");

        $.post(`/leadgen/results`, {
            campaign_id: campaign_id,
            company_id: company_id,
            type: type,
            id: id,
            link: link,
            script: script,
        }, function () {
            row.prev().remove();
            row.remove();
        });
    });

    let start = null;
    let end = null;
    const range = decodeURIComponent($.getAllUrlParams().range).replace(/\+/g, " ");
    if (range !== "undefined") {
        start = moment(range.split(' - ')[0], "YYYY/MM/DD");
        end = moment(range.split(' - ')[1], "YYYY/MM/DD");
    } else {
        start = moment().subtract(3, 'month');
        end = moment();
    }

    $('input[name="range"]').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
            'This Month': [moment().startOf('month'), moment()],
            'Last Month': [moment().subtract(1, 'month'), moment()],
            'Last 3 Months': [moment().subtract(3, 'month'), moment()],
            'All Time': [moment('1970-01-01'), moment()]
        },
        locale: {
            format: 'YYYY/MM/DD'
        }
    });


    /* Drag and drop handlers */

    let sourceCard = false;
    let currentDragging = false;
    let sourceBoard = false;

    // started
    $(document).on('dragstart', '[draggable="true"]', function (event) {
        sourceCard = $(this);
        sourceBoard = $(this).parent();
        currentDragging = sourceCard.clone();

        $(event.target).css('opacity', .75);
        setTimeout(() => {
            sourceCard.css('opacity', .25);
        }, 0);
    });

    // cancelled
    $(document).on('dragend', '[draggable="true"]', function (event) {
        event.preventDefault();
        $('.panel').removeClass('card-border-top').removeClass('card-border-bottom');
        $('.dropzone').css('background', 'transparent').css('border-radius', 0);
        sourceCard.css('opacity', 1);
    });

    // entering zone - calculate and apply styles
    $('.dropzone').on('dragover', function (event) {
        event.preventDefault();

        $(this).css('background', '#fff7').css('border-radius', '7px');

        const cards = $(this).find('.panel');
        const dropPoint = event.originalEvent.layerY;

        if (cards.length && dropPoint > $(cards[0]).position().top) {
            cards.removeClass('card-border-top').removeClass('card-border-bottom');

            const lastCard = $(cards[cards.length - 1]);
            if (dropPoint > lastCard.position().top + lastCard.height()) {
                lastCard.addClass('card-border-bottom');
            } else {
                for (let i = 0; i < cards.length; i++) {
                    const cardBottom = $(cards[i]).position().top + $(cards[i]).height();
                    if (cardBottom >= dropPoint) {
                        $(cards[i]).addClass('card-border-top');
                        break;
                    }
                }
            }
        }
    });

    // leaving zone - reset styles
    $('.dropzone').on('dragleave', function (event) {
        event.preventDefault();
        $(this).find('.panel').removeClass('card-border-top').removeClass('card-border-bottom');
        $(this).css('background', 'transparent').css('border-radius', 0);
    });

    // applied
    $('.dropzone').on('drop', function (event) {
        $(this).css('background', 'transparent').css('border-radius', 0);

        const syncSourceBoard = function (sourceBoard, sourceCard) {
            const originalOrder = parseInt(sourceCard.attr('order'));
            sourceCard.remove();

            const cards = sourceBoard.find('.panel');
            for (let i = 0; i < cards.length; i++) {
                let srcOrder = $(cards[i]).attr('order');
                if (srcOrder <= originalOrder) {
                    continue;
                } else {
                    let reorder = parseInt($(cards[i]).attr('order')) - 1;
                    $(cards[i]).attr('order', reorder).find('.order').text(reorder);
                }
            }
        }

        event.preventDefault();
        $(this).find('.panel').removeClass('card-border-top').removeClass('card-border-bottom');

        let order = 0;
        const targetBoard = $(this);
        const dropPoint = event.originalEvent.layerY;

        const cards = targetBoard.find('.panel');
        if (cards.length && dropPoint > $(cards[0]).position().top) {
            const lastCard = $(cards[cards.length - 1]);
            if (dropPoint > lastCard.position().top + lastCard.height()) {
                order = parseInt(lastCard.attr('order')) + 1;
                syncSourceBoard(sourceBoard, sourceCard);
                if (sourceBoard.data('board') == targetBoard.data('board')) {
                    order--;
                }

                currentDragging.attr('order', order).find('.order');
                $(this).append(currentDragging);
            } else {
                isCardPlaced = false;
                for (let i = 0; i < cards.length; i++) {
                    const cardBottom = $(cards[i]).position().top + $(cards[i]).height();
                    if (!isCardPlaced && cardBottom >= dropPoint) {
                        order = parseInt($(cards[i]).attr('order'));
                        syncSourceBoard(sourceBoard, sourceCard);

                        if (sourceBoard.data('board') == targetBoard.data('board') && order >= parseInt(currentDragging.attr('order'))) {
                            order--;
                        }

                        currentDragging.attr('order', order).find('.order');
                        $(cards[i]).before(currentDragging);
                        isCardPlaced = true;
                    }

                    if (isCardPlaced) {
                        let reorder = parseInt($(cards[i]).attr('order')) + 1;
                        $(cards[i]).attr('order', reorder).find('.order').text(reorder);
                    }
                }
            }
        } else {
            $(this).find('.noresults').remove();
            syncSourceBoard(sourceBoard, sourceCard);

            currentDragging.attr('order', order).find('.order');
            $(this).append(currentDragging);
        }

        const srcCounter = sourceBoard.find('.panel').length;
        sourceBoard.find('.counter').text(srcCounter > 0 ? srcCounter : '');

        const dstCounter = $(this).find('.panel').length;
        $(this).find('.counter').text(dstCounter > 0 ? dstCounter : '');

        $.ajax(`/leadgen/boards/cards/${currentDragging.data('card')}`, {
            method: 'PATCH',
            data: {
                board: targetBoard.data('board'),
                order: order
            },
            success: function (data) {
                console.debug(data);
                currentDragging = false;
                sourceBoard = false;
                sourceCard = false;
            }
        });
    });

    $(document).on('click', 'a[href="#history"]', function (event) {
        event.preventDefault();
        const history = $(this).parent().parent().parent().find('.panel-footer');
        history.toggleClass('d-none');
    });

    // todo send comments into the history in async
});
