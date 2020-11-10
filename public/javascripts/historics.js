/**  */
/**********************************************************************************************************/
/****** Module: historics.js												*******************************/
/****** Description: Módulo de soporte a la gestion de historicos			*******************************/
/**********************************************************************************************************/
const ROWS_BY_PAGE = 20;
var dataToPrint = [];
var filterReport = '';
var subHeader = "";

/**
 * InitialPage
 * @param {any} howMany
 * 20170508 AGL. Calculo de Pagina en curso inicial 
 */
var InitialPage = function(howMany) {
    return howMany == 0 ? 0 : 1;
};
/**
 * AddRecordsForReport
 * @param {any} value
 * @param {any} filter
 */
var AddRecordsForReport = function (value, filter) {

    Trace("historic.js:AddRecordsForReport. [value, filter] ", value, filter);

    filterReport = filter;

    var TipoAlarma = '';
    switch (value.TipoAlarma) {
        case 0:
            TipoAlarma = 'No urgente';//AlarmNoUrgent;
            break;
        case 1:
            TipoAlarma = 'Urgente';//AlarmUrgent;
            break;
        case 2:
            TipoAlarma = 'Crítica';//AlarmCritique;
            break;
        default:
            TipoAlarma = '';
    }

    // Data to print
    var rowToPrint = [];
    rowToPrint.push(value.FechaHora.toString());
    rowToPrint.push(value.TipoHw);
    rowToPrint.push(value.IdHw);
    rowToPrint.push(value.Descripcion);
    rowToPrint.push(value.Alarma == '1' ? 'Alarma' : 'Evento');
    rowToPrint.push(value.Reconocida === null ? '' : value.Reconocida);
    var alarmType = (value.Alarma == '1' ? TipoAlarma : '');
    rowToPrint.push(alarmType);
    rowToPrint.push(value.Usuario == null ? '' : value.Usuario);

    dataToPrint.push(rowToPrint);
};
/**
 * AddRecordsForReportEvents
 * @param {any} value
 * @param {any} filter
 */
var AddRecordsForReportEvents = function (value, filter) {

    Trace("historic.js:AddRecordsForReportEvent. [value, filter] ", value, filter);

    filterReport = filter;
    // Data to print
    var rowToPrint = [];
    rowToPrint.push(value.FechaHora.toString());
    rowToPrint.push(value.TipoHw);
    rowToPrint.push(value.IdHw);
    rowToPrint.push(value.Descripcion);
    rowToPrint.push(value.Alarma == '1' ? 'Alarma' : 'Evento');
    rowToPrint.push(value.Usuario == null ? '' : value.Usuario);

    dataToPrint.push(rowToPrint);
};
/**
 * LoadGatewayInActiveConfiguration
 * */
var LoadGatewaysInActiveConfiguration = function () {

    Trace("historic.js:LoadGatewaysInActiveConfiguration.");

    $("#GotoGatewaysLocalConfiguration").empty();
    $.ajax({
        type: 'GET',
        url: '/gateways/activeCfg',
        success: function(data) {
            if (data != null) {
                var lastCfg = "";
                var lastSite = "";
                $.each(data, function(index, value) {
                    if (value.cfg != lastCfg) {
                        lastCfg = value.cfg;
                        lastSite = value.site;
                        // Creamos nuevo item de configuracion
                        var itemCfg = $('<li style="width:95%;margin-top: 5px;margin-bottom: 10px">' +
                            '<a style="display:block" >' + value.cfg + '</a>' +
                            '<ul id="cfg_gtw-' + value.idCFG + '" style="padding-left: 5px; display:block"></ul>' +
                            '</li>');
                        var itemSite = $('<li style="width:95%;margin-top: 5px;margin-bottom: 5px">' +
                            '<a style="display:block; color:#ffCC00">' + value.site + '</a>' +
                            '<ul id="site_gtw-' + value.idEMPLAZAMIENTO + '" style="padding-left: 5px; display:block"></ul>' +
                            '</li>');
                        var itemGtw = $('<li style="width:95%;margin-top: 5px;margin-bottom: 5px"><a style="color::#ffCC00;font-size:10px" href=http://' + value.ipv + ":" + value.wport + ' target="_blank">' + value.name + '</li>');
                        itemCfg.appendTo($("#GotoGatewaysLocalConfiguration"));
                        itemSite.appendTo($('#cfg_gtw-' + value.idCFG));
                        itemGtw.appendTo($('#site_gtw-' + value.idEMPLAZAMIENTO));
                    }
                    else if (value.site != lastSite) {
                        lastSite = value.site;

                        var itemSite1 = $('<li style="width:95%;margin-top: 5px;margin-bottom: 5px">' +
                            '<a style="display:block; color:#ffCC00">' + value.site + '</a>' +
                            '<ul id="site_gtw-' + value.idEMPLAZAMIENTO + '" style="padding-left: 5px; display:block"></ul>' +
                            '</li>');
                        var itemGtw1 = $('<li style="width:95%;margin-top: 5px;margin-bottom: 5px"><a style="color::#ffCC00;font-size:10px" href=http://' + value.ipv + ":" + value.wport + ' target="_blank">' + value.name + '</li>');
                        itemSite1.appendTo($('#cfg_gtw-' + value.idCFG));
                        itemGtw1.appendTo($('#site_gtw-' + value.idEMPLAZAMIENTO));
                    }
                    else {
                        var itemGtw2 = $('<li style="width:95%;margin-top: 5px;margin-bottom: 5px"><a style="color::#ffCC00;font-size:10px" href=http://' + value.ipv + ":" + value.wport + ' target="_blank">' + value.name + '</li>');
                        itemGtw2.appendTo($('#site_gtw-' + value.idEMPLAZAMIENTO));
                    }

                });
            }
        }
    });
};
/**
 * GetOverallHistorics
 * */
var GetOverallHistorics = function () {

    Trace("historic.js:GetOverallHistorics");

    $('#BtnToPdfEvents').hide();
    $('#BtnToPdf').show();
    $('#BtnToExcel').show();
    $('#BtnToExcelEvents').hide();
    $('#FormHistorics').show();
    $('#tdFilter').attr('style', 'display:table-column');
    $('#DivHistorics').animate({ width: '1600px' });
    $('#Page').data('page', 0);

    $('#TableHistorics').fadeOut(500, function() {
        $('#AddFormHistorics').show();
        $.ajax({
            type: 'GET',
            url: '/historics',
            success: function(data) {
                var h = '';
                var i = 0;
                var AlarmNoUrgent = '';
                var AlarmUrgent = '';
                var AlarmCritique = '';
                var _Overall = '';

                translateWord('NoUrgent', function(result) {
                    AlarmNoUrgent = result;
                    translateWord('Urgent', function(result) {
                        AlarmUrgent = result;
                        translateWord('Critique', function(result) {
                            AlarmCritique = result;

                            dataToPrint = [];
                            $('#TableHistorics tr:gt(0)').remove();
                            $('#TableToExcel tr:gt(0)').remove();
                            $('#TableToExcelEvents tr:gt(0)').remove();

                            $('#TableHistorics th:nth-child(6)').show();
                            $('#TableHistorics th:nth-child(7)').show();

                            translateWord('Overall', function(result) {
                                _Overall = result.toUpperCase();
                            });


                            $.each(data.historics, function(index, value) {
                                AddRecordsForReport(value, _Overall);

                                var TipoAlarma = '';
                                switch (value.TipoAlarma) {
                                    case 0:
                                        TipoAlarma = AlarmNoUrgent;
                                        break;
                                    case 1:
                                        TipoAlarma = AlarmUrgent;
                                        break;
                                    case 2:
                                        TipoAlarma = AlarmCritique;
                                        break;
                                    default:
                                        TipoAlarma = '';
                                }

                                h = '<tr> <td>' + value.FechaHora + '</td>' +
                                    '<td>' + value.TipoHw + '</td>' +
                                    '<td>' + value.IdHw + '</td>' +
                                    '<td>' + value.Descripcion + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                                    '<td>' + (value.Reconocida == null ? '' : value.Reconocida) + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? TipoAlarma : '') + '</td>' +
                                    '<td>' + value.Usuario + '</td> </tr>';
                                if (++i <= ROWS_BY_PAGE) {
                                    $('#TableHistorics tr:last').after(h);
                                }

                                $('#TableToExcel tr:last').after(h);
                            });

                            $('#TableHistorics').fadeIn(500);
                            $('#FormHistorics').data('numPages', Math.floor(data.howMany / ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                            $('#TblHistoricos').data('filtering', 'none');
                            $('#Page').text($('#Page').data('page') + InitialPage(data.howMany) + '/' + $('#FormHistorics').data('numPages') + (data.howMany == 3000 ? '	(*)' : ''));
                        });
                    });
                });


            }
        });
    });
};
/**
 * GetOverallHistoricsEvents
 * */
var GetOverallHistoricsEvents = function () {

    Trace("historic.js:GetOverallHistoricsEvents");

    $('#BtnToPdf').hide();
    $('#BtnToPdfEvents').show();
    $('#BtnToExcel').hide();
    $('#BtnToExcelEvents').show();
    $('#FormHistorics').show();
    $('#tdFilter').attr('style', 'display:table-column');
    $('#DivHistorics').animate({ width: '1600px' });
    $('#Page').data('page', 0);

    $('#TableHistorics').fadeOut(500, function() {
        $('#AddFormHistorics').show();
        $.ajax({
            type: 'GET',
            url: '/historics/events/',
            success: function(data) {
                var h = '';
                var i = 0;

                dataToPrint = [];
                $('#TableHistorics tr:gt(0)').remove();
                $('#TableToExcel tr:gt(0)').remove();
                $('#TableToExcelEvents tr:gt(0)').remove();

                $('#TableHistorics th:nth-child(6)').hide();
                $('#TableHistorics th:nth-child(7)').hide();

                $.each(data.historics, function(index, value) {
                    translateWord('OnlyEvents', function(result) {
                        AddRecordsForReportEvents(value, result.toUpperCase());
                    });

                    h = '<tr> <td>' + value.FechaHora + '</td>' +
                        '<td>' + value.TipoHw + '</td>' +
                        '<td>' + value.IdHw + '</td>' +
                        '<td>' + value.Descripcion + '</td>' +
                        '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                        //'<td>' + (value.Reconocida==null ? '' : value.Reconocida) + '</td>' +
                        //'<td>' + (value.Alarma=='1'?TipoAlarma:'') + '</td>' +
                        '<td>' + value.Usuario + '</td> </tr>';
                    if (++i <= ROWS_BY_PAGE) {
                        $('#TableHistorics tr:last').after(h);
                    }

                    $('#TableToExcelEvents tr:last').after(h);
                });

                $('#TableHistorics').fadeIn(500);
                $('#FormHistorics').data('numPages', Math.floor(data.howMany / ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                $('#TblHistoricos').data('filtering', 'events');
                $('#Page').text($('#Page').data('page') + InitialPage(data.howMany) + '/' + $('#FormHistorics').data('numPages') + (data.howMany == 3000 ? '	(*)' : ''));
            }
        });
    });
};
/**
 * GetOverallHistoricsAlarms
 * */
var GetOverallHistoricsAlarms = function () {

    Trace("historic.js:GetOverallHistoricsAlarms");

    $('#BtnToPdfEvents').hide();
    $('#BtnToPdf').show();
    $('#BtnToExcel').show();
    $('#BtnToExcelEvents').hide();
    $('#FormHistorics').show();
    $('#tdFilter').attr('style', 'display:table-column');
    $('#DivHistorics').animate({ width: '1600px' });
    $('#Page').data('page', 0);
    $('#FormHistorics').data('numPages', 0);
    $('#Page').text('0/0');

    $('#TableHistorics').fadeOut(500, function() {
        $('#AddFormHistorics').show();
        $.ajax({
            type: 'GET',
            url: '/historics/alarms/',
            success: function(data) {
                var h = '';
                var i = 0;
                var AlarmNoUrgent = '';
                var AlarmUrgent = '';
                var AlarmCritique = '';

                translateWord('NoUrgent', function(result) {
                    AlarmNoUrgent = result;
                    translateWord('Urgent', function(result) {
                        AlarmUrgent = result;
                        translateWord('Critique', function(result) {
                            AlarmCritique = result;

                            dataToPrint = [];
                            $('#TableHistorics tr:gt(0)').remove();
                            $('#TableToExcel tr:gt(0)').remove();
                            $('#TableToExcelEvents tr:gt(0)').remove();

                            $('#TableHistorics th:nth-child(6)').show();
                            $('#TableHistorics th:nth-child(7)').show();

                            $.each(data.historics, function(index, value) {
                                translateWord('OnlyAlarms', function(result) {
                                    AddRecordsForReport(value, result.toUpperCase());
                                });

                                var TipoAlarma = '';
                                switch (value.TipoAlarma) {
                                    case 0:
                                        TipoAlarma = AlarmNoUrgent;
                                        break;
                                    case 1:
                                        TipoAlarma = AlarmUrgent;
                                        break;
                                    case 2:
                                        TipoAlarma = AlarmCritique;
                                        break;
                                    default:
                                        TipoAlarma = '';
                                }

                                h = '<tr> <td>' + value.FechaHora + '</td>' +
                                    '<td>' + value.TipoHw + '</td>' +
                                    '<td>' + value.IdHw + '</td>' +
                                    '<td>' + value.Descripcion + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                                    '<td>' + (value.Reconocida == null ? '' : value.Reconocida) + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? TipoAlarma : '') + '</td>' +
                                    '<td>' + value.Usuario + '</td> </tr>';
                                if (++i <= ROWS_BY_PAGE) {
                                    $('#TableHistorics tr:last').after(h);
                                }

                                $('#TableToExcel tr:last').after(h);
                            });

                            $('#TableHistorics').fadeIn(500);
                            $('#FormHistorics').data('numPages', Math.floor(data.howMany / ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                            $('#TblHistoricos').data('filtering', 'alarms');
                            $('#Page').text($('#Page').data('page') + InitialPage(data.howMany) + '/' + $('#FormHistorics').data('numPages') + (data.howMany == 3000 ? '	(*)' : ''));
                        });
                    });
                });

            }
        });
    });
};
/**
 * GetRangeHistorics
 * @param {any} start
 * @param {any} howMany
 */
var GetRangeHistorics = function (start, howMany) {

    Trace("historic.js:GetRangeHistorics. start %s, howMany %s.", start, howMany);

    $('#BtnToPdfEvents').hide();
    $('#BtnToPdf').show();
    $('#BtnToExcel').show();
    $('#BtnToExcelEvents').hide();
    $('#TableHistorics').fadeOut(500, function() {
        $.ajax({
            type: 'GET',
            url: '/historics/range/' + start + '/' + howMany,
            success: function(data) {
                $('#TableHistorics').fadeIn(500);
                var h = '';
                $('#TableHistorics tr:gt(0)').remove();
                $('#Page').text($('#Page').data('page') + InitialPage(data.howMany) + '/' + $('#FormHistorics').data('numPages'));
                var AlarmNoUrgent = '';
                var AlarmUrgent = '';
                var AlarmCritique = '';

                translateWord('NoUrgent', function(result) {
                    AlarmNoUrgent = result;
                    translateWord('Urgent', function(result) {
                        AlarmUrgent = result;
                        translateWord('Critique', function(result) {
                            AlarmCritique = result;

                            $.each(data.historics, function(index, value) {
                                var TipoAlarma = '';
                                switch (value.TipoAlarma) {
                                    case 0:
                                        TipoAlarma = AlarmNoUrgent;
                                        break;
                                    case 1:
                                        TipoAlarma = AlarmUrgent;
                                        break;
                                    case 2:
                                        TipoAlarma = AlarmCritique;
                                        break;
                                    default:
                                        TipoAlarma = '';
                                }

                                h = '<tr> <td>' + value.FechaHora + '</td>' +
                                    '<td>' + value.TipoHw + '</td>' +
                                    '<td>' + value.IdHw + '</td>' +
                                    '<td>' + value.Descripcion + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                                    '<td>' + (value.Reconocida === null ? '' : value.Reconocida) + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? TipoAlarma : '') + '</td>' +
                                    '<td>' + value.Usuario + '</td> </tr>';
                                $('#TableHistorics tr:last').after(h);
                            });
                        });
                    });
                });
            }
        });
    });
};
/**
 * GetRangeHistoricsEvents
 * @param {any} start
 * @param {any} howMany
 */
var GetRangeHistoricsEvents = function (start, howMany) {

    Trace("historic.js:GetRangeHistoricsEvents. start %s, howMany %s", start, howMany);

    $('#BtnToPdfEvents').show();
    $('#BtnToPdf').hide();
    $('#BtnToExcel').hide();
    $('#BtnToExcelEvents').show();
    $('#TableHistorics').fadeOut(500, function() {
        $.ajax({
            type: 'GET',
            url: '/historics/range/events/' + start + '/' + howMany,
            success: function(data) {
                $('#TableHistorics').fadeIn(500);
                var h = '';
                $('#TableHistorics tr:gt(0)').remove();
                $('#Page').text($('#Page').data('page') + InitialPage(data.howMany) + '/' + $('#FormHistorics').data('numPages'));

                $.each(data.historics, function(index, value) {

                    h = '<tr> <td>' + value.FechaHora + '</td>' +
                        '<td>' + value.TipoHw + '</td>' +
                        '<td>' + value.IdHw + '</td>' +
                        '<td>' + value.Descripcion + '</td>' +
                        '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                        //'<td>' + (value.Reconocida===null ? '' : value.Reconocida) + '</td>' +
                        //'<td>' + (value.Alarma=='1'?TipoAlarma:'') + '</td>' +
                        '<td>' + value.Usuario + '</td> </tr>';
                    $('#TableHistorics tr:last').after(h);
                });
            }
        });
    });
};
/**
 * GetRangeHistoricsAlarms
 * @param {any} start
 * @param {any} howMany
 */
var GetRangeHistoricsAlarms = function (start, howMany) {

    Trace("historic.js:GetRangeHistoricsAlarms. start %s, howMany %s", start, howMany);

    $('#BtnToPdfEvents').hide();
    $('#BtnToPdf').show();
    $('#BtnToExcel').show();
    $('#BtnToExcelEvents').hide();
    $('#TableHistorics').fadeOut(500, function() {
        $.ajax({
            type: 'GET',
            url: '/historics/range/alarms/' + start + '/' + howMany,
            success: function(data) {
                $('#TableHistorics').fadeIn(500);
                var h = '';
                $('#TableHistorics tr:gt(0)').remove();
                $('#Page').text($('#Page').data('page') + InitialPage(data.howMany) + '/' + $('#FormHistorics').data('numPages'));
                var AlarmNoUrgent = '';
                var AlarmUrgent = '';
                var AlarmCritique = '';

                translateWord('NoUrgent', function(result) {
                    AlarmNoUrgent = result;
                    translateWord('Urgent', function(result) {
                        AlarmUrgent = result;
                        translateWord('Critique', function(result) {
                            AlarmCritique = result;

                            $.each(data.historics, function(index, value) {
                                var TipoAlarma = '';
                                switch (value.TipoAlarma) {
                                    case 0:
                                        TipoAlarma = AlarmNoUrgent;
                                        break;
                                    case 1:
                                        TipoAlarma = AlarmUrgent;
                                        break;
                                    case 2:
                                        TipoAlarma = AlarmCritique;
                                        break;
                                    default:
                                        TipoAlarma = '';
                                }

                                h = '<tr> <td>' + value.FechaHora + '</td>' +
                                    '<td>' + value.TipoHw + '</td>' +
                                    '<td>' + value.IdHw + '</td>' +
                                    '<td>' + value.Descripcion + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                                    '<td>' + (value.Reconocida === null ? '' : value.Reconocida) + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? TipoAlarma : '') + '</td>' +
                                    '<td>' + value.Usuario + '</td> </tr>';
                                $('#TableHistorics tr:last').after(h);
                            });
                        });
                    });
                });
            }
        });
    });
};
/**
 * Filter
 * @param {any} page
 */
function Filter(page) {

    Trace("historic.js:Filter. page ", page);

    switch ($('#TblHistoricos').data('filtering')) {
        case 'none':
            GetRangeHistorics(page * ROWS_BY_PAGE, ROWS_BY_PAGE);
            break;
        case 'events':
            GetRangeHistoricsEvents(page * ROWS_BY_PAGE, ROWS_BY_PAGE);
            break;
        case 'alarms':
            GetRangeHistoricsAlarms(page * ROWS_BY_PAGE, ROWS_BY_PAGE);
            break;
        case 'group':
            FilteringByGroup(false);
            break;
        case 'date':
            FilteringByDate(false);
            break;
        case 'component':
            FilteringByComponent(false);
            break;
        case 'code':
            FilteringByCode(false);
            break;
    }
}
/**
 * GotoNextPage
 * */
function GotoNextPage() {

    Trace("historic.js:GotoNextPage.");

    if ($('#Page').data('page') < $('#FormHistorics').data('numPages') - 1) {
        var page = ($('#Page').data('page') + 1);
        $('#Page').data('page', page);

        Filter(page);
    }
}
/**
 * GotoPreviousPage
 * */
function GotoPreviousPage() {

    Trace("historic.js:GotoPreviousPage");

    if ($('#Page').data('page') > 0) {
        var page = ($('#Page').data('page') - 1);
        $('#Page').data('page', page);

        Filter(page);
    }
}
/**
 * GotoFirstPage
 * */
function GotoFirstPage() {

    Trace("historic.js:GotoFirstPage.");

    if ($('#Page').data('page') > 0) {
        var page = 0;
        $('#Page').data('page', page);

        Filter(page);
    }
}
/**
 * GotoLastPage
 * */
function GotoLastPage() {

    Trace("historic.js:GotoLastPage");

    if ($('#Page').data('page') < $('#FormHistorics').data('numPages') - 1) {
        var page = $('#FormHistorics').data('numPages') - 1;
        $('#Page').data('page', page);

        Filter(page);
    }
}
/**
 * ShowFilterGroups
 * */
function ShowFilterGroups() {

    Trace("historic.js:ShowFilterGroups.");

    startHistoricDate('IDateStartGroup');
    todayDateTime('IDateEndGroup');

    $('#FormHistorics').show();
    $('#AddFilterCode').hide();
    $('#AddFormHistorics').hide();
    $('#AddFilterComponent').hide();
    $('#BtnToPdf').hide();
    $('#BtnToExcel').hide();
    $('#BtnToExcelEvents').hide();

    $('#DivHistorics').animate({ width: '223px' });
    $('#tdFilter').attr('style', 'vertical-align:top;display:table-cell');
    $('#AddFilterGroup').show();
    $('#AddFilterDate').hide();

    // Buscar los distintos grupos
    $.ajax({
        type: 'GET',
        url: '/historics/groups',
        success: function(data) {
            $('#SGroup').empty();
            $.each(data.groups, function(index, value) {
                $('#SGroup').append($('<option>', {
                    text: value.TipoHw,
                    value: value.TipoHw
                }
                )
                );
            });
        }
    });
}
/**
 * FilteringByGroup
 * @param {any} noRange
 */
function FilteringByGroup(noRange) {

    Trace("historic.js:FilteringByGroup. noRange ", noRange);

    $('#BtnToPdfEvents').hide();
    $('#BtnToPdf').show();
    $('#BtnToExcel').show();
    $('#BtnToExcelEvents').hide();
    $('#DivHistorics').animate({ width: '1600px' });
    if (noRange)
        $('#Page').data('page', 0);

    $('#TableHistorics').fadeOut(500, function() {
        $('#AddFormHistorics').show();

        var iniRec = $('#Page').data('page') * ROWS_BY_PAGE;

        var strUrl = '';
        if (noRange)
            strUrl = '/historics/group/' + $('#SGroup option:selected').val() + '/' + $('#IDateStartGroup').val() + '/' + $('#IDateEndGroup').val() + '/0/0';
        else
            strUrl = '/historics/group/' + $('#SGroup option:selected').val() + '/' + $('#IDateStartGroup').val() + '/' + $('#IDateEndGroup').val() + '/' + iniRec + '/' + ROWS_BY_PAGE;
        $.ajax({
            type: 'GET',
            url: strUrl,
            success: function(data) {
                $('#TableHistorics').fadeIn(500);
                if (noRange) {
                    $('#FormHistorics').data('numPages', Math.floor(data.howMany / ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                    $('#TableToExcel tr:gt(0)').remove();
                    $('#TableToExcelEvents tr:gt(0)').remove();
                }
                $('#TblHistoricos').data('filtering', 'group');
                $('#Page').text($('#Page').data('page') + InitialPage(data.howMany) + '/' + $('#FormHistorics').data('numPages'));

                $('#TableHistorics th:nth-child(6)').show();
                $('#TableHistorics th:nth-child(7)').show();

                var h = '';
                var i = 0;
                if (noRange)
                    dataToPrint = [];
                $('#TableHistorics tr:gt(0)').remove();

                var AlarmNoUrgent = '';
                var AlarmUrgent = '';
                var AlarmCritique = '';

                translateWord('NoUrgent', function(result) {
                    AlarmNoUrgent = result;
                    translateWord('Urgent', function(result) {
                        AlarmUrgent = result;
                        translateWord('Critique', function(result) {
                            AlarmCritique = result;

                            $.each(data.historics, function(index, value) {

                                var TipoAlarma = '';
                                switch (value.TipoAlarma) {
                                    case 0:
                                        TipoAlarma = AlarmNoUrgent;
                                        break;
                                    case 1:
                                        TipoAlarma = AlarmUrgent;
                                        break;
                                    case 2:
                                        TipoAlarma = AlarmCritique;
                                        break;
                                    default:
                                        TipoAlarma = '';
                                }

                                h = '<tr> <td>' + value.FechaHora + '</td>' +
                                    '<td>' + value.TipoHw + '</td>' +
                                    '<td>' + value.IdHw + '</td>' +
                                    '<td>' + value.Descripcion + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                                    '<td>' + (value.Reconocida == null ? '' : value.Reconocida) + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? TipoAlarma : '') + '</td>' +
                                    '<td>' + value.Usuario + '</td> </tr>';

                                if (noRange) {
                                    translateWord('Group', function(result) {
                                        translateWord('StartingDate', function(start) {
                                            translateWord('EndingDate', function(end) {
                                                AddRecordsForReport(value, start + ': ' + $('#IDateStartGroup').val().toString() + '. ' + end + ': ' + $('#IDateEndGroup').val().toString() + ' - ' + result + ': ' + $('#SGroup option:selected').val());
                                            });
                                        });
                                    });
                                    //AddRecordsForReport(value,'Group: ' + $('#SGroup option:selected').val());
                                    $('#TableToExcel tr:last').after(h);
                                }

                                if (++i <= ROWS_BY_PAGE)
                                    $('#TableHistorics tr:last').after(h);
                            });

                        });
                    });
                });

            }
        });
    });
}
/**
 * todayDateTime
 * @param {any} data
 */
function todayDateTime(data) {

    Trace("historic.js:todayDateTime. data ", data);

    var field = document.getElementById(data);
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    month++;
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    if (day.toString().length == 1)
        day = '0' + day;
    if (month.toString().length == 1)
        month = '0' + month;
    if (hours.toString().length == 1)
        hours = '0' + hours;
    if (minutes.toString().length == 1)
        minutes = '0' + minutes;

    field.value = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}
/**
 * startHistoricDate
 * @param {any} data
 */
function startHistoricDate(data) {

    Trace("historic.js:startHistoricDate. data ", data);

    var field = document.getElementById(data);
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    month++;
    var year = date.getFullYear();

    if (day.toString().length == 1)
        day = '0' + day;
    if (month.toString().length == 1)
        month = '0' + month;

    field.value = year + '-' + month + '-' + day + 'T00:00';
}
/**
 * startStatisticsData
 * @param {any} data
 */
function startStatisticsDate(data) {

    Trace("historic.js:startStatisticsDate. data", data);

    var field = document.getElementById(data);
    var date = new Date();

    var year = date.getFullYear();

    field.value = year + '-01-01T00:00';
}
/**
 * ShowFilterDate
 * */
function ShowFilterDate() {

    Trace("historic.js:ShowFilterDate");

    $('#FormHistorics').show();
    $('#AddFilterCode').hide();
    $('#AddFormHistorics').hide();
    $('#AddFilterComponent').hide();

    startHistoricDate('IDateStart');
    todayDateTime('IDateEnd');

    $('#DivHistorics').animate({ width: '223px' });
    $('#tdFilter').attr('style', 'vertical-align:top;display:table-cell');
    $('#AddFilterGroup').hide();
    $('#AddFilterDate').show();
    $('#BtnToPdf').hide();
    $('#BtnToExcel').hide();
    $('#BtnToExcelEvents').hide();
}
/**
 * FilteringByDate
 * @param {any} noRange
 */
function FilteringByDate(noRange) {

    Trace("historic.js:FilteringByDate. noRange ", noRange);

    $('#BtnToPdfEvents').hide();
    $('#BtnToPdf').show();
    $('#BtnToExcel').show();
    $('#BtnToExcelEvents').hide();
    $('#DivHistorics').animate({ width: '1600px' });
    if (noRange)
        $('#Page').data('page', 0);

    $('#TableHistorics').fadeOut(500, function() {
        $('#AddFormHistorics').show();

        var iniRec = $('#Page').data('page') * ROWS_BY_PAGE;

        var strUrl = '';
        if (noRange)
            strUrl = '/historics/date/' + $('#IDateStart').val() + '/' + $('#IDateEnd').val() + '/0/0';
        else
            strUrl = '/historics/date/' + $('#IDateStart').val() + '/' + $('#IDateEnd').val() + '/' + iniRec + '/' + ROWS_BY_PAGE;
        $.ajax({
            type: 'GET',
            url: strUrl,
            success: function(data) {
                $('#TableHistorics').fadeIn(500);
                if (noRange) {
                    $('#FormHistorics').data('numPages', Math.floor(data.howMany / ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                    $('#TableToExcel tr:gt(0)').remove();
                    $('#TableToExcelEvents tr:gt(0)').remove();
                }
                $('#TblHistoricos').data('filtering', 'date');
                $('#Page').text($('#Page').data('page') + 1 + '/' + $('#FormHistorics').data('numPages'));

                $('#TableHistorics th:nth-child(6)').show();
                $('#TableHistorics th:nth-child(7)').show();

                var h = '';
                var i = 0;
                if (noRange)
                    dataToPrint = [];
                $('#TableHistorics tr:gt(0)').remove();

                var AlarmNoUrgent = '';
                var AlarmUrgent = '';
                var AlarmCritique = '';

                translateWord('NoUrgent', function(result) {
                    AlarmNoUrgent = result;
                    translateWord('Urgent', function(result) {
                        AlarmUrgent = result;
                        translateWord('Critique', function(result) {
                            AlarmCritique = result;

                            $.each(data.historics, function(index, value) {
                                var TipoAlarma = '';
                                switch (value.TipoAlarma) {
                                    case 0:
                                        TipoAlarma = AlarmNoUrgent;
                                        break;
                                    case 1:
                                        TipoAlarma = AlarmUrgent;
                                        break;
                                    case 2:
                                        TipoAlarma = AlarmCritique;
                                        break;
                                    default:
                                        TipoAlarma = '';
                                }

                                h = '<tr> <td>' + value.FechaHora + '</td>' +
                                    '<td>' + value.TipoHw + '</td>' +
                                    '<td>' + value.IdHw + '</td>' +
                                    '<td>' + value.Descripcion + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                                    '<td>' + (value.Reconocida == null ? '' : value.Reconocida) + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? TipoAlarma : '') + '</td>' +
                                    '<td>' + value.Usuario + '</td> </tr>';

                                if (noRange) {
                                    translateWord('StartingDate', function(start) {
                                        translateWord('EndingDate', function(end) {
                                            AddRecordsForReport(value, start + ': ' + $('#IDateStart').val().toString() + '. ' + end + ': ' + $('#IDateEnd').val().toString());
                                        });
                                    });
                                    //AddRecordsForReport(value,'Date from: ' + $('#IDateStart').val().toString() + '. Date to: ' + $('#IDateEnd').val().toString());
                                    $('#TableToExcel tr:last').after(h);
                                }

                                if (++i <= ROWS_BY_PAGE)
                                    $('#TableHistorics tr:last').after(h);
                            });
                        });

                    });
                });


            }
        });
    });
}
/**
 * ShowFilterComponent
 * */
function ShowFilterComponent() {

    Trace("historic.js:ShowFilterComponent.");

    startHistoricDate('IDateStartComponent');
    todayDateTime('IDateEndComponent');
    $('#FormHistorics').show();
    $('#AddFormHistorics').hide();
    $('#DivHistorics').animate({ width: '223px' });
    $('#tdFilter').attr('style', 'vertical-align:top;display:table-cell');
    $('#AddFilterComponent').show();
    $('#AddFilterCode').hide();
    $('#AddFilterGroup').hide();
    $('#AddFilterDate').hide();
    $('#BtnToPdf').hide();
    $('#BtnToExcel').hide();
    $('#BtnToExcelEvents').hide();

    // Buscar los distintos componentes
    $.ajax({
        type: 'GET',
        url: '/historics/components',
        success: function(data) {
            $('#SComponent').empty();
            $.each(data.components, function(index, value) {
                $('#SComponent').append($('<option>', {
                    text: value.IdHw,
                    value: value.IdHw
                }
                )
                );
            });
        }
    });
}
/**
 * FilteringByComponent
 * @param {any} noRange
 */
function FilteringByComponent(noRange) {

    Trace("historic.js:FilteringByComponent. noRange ", noRange);

    $('#BtnToPdfEvents').hide();
    $('#BtnToPdf').show();
    $('#BtnToExcel').show();
    $('#BtnToExcelEvents').hide();
    $('#DivHistorics').animate({ width: '1600px' });
    if (noRange)
        $('#Page').data('page', 0);

    $('#TableHistorics').fadeOut(500, function() {
        $('#AddFormHistorics').show();

        var iniRec = $('#Page').data('page') * ROWS_BY_PAGE;

        var strUrl = '';
        if (noRange)
            strUrl = '/historics/component/' + $('#SComponent option:selected').val() + '/' + $('#IDateStartComponent').val() + '/' + $('#IDateEndComponent').val() + '/0/0';
        else
            strUrl = '/historics/component/' + $('#SComponent option:selected').val() + '/' + $('#IDateStartComponent').val() + '/' + $('#IDateEndComponent').val() + '/' + iniRec + '/' + ROWS_BY_PAGE;
        $.ajax({
            type: 'GET',
            url: strUrl,
            success: function(data) {
                $('#TableHistorics').fadeIn(500);
                if (noRange) {
                    $('#FormHistorics').data('numPages', Math.floor(data.howMany / ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                    $('#TableToExcel tr:gt(0)').remove();
                    $('#TableToExcelEvents tr:gt(0)').remove();
                }
                $('#TblHistoricos').data('filtering', 'component');
                $('#Page').text($('#Page').data('page') + 1 + '/' + $('#FormHistorics').data('numPages'));

                $('#TableHistorics th:nth-child(6)').show();
                $('#TableHistorics th:nth-child(7)').show();

                var h = '';
                var i = 1;
                if (noRange)
                    dataToPrint = [];
                $('#TableHistorics tr:gt(0)').remove();

                var AlarmNoUrgent = '';
                var AlarmUrgent = '';
                var AlarmCritique = '';

                translateWord('NoUrgent', function(result) {
                    AlarmNoUrgent = result;
                    translateWord('Urgent', function(result) {
                        AlarmUrgent = result;
                        translateWord('Critique', function(result) {
                            AlarmCritique = result;

                            $.each(data.historics, function(index, value) {
                                var TipoAlarma = '';
                                switch (value.TipoAlarma) {
                                    case 0:
                                        TipoAlarma = AlarmNoUrgent;
                                        break;
                                    case 1:
                                        TipoAlarma = AlarmUrgent;
                                        break;
                                    case 2:
                                        TipoAlarma = AlarmCritique;
                                        break;
                                    default:
                                        TipoAlarma = '';
                                }

                                h = '<tr> <td>' + value.FechaHora + '</td>' +
                                    '<td>' + value.TipoHw + '</td>' +
                                    '<td>' + value.IdHw + '</td>' +
                                    '<td>' + value.Descripcion + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                                    '<td>' + (value.Reconocida == null ? '' : value.Reconocida) + '</td>' +
                                    '<td>' + (value.Alarma == '1' ? TipoAlarma : '') + '</td>' +
                                    '<td>' + value.Usuario + '</td> </tr>';
                                if (noRange) {
                                    translateWord('Component', function(result) {
                                        translateWord('StartingDate', function(start) {
                                            translateWord('EndingDate', function(end) {
                                                AddRecordsForReport(value, start + ': ' + $('#IDateStartComponent').val().toString() + '. ' + end + ': ' + $('#IDateEndComponent').val().toString() + ' - ' + result + ': ' + $('#SComponent option:selected').val());
                                            });
                                        });
                                    });
                                    //AddRecordsForReport(value,'Component: ' + $('#SComponent option:selected').val());
                                    $('#TableToExcel tr:last').after(h);
                                }

                                if (++i <= ROWS_BY_PAGE)
                                    $('#TableHistorics tr:last').after(h);
                            });

                        });
                    });
                });
            }
        });
    });
}
/**
 * ShowFilterCode
 * */
function ShowFilterCode() {

    Trace("historic.js:ShowFilterCode.");

    startHistoricDate('IDateStartCode');
    todayDateTime('IDateEndCode');
    $('#FormHistorics').show();
    $('#AddFormHistorics').hide();
    $('#DivHistorics').animate({ width: '223px' });
    $('#tdFilter').attr('style', 'vertical-align:top;display:table-cell');
    $('#AddFilterCode').show();
    $('#AddFilterComponent').hide();
    $('#AddFilterGroup').hide();
    $('#AddFilterDate').hide();
    $('#BtnToPdf').hide();
    $('#BtnToExcel').hide();
    $('#BtnToExcelEvents').hide();

    // Buscar los distintos grupos
    $.ajax({
        type: 'GET',
        url: '/historics/codes',
        success: function(data) {
            $('#SCode').empty();
            $.each(data.codes, function(index, value) {
                $('#SCode').append($('<option>', {
                    text: value.Incidencia,
                    value: value.IdIncidencia
                }
                )
                );
            });
        }
    });
}
/**
 * FilteringByCode
 * @param {any} noRange
 */
function FilteringByCode(noRange) {

    Trace("historic.js:FilteringByCode. noRange ", noRange);

    $('#BtnToPdf').hide();
    $('#BtnToPdfEvents').show();
    $('#BtnToExcel').hide();
    $('#BtnToExcelEvents').show();
    //	$('#AddFilterCode').animate({width: '175px'});
    //	$('#SCode').attr('style','width:150px');

    $('#DivHistorics').animate({ width: '1600px' });
    if (noRange)
        $('#Page').data('page', 0);

    $('#TableHistorics').fadeOut(500, function() {
        $('#AddFormHistorics').show();

        var iniRec = $('#Page').data('page') * ROWS_BY_PAGE;

        var strUrl = '';
        if (noRange)
            strUrl = '/historics/code/' + $('#SCode option:selected').val() + '/' + $('#IDateStartCode').val() + '/' + $('#IDateEndCode').val() + '/0/0';
        else
            strUrl = '/historics/code/' + $('#SCode option:selected').val() + '/' + $('#IDateStartCode').val() + '/' + $('#IDateEndCode').val() + '/' + iniRec + '/' + ROWS_BY_PAGE;
        $.ajax({
            type: 'GET',
            url: strUrl,
            success: function(data) {
                $('#TableHistorics').fadeIn(500);
                if (noRange) {
                    $('#FormHistorics').data('numPages', Math.floor(data.howMany / ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                    $('#TableToExcel tr:gt(0)').remove();
                    $('#TableToExcelEvents tr:gt(0)').remove();
                }
                $('#TblHistoricos').data('filtering', 'code');
                $('#Page').text($('#Page').data('page') + 1 + '/' + $('#FormHistorics').data('numPages'));

                var h = '';
                var i = 1;
                if (noRange)
                    dataToPrint = [];
                $('#TableHistorics tr:gt(0)').remove();

                $('#TableHistorics th:nth-child(6)').hide();
                $('#TableHistorics th:nth-child(7)').hide();


                $.each(data.historics, function(index, value) {

                    h = '<tr> <td>' + value.FechaHora + '</td>' +
                        '<td>' + value.TipoHw + '</td>' +
                        '<td>' + value.IdHw + '</td>' +
                        '<td>' + value.Descripcion + '</td>' +
                        '<td>' + (value.Alarma == '1' ? 'Alarma' : 'Evento') + '</td>' +
                        //'<td>' + (value.Reconocida==null ? '' : value.Reconocida) + '</td>' +
                        //'<td>' + (value.Alarma=='1'?TipoAlarma:'') + '</td>' +
                        '<td>' + value.Usuario + '</td> </tr>';

                    if (noRange) {
                        translateWord('Event', function(result) {
                            translateWord('StartingDate', function(start) {
                                translateWord('EndingDate', function(end) {
                                    AddRecordsForReport(value, start + ': ' + $('#IDateStartCode').val().toString() + '. ' + end + ': ' + $('#IDateEndCode').val().toString() + ' - ' + result + ': ' + $('#SCode option:selected').text());
                                });
                            });
                        });
                        $('#TableToExcelEvents tr:last').after(h);
                    }

                    if (++i <= ROWS_BY_PAGE)
                        $('#TableHistorics tr:last').after(h);
                });
            }
        });
    });
}
/**
 * GenerateHistoricEventArray
 * @param {any} idHw
 * @param {any} idIncidencia
 * @param {any} params
 * @param {any} usuario
 */
function GenerateHistoricEventArray(idHw, idIncidencia, params, usuario) {

    Trace("historic.js:GenerateHistoricEventArray, idHw %s, idIncidencia %s, usuario %s, params ", idHw, idIncidencia, usuario, params);

    var listOfParams = '';
    for (var i = 0; i < params.length; i++) {
        listOfParams += params[i] + ((i == params.length - 1) ? '' : ' - ');
    }

    var strUrl = '/historics/';
    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: strUrl,
        data: JSON.stringify({
            IdIncidencia: idIncidencia,
            IdHw: idHw,
            Usuario: usuario != null ? usuario : param,
            Param: listOfParams
        }),
        success: function(data) {
        }
    });
}
/**
 * GenerateHistoricEvent
 * @param {any} idHw
 * @param {any} idIncidencia
 * @param {any} param
 * @param {any} usuario
 */
function GenerateHistoricEvent(idHw, idIncidencia, param, usuario) {

    Trace("historic.js:GenerateHistoricEvent: idHw %s, idIncidencia %s, usuario %s, params ", idHw, idIncidencia, usuario, param);

    var strUrl = '/historics/';
    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: strUrl,
        data: JSON.stringify({
            IdIncidencia: idIncidencia,
            IdHw: idHw,
            Usuario: usuario != null ? usuario : param,
            Param: param
        }),
        success: function(data) {
        }
    });
}

// FUNCIONES PANEL ESTADISTICAS
/**
 * ShowFilterDateStatistics
 * */
function ShowFilterDateStatiscs() {

    Trace("historic.js:ShowFilterDateStatistics.");

    $('#FormStatiscs').show();
    $('#AddFormStatistics').hide();

    //$('#DivStatistics').animate({width: '175px'});
    $('#tdFilter').attr('style', 'vertical-align:top;display:table-cell');
    $('#AddFilterDateEstadisticas').show();
    $('#AddFilterComponentEstadisticas').hide();
    $('#AddFilterCodeEstadisticas').hide();
}
/**
 * FilteringByDateStatistics
 * */
function FilteringByDateStatistics() {

    Trace("historic.js:FilteringByDateStatistics.");

    $('#DivStatistics').animate({ width: '725px' }, function() {
        $('#AddFormStatistics').attr('style', 'height:181px; width:520px')
            .fadeIn(500);
        var strUrl = '/historics/tasaEventosFallos/date/' + $('#IDateStartStatistics').val() + '/' + $('#IDateEndStatistics').val();
        $.ajax({
            type: 'GET',
            url: strUrl,
            success: function(data) {
                if (data.error == null) {
                    // 20170509. AGL. Controlar que data.rate y data.mtfb son numericos.
                    data.rate = !data.rate ? 0 : data.rate;
                    data.mtbf = !data.mtbf ? 0 : data.mtbf;
                    $('#tasa').val(Number(Math.round(data.rate + 'e2') + 'e-2').toString().replace('.', ','));	// Redondear a dos decimales
                    $('#mtbf').val(Number(Math.round(data.mtbf + 'e2') + 'e-2').toString().replace('.', ',')); 	// Redondear a dos decimales
                    //$('#mut').val(Number(Math.round(data.mut+'e2')+'e-2').toString().replace('.',','));		// Redondear a dos decimales
                }
            }
        });
    });
}
/**
 * ShowFilterComponentStatistics
 * */
function ShowFilterComponentStatiscs() {

    Trace("historic.js:ShowFilterComponentStatistics");

    startStatisticsDate('IDateStartStatisticsComponent');
    todayDateTime('IDateEndStatisticsComponent');
    $('#FormStatiscs').show();
    $('#AddFormStatistics').hide();

    $('#BtnStatsToPdf').hide();
    $('#BtnStatsToExcel').hide();

    $('#DivStatistics').animate({ width: '360px' });
    $('#tdFilter').attr('style', 'vertical-align:top;display:table-cell');
    $('#AddFilterDateEstadisticas').hide();
    $('#AddFilterComponentEstadisticas').animate({ width: '340px' });
    $('#AddFilterComponentEstadisticas').show();
    $('#AddFilterCodeEstadisticas').hide();

    // Buscar los distintos componentes
    $.ajax({
        type: 'GET',
        url: '/historics/components',
        success: function(data) {
            $('#SComponentStatistics').empty();
            $.each(data.components, function(index, value) {
                $('#SComponentStatistics').append($('<input>', {
                    type: 'checkbox',
                    text: value.IdHw,
                    value: value.IdHw
                }
                )
                )
                    .append(value.IdHw + '<br/>');
            });
        }
    });
}
/**
 * FilteringByComponentStatistics
 * */
function FilteringByComponentStatistics() {

    Trace("historic.js:FilteringByComponentStatistics");

    $('#DivStatistics').animate({ width: '725px' }, function() {
        $('#BtnStatsToPdf').show();
        $('#BtnStatsToExcel').show();
        $('#AddFormStatistics').attr('style', 'height:222px; width:340px')
            .fadeIn(500);
        var strComponents = '';
        $.each($('#SComponentStatistics input:checked'), function(index, value) {
            if (strComponents.length > 0)
                strComponents += ',';
            strComponents += '\'' + value.value + '\'';
        });

		/*translateWord('StartingDate',function(start){
			translateWord('EndingDate',function(end){
				subHeader = strComponents +'   ' + start + ': ' + $('#IDateStartStatisticsComponent').val().toString() + '. ' + end + ': ' + $('#IDateEndStatisticsComponent').val().toString();
			});
		});*/

        subHeader = '(' + $('#IDateStartStatisticsComponent').val().toString() + ' / ' + $('#IDateEndStatisticsComponent').val().toString() + ' ): ' + strComponents;

        var strUrl = '/historics/tasaEventosFallos/hw/' + strComponents + '/' + $('#IDateStartStatisticsComponent').val() + '/' + $('#IDateEndStatisticsComponent').val();
        $.ajax({
            type: 'GET',
            url: strUrl,
            success: function(data) {
                if (data.error == null) {
                    // 20170509. AGL. Controlar que data.rate y data.mtfb son numericos.
                    data.rate = !data.rate ? 0 : data.rate;
                    data.mtbf = !data.mtbf ? 0 : data.mtbf;
                    $('#tasa').val(Number(Math.round(data.rate + 'e2') + 'e-2').toString().replace('.', ','));	// Redondear a dos decimales
                    $('#mtbf').val(Number(Math.round(data.mtbf + 'e2') + 'e-2').toString().replace('.', ',')); 	// Redondear a dos decimales
                    //$('#mut').val(Number(Math.round(data.mut+'e2')+'e-2').toString().replace('.',','));		// Redondear a dos decimales
                }
            }
        });
    });
}
/**
 * ShowFilterCodeStatiscs
 * */
function ShowFilterCodeStatiscs() {

    Trace("historic.js:ShowFilterCodeStatiscs");

    startStatisticsDate('IDateStartStatisticsCode');
    todayDateTime('IDateEndStatisticsCode');
    $('#FormStatiscs').show();
    $('#AddFormStatistics').hide();

    $('#BtnStatsToPdf').hide();
    $('#BtnStatsToExcel').hide();

    $('#DivStatistics').animate({ width: '360px' });
    $('#tdFilter').attr('style', 'vertical-align:top;display:table-cell');
    $('#AddFilterDateEstadisticas').hide();
    $('#AddFilterComponentEstadisticas').hide();
    $('#AddFilterCodeEstadisticas').animate({ width: '340px' });
    $('#AddFilterCodeEstadisticas').show();

    // Buscar los distintos codigos
    $.ajax({
        type: 'GET',
        url: '/historics/codes',
        success: function(data) {
            $('#SCodeStatistics').empty();
            $.each(data.codes, function(index, value) {
                if (value.Error == 1) {
                    $('#SCodeStatistics').append($('<option>', {
                        text: value.Incidencia,
                        value: value.IdIncidencia
                    }
                    )
                    );
                }
            });
        }
    });
}
/**
 * FilteringByCodeStatistics
 * */
function FilteringByCodeStatistics() {

    Trace("historic.js:FilteringByCodeStatistics");

    $('#DivStatistics').animate({ width: '725px' }, function() {
        $('#AddFormStatistics').attr('style', 'height:138px; width:345px')
            .fadeIn(500);

		/*translateWord('StartingDate',function(start){
			translateWord('EndingDate',function(end){
				subHeader = start + ': ' + $('#IDateStartStatisticsCode').val().toString() + '. ' + end + ': ' + $('#IDateEndStatisticsCode').val().toString();
			});
	});*/

        subHeader = '( ' + $('#IDateStartStatisticsCode').val().toString() + ' / ' + $('#IDateEndStatisticsCode').val().toString() + ' ): ' + $('#SCodeStatistics option:selected').text();

        var strUrl = '/historics/tasaEventosFallos/event/' + $('#SCodeStatistics option:selected').val() + '/' + $('#IDateStartStatisticsCode').val() + '/' + $('#IDateEndStatisticsCode').val();
        $('#BtnStatsToPdf').show();
        $('#BtnStatsToExcel').show();
        $.ajax({
            type: 'GET',
            url: strUrl,
            success: function(data) {
                if (data.error == null) {
                    // 20170509. AGL. Controlar que data.rate y data.mtfb son numericos.
                    data.rate = !data.rate ? 0 : data.rate;
                    data.mtbf = !data.mtbf ? 0 : data.mtbf;
                    $('#tasa').val(Number(Math.round(data.rate + 'e2') + 'e-2').toString().replace('.', ','));	// Redondear a dos decimales
                    $('#mtbf').val(Number(Math.round(data.mtbf + 'e2') + 'e-2').toString().replace('.', ',')); 	// Redondear a dos decimales
                    //$('#mut').val(Number(Math.round(data.mut+'e2')+'e-2').toString().replace('.',','));		// Redondear a dos decimales
                }
            }
        });
    });
}

/** 20201103. From HISTORIC.JADE */
/**
 * selectEndingDate
 * @param {any} crtIni
 * @param {any} crtFin
 */
function selectEndingDate(crtIni, crtFin) {

    Trace("historic.js:selectEndingDate");

    var fechaH = $(crtIni)[0].valueAsDate;
    fechaH.setDate(fechaH.getDate());
    $(crtFin)[0].valueAsDate = fechaH;
    $(crtFin).attr('min', $(crtFin).val());
}
/**
 * ExportHistoricsToPdf
 * @param {any} rows
 * @param {any} filter
 */
function ExportHistoricsToPdf(rows, filter) {

    Trace("historic.js:ExportHistoricsToPdf");

    var header = [];

    alertify.success('Generando fichero PDF');

    translateWord('DateTime', function (dateTime) {
        translateWord('Code', function (code) {
            translateWord('Group', function (group) {
                translateWord('Component', function (component) {
                    translateWord('Description', function (description) {
                        translateWord('Type', function (type) {
                            translateWord('Acknowled', function (acknowled) {
                                translateWord('TypeAlarm', function (typealarm) {
                                    translateWord('User', function (user) {

                                        header[0] = "Fecha-\nHora";
                                        header[1] = group;
                                        header[2] = component;
                                        header[3] = description;
                                        header[4] = type;
                                        header[5] = acknowled;
                                        header[6] = typealarm;
                                        header[7] = user;

                                        var doc = new jsPDF('l');
                                        doc.setFontType("bold");
                                        doc.setFontSize(11);
                                        doc.text(7, 15, "HISTORICOS: " + filter);
                                        doc.autoTableSetDefaults({ headerStyles: { fillColor: [255, 50, 40] } });// Red
                                        doc.autoTable(header, rows, {
                                            startY: 20,
                                            margin: { horizontal: 7 },
                                            bodyStyles: { valign: 'top' },
                                            columnStyles: {
                                                0: { columnWidth: 30, overflow: 'linebreak' },
                                                1: { columnWidth: 30, overflow: 'linebreak' },
                                                2: { columnWidth: 30, overflow: 'linebreak' },
                                                3: { columnWidth: 90, overflow: 'linebreak' },
                                                4: { columnWidth: 20, overflow: 'linebreak' },
                                                5: { columnWidth: 25, overflow: 'linebreak' },
                                                6: { columnWidth: 25, overflow: 'linebreak' },
                                                7: { columnWidth: 30, overflow: 'linebreak' }
                                            }
                                        });
                                        doc.save('Historicos.pdf');
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}
/**
 * ExportHistoricsToPdfEvents
 * @param {any} rows
 * @param {any} filter
 */
function ExportHistoricsToPdfEvents(rows, filter) {
    var header = [];

    Trace("historics.js:ExportHistoricsToPdfEvents.")
    alertify.success('Generando fichero PDF');

    translateWord('DateTime', function (dateTime) {
        translateWord('Code', function (code) {
            translateWord('Group', function (group) {
                translateWord('Component', function (component) {
                    translateWord('Description', function (description) {
                        translateWord('Type', function (type) {
                            translateWord('User', function (user) {
                                header[0] = { text: dateTime, style: 'tableHeader' }
                                header[1] = { text: group, style: 'tableHeader' }
                                header[2] = { text: component, style: 'tableHeader' }
                                header[3] = { text: description, style: 'tableHeader' }
                                header[4] = { text: type, style: 'tableHeader' }
                                header[5] = { text: '', style: 'tableHeader' }
                                header[6] = { text: '', style: 'tableHeader' }
                                header[7] = { text: user, style: 'tableHeader' }
                                var start = 0;
                                var cuantos = 300;
                                var items = rows.slice(start, cuantos);
                                while (items.length > 0) {
                                    var data = [];
                                    data.push(header);
                                    $.each(items, function (index, value) {
                                        //Dos columnas menos que hay que quitar
                                        data.push(value);
                                    })

                                    translateWord('Historics', function (historic) {
                                        var docDefinition = {
                                            footer: function (currentPage, pageCount) { return { text: currentPage.toString() + ' / ' + pageCount, alignment: 'center', margin: [0, 5, 0, 0] } },
                                            background: function (currentPage) {
                                                if (currentPage > 1)
                                                    return { text: filter, style: 'subheader' };
                                            },
                                            // a string or { width: number, height: number }
                                            pageSize: 'A4',
                                            // by default we use portrait, you can change it to landscape if you wish
                                            pageOrientation: 'landscape',
                                            content: [
                                                { text: historic, style: 'header' },
                                                { text: filter, style: 'subheader' },
                                                {
                                                    style: 'tableExample',
                                                    table: {
                                                        headerRows: 1,
                                                        body: data
                                                    }
                                                },
                                            ],
                                            styles: {
                                                header: {
                                                    fontSize: 18,
                                                    bold: true,
                                                    margin: [0, 0, 0, 10],
                                                    color: 'red',
                                                    alignment: 'center'
                                                },
                                                subheader: {
                                                    fontSize: 16,
                                                    bold: true,
                                                    color: '#D2747D',
                                                    margin: [0, 10, 0, 5]
                                                },
                                                tableExample: {
                                                    margin: [0, 5, 0, 15]
                                                },
                                                tableHeader: {
                                                    bold: true,
                                                    fontSize: 12,
                                                    color: 'black'
                                                }
                                            },
                                            defaultStyle: {
                                                // alignment: 'justify'
                                                fontSize: 10
                                            }
                                        };

                                        pdfMake.createPdf(docDefinition).open();
                                    })
                                    //pdfMake.createPdf(docDefinition).download('U5K-G-' + start + '.pdf');	
                                    items = rows.slice(++start * cuantos, (start * cuantos) + cuantos);
                                }
                            })
                        })
                    })
                })
            })
        })
    })
}
/**
 * ExportStatisticsToPdf
 * */
function ExportStatisticsToPdf() {
    var header = [];
    var detail = [];

    Trace("historics.js:ExportStatisticsToPdf.");

    translateWord('TasaEventosFallos', function (tasafallos) {
        translateWord('MTBF', function (mtbf) {
            header[0] = { text: tasafallos, style: 'tableHeader' }
            header[1] = { text: mtbf, style: 'tableHeader' }

            var data = [];
            data.push(header);

            detail[0] = $('#tasa').val();
            detail[1] = $('#mtbf').val();

            data.push(detail);

            var docDefinition = {
                footer: { text: ' 1/1 ', alignment: 'center', margin: [0, 5, 0, 0] },
                background: function (currentPage) {
                    if (currentPage > 1)
                        return { text: "Estadísticas", style: 'subheader' };
                },
                // a string or { width: number, height: number }
                pageSize: 'A4',

                content: [
                    { text: "Estadísticas", style: 'header' },
                    { text: subHeader, style: 'subheader' },
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            body: data
                        }
                    },
                ],
                styles: {
                    header: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 10],
                        color: 'red',
                        alignment: 'center'
                    },
                    subheader: {
                        fontSize: 16,
                        bold: true,
                        color: '#D2747D',
                        margin: [0, 10, 0, 5]
                    },
                    tableExample: {
                        margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: 'black'
                    }
                },
                defaultStyle: {
                    // alignment: 'justify'
                }
            };

            pdfMake.createPdf(docDefinition).open();
        })
    })
}
/**
 * doCsv
 * @param {any} tableName
 */
function doCsv(tableName) {

    Trace("historics.js:doCsv. tableName ", tableName);

    var table = document.getElementById(tableName).innerHTML;
    var data = table.replace(/<thead>/g, '')
        .replace(/<\/thead>/g, '')
        .replace(/<tbody>/g, '')
        .replace(/<\/tbody>/g, '')
        .replace(/<tr>/g, '')
        .replace(/<\/tr>/g, '\r\n')
        .replace(/<th [a-z|A-Z|\s|\d|=|"]+>/g, '')
        .replace(/<\/th>/g, ';')
        .replace(/<td>/g, '')
        .replace(/<\/td>/g, ';')
        .replace(/\t/g, '')
        .replace(/\/n/g, '');

    var myLink = document.createElement('a');
    myLink.download = 'HistoricosRedan.csv';
    myLink.href = "data:application/csv," + escape(data);
    myLink.click();
}
/**
 * doCsvStatistics
 * */
function doCsvStatistics() {

    Trace("historics.js:doCsvStatistics.");

    var myLink = document.createElement('a');
    myLink.download = 'EstadisticasRedan.csv';
    myLink.href = "data:application/csv," + escape(subHeader + ";\r\n") + escape("Tasa Eventos/Fallos(%);Tiempo Medio(Días);\r\n" + $(tasa).val() + ";" + $(mtbf).val());
    myLink.click();
}
