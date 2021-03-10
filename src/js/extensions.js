$(function () {
    $('select[name="template[range]"]').selectpicker();


    /* Drag and drop handlers */

    let currentDragging = false;

    $('[draggable="true"]').on('dragstart', function (event) {
        currentDragging = $(this).clone();
    });

    $('[draggable="true"]').on('dragstop', function (event) {
        currentDragging = false;
    });

    $('.dropzone').on('dragover', function (event) {
        event.preventDefault();

        // do not highlight when dragging groups into groups
        if ($(this).parent().hasClass('extension-group-frame') && currentDragging.hasClass('extension-group-frame')) {
            return;
        }

        // do not highlight when dragging extensions into groups which have these extensions
        if (currentDragging.hasClass('extension-frame')) {
            const extension_id = currentDragging.data('extension');
            if ($(this).find(`[data-extension="${extension_id}"]`).length) {
                return;
            }
        }

        // do not highlight when dragging groups into templates which have these groups
        if (currentDragging.hasClass('extension-group-frame')) {
            const group_id = currentDragging.data('extension-group');
            if ($(this).find(`[data-extension-group="${group_id}"]`).length) {
                return;
            }
        }

        $(this).addClass('dragover');
    });

    $('.dropzone').on('dragleave', function (event) {
        event.preventDefault();
        $(this).removeClass('dragover');
    });

    $('.dropzone').on('drop', function (event) {
        event.preventDefault();

        // do not allow dropping groups into groups
        if ($(this).parent().hasClass('extension-group-frame')
            && currentDragging.hasClass('extension-group-frame')) {
            return;
        }

        // do not allow dropping extensions into groups which have these extensions
        if (currentDragging.hasClass('extension-frame')) {
            const extension_id = currentDragging.data('extension');
            if ($(this).find(`[data-extension="${extension_id}"]`).length) {
                return;
            }
        }

        // do not allow dropping groups into templates which have these groups
        if (currentDragging.hasClass('extension-group-frame')) {
            const group_id = currentDragging.data('extension-group');
            if ($(this).find(`[data-extension-group="${group_id}"]`).length) {
                return;
            }
        }

        $(this).removeClass('dragover');
        if ($(this).find('.placeholder').length) {
            $(this).find('.placeholder').remove();
        }

        // dropping an extension
        if (currentDragging.data('extension')) {
            const extension_id = currentDragging.data('extension');
            if (!$(this).find(`[data-extension="${extension_id}"]`).length) {
                currentDragging.find('form').remove()
                currentDragging.removeAttr('draggable');
                $(this).append(currentDragging);

                // adding an extension to the group
                if ($(this).parent().hasClass('extension-group-frame')) {
                    const group_id = $(this).parent().data('extension-group');
                    const that = $(this);
                    $.ajax(`/config/extensions/groups/${group_id}/contents`, {
                        method: 'post',
                        data: {
                            extension_id: extension_id
                        },
                        success: function (data) {
                            if (data.success) {
                                that.find(`[data-extension="${extension_id}"]`).append(`
                                    <a class="ml-1 text-info destroy" href="#"><i class="fa fa-times"></i></a>`);
                            } else {
                                that.find(`[data-extension="${extension_id}"]`).remove();
                            }
                        }
                    });
                }

                // adding an extension to the template
                else if ($(this).parent().hasClass('extension-template-frame')) {
                    const template_id = $(this).parent().data('extension-template');
                    const that = $(this);
                    $.ajax(`/config/extensions/templates/${template_id}/contents`, {
                        method: 'post',
                        data: {
                            extension_id: extension_id
                        },
                        success: function (data) {
                            if (data.success) {
                                that.find(`[data-extension="${extension_id}"]`).append(`
                                    <a class="ml-1 text-info destroy" href="#"><i class="fa fa-times"></i></a>`);
                            } else {
                                that.find(`[data-extension="${extension_id}"]`).remove();
                            }
                        }
                    });
                }
            }
        }

        // adding a group to a template
        else if (currentDragging.data('extension-group')) {
            if (!$(this).find(`[data-extension-group="${currentDragging.data('extension-group')}"]`).length) {
                currentDragging.find('.dropzone').remove();
                currentDragging.find('form').remove()
                currentDragging.removeAttr('draggable');

                currentDragging.removeClass('panel').removeClass('panel-default')
                    .addClass('btn').addClass('btn-sm')
                    .css('background', '#eeecee');

                currentDragging.find('.extension-group-name')
                    .append(`<a class="ml-1 text-info destroy" href="#"><i class="fa fa-times"></i></a>`)
                    .removeClass('panel-heading').removeClass('p-3');

                $(this).append(currentDragging);

                const template_id = $(this).parent().data('extension-template');
                const group_id = currentDragging.data('extension-group');
                const that = $(this);
                console.log(`Adding group ${group_id} to template ${template_id}`);
                $.ajax(`/config/extensions/templates/${template_id}/groups`, {
                    method: 'post',
                    data: {
                        group_id: group_id
                    },
                    success: function (data) {
                        if (! data.success) {
                            that.find(`[data-extension-group="${extension_id}"]`).remove();
                        }
                    }
                });
            }
        }

        currentDragging = false;
    });


    /* Panels click handlers */

    $(document).on('click', '.extensions-column .extension-frame', function (event) {
        let number = '';
        let name = '';

        //$('.extension-group-frame').css('border', '1px solid #555');
        //$('.extension-template-frame').css('border', '1px solid #555');
        //$(this).parent().find('.extension-frame').css('border', '1px solid #555');
        //$(this).css('border', '1px solid #eee');
        $('input[name="extension[name]"]').focus();

        if ($(this).find('.text-muted').length) {
            number = $(this).find('.text-muted').text();
            name = $(this).find('.text-white').text();
        } else {
            number = $(this).find('.text-white').text();
            name = '';
        }

        $('input[name="extension[number]"]').val(number);
        $('input[name="extension[name]"]').val(name);
        $('button[name="extension[apply]"]').text('Update');
    });

    $(document).on('click', '.extension-groups-column .extension-group-frame', function (event) {
        const header = $(this).children().first();
        let number = '';
        let name = '';

        //$('.extension-frame').css('border', '1px solid #555');
        //$('.extension-template-frame').css('border', '1px solid #555');
        //$(this).parent().find('.extension-group-frame').css('border', '1px solid #555');
        //$(this).css('border', '1px solid #eee');
        $('input[name="group[name]"]').focus();

        if (header.find('.text-muted').length) {
            number = header.find('.text-muted').text();
            name = header.find('.text-white').text();
        } else {
            number = header.find('.text-white').text();
            name = '';
        }

        $('input[name="group[number]"]').val(number);
        $('input[name="group[name]"]').val(name);
        $('button[name="group[apply]"]').text('Update');
    });

    $(document).on('click', '.extension-templates-column .extension-template-frame', function (event) {
        const header = $(this).children().first();
        let name = header.find('.template-name').text();
        let range = header.find('.template-range').data('range');

        //$('.extension-frame').css('border', '1px solid #555');
        //$('.extension-group-frame').css('border', '1px solid #555');
        //$(this).parent().find('.extension-template-frame').css('border', '1px solid #555');
        //$(this).css('border', '1px solid #eee');

        $('select[name="template[range]"]').data('selectpicker').$button.focus();
        $('input[name="template[name]"]').val(name);
        $('select[name="template[range]"]').selectpicker('val', range);
        $('button[name="template[apply]"]').text('Update');
    });

    // deselect extensions on primary key change
    $('input[name="extension[number]"]').on('keyup', function (event) {
        $('.extension-frame').css('border', '1px solid #555');
        $('button[name="extension[apply]"]').text('Apply');
    });

    $('input[name="extension[number]"]').on('change', function (event) {
        //$('.extension-frame').addClass('border', '1px solid #555');
        $('button[name="extension[apply]"]').text('Apply');
        console.log('change');
    });

    // deselect groups on primary key change
    $('input[name="group[number]"]').on('keyup', function (event) {
        //$('.extension-group-frame').css('border', '1px solid #555');
        $('button[name="group[apply]"]').text('Apply');
    });

    $('input[name="group[number]"]').on('change', function (event) {
        //$('.extension-group-frame').css('border', '1px solid #555');
        $('button[name="group[apply]"]').text('Apply');
    });

    // deselect template on primary key change
    $('input[name="template[name]"]').on('keyup', function (event) {
        //$('.extension-template-frame').css('border', '1px solid #555');
        $('button[name="template[apply]"]').text('Apply');
    });

    $('input[name="template[name]"]').on('change', function (event) {
        //$('.extension-template-frame').css('border', '1px solid #555');
        $('button[name="template[apply]"]').text('Apply');
    });


    /* Panels destroy handlers */

    $(document).on('click', '.extension-groups-column a.destroy', function (event) {
        const extension = $(this).parent();
        const group = extension.parent().parent();
        $.ajax(`/config/extensions/groups/${group.data('extension-group')}/contents/${extension.data('extension')}`, {
            method: 'delete',
            success: function () {
                extension.remove();
                if (!group.find('.dropzone').children().length) {
                    group.find('.dropzone').append(`
                        <div class="placeholder text-muted pb-2">Drop Extensions here</div>`);
                }
            },
        });
    });

    $(document).on('click', '.extension-templates-column a.destroy', function (event) {
        const instance = $(this).parent();

        // dealing with extension
        if (instance.data('extension')) {
            const extension = instance;
            const template = extension.parent().parent();
            $.ajax(`/config/extensions/templates/${template.data('extension-template')}/contents/${extension.data('extension')}`, {
                method: 'delete',
                success: function () {
                    extension.remove();
                    if (!template.find('.dropzone').children().length) {
                        template.find('.dropzone').append(`
                            <div class="placeholder text-muted pb-2">Drop Extensions or Groups here</div>`);
                    }
                },
            });
        }

        // dealing with group
        else if (instance.parent().data('extension-group')) {
            const group = instance.parent();
            const template = group.parent().parent();
            $.ajax(`/config/extensions/templates/${template.data('extension-template')}/groups/${group.data('extension-group')}`, {
                method: 'delete',
                success: function () {
                    group.remove();
                    if (!template.find('.dropzone').children().length) {
                        template.find('.dropzone').append(`
                            <div class="placeholder text-muted pb-2">Drop Extensions or Groups here</div>`);
                    }
                },
            });
        }
    });
});
