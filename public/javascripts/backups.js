/// Backup.js
var MaxPages;
/**
 * GetParametersBackup
 * */
function GetParametersBackup() {
    var url = $('#BodyRedan').data('urlbackupservice');

    Trace("backup.js:GetParametersBackup. url ", url);

    LoadSelects();

    $('#FormConfigurationBackup').show();

    $.ajax({
        url: "//" + url + "/config",
        type: "GET",

        success: function(data) {
            $('#path').val(data.path);
            $('#profundidad option[value="' + data.profundidad + '"]').prop('selected', true);
            $('#horaBackup option[value="' + data.hora + '"]').prop('selected', true);
            $('#minutosBackup option[value="' + data.minuto + '"]').prop('selected', true);
        }
    });
}
/**
 * AcceptParametersBackup
 * */
function AcceptParametersBackup() {
    var url = $('#BodyRedan').data('urlbackupservice');

    Trace("backup.js:AcceptParametersBackup. url ", url);

    $.ajax({
        type: 'POST',
        url: "//" + url + "/config",
        data: JSON.stringify({
            "path": $('#path').val(),
            "profundidad": $('#profundidad option:selected').val(),
            "hora": $('#horaBackup option:selected').val(),
            "minuto": $('#minutosBackup option:selected').val()
        }),
        success: function(data) {
            alertify.success('Parámetros backup actualizados.');
        },
        error: function(data) {
            if (data.responseText == '')
                alertify.error('El Servidor de Backup no esta diponible.');
            else
                alertify.success(data.responseText);
        }
    });
}
/**
 * LoadSelects
 * */
function LoadSelects() {

    Trace("backup.js:LoadSelects");

    $('#horaBackup').empty();
    $('#minutosBackup').empty();
    $('#profundidad').empty();

    for (var i = 0; i < 24; i++) {
        $('#horaBackup').append($('<option>', {
            text: i,
            value: i
        }));
    }

    for (var j = 0; j < 60; j++) {
        $('#minutosBackup').append($('<option>', {
            text: j,
            value: j
        }));
    }

    for (var h = 1; h < 32; h++) {
        $('#profundidad').append($('<option>', {
            text: h,
            value: h
        }));
    }
}
/**
 * GetLogsBackup
 * */
function GetLogsBackup() {
    var url = $('#BodyRedan').data('urlbackupservice');

    Trace("backup.js:GetLogsBackup. url ", url);

    $('#TableLog').fadeOut(500, function() {
        $('#FormLogs').show();
        $.ajax({
            url: "//" + url + "/log",
            type: "GET",

            success: function(data) {
                var h = '';
                var i = 0;
                $('#TableLog tr:gt(0)').remove();
                MaxPages = Math.floor(data.log.length / ROWS_BY_PAGE) + ((data.log.length % ROWS_BY_PAGE) != 0 ? 1 : 0);
                $('#PageLog').text(PageLog + 1);

                $.each(data.log, function(index, value) {
                    if (index >= PageLog * ROWS_BY_PAGE) {
                        var r = value.split('-');

                        h = '<tr> <td>' + r[0] + '</td>' +
                            '<td>' + r[1] + '</td>' +
                            '<td>' + r[2] + '</td> </tr>';
                        if (++i <= ROWS_BY_PAGE) {
                            $('#TableLog tr:last').after(h);
                        }

                        $('#TableToExcel tr:last').after(h);
                    }
                    if (index > (PageLog + 1) * ROWS_BY_PAGE)
                        return false;
                });

                $('#TableLog').fadeIn(500);
                //$('#FormHistorics').data('numPages',Math.floor(data.howMany/ROWS_BY_PAGE) + ((data.howMany % ROWS_BY_PAGE) != 0 ? 1 : 0));
                //$('#TblHistoricos').data('filtering','none');
                //$('#Page').text($('#Page').data('page') + 1 + '/' + $('#FormHistorics').data('numPages'));
            }
        });
    });
}
/**
 * DeleteLogBackup
 * */
function DeleteLogBackup() {
    var url = $('#BodyRedan').data('urlbackupservice');

    Trace("backup.js:DeleteLogBackup. url ", url);

    translateWord('ConfirmDeleteLog', function(result) {
        alertify.confirm('Ulises G 5000 R', result,
            function() {
                $.ajax({
                    type: "POST",
                    url: "//" + url + "/log",
                    success: function(data) {
                        GetLogsBackup();
                    },
                    error: function(data) {
                        alertify.error(data.responseText);
                    }
                });
                //alertify.success('Ok'); 
            },
            function() { alertify.error('Cancelado'); }
        );
    });
}
/**
 * GetHandBackup
 * */
function GetHandBackup() {

    Trace("backup.js:GetHandBackup");

    $('#FormHandBackup').show();
}
/**
 * MakeBackup
 * */
function MakeBackup() {
    var url = $('#BodyRedan').data('urlbackupservice');

    Trace("backup.js:MakeBackup. url ", url);

    translateWord('ConfirmMakeBackup', function(result) {
        alertify.confirm('Ulises G 5000 R', result,
            function() {
                $.ajax({
                    type: "POST",
                    url: "//" + url + "/backup",
                    success: function(data) {
						console.log(data);
						if (data.resultado=="OK") {
							var today = new Date();
							var h = today.getHours();
							var m = today.getMinutes();
							var s = today.getSeconds();

							var y = today.getFullYear();
							var month = today.getMonth() + 1;
							var d = today.getDate();

							m = checkTime(m);
							s = checkTime(s);
							$('#AddFormHandBackup').animate({ width: '320px' });
							$('#BackupTimestamp').text("OK: " + d + "/" + month + "/" + y + "  " + h + ":" + m + ":" + s);
						}
						else {
							alertify.error(data.resultado);
							var today = new Date();
							var h = today.getHours();
							var m = today.getMinutes();
							var s = today.getSeconds();

							var y = today.getFullYear();
							var month = today.getMonth() + 1;
							var d = today.getDate();

							m = checkTime(m);
							s = checkTime(s);
							$('#AddFormHandBackup').animate({ width: '325px' });
							$('#BackupTimestamp').text("ERROR: " + d + "/" + month + "/" + y + "  " + h + ":" + m + ":" + s);
						}
                    },
                    error: function(data) {
                        alertify.error(data.responseText);
                        var today = new Date();
                        var h = today.getHours();
                        var m = today.getMinutes();
                        var s = today.getSeconds();

                        var y = today.getFullYear();
                        var month = today.getMonth() + 1;
                        var d = today.getDate();

                        m = checkTime(m);
                        s = checkTime(s);
                        $('#AddFormHandBackup').animate({ width: '325px' });
                        $('#BackupTimestamp').text("ERROR: " + d + "/" + month + "/" + y + "  " + h + ":" + m + ":" + s);
                    }
                });
                //alertify.success('Ok'); 
            },
            function() { alertify.error('Cancelado'); }
        );
    });

}