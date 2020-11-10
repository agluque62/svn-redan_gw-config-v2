var numTable = 0;
var howManyTables = 0;
var tables = [];
var blockZone = false;
var lastSelectedResource = 0;
var originalResourceType = 0;

function OnCbBssMethod(obj) {
    // Las tablas de calificación sólo estarán disponibles para los recursos
    // radio remotos con método Bss seleccionado RSSI y si son Rx o RxTx.
    /*if (($('#CbBssMethod option:selected').val()==1))
        $('#BSSMethodRow .SoloRssi').hide();
    else
        $('#BSSMethodRow .SoloRssi').show();
*/
}

/****************************************/
/*	FUNCTION: ShowUris 					*/
/*  PARAMS: data: datos de las urls		*/
/*										*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function ShowUris(data) {

    Trace("hardware.js:ShowUris. data ", data);

    loadUriSites(true);

    if (data != null && data.uris != null) {
        for (var i = 0; i < data.uris.length; i++) {
            if (data.uris[i].nivel_colateral == 1) {
                if (data.uris[i].tipo == 'TXA')
                    $('#UriTxA1').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
                if (data.uris[i].tipo == 'RXA')
                    $('#UriRxA1').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
            }
            if (data.uris[i].nivel_colateral == 2) {
                if (data.uris[i].tipo == 'TXB')
                    $('#UriTxB1').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
                if (data.uris[i].tipo == 'RXB')
                    $('#UriRxB1').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
            }
            if (data.uris[i].nivel_colateral == 3) {
                if (data.uris[i].tipo == 'TXA')
                    $('#UriTxA2').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
                if (data.uris[i].tipo == 'RXA')
                    $('#UriRxA2').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
            }
            if (data.uris[i].nivel_colateral == 4) {
                if (data.uris[i].tipo == 'TXB')
                    $('#UriTxB2').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
                if (data.uris[i].tipo == 'RXB')
                    $('#UriRxB2').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
            }
            if (data.uris[i].nivel_colateral == 5) {
                if (data.uris[i].tipo == 'TXA')
                    $('#UriTxA3').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
                if (data.uris[i].tipo == 'RXA')
                    $('#UriRxA3').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
            }
            if (data.uris[i].nivel_colateral == 6) {
                if (data.uris[i].tipo == 'TXB')
                    $('#UriTxB3').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
                if (data.uris[i].tipo == 'RXB')
                    $('#UriRxB3').val(data.uris[i].uri.substring(4, data.uris[i].uri.length));
            }
        }
    }
}
/**
 * loadUriSites
 * @param {any} isClean
 */
function loadUriSites(isClean) {

    Trace("hardware.js:loadUriSites. isClean ", isClean);

    if (isClean) {
        //Limpiar Campos
        $('#UriTxA1').val('');
        $('#UriRxA1').val('');
        $('#UriTxA2').val('');
        $('#UriRxA2').val('');
        $('#UriTxA3').val('');
        $('#UriRxA3').val('');
        $('#UriTxB1').val('');
        $('#UriRxB1').val('');
        $('#UriTxB2').val('');
        $('#UriRxB2').val('');
        $('#UriTxB3').val('');
        $('#UriRxB3').val('');
    }
    //Inicializar
    $('#LabelSite1').show();
    $('#RowSite1').show();
    $('#LabelSite2').hide();
    $('#RowSite2').hide();
    $('#LabelSite3').hide();
    $('#RowSite3').hide();
    $('#TxARow2').hide();
    $('#RxARow2').hide();
    $('#TxARow3').hide();
    $('#RxARow3').hide();
    $('#TxBRow2').hide();
    $('#RxBRow2').hide();
    $('#TxBRow3').hide();
    $('#RxBRow3').hide();

    //Local-Simple
    if ($('#LbTypeRadio option:selected').val() == '0') {
        $('#TxBRow1').hide();
        $('#RxBRow1').hide();
    }
    //Local-PR
    else if ($('#LbTypeRadio option:selected').val() == '1') {
        $('#TxBRow1').show();
        $('#RxBRow1').show();
    }
    else {
        $('#TxARow2').show();
        $('#RxARow2').show();
        $('#TxARow3').show();
        $('#RxARow3').show();
    }
    //Local FD-Simple
    if ($('#LbTypeRadio option:selected').val() == '2') {
        $('#LabelSite2').show();
        $('#RowSite2').show();
        $('#LabelSite3').show();
        $('#RowSite3').show();

        $('#TxBRow1').hide();
        $('#RxBRow1').hide();
        $('#TxBRow2').hide();
        $('#RxBRow2').hide();
        $('#TxBRow3').hide();
        $('#RxBRow3').hide();
    }
    //Local FD-Simple
    if ($('#LbTypeRadio option:selected').val() == '3') {
        $('#LabelSite2').show();
        $('#RowSite2').show();
        $('#LabelSite3').show();
        $('#RowSite3').show();

        $('#TxBRow1').show();
        $('#RxBRow1').show();
        $('#TxBRow2').show();
        $('#RxBRow2').show();
        $('#TxBRow3').show();
        $('#RxBRow3').show();
    }
}
/**
 * GetHardware
 * */
var GetHardware = function () {

    Trace("hardware.js:GetHardware");

    //$('#Component').text('Hardware');	// Titulo
    //$("#NewHardware").show();
    //$('#BtnShowSlaves').hide();
    //$('#DivComponents').attr('class','disabledDiv');
    $('#FormHardware').show();
    $('#FormParameters').hide();
    $.ajax({
        type: 'GET',
        url: '/hardware',
        success: function(data) {
            //ShowBigSlaves(data);
            ShowLittleSlaves(data);
        }
    });
    $.ajax({
        type: 'GET',
        url: '/resources/lists',
        success: function(data) {
            LoadUri(data);
        }
    });
};
/**
 * LoadUri
 * @param {any} data
 */
function LoadUri(data) {

    Trace("hardware.js:LoadUri. data ", data);

    var options = '';
    //var optionsAssigned = '<option value="0">Select URI</option>';

    $("#ListUris").empty();
    $("#ListUris").prop("selectedIndex", -1);

    if (data != 'NO_DATA') {
        for (var i = 0; i < data.uris.length; i++) {
            options += '<option value="' + data.uris[i].ip + '">' + data.uris[i].ip.substring(4) + '</option>';
            //optionsAssigned += '<option value="' + data.uris[i].idURILISTAS + '">' + data.uris[i].ip.substring(4) + '</option>';
        }
        $('#ListUris').html(options);
        $('#ListUris option:eq(1)');
    } else if (DEBUG) alertify.error("Lista URIS vacia...");
}
/**
 * LoadAssignedUriList
 * @param {any} data
 */
function LoadAssignedUriList(data) {

    Trace("hardware.js:LoadAssignedUriList. data ", data);

    var optionsAssigned = '<option value="0">Selecciona URI</option>';

    for (var i = 0; data != 'NO_DATA' && i < data.uris.length; i++) {
        optionsAssigned += '<option value="' + data.uris[i].idURILISTAS + '">' + data.uris[i].ip.substring(4) + '</option>';
    }
    $('#AssignedUriList').html(optionsAssigned);
    $('#AssignedUriList option:eq(1)');
}
/**
 * NextSlave
 * */
function NextSlave() {

    Trace("hardware.js:NextSlave");

    $('#SlavesZone table:nth-child(' + numTable + ')').hide();
    $('#SlavesZone').animate({ left: '600px' });

    numTable = ++numTable % (howManyTables + 1);
    numTable = (numTable == 0 ? 1 : numTable);

    $('#SlavesZone').animate({ left: '0' });
    $('#SlavesZone table:nth-child(' + numTable + ')').show();
}
/**
 * PrevSlave
 * */
function PrevSlave() {

    Trace("hardware.js:PrevSlave");

    $('#SlavesZone').animate({ left: '600px' });
    $('#SlavesZone table:nth-child(' + numTable + ')').hide();

    numTable = --numTable % (howManyTables + 1);
    numTable = (numTable == 0 ? howManyTables : numTable);

    $('#SlavesZone table:nth-child(' + numTable + ')').show();
    $('#SlavesZone').animate({ left: '0' });
}
/**
 * GetSlave
 * @param {any} idSlave
 */
function GetSlave(idSlave) {

    Trace("hardware.js:GetSlave. idSlave", idSlave);

    $.ajax({
        type: 'GET',
        url: '/sites',
        success: function(data) {
            $("#CBEmplazamientoOfSlave").empty();
            var options = '<option value="" disabled selected>Select site name</option>';
            $.each(data.data, function(index, value) {
                options += '<option value="' + value.idEMPLAZAMIENTO + '">' + value.name + '</option>';
            });
            $('#CBEmplazamientoOfSlave').html(options);
        }
    });

    $.ajax({
        type: 'GET',
        url: '/hardware/' + idSlave,
        success: function(data) {
            //ShowBigSlaves(data);
            //ShowLittleSlaves(data)
            BlockResourceZone(false, 0);
            $('#SlaveTable td:nth-child(3)').attr('style', 'display:table-column');
            //$('#DateSlave').show();

            if (!$('#BigSlavesZone').is(':visible')) {
                $('#DivHardware').animate({ width: '635px' });
                $('#BigSlavesZone').show();
                $('#BigSlavesZone').animate({ width: '275px' });
            }
            else {
                $('#SlavesZone').animate({ bottom: '600px' });
                //$('#SlavesZone table').hide();
            }

            $('#FormParameters').hide();
            $('#SlavesZone table').show();
            ShowDataSlave(data);
            $('#SlavesZone').animate({ bottom: '0' });
        }
    });
}
/**
 * NewSlave
 * */
function NewSlave() {

    Trace("hardware.js:NewSlave.");

    if (!$('#BigSlavesZone').is(':visible')) {
        $('#DivHardware').animate({ width: '635px' });
        $('#BigSlavesZone').show();
        $('#BigSlavesZone').animate({ width: '275px' });
    }
    else {
        $('#SlavesZone').animate({ bottom: '600px' });
        //$('#SlavesZone table').hide();
    }

    $.ajax({
        type: 'GET',
        url: '/sites',
        success: function(data) {
            $("#CBEmplazamientoOfSlave").empty();
            var options = '<option value="" disabled selected>Select site name</option>';
            $.each(data.data, function(index, value) {
                options += '<option value="' + value.idEMPLAZAMIENTO + '">' + value.name + '</option>';
            });
            $('#CBEmplazamientoOfSlave').html(options);
        }
    });

    $('#SlavesZone table').show();
    ShowNewSlave();
    $('#SlavesZone').animate({ bottom: '0' });
}
/**
 * ShowNewSlave
 * */
function ShowNewSlave() {

    Trace("hardware.js:ShowNewSlave");

    translateWord('Hardware', function(result) {
        $('#HardwareH3').text(result);
    });

    for (var i = 2; i <= 5; i++) {
        $('#Res' + (i - 1)).attr('onmouseenter', 'ShowResource("-1")')
            .attr('onmouseleave', '');

        $('#Res' + (i - 1) + ' a').text('void')
            .attr('style', 'color:gray');
    }

    $('#IdSlave').val('');
    translateWord('Add', function(result) {
        $('#BtnUpdateSlave')
            .attr('onclick', 'AddSlave()')
            .text(result);
    });
    $('#BtnCopySlave').hide();
    $('#BtnRemoveSlave').hide();
}
/**
 * AddSlave
 * @param {any} gatewayName
 * @param {any} slot
 * @param {any} f
 */
function AddSlave(gatewayName, slot, f) {

    Trace("hardware.js:AddSlave. gwName %s, slot %s", gatewayName, slot);

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: '/hardware/hw',
        data: JSON.stringify({
            name: gatewayName + '_' + slot,
            tp: '0' //$('#IA4').prop('checked') ? '0' : '1'
        }),
        success: function(data) {
            if (data.error === null) {
                //$('#FormParameters').hide();

                //GenerateHistoricEvent(ID_HW,ADD_IA4_SLAVE,data.data.name,$('#loggedUser').text());
                //alert('Slave ' + data.data.name + ' added.')
                //$('#BigSlavesZone').hide();
                //$('#DivHardware').animate({width: '345px'});
                //GetHardware();

                //ShowDataSlave(data.data.name);
                if (f != null)
                    f(data.data.idSLAVES);
            }
            else if (data.error == "ER_DUP_ENTRY") {

                alertify.error('El esclavo \"' + data.data.name + '\" ya existe.');
            }
        },
        error: function(data) {
            alertify.error('El esclavo \"' + data.data.name + '\" no existe.');
        }
    });
}
/**
 * UpdateSlave
 * */
function UpdateSlave() {

    Trace("hardware.js:UpdateSlave");

    if ($('#CBEmplazamientoOfSlave option:selected').val() != '-1' &&
        // Si el grupo no existe se da de alta
        $('#CBGroupOfSlave option:selected').val() == '-1') {
        if ($('#TBGroup').val() != '') {
            $.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                url: '/sites/groups',
                data: JSON.stringify({
                    EMPLAZAMIENTO_idEMPLAZAMIENTO: $('#CBEmplazamientoOfSlave option:selected').val(),
                    name: $('#TBGroup').val()
                }),
                success: function(dataGroup) {
                    if (dataGroup.error === null) {
                        $.ajax({
                            type: 'PUT',
                            dataType: 'json',
                            contentType: 'application/json',
                            url: '/hardware/hw',
                            data: JSON.stringify({
                                idSLAVES: $('#SlaveId').val(),
                                GRUPO_idGRUPO: dataGroup.data,
                                name: $('#IdSlave').val(),
                                tp: $('#IA4').prop('checked') ? '0' : '1'
                            }),
                            success: function(data) {
                                if (data.error === null) {
                                    alertify.success('Esclavo \"' + data.data.name + '\n actualizado.');
                                    GetHardware();
                                }
                            },
                            error: function(data) {
                                alertify.error('El esclavo \"' + data.data.name + '\n no existe.');
                            }
                        });
                    }
                }
            });
        }
    }
    else {
        $.ajax({
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json',
            url: '/hardware/hw',
            data: JSON.stringify({
                idSLAVES: $('#SlaveId').val(),
                GRUPO_idGRUPO: $('#CBGroupOfSlave option:selected').val(),
                name: $('#IdSlave').val(),
                tp: $('#IA4').prop('checked') ? '0' : '1'
            }),
            success: function(data) {
                if (data.error == null) {
                    alertify.success('El esclavo \"' + data.data.name + '\" ha sido actualizado.');
                    GetHardware();
                }
            },
            error: function(data) {
                alertify.error('El esclavo \"' + data.data.name + '\" no existe.');
            }
        });
    }
}
/**
 * DeleteSlave
 * */
function DeleteSlave() {

    Trace("hardware.js:DeleteSlave.");

    alertify.confirm('Ulises G 5000 R', "¿Eliminar la tarjeta esclava \"" + $('#SlaveId').val() + "\"?",
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/hardware/' + $('#SlaveId').val(),
                success: function(data) {
                    if (data.error == null) {
                        if (data.data == 0) {
                            alertify.alert('Ulises G 5000 R', "Una tarjeta esclava que pertenece a un gateway activo no se puede eliminar.");
                            alertify.error("Una tarjeta esclava que pertenece a un gateway activo no se puede eliminar.");
                        } else {
                            //GenerateHistoricEvent(ID_HW,REMOVE_IA4_SLAVE,$('#IdSlave').val(),$('#loggedUser').text());
                            alertify.success('La tarjeta esclava \"' + $('#IdSlave').val() + '\" ha sido eliminada.');
                            GetHardware();
                            $('#BigSlavesZone').hide();
                            $('#DivHardware').animate({ width: '345px' });
                        }
                    }
                },
                error: function(data) {
                    alertify.error('La tarjeta esclava \"' + $('#IdSlave').val() + '\" no existe.');
                }
            });

        },
        function() { alertify.error('Cancelado'); }
    );

}
/**
 * AssigSlaveToGateway
 * @param {any} idSlave
 * @param {any} idCgw
 * @param {any} myRank
 */
function AssigSlaveToGateway(idSlave, idCgw, myRank) {
    var url = '/gateways/' + idCgw + '/hardware/' + idSlave;

    Trace("hardware.js:AssigSlaveToGateway. url %s, rank ", url, rank);

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: url,
        data: JSON.stringify({
            CGW_idCGW: idCgw,
            SLAVES_idSLAVES: idSlave,
            rank: myRank
        }),
        success: function(data) {
            if (data.error == null) {
                // alert('Assigned slave to gateway.')
                // GetAllSlaves();
            }
            // else if (data.error == "ER_DUP_ENTRY") {
            // 	alert('Slave ' + data.data.SLAVES_idSLAVES + ' exists.');
            // }
        }
        // error: function(data){
        // 	alert('Slave ' + data.data.SLAVES_idSLAVES + ' does not exist.')
        // }
    });
}
/**
 * ReleaseSlaveFromGateway
 * @param {any} idCgw
 * @param {any} idSlave
 * @param {any} rank
 */
function ReleaseSlaveFromGateway(idCgw, idSlave, rank) {
    var url = '/gateways/' + idCgw + '/hardware/' + idSlave;

    Trace("hardware.js:ReleaseSlaveFromGateway. url %s, rank ", url, rank);

    $.ajax({
        type: 'DELETE',
        dataType: 'json',
        contentType: 'application/json',
        url: url,
        data: JSON.stringify({
            CGW_idCGW: idCgw,
            SLAVES_idSLAVES: idSlave,
            rank: rank
        }),
        success: function(data) {
            if (data.error == null) {
                alertify.success('Tarjeta esclava desasignada del gateway');
                GetAllSlaves();
            }
            else if (data.error) {
                alertify.error('Error liberando tarjeta esclava: ' + data.data.SLAVES_idSLAVES);
            }
        },
        error: function(data) {
            alertify.error('La tarjeta esclava \"' + data.data.SLAVES_idSLAVES + '\"" no existe.');
        }
    });
}


/****************************************/
/*	FUNCTION: changeSlaveFromGateway 	*/
/*  PARAMS: idResource					*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function changeSlaveFromGateway(rank, idSlave, idCgw) {
    var url = '/gateways/' + idCgw + '/hardware/' + idSlave;

    Trace("hardware.js:changeSlaveFromGateway. url %s, rank ", url, rank);

    $.ajax({
        type: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        url: url,
        data: JSON.stringify({
            CGW_idCGW: idCgw,
            SLAVES_idSLAVES: idSlave,
            rank: rank
        }),
        success: function(data) {
            if (data.error) {
                alertify.error('Error desasignando tarjeta esclava \"' + data.data.SLAVES_idSLAVES + '\"');
            }
            else {
                resModified = true;
            }
        },
        error: function(data) {
            alertify.error('La tarjeta esclava \"' + data.data.SLAVES_idSLAVES + '\" no existe.');
        }
    });
}
/**
 * CopySlave
 * @param {any} commit
 */
function CopySlave(commit) {

    Trace("hardware.js:CopySlave. commit ", commit);

    if (!commit) {
        $('#BtnUpdateSlave').hide();
        $('#BtnRemoveSlave').hide();

        $('#BtnCopySlave').animate({ left: '110px' });

        $('#BtnCancelCopySlave').show();
        $('#BtnCancelCopySlave').animate({ top: '15px' });
        $('#BtnCancelCopySlave').animate({ left: '60px' });
        // $('#BtnCancelCopySlave').animate({top:'40px'});

        $('#TbCopySlave').show();
        $('#TbCopySlave').animate({ right: '100px' });

        $('#BtnCopySlave').attr('onclick', 'CopySlave(true)');
        translateWord('Commit', function(result) {
            $('#BtnCopySlave').text(result);
        });
    }
    else {
        if ($('#TbCopySlave').val().length > 0) {
            $.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                url: '/hardware/' + $('#SlavesZone').data('idSlave') + '/copy',
                // New slave
                data: JSON.stringify({
                    "name": $('#TbCopySlave').val(),
                    "tp": $('#IA4').prop('checked') ? '0' : '1'
                }
                ),
                success: function(data) {
                    if (data.error == null) {
                        $('#FormParameters').hide();
                        //alert('Slave ' + data.data.name + ' copied.')
                        alertify.success('Tarjeta esclava \"' + data.data.name + '\" copiada.');
                        $('#BigSlavesZone').hide();
                        $('#DivHardware').animate({ width: '345px' });
                        GetHardware();
                        ShowDataSlave(data.data.name);
                    }
                },
                error: function(data) {
                    alertify.error('La tarjeta esclava \"' + data.data.name + '\" no existe.');
                }
            });
        } else {
            alertify.error('Nombre de tarjeta esclava no válido.');
        }

        CancelCopySlave();
    }
}
/**
 * CancelCopySlave
 * */
function CancelCopySlave() {

    Trace("hardware.js:CancelCopySlave");

    translateWord('Copy', function(result) {
        $('#BtnCopySlave').text(result);
    });

    $('#BtnCopySlave').animate({ left: '0' });

    $('#TbCopySlave').animate({ right: '0' });
    $('#TbCopySlave').hide();

    $('#BtnCancelCopySlave').animate({ right: '0' });
    $('#BtnCancelCopySlave').animate({ top: '0' });
    $('#BtnCancelCopySlave').hide();

    $('#BtnCopySlave').attr('onclick', 'CopySlave(false)');
    $('#BtnUpdateSlave').show();
    $('#BtnRemoveSlave').show();
}
/**
 * ShowDataSlave
 * @param {any} data
 */
function ShowDataSlave(data) {

    Trace("hardware.js:ShowDataSlave. data ", data);

    var table = '';
    var row = '';
    var lastItem = '';
    howManyTables = 0;

    BlockResourceZone(false, 0);

    translateWord('Hardware', function(result) {
        $('#HardwareH3').text(result + ': ' + data.hardware[0].name);
    });

    // idSlave o clave del registro SLAVES. Se utiliza en CopySlave
    $('#SlavesZone').data('idSlave', data.hardware[0].idSLAVES);

    $('#IdSlave').val(data.hardware[0].name);
    $('#CBEmplazamientoOfSlave option[value="' + (data.hardware[0].siteId) + '"]').prop('selected', true);

    $("#CBGroupOfSlave").empty();
    $('#TBGroup').val('');

    if (data.hardware[0].siteId != null) {
        OnChangeSite($('#CBEmplazamientoOfSlave option:selected')[0], function() {
            $('#CBGroupOfSlave option[value="' + (data.hardware[0].GRUPO_idGRUPO) + '"]').prop('selected', true);
            $('#TBGroup').val($('#CBGroupOfSlave option:selected').text());
        });
    }

    for (var i = 2; i <= 5; i++) {
        $('#Res' + (i - 1)).attr('onmouseenter', 'ShowResource("-1")')
            .attr('onmouseleave', '');

        $('#Res' + (i - 1) + ' a').text('void')
            .attr('style', 'color:gray')
            .attr('onclick', 'ShowNewResource("' + (i - 1) + '")');
    }

    $.each(data.hardware, function(rowIndex, r) {
        var fila = 2 + r.P_rank;
        var col = fila == 2 ? 2 : 1;
        if (r.resource != null) {
            $('#Res' + (fila - 1)).attr('onmouseenter', 'ShowResource("' + r.idRECURSO + '")')
                .data('resourceId', r.idRECURSO);

            $('#Res' + (fila - 1) + ' a').text(r.resource)
                .append(r.tipo == 1 ? $("<img src='/images/iconRadio.gif' style='float: right'/>")
                    : $("<img src='/images/iconPhone.gif' style='float: right'/>"))
                .attr('style', 'color:var(--main-color)')
                .attr('onclick', 'BlockResourceZone(true, "' + fila + '")');
        }

        $('#IA4').prop('checked', r.tp == '0');
        $('#IQ1').prop('checked', r.tp != '0');
        $('#SlaveId').val(r.idSLAVES);
    });

    translateWord('Update', function(result) {
        $('#BtnUpdateSlave')
            .attr('onclick', 'UpdateSlave()')
            .text(result);
    });
    $('#BtnCopySlave').show();
    $('#BtnRemoveSlave').show();
}
/**
 * [BlockResourceZone description]
 * @param {[type]} block [description]
 * @param {[type]} fila  [description]
 */
function BlockResourceZone(block, fila) {

    Trace("hardware.js:BlockResourceZone. fila %s, block ", fila, block);

    if (block && blockZone && fila - 1 != lastSelectedResource) {
        // Si hay un recurso seleccionado y pulsan sobre otro distinto se ignora
        //$('table.resource').attr('style','display:block');
        //$('#SlaveTable td:nth-child(2)').attr('style','display:table-column');
        return;
    }

    blockZone = block;

    $('table.resource tr:nth-child(8)').attr('style', 'display:table-row');

    if (block) {
        //$('#DivHardware').animate({width: '1162px'})
        //$('#BigSlavesZone').animate({width: '1020px'});
        $('#TblTools').attr('style', 'display:none');
        $('#ToolsRow').show();

        if (lastSelectedResource > 0)
            $('#Res' + lastSelectedResource).removeClass('occuped');

        $('#Res' + (fila - 1)).addClass('occuped');

        //$('#ButtonCommit').attr('onclick','UpdateResource("' + fila + '")');	

        lastSelectedResource = fila - 1;
        // Obtener datos del recurso idRecurso
        $.ajax({
            type: 'GET',
            url: '/resources/' + $('#Res' + (fila - 1)).data('resourceId'),
            success: function(data) {
                ShowDataOfResource(data);
                //$('#Res' + (fila-1) + ' a').attr('onclick','UpdateResource("' + fila + '")');			

                $('#TbNameResource').prop('disabled', false);
                //$('#TbRtpSize').prop('disabled',false)
                // $('#SCodec').prop('disabled',false)
                //$('#SResourceType').prop('disabled',false)
                $('#SRestriccion').prop('disabled', false);
                //$('#TbEnableRegister').prop('disabled',false)
                $('#TbKey').prop('disabled', false);
                $('#IdDestination').prop('disabled', false);
                $('#CbLlamadaAutomatica').prop('disabled', false);
            }
        });
        $('#BtnRemoveResource').show();
        $('#BtnResourceParameters').show();
        $('#BtnListasBN').show();

        ResourceParameters();
    } else {
        //$('#DivHardware').animate({width: '625px'})
        //$('#BigSlavesZone').animate({width: '475px'});
        $('table.resource').attr('style', 'display:block');
        $('#SlaveTable td:nth-child(2)').attr('style', 'display:table-column');
        $('#Res' + lastSelectedResource).removeClass('occuped');
        $('#TblTools').attr('style', 'display:table-row');
    }
}
/**
 * ShowNewResource
 * @param {any} fila
 */
function ShowNewResource(fila) {

    Trace("hardware.js:ShowNewResource. fila ", fila);

    // Si hay un recurso seleccionado y pulsan sobre otro distinto se ignora
    /** 20170511. AGL PERFILES. TODO. Que perfiles estan permitidos??? */
    if (Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false) {
        return;
    }
    if ((blockZone && fila != lastSelectedResource)) {
        return;
    }
	/* if (($('#BodyRedan').data('perfil') & 1) == 1 || (blockZone && fila!=lastSelectedResource))
		return;
		*******************************************/

    blockZone = true;
    ResetResourcePanel();
    $('#ToolsRow').show();

    $('table.resource').attr('style', 'display:block');
    $('#SlaveTable td:nth-child(2)').attr('style', 'display:table-cell; border:none; padding-top: 10px;');
    //$('#BigSlavesZone').animate({width: '505px'});
	/*
	$('#BtnRemoveResource').hide();
	$('#BtnResourceParameters').hide();
	$('#BtnListasBN').hide();
	*/
    $('#TblTools').attr('style', 'display:none');

    if (lastSelectedResource > 0)
        $('#Res' + lastSelectedResource).removeClass('occuped');

    lastSelectedResource = fila;
	/*
	$('#DivHardware').animate({width: '635px'})
	$('#BigSlavesZone').animate({width: '275px'});
	*/
    //$('#SlaveTable td:nth-child(3)').show();

    $('#Res' + (fila)).addClass('occuped');
    $('#Res' + (fila) + ' a').text('Add resource');
    //.attr('onclick','AddResource("' + (fila) + '")');

    $('#ButtonCommit').attr('onclick', 'AddResource("' + (fila) + '")');

    $('#TbNameResource').prop('disabled', false);
    //$('#TbRtpSize').prop('disabled',false)
    //$('#SCodec').prop('disabled',false)
    $('#SResourceType').prop('disabled', false);
    $('#SRestriccion').prop('disabled', false);
    //$('#TbEnableRegister').prop('disabled',false)
    $('#TbKey').prop('disabled', false);
    $('#IdDestination').prop('disabled', false);
    $('#CbLlamadaAutomatica').prop('disabled', false);

    // Ocultar botón para añadir frecuencia
    //$('table.resource tr:nth-child(8)').attr('style','display:table-column');

	/*
	$('#SlaveTable td:nth-child(3)').attr('style','display:table-cell');
	$('#BtnRemoveResource').hide();
	$('#BtnResourceParameters').hide();
	$('#BtnListasBN').hide();*/
}
/**
 * ShowLittleSlaves
 * @param {any} data
 */
function ShowLittleSlaves(data) {

    Trace("hardware.js:ShowLittleSlaves. data ", data);

    var freeSlaves = [];

    $("#listSlaves").empty();
    $.each(data.hardware, function(index, value) {
        if ($.inArray(value.idSLAVES, freeSlaves) < 0) {
            var item = $('<li><a onclick="GetSlave(\'' + value.idSLAVES + '\')">' + value.name + '</li>');
            item.appendTo($("#listSlaves"));
            freeSlaves.push(value.idSLAVES);
        }
    });
}
/**
 * ShowResource
 * @param {any} visible
 */
function ShowResource(visible) {

    Trace("hardware.js:ShowResource. visible ", visible);

    if (visible > 0) {
        // Obtener datos del recurso idRecurso
        $.ajax({
            type: 'GET',
            url: '/resources/' + visible,
            success: function(data) {
                ShowDataOfResource(data);
                $('#SlaveTable td:nth-child(2)').attr('style', 'display:table-cell; border:none; padding-top: 10px;');
            }
        });
    }
    else if (visible < 0) {
        $('#Resource').attr('style', 'display:table-column');
    }
    /*	if (!blockZone){
            if (visible > 0){
                $('table.resource').attr('style','display:block');
                //$('#BigSlavesZone').animate({width: '505px'});
    
                $('#BtnRemoveResource').hide();
                $('#BtnResourceParameters').hide();
                $('#BtnListasBN').hide();
                $('#ToolsRow').hide();
    
                // Obtener datos del recurso idRecurso
                $.ajax({type: 'GET', 
                    url: '/resources/'+visible, 
                    success: function(data){
                        ShowDataOfResource(data)
                        $('#SlaveTable td:nth-child(2)').attr('style','display:table-cell; border:none; padding-top: 10px;');
                    }
                });
            }
            else if (visible<0){
                $('#Resource').attr('style','display:table-column');
            }else{
                $('table.resource').attr('style','display:block');
                //$('#BigSlavesZone').animate({width: '500px'});
                $('#SlaveTable td:nth-child(2)').attr('style','display:table-column');
            }
        }
    */
}
/**
 * ShowDataOfResource
 * @param {any} data
 * @param {any} f
 */
function ShowDataOfResource(data, f) {

    Trace("hardware.js:ShowDataOfResource. data ", data);

    if (data != null && data.recursos.length > 0) {
        // Guardar el POS_idPOS del recurso: se utiliza en RemoveResource()
        $('table.resource').data('idPos', data.recursos[0].POS_idPOS);
        // Guardar el idRecurso: se utiliza en ResourceParameters()
        $('table.resource').data('idRecurso', data.recursos[0].idRECURSO);


        $('#TbNameResource')//.prop('disabled','disabled')
            .val(data.recursos[0].name);

        //$('#LblUriSip').text(data.recursos[0].name+'@'+$('#ipv').val());


        $('#UriSipRow').attr('style', 'display:table-row');

        if (data.recursos[0].tipo == 2) {
            // Habilitar registro
            //$('.resource tr:nth-child(4)').hide();

            // Frecuencia
            $('#DestinationRow').attr('style', 'display:table-column');

            $('#BlackWhiteRow').attr('style', 'display:table-column');
            $('.resource tr:nth-child(7)').show();
        }
        else {
            // Tipo Radio
            //$('.resource tr:nth-child(4)').show();	
            //$('.resource tr:nth-child(7)').show();

            $('#DestinationRow').attr('style', 'display:table-row');
            $('#BlackWhiteRow').attr('style', 'display:table-row');
            //$('.resource tr:nth-child(7)').hide();
        }

        $('#SCodec').prop('disabled', 'disabled');
        if (data.recursos[0].codec < 0 || data.recursos[0].codec > 2)
            $('#SCodec option[value="-1"]').prop('selected', true);
        else
            $('#SCodec option[value="' + data.recursos[0].codec + '"]').prop('selected', true);

        originalResourceType = data.recursos[0].tipo;
        $('#SResourceType option[value="' + data.recursos[0].tipo + '"]').prop('selected', true);
        //$('#SResourceType').prop('disabled','disabled')

        //$('#SRestriccion').prop('disabled','disabled');

        var rsc = $('table.resource').data('idRecurso');
        $('#SRestriccion option[value="' + data.recursos[0].restriccion + '"]').prop('selected', true);
        if (data.recursos[0].restriccion == "1") {
            $('#SRestriccion option:eq(1)').prop('selected', true);
            GetListsFromResource(rsc);
        }
        else if (data.recursos[0].restriccion == "2") {
            $('#SRestriccion option:eq(2)').prop('selected', true);
            GetListsFromResource(rsc);
        }
        else
            $('#SRestriccion option:eq(0)').prop('selected', true);
        $('#TbEnableRegister')//.prop('disabled','disabled')
            .prop('checked', data.recursos[0].enableRegistro != null && data.recursos[0].enableRegistro != '0');


        if (data.recursos[0].enableRegistro != null && data.recursos[0].enableRegistro != '0') {
            $('.resource tr:nth-child(4)').show();
            $('#TbKey').val(data.recursos[0].szClave);
        }
        else
            $('.resource tr:nth-child(5)').hide();

        //$('#SFrecuencia').prop('disabled','disabled');
        //$('#SFrecuencia option:eq(0)').prop('selected', true);
        //$('#SFrecuencia option[value="' + data.recursos[0].idDESTINOS +'"]').prop('selected', true);
        $('#IdDestination').val(data.recursos[0].frecuencia)
            .data('data-idFrecuencia', data.recursos[0].idDESTINOS);

        $('#CbLlamadaAutomatica')//.prop('disabled','disabled')
            .prop('checked', data.recursos[0].LlamadaAutomatica != null && data.recursos[0].LlamadaAutomatica != '0');

        var cuantos = $('#WhiteBlackList tr').length;
        for (var i = 0; i < cuantos - 1; i++)
            $('#WhiteBlackList tr:nth-child(1)').remove();

        var indice = 0;

        /** 20170511. AGL. Perfiles */
        var clase = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='New NotAllowedTd'" : "";
        var clase_a = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='ButtonNucleo NotAllowedBtn'" : "class='ButtonNucleo'";
        var clase_ = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='NotAllowedBtn'" : "";
		/*var clase = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='New NotAllowedTd'" : "";
		var clase_a = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='ButtonNucleo NotAllowedBtn'" : "class='ButtonNucleo'";
		var clase_ = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='NotAllowedBtn'" : "";
		*****************************************/
        if (f != null)
            f();

        /** 20170517 AGL. El tipo de restriccion almacenada esta en '.restriccion' */
        if (data.recursos[0].restriccion == 0) {
            $('#SRestriccion option:eq(0)').prop('selected', true);
        } else if (data.recursos[0].restriccion == 1) {
            $('#SRestriccion option:eq(1)').prop('selected', true);
            OnChangeRestriccion($('#SRestriccion')[0]);
        } else if (data.recursos[0].restriccion == 2) {
            $('#SRestriccion option:eq(2)').prop('selected', true);
            OnChangeRestriccion($('#SRestriccion')[0]);
        }
        // if (data.recursos[1].ip == null) {
        // 	$('#SRestriccion option:eq(0)').prop('selected', true);
        // }
        // else if(data.recursos[1].blanca == 0) {
        // 	$('#SRestriccion option:eq(1)').prop('selected', true);
        // 	/** 20170517 AGL Esta llamada se hace con un parámetros incorrecto. */
        // 	OnChangeRestriccion($('#SRestriccion')[0]);
        // 	/*OnChangeRestriccion(1);*/
        // }
        // else {
        // 	$('#SRestriccion option:eq(2)').prop('selected', true);
        // 	/** 20170517 AGL Esta se hace con un parámetros incorrecto. */
        // 	OnChangeRestriccion($('#SRestriccion')[0]);
        // 	/*OnChangeRestriccion(2);*/
        // }
    }
}
/**
 * UpdateUriFromList
 * @param {any} index
 */
function UpdateUriFromList(index) {

    Trace("hardware.js:UpdateUriFromList. index ", index);

    var uri = $('#WhiteBlackList tr:nth-child(' + (index + 1) + ')').data('idurilistas');
    var rsc = $('table.resource').data('idRecurso');
    //	var black=$('#WhiteBlackList tr:nth-child(' + (index + 1) + ') td:nth-child(2) input').prop('checked');
    //	var white=$('#WhiteBlackList tr:nth-child(' + (index + 1) + ') td:nth-child(3) input').prop('checked');

    RemoveUriFromList(index, function() { AddGatewayToList($('#DivGateways').data('idCgw')); });

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: '/resources/' + rsc + '/lists',
        data: JSON.stringify({
            idURILISTAS: uri,
            black: black,
            white: white
        }),
        success: function(data) {
            if (data.error == null) {
                alertify.success('La URI ha sido modificada.');
                //ShowResource(rsc)
                GetResource(rsc);
            }
        }
    });
}
/**
 * RemoveUriFromList
 * @param {any} index
 * @param {any} f
 */
function RemoveUriFromList(index, f) {

    Trace("hardware.js:RemoveUriFromList. index", index);

    alertify.confirm('Ulises G 5000 R', "¿Eliminar la URI \"" + $('#WhiteBlackList tr:nth-child(' + (index) + ')').children().html() + "\"?",
        function() {
            var uri = $('#WhiteBlackList tr:nth-child(' + (index) + ')').data('idurilistas');
            var rsc = $('table.resource').data('idRecurso');

            $.ajax({
                type: 'DELETE',
                dataType: 'json',
                contentType: 'application/json',
                url: '/resources/' + rsc + '/lists',
                data: JSON.stringify({
                    idURILISTAS: uri,
                    black: $('#SRestriccion option:selected').val() == 1,
                    white: $('#SRestriccion option:selected').val() == 2
                }),
                success: function(data) {
                    if (data.error == null) {
                        alertify.success('URI eliminada.');
                        //ShowResource(rsc)
                        GetListsFromResource(rsc);

                        if (f != null)
                            f();
                    }
                }
            });

            /** 20170517 AGL buscando 'undefined' */
            var val = $('#SRestriccion option:selected').val();
            if (val) {
                $.ajax({
                    type: 'GET',
                    url: '/resources/assignedlists/' + rsc + '/' + $('#SRestriccion option:selected').val(),
                    success: function(data1) {
                        LoadAssignedUriList(data1);
                    }
                });
            }
            else {
                if (DEBUG) alertify.error("RemoveUriFromList: #SRestriccion option:selected undefined.");
            }
        },
        function() { alertify.error('Cancelado'); }
    );

}
/**
 * GetListsFromResource
 * Obtiene las listas blancas y negras del recurso
 * @param {int} rsc id del recurso
 */
function GetListsFromResource(rsc) {

    Trace("hardware.js:GetListFromResource. rsc", rsc);

    $.ajax({
        type: 'GET',
        url: '/resources/' + rsc + '/lists',
        success: function(data) {
            ShowListsFromResource(data);
        }
    });
}
/**
 * ShowListsFromResource
 * @param {any} data
 */
function ShowListsFromResource(data) {

    Trace("hardware.js:ShowListFromResource. data ", data);

    /** 20170511. AGL. Perfiles */
    var clase = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='New NotAllowedTd'" : "";
    var clase_a = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='ButtonNucleo NotAllowedBtn'" : "class='ButtonNucleo'";
    var clase_ = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='NotAllowedBtn'" : "";
	/*var clase = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='New NotAllowedTd'" : "";
	var clase_a = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='ButtonNucleo NotAllowedBtn'" : "class='ButtonNucleo'";
	var clase_ = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='NotAllowedBtn'" : "";
	******************************************/

    // Borrar la tabla
    var cuantos = $('#WhiteBlackList tr').length;
    for (var i = 0; i < cuantos - 1; i++)
        $('#WhiteBlackList tr:nth-child(1)').remove();

    if (data == 'NO_DATA')
        return;


    /** 20170519 AGL. Establezco bien los limites */
    var tipo = $('#SRestriccion option:selected').val();	// 0: None, 1: L.Negra, 2: L.Blanca
    var count_tipo = 0;
    var indice = 0;
    $.each(data.uris, function(index, value) {
        var encontrado = false;
        if (value.ip != null && tipo != 0) {
            /** 20170517 AGL El TraslateWord, difiere la ejecucion de la insercion de filas y 
             * provoca que se rellenen por ducplicado al llamada a la fucioncion 2 veces...
             */
            var remove = "Eliminar";
            if ((value.negra == 0 && tipo == 2) || (value.negra == 1 && tipo == 1)) {
                indice++;
                $('#WhiteBlackList tr:nth-last-child(1)').before('<tr data-idurilistas=' + value.idURILISTAS + ' style="height:32px">' +
                    '<td align="center">' + value.ip.substring(4) + '</td>' +
                    '<td align="center" ' + clase + '><a ' + clase_a + 'style="height: 10px;padding-top: 2px;padding-bottom: 2px;"' + ' onclick="RemoveUriFromList(' + indice + ',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})" >' + remove + '</a></td>' +
                    '</tr>');
                count_tipo++;
            }
        }
    });

    if (count_tipo >= 8) {
        $('#AddUriRow').hide();
    }
    else {
        $('#AddUriRow').show();
    }

    // /* */
    // var actualiza='';
    // var indice = 0;
    // if (data == 'NO_DATA')
    // 	return;
    // if (data.uris.length >= 8){
    // 	$('#AddUriRow').hide();
    // }
    // else{
    // 	$('#AddUriRow').show();
    // }
    // translateWord('Update',function(result){SHow
    // 	actualiza=result;	
    // });

    // if (DEBUG) console.log("ShowListFromResources #2: "+ $('#WhiteBlackList tr').length);
    // $.each(data.uris,function(index,value){
    // 	var encontrado = false;
    // 	if (value.ip != null){

    // 	if (DEBUG) console.log("ShowListFromResources #3: "+ $('#WhiteBlackList tr').length);

    // 	/** 20170517 AGL El TraslateWord, difiere la ejecucion de la insercion de filas y 
    // 	 * provoca que se rellenen por ducplicado al llamada a la fucioncion 2 veces...
    // 	 */
    // 	// translateWord('Remove',function(result){
    // 	//	var remove=result;
    // 		var remove = "Eliminar";

    // 		if ($('#SRestriccion option:selected').val() != 0 &&
    // 			(($('#SRestriccion option:selected').val() == 1 && value.negra==1) ||
    // 			($('#SRestriccion option:selected').val() == 2 && value.negra==0))){
    // 				if (DEBUG) console.log("ShowListFromResources #4: "+ $('#WhiteBlackList tr').length);
    // 				indice++;								
    // 				$('#WhiteBlackList tr:nth-last-child(1)').before('<tr data-idurilistas=' + value.idURILISTAS + ' style="height:32px">' +
    // 											'<td align="center">' + value.ip.substring(4) + '</td>' + 
    // 											'<td align="center" ' + clase +'><a ' + clase_a + 'style="height: 10px;padding-top: 2px;padding-bottom: 2px;"' + ' onclick="RemoveUriFromList(' + indice + ',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})" >' + remove + '</a></td>' +
    // 											'</tr>');
    // 				}
    // 			// });
    // 	}
    // });

}
/**
 * AddUriToList
 * @param {any} element
 * @param {any} f
 */
function AddUriToList(element, f) {

    Trace("hardware.js:AddUriToList");

    var index = element.parentElement.parentElement.rowIndex;
    var uri = $('#AssignedUriList option:selected').val();
    var rsc = $('table.resource').data('idRecurso');
    var black = $('#SRestriccion option:selected').val() == 1;
    var white = $('#SRestriccion option:selected').val() == 2;

    if (uri != 0) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            url: '/resources/' + rsc + '/lists',
            data: JSON.stringify({
                idURILISTAS: uri,
                black: black,
                white: white
            }),
            success: function(data) {
                if (data.error == null) {
                    alertify.success('URI añadida.');
                    GetListsFromResource(rsc);
                    $('#AssignedUriList option:eq(0)').prop('selected', true);

                    if (f != null)
                        f();
                }
            }
        });

        /** 20170517 AGL buscando 'undefined' */
        var val = $('#SRestriccion option:selected').val();
        if (val) {
            $.ajax({
                type: 'GET',
                url: '/resources/assignedlists/' + rsc + '/' + $('#SRestriccion option:selected').val(),
                success: function(data1) {
                    LoadAssignedUriList(data1);
                }
            });
        }
        else {
            if (DEBUG) alertify.error("AddUriToList. #SRestriccion option:selected undefined");
        }
    }
}
/**
 * RemoveUri
 * */
function RemoveUri() {

    Trace("hardware.js:RemoveUri");

    alertify.confirm('Ulises G 5000 R', "¿Eliminar la URI \"" + $('#ListUris option:selected').val() + "\"?",
        function() {
            var uri = $('#ListUris option:selected').val();
            var rsc = $('table.resource').data('idRecurso');

            $.ajax({
                type: 'DELETE',
                dataType: 'json',
                contentType: 'application/json',
                url: '/resources/lists',
                data: JSON.stringify({
                    ip: uri
                }),
                success: function(data) {
                    if (data.error == null) {
                        alertify.success('URI eliminada.');
                        $.ajax({
                            type: 'GET',
                            url: '/resources/lists',
                            success: function(data) {
                                LoadUri(data);
                            }
                        });
                    }
                }
            });

            /** 20170517 AGL buscando 'undefined' */
            var val = $('#SRestriccion option:selected').val();
            if (val) {
                $.ajax({
                    type: 'GET',
                    url: '/resources/assignedlists/' + rsc + '/' + $('#SRestriccion option:selected').val(),
                    success: function(data1) {
                        LoadAssignedUriList(data1);
                    }
                });
            }
            else {
                if (DEBUG) alertify.error("RemoveUri. #SRestriccion option:selected undefined");
            }
        },
        function() { alertify.error('Cancelado'); }
    );

}
/**
 * AddUri
 * @param {any} element
 */
function AddUri(element) {

    Trace("hardware.js:AddUri. element ", element);

    var index = element.parentElement.parentElement.rowIndex;

    translateWord('Add', function(result) {
        $('#BtnAddUri').attr('onclick', 'CommitUri(' + index + ')');
        //$('#BtnAddUri').animate({top: '30px'});
        $('#BtnAddUri').text(result);
    });

    translateWord('Cancel', function(result) {
        //$('#BtnRemoveUri').animate({top: '30px'});
        $('#BtnRemoveUri').text(result);
        $('#BtnRemoveUri').attr('onclick', 'CancelAddUri()');
    });

    $('#NewUri').val('');
    $('#NewUri').show();
}
/**
 * CommitUri
 * @param {any} index
 */
function CommitUri(index) {
    var uri = ($('#NewUri').val() != '' ? 'sip:' + $('#NewUri').val() : $('#NewUri').val());
    var rsc = $('table.resource').data('idRecurso');

    Trace("hardware.js:CommitUri. index %s, rsc %s, uri ", index, rsc, uri);

    $('#NewUri').hide();
    translateWord('AddURI', function(result) {
        $('#BtnAddUri').animate({ left: '0' })
            .animate({ top: '0' })
            .text(result)
            .attr('onclick', 'AddUri(this)');
    });

    //$('#BtnRemoveUri').show();

    if (uri != '') {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            url: '/resources/lists',
            data: JSON.stringify({
                ip: uri
            }),
            success: function(data) {
                if (data.error == null) {
                    alertify.success('URI añadida.');
                    $.ajax({
                        type: 'GET',
                        url: '/resources/lists',
                        success: function(data) {
                            LoadUri(data);
                        }
                    });
                }
            }
        });

        /** 20170517 AGL buscando 'undefined' */
        var val = $('#SRestriccion option:selected').val();
        if (val) {
            $.ajax({
                type: 'GET',
                url: '/resources/assignedlists/' + rsc + '/' + $('#SRestriccion option:selected').val(),
                success: function(data1) {
                    LoadAssignedUriList(data1);
                }
            });
        }
        else {
            if (DEBUG) alertify.error("CommitUri. #SRestriccion option:selected. undefined.");
        }
    }

    CancelAddUri();
}
/**
 * CancelAddUri
 * */
function CancelAddUri() {

    Trace("hardware.js:CancelAddUri.");

    translateWord('AddURI', function(result) {
        $('#BtnAddUri').attr('onclick', 'AddUri(this)');
        $('#BtnAddUri').animate({ top: '0' });
        $('#BtnAddUri').text(result);
    });

    translateWord('RemoveURI', function(result) {
        $('#BtnRemoveUri').animate({ top: '0' });
        $('#BtnRemoveUri').text(result);
        $('#BtnRemoveUri').attr('onclick', 'RemoveUri()');
    });

    $('#NewUri').hide();
}
/**
 * ResetResourcePanel
 * */
function ResetResourcePanel() {

    Trace("hardware.js:ResetResourcePanel");

    $('#DestinationRow').attr('style', 'display:table-row');
    $('#BlackWhiteRow').attr('style', 'display:table-row');

    $('#TbNameResource').val('');
    $('#TbAdGain').val('');
    $('#TbDaGain').val('');
    $('#CbAdAgc').prop('checked', false);
    $('#CbDaAgc').prop('checked', false);
    $('#LblAD').show();
    $('#LblAD').show();
    $('#TbAdGain').show();
    $('#TbDaGain').show();

    $('#SCodec option:eq(1)').prop('selected', true);
    $('#SResourceType option:eq(0)').prop('selected', true);
    $('#SRestriccion option:eq(0)').prop('selected', true);
    //$('#SFrecuencia option:eq(0)').prop('selected', true);
    $('#IdDestination').val('');
    $('#TbEnableRegister').prop('checked', false);
    $('#TbKey').val('');

    //$('#DestinationRow').attr('style','display:table-row');
    //$('#BlackWhiteRow').attr('style','display:table-row');
    $('#CbLlamadaAutomatica').prop('checked', false);
    //Defecto por tfno
    $('#TbRemoteUri').val('');
    $('#TbUmbral').val('-15');
    $('#TbInactividad').val('0');

}
/**
 * AddResource
 * @param {any} slaveId
 * @param {any} col
 * @param {any} fila
 * @param {any} f
 */
function AddResource(slaveId, col, fila, f) {

    Trace("hardware.js:AddResource. slaveId %s, col %s, fil %s", slaveId, col, fil);

    var idSlave = slaveId;	//$('#SlaveId').val();

    // Permitir dar de alta recursos solo si tiene un identificador
    // y tiene asignada una frecuencia si es de tipo radio.

    if ($('#TbNameResource').val().length > 0) {
        $.ajax({
            type: 'GET',
            //url: '/gateways/' + $('#Component').text() + '/services/' + serviceId,
            url: '/hardware/checkresname/' + $('#TbNameResource').val() + '/' + $('#DivGateways').data('idCgw'),
            success: function(data) {
                if (data == "NAME_DUP") {
                    alertify.error('El nombre del recurso ' + $('#TbNameResource').val() +
                        ' ya se encuentra dada de alta en la pasarela. Utilize otro nombre.');
                }
                else {
                    if ((($('#SResourceType option:selected').val() != 1) || $('#IdDestination').val() != '')) {
                        // Comprobar si la slave existe
                        if (idSlave == '') {
                            ////////////////////////
                            // La slave no existe //
                            ////////////////////////
                            AddSlave($('#IdSite').data('gatewayName'), col, function(data) {
                                idSlave = data;
                                $.ajax({
                                    type: 'POST',
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    url: '/hardware/' + idSlave + '/resources/resource',
                                    data: JSON.stringify({
                                        POS_idPOS: fila,	// Ahora se pone la posición dentro de la slave, en la bd va el id del registro POS generado
                                        name: $('#TbNameResource').val(),
                                        tamRTP: 0,	//$('#TbRtpSize').val(),
                                        codec: $('#SCodec option:selected').val(),
                                        tipo: $('#SResourceType option:selected').val(),
                                        restriccion: $('#SRestriccion option:selected').val(),
                                        enableRegistro: $('#TbEnableRegister').prop('checked'),
                                        szClave: $('#TbKey').val(),
                                        LlamadaAutomatica: $('#CbLlamadaAutomatica').prop('checked')
                                    }),
                                    success: function(data) {
                                        if (data.error === null) {
                                            if ($('#SResourceType option:selected').val() == 1) {
                                                // Radio
                                                PostResourceToDestination(data.data.idRECURSO, $('#IdDestination').val(), function() {
                                                    GenerateHistoricEvent(ID_HW, ADD_HARDWARE_RESOURCE, data.data.name, $('#loggedUser').text());

                                                    AssigSlaveToGateway(idSlave, $('#IdSite').data('gatewayId'), col);

                                                    alertify.success('Recurso \"' + data.data.name + '\" añadido.');


                                                    // Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
                                                    if (f != null)
                                                        f();

                                                    //GetMySlaves();
                                                    $('.Res' + fila + col).data('idResource', data.data.idRECURSO);
                                                    GetResource(data.data.idRECURSO, function() {
                                                        $('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + fila + "',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})");
                                                        /** 20170518 AGL  */
                                                        $("#SResourceType").prop("disabled", true);

                                                        $('#FormParameters').show();
                                                        $('#BtnRemoveResource').show();

                                                        var t = ($('.Res' + fila + col).offset().top - 94) + 'px';
                                                        var l = ($('.Res' + fila + col).offset().left - 145) + 'px';
                                                        $('#BigSlavesZone').animate({ width: '85%' }, 500, function() {
                                                            $('#BigSlavesZone').addClass('divNucleo');
                                                        });
                                                    });
                                                });
                                            }
                                        }
                                        else if (data.error == "ER_DUP_ENTRY") {
                                            alertify.error('El recurso \"' + data.data.name + '\" ya existe.');
                                        }
                                    },
                                    error: function(data) {
                                        alertify.error('El recurso \"' + data.data.name + '\" no existe.');
                                    }
                                });
                            });
                        }
                        else {
                            // Si el recurso es de telefonía o, siendo de radio, tiene asignado frecuencia, se da de alta
                            $.ajax({
                                type: 'POST',
                                dataType: 'json',
                                contentType: 'application/json',
                                url: '/hardware/' + idSlave + '/resources/resource',
                                data: JSON.stringify({
                                    POS_idPOS: fila,	// Ahora se pone la posición dentro de la slave, en la bd va el id del registro POS generado
                                    name: $('#TbNameResource').val(),
                                    tamRTP: 0,	//$('#TbRtpSize').val(),
                                    codec: $('#SCodec option:selected').val(),
                                    tipo: $('#SResourceType option:selected').val(),
                                    restriccion: $('#SRestriccion option:selected').val(),
                                    enableRegistro: $('#TbEnableRegister').prop('checked'),
                                    szClave: $('#TbKey').val(),
                                    LlamadaAutomatica: $('#CbLlamadaAutomatica').prop('checked')
                                }),
                                success: function(data) {
                                    if (data.error === null) {
                                        if ($('#SResourceType option:selected').val() == 1) {
                                            // Radio
                                            PostResourceToDestination(data.data.idRECURSO, $('#IdDestination').val(), function() {
                                                GenerateHistoricEvent(ID_HW, ADD_HARDWARE_RESOURCE, data.data.name, $('#loggedUser').text());

                                                alertify.success('Recurso \"' + data.data.name + '\" añadido.');

                                                // Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
                                                if (f != null)
                                                    f();

                                                $('.Res' + fila + col).data('idResource', data.data.idRECURSO);
                                                GetResource(data.data.idRECURSO, function() {
                                                    $('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + fila + "',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})");
                                                    /** 20170518 AGL  */
                                                    $("#SResourceType").prop("disabled", true);

                                                    /** 20170519 AGL Para asegurar lista uris llenas  */
                                                    $.ajax({
                                                        type: 'GET', url: '/resources/lists', success:
                                                            function(data) {
                                                                LoadUri(data);
                                                            }
                                                    });
                                                    /**************************************** */


                                                    $('#FormParameters').show();
                                                    $('#BtnRemoveResource').show();

                                                    var t = ($('.Res' + fila + col).offset().top - 94) + 'px';
                                                    var l = ($('.Res' + fila + col).offset().left - 145) + 'px';
                                                    $('#BigSlavesZone').animate({ width: '85%' }, 500, function() {
                                                        $('#TbAdGain').val('-1.3');//Valores por defecto en nuevo
                                                        $('#TbDaGain').val('-0.2');
                                                        $('#BigSlavesZone').addClass('divNucleo');
														/*if($('#SResourceType option:selected').val() == 1) {
														 $('#CbGranularity option:eq(0)').attr("selected", "true");
														 $('#CbGranularity').attr("disabled", "disabled");
														 }*/

                                                        /** 20170516. AGL. Los recursos radio por defecto tienen el audio estricto  */
                                                        $('#CbGranularity option[value="0"]').prop('selected', true);

                                                    });
                                                });
                                            });
                                        }
                                        else {
                                            // Telefonia
                                            GenerateHistoricEvent(ID_HW, ADD_HARDWARE_RESOURCE, data.data.name, $('#loggedUser').text());
                                            alertify.success('Recurso \"' + data.data.name + '\" añadido.');

                                            // Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
                                            if (f != null)
                                                f();

                                            $('.Res' + fila + col).data('idResource', data.data.idRECURSO);
                                            GetResource(data.data.idRECURSO, function() {
                                                $('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + fila + "',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))}); AddPhoneParameters()");
                                                /** 20170518 AGL  */
                                                $("#SResourceType").prop("disabled", true);

                                                $('#FormParameters').show();
                                                $('#BtnRemoveResource').show();

                                                var t = ($('.Res' + fila + col).offset().top - 94) + 'px';
                                                var l = ($('.Res' + fila + col).offset().left - 145) + 'px';
                                                $('#BigSlavesZone').animate({ width: '85%' }, 500, function() {
                                                    $('#TbAdGain').val('-1.3');//Valores por defecto en nuevo
                                                    $('#TbDaGain').val('-0.2');
                                                    $('#BigSlavesZone').addClass('divNucleo');
                                                });
                                            });
                                        }
                                    }
                                    else if (data.error == "ER_DUP_ENTRY") {
                                        alertify.error('El recurso \"' + data.data.name + '\" ya existe.');
                                        if (f != null)
                                            f();
                                    }
                                },
                                error: function(data) {
                                    alertify.error('El recurso \"' + data.data.name + '\" no existe.');
                                    if (f != null)
                                        f();
                                }
                            });
                        }
                    }
                    else {
                        alertify.error('El recurso radio debe estar asignado a una frecuencia.');
                        if (f != null)
                            f();
                    }
                }
            },
            error: function(data) {
                alertify.error('Error al comprobar el nombre del recurso en el sistema.');
            }
        });
    }
    else {
        alertify.error('Nombre de recurso no válido.');
        if (f != null)
            f();
    }
}

/** 20170516 AGL. Validaciones  */
/**
 * localValidateAtsNumber
 * @param {any} num
 */
function localValidateAtsNumber(num) {

    Trace("hardware.js:localValidateAtsNumber. num ", num);

    if (num=="")
        return true;
    var regx_atsval = /^[2-3][0-9]{5}$/;
    var matchVal = num.match(regx_atsval);
    return matchVal ? true : false;
}
/**
 * UpdateResource
 * @param {any} slaveId
 * @param {any} col
 * @param {any} fila
 * @param {any} f
 */
function UpdateResource(slaveId, col, fila, f) {

    Trace("hardware.js:UpdateResource. slaveId %s, col %s, fil %s", slaveId, col, fila);

    loadingContent();
    if ($('#SResourceType option:selected').val() == 1) { //Recurso Radio
        if ($('#LbTypeRadio option:selected').val() == 0) { //Radio Local Simple
            if (($('#UriTxA')[0].value == null) || ($('#UriTxA')[0].value == '') &&
                ($('#UriRxA')[0].value == null) || ($('#UriRxA')[0].value == '')) {
                alertify.alert('Ulises G 5000 R', "Para un recurso radio simple se debe añadir un colateral y rellenar " +
                    "los campos URI Tx y URI Rx con un valor correcto.",
                    function() {
                        GotoResource(fila, col, true);
                    }
                );
            }
            else
                UpdateResourceReally(slaveId, col, fila, f);

        }//TODO
        else if ($('#LbTypeRadio option:selected').val() == 1) { //Radio Local P/R 4 campos de URI
            if ((($('#UriTxA')[0].value == null) || ($('#UriTxA')[0].value == '') &&
                ($('#UriRxA')[0].value == null) || ($('#UriRxA')[0].value == '')) ||
                (($('#UriTxB')[0].value == null) || ($('#UriTxB')[0].value == '') &&
                    ($('#UriRxB')[0].value == null) || ($('#UriRxB')[0].value == ''))) {
                alertify.alert('Ulises G 5000 R', "Para un recurso radio simple se debe añadir un colateral y rellenar " +
                    "los campos URI Tx y URI Rx con un valor correcto.",
                    function() {
                        GotoResource(fila, col, true);
                    }
                );
            }
            else
                UpdateResourceReally(slaveId, col, fila, f);
        }
        //else if( $('#LbTypeRadio option:selected').val() == 2 ) {

        //}
        //else if( $('#LbTypeRadio option:selected').val() == 3 ) {

        //}
        else
            UpdateResourceReally(slaveId, col, fila, f);
    }
    if ($('#SResourceType option:selected').val() == 2) { //Recurso Telefonía
        if ($('#TbRemoteUri')[0].value == null || $('#TbRemoteUri')[0].value == '') {
            alertify.alert('Ulises G 5000 R', "Para un recurso telefónico, el campo URI remota tiene " +
                "que tener un valor correcto.",
                function() {
                    GotoResource(fila, col, true);
                }
            );
        }
        /** 20170516. AGL. TEST NUMERO de TEST R2/N5 Rellenos... */
        else if ($('#LbTypeTel')[0].value == 3 || $('#LbTypeTel')[0].value == 4) {
            if (localValidateAtsNumber($('#TbLocalNumText').val()) == false) {
                alertify.error("ATS. Debe rellenar el Numero Origen de las Llamadas de Test...");
                // GotoResource(fila, col, true);
            }
            else if (localValidateAtsNumber($('#TbRemoteNumText').val()) == false) {
                alertify.error("ATS. Debe rellenar el Numero Destino de las Llamadas de Test...");
                // GotoResource(fila, col, true);
            }
            else {
                UpdateResourceReally(slaveId, col, fila, f);
            }
        }
		/*else if ($('#LbTypeTel')[0].value == 3) {//ATS
			if ($('#rangeAtsOrigin')[0].childNodes["0"].childNodes.length == 6) {
				translateWord('ErrorATSMaxOrig', function (result) {
					alertify.error(result);
				});
			}
		}*/
        else
            UpdateResourceReally(slaveId, col, fila, f);
    }
}
/**
 * UpdateResourceReally
 * @param {any} slaveId
 * @param {any} col
 * @param {any} fila
 * @param {any} f
 */
function UpdateResourceReally(slaveId, col, fila, f) {

    Trace("hardware.js:UpdateResourceReally. slaveId %s, col %s, fila %s", slaveId, col, fila);

    var idSlave = slaveId;

    /** 20170511 AGL. PERFILES */
    if (Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == true) {
        if ($('#TbNameResource').val().length > 0) {
            if ($('#SResourceType option:selected').val() == 1) {
                if ($('#IdDestination').val() == '') {
                    alertify.error('El recurso radio debe estar asignado a una frecuencia.');
                    return;
                }
                else if (($('#LbTypeRadio option:selected').val() == 4 || $('#LbTypeRadio option:selected').val() == 6) &&
                    $('#CbBssMethod option:selected').val() == 0 && $('#CbBssAudioTable option:selected').val() == -1) {
                    alertify.error('El recurso radio debe tener asignado una tabla de calificación de audio.');
                    return;
                }
                // Radio
                DeleteResourceFromDestination($('table.resource').data('idRecurso'), $('#IdDestination').val(), function() {
                    PostResourceToDestination($('table.resource').data('idRecurso'), $('#IdDestination').val());
                });
            }

            $.ajax({
                type: 'PUT',
                dataType: 'json',
                contentType: 'application/json',
                url: '/resources/resource',
                data: JSON.stringify({
                    rsc: {
                        idRECURSO: $('table.resource').data('idRecurso'),
                        name: $('#TbNameResource').val(),
                        tamRTP: 0, //$('#TbRtpSize').val(),
                        codec: $('#SCodec option:selected').val(),
                        tipo: $('#SResourceType option:selected').val(),
                        restriccion: $('#SRestriccion option:selected').val(),
                        enableRegistro: $('#TbEnableRegister').prop('checked'),
                        szClave: $('#TbKey').val(),
                        LlamadaAutomatica: $('#CbLlamadaAutomatica').prop('checked')
                    },
                    listablanca: [],
                    listanegra: []
                }),
                success: function(data) {
                    if (data.error === null) {
                        //if (originalResourceType != $('#SResourceType option:selected').val()){
                        if ($('#SResourceType option:selected').val() == 1)
                            AddRadioParameters();
                        else
                            AddPhoneParameters();
                        //}

                        // Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
                        if (f != null)
                            f();

                        GenerateHistoricEvent(ID_HW, MODIFY_HARDWARE_RESOURCE_PARAM, data.data.rsc.name, $('#loggedUser').text());
                        alertify.success('El recurso \"' + data.data.rsc.name + '\" ha sido actualizado.');
                        blockZone = false;
                        GetMySlaves();
                        // GetSlave(idSlave);
                    }
                },
                error: function(data) {
                    alertify.error('El recurso \"' + data.data.rsc.name + '\" no existe.');
                }
            });
        }
        else {
            alertify.error('Nombre de recurso no válido.');
        }
    }
    else {
        blockZone = false;
        //GetSlave(idSlave);
    }
}
/****************************************/
/*	FUNCTION: removeRadioResource 		*/
/*  PARAMS: idResource					*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function removeRadioResource(idResource) {

    Trace("hardware.js:removeRadioResource. idResource ", idResource);

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el recurso \"" + $('#TbNameResource').val() + "\"?",
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/resources/deleteRadioResource/' + idResource,
                success: function(data) {
                    if (data.error == null) {
                        alertify.success('El recurso se ha eliminado correctamente.');
                        GenerateHistoricEvent(ID_HW, REMOVE_HARDWARE_RESOURCE, $('#TbNameResource').val(), $('#loggedUser').text());
                        GetMySlaves();
                        if (data.activa == 1)
                            resModified = true;
                    }
                    else {
                        alertify.error('Error: ' + data.error);
                    }
                },
                error: function(data) {
                    alertify.error('Error eliminando el recurso.');
                }
            });
        },
        function() { alertify.error('Cancelado'); }
    );
}
/****************************************/
/*	FUNCTION: removePhoneResource 		*/
/*  PARAMS: idResource					*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function removePhoneResource(idResource) {

    Trace("hardware.js:removePhoneResource. idResource ", idResource);

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el recurso \"" + $('#TbNameResource').val() + "\"?",
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/resources/deletePhoneResource/' + idResource,
                success: function(data) {
                    if (data.error == null) {
                        alertify.success('El recurso se ha eliminado correctamente.');
                        GenerateHistoricEvent(ID_HW, REMOVE_HARDWARE_RESOURCE, $('#TbNameResource').val(), $('#loggedUser').text());
                        GetMySlaves();
                        if (data.activa == 1)
                            resModified = true;
                    }
                    else {
                        alertify.error('Error: ' + data.error);
                    }
                },
                error: function(data) {
                    alertify.error('Error eliminando el recurso.');
                }
            });
        },
        function() { alertify.error('Cancelado'); }
    );
}
/**
 * RemoveResource
 * @param {any} f
 */
function RemoveResource(f) {

    Trace("hardware.js:RemoveResource");

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el recurso \"" + $('#TbNameResource').val() + "\"?",
        function() {
            var idSlave = $('#SlaveId').val();
            if ($('table.resource').data('idPos')) {
                $.ajax({
                    type: 'DELETE',
                    url: '/resources/' + $('table.resource').data('idPos'),
                    success: function(data) {
                        if (data.error === null) {
                            if (data.data == 0) {
                                alertify.error('Un recurso asignado a un gateway activo no puede ser eliminado.');
                            } else {
                                GenerateHistoricEvent(ID_HW, REMOVE_HARDWARE_RESOURCE, $('#TbNameResource').val(), $('#loggedUser').text());
                                alertify.success('Recurso \"' + $('#TbNameResource').val() + '\" eliminado.');

                                // Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
                                if (f != null)
                                    f();

                                GetMySlaves();
                            }
                        }
                    },
                    error: function(data) {
                        alertify.error('El recurso \"' + $('#TbNameResource').val() + '\" no existe.');
                    }
                });
            }
            blockZone = false;
            //GetSlave(idSlave);
            //$('#BtnRemoveResource').hide();
            $('#BtnResourceParameters').hide();
            $('#BtnListasBN').hide();

            //alertify.success('Ok'); 
        },
        function() { alertify.error('Cancelado'); }
    );

}
/**
 * ResourceParameters
 * */
function ResourceParameters() {

    Trace("hardware.js:ResourceParameters");

    // Simular click sobre tab Hw.
    $('#aHw').click();

    if ($('#SResourceType option:selected').val() == 1) {
        // Show radio parameters
        $('#FormParameters').show();
        //		$('#ButtonCommit').attr('onclick','UpdateResource("' + fila + '"); AddRadioParameters()');
        ResetRadioParameters();
        GetRadioResourceParameters($('table.resource').data('idRecurso'), $('#TbNameResource').val());
    }
    else {
        // Show telephone parameters
        $('#FormParameters').show();
        //		$('#ButtonCommit').attr('onclick','UpdateResource("' + fila + '"); AddPhoneParameters()');
        ResetTelParameters();
        GetTelResourceParameters($('table.resource').data('idRecurso'), $('#TbNameResource').val());
    }
}
/**
 * GetRadioResourceParameters
 * @param {any} idRecurso
 * @param {any} name
 */
function GetRadioResourceParameters(idRecurso, name) {

    Trace("hardware.js:GetRadioResourcesParameters. idRecurso %s, name ", idRecurso, name);

    $.ajax({
        type: 'GET',
        url: '/resources/' + idRecurso + '/radioParameters',
        success: function(data) {
            if (data != null)
                $('#DivParameters').data('idRecurso', idRecurso);
            $('#DivParameters').data('nombreRecurso', name);
            ShowRadioParamsOfResource(data);
        }
    });

    //GetUris(idRecurso);
}
/**
 * GetUris
 * @param {any} idRecurso
 */
function GetUris(idRecurso) {

    Trace("hardware.js:GetUris. idRecurso ", idRecurso);

    // Obtener los emplazamientos del recurso
	/*$.ajax({type: 'GET',
		url: '/resources/' + idRecurso + '/uris',
		success: function(data){
			if (data != null)
				ShowUris(data);
		}
	});*/
}
/**
 * ShowRadioParamsOfResource
 * @param {any} data
 */
function ShowRadioParamsOfResource(data) {

    Trace("hardware.js:ShowRadioParamsOfResource. data ", data);

    // Reset panel comunicaciones
    ShowUriNumber(0);

    // Mantener datos del recurso
    var name = $('#NameResource').text();
    $('#NameResource').text(name + ' ' + $('#DivParameters').data('nombreRecurso'));

    // Parámetros Hw (Audio)
    $('#CbAdAgc').prop('checked', data.parametros.hardware.AD_AGC != '0');
    $('#TbAdGain').val(parseFloat(data.parametros.hardware.AD_Gain) / 10);
    $('#CbDaAgc').prop('checked', data.parametros.hardware.DA_AGC != '0');
    $('#TbDaGain').val(parseFloat(data.parametros.hardware.DA_Gain) / 10);
    if (data.parametros.hardware.DA_AGC != '0') {
        $('#LblDA').hide();
        $('#TbDaGain').hide();
    }
    else {
        $('#LblDA').show();
        $('#TbDaGain').show();
    }

    if (data.parametros.hardware.AD_AGC != '0') {
        $('#LblAD').hide();
        $('#TbAdGain').hide();
    }
    else {
        $('#LblAD').show();
        $('#TbAdGain').show();
    }

    // Parametros jitter
    // $('#TbMin').val(data.parametros.Buffer_jitter.min);
    // $('#TbMax').val(data.parametros.Buffer_jitter.max);
    //$('#paramHw tr:nth-child(3)').show();
    //$('#TbJitterBufferDelay').val(data.parametros.radio.tjbd);

    // Parámetros radio
    $('#LbTypeRadio option[value="' + data.parametros.radio.tipo + '"]').prop('selected', true);
    $('#LbSquelchType option[value="' + data.parametros.radio.sq + '"]').prop('selected', true);
    $('#LbPttType option[value="' + data.parametros.radio.ptt + '"]').prop('selected', true);
    $('#TbTiempoMaxPtt').val(data.parametros.radio.tiempoPtt);
    $('#CbBssEnable').prop('checked', data.parametros.radio.bss != '0');
    $('#CbEnableRecording').prop('checked', data.parametros.radio.iEnableGI);
    $('#CbInputSignalForced').prop('checked', data.parametros.radio.ForcedSignal != '0');
    $('#CbGranularity option[value="' + data.parametros.radio.iPrecisionAudio + '"]').prop('selected', true);

    if (data.parametros.radio.tipo >= 0 && data.parametros.radio.tipo <= 3) {
        $('#CbBssMethodAvailable option[value="' + data.parametros.radio.metodoBss + '"]').prop('selected', true);
        $('#LbPttPriority option[value="' + data.parametros.radio.iPttPrio + '"]').prop('selected', true);
        $('#LbSipPriority option[value="' + data.parametros.radio.iSesionPrio + '"]').prop('selected', true);
    }
    else
        $('#CbBssMethod option[value="' + data.parametros.radio.metodoBss + '"]').prop('selected', true);

    if (data.parametros.radio.sq == 1)	// Sólo para SQ=VAD
        $('#VadRow').attr('style', 'display:table-row');
    else
        $('#VadRow').attr('style', 'display:table-column');


    SetAudioTableCB(function() {
        // Dependiendo del tipo de radio (cualquier local/cualquier remoto)
        // La selección del Metodo BSS representa una disponibilidad de métodos (locales) o 
        // un método preferido (remotos)
        // Ocultar/Mostrar tab listas dependiendo de si esta seleccionada o no la restricción
        if (data.parametros.radio.tipo === 4 || data.parametros.radio.tipo === 6)
            $('#EnableRecordingRow').attr('style', 'display:table-row');		//show
        else
            $('#EnableRecordingRow').attr('style', 'display:table-column');		//Hide
        if (data.parametros.radio.tipo >= 0 && data.parametros.radio.tipo <= 3) {
            // Recursos radio locales

            // Completar lista de recursos radio remotos
            GetRemoteRadioResources();

            $('#ListMenuParameters li:nth-child(5)').show();
            $('#ListMenuParameters li:nth-child(4)').hide();
            $('#BSSAvailableRow').attr('style', 'display:table-row');	// Show
            //$('#EnableRecordingRow').attr('style','display:table-row');		// Show
            $('#InternalDelayRow').attr('style', 'display:table-column');	// Hide
            $('#BSSMethodRow').attr('style', 'display:table-column');	// Hide
            $('#BssAvailableRow').attr('style', 'display:table-row');	// Show
            $('#PttPriorityRow').attr('style', 'display:table-row');	// Show
            $('#SipPriorityRow').attr('style', 'display:table-row');	// Show

            // Seleccionar elemento en CB tabla calificación audio.
            if (data.parametros.tablaAudio != null)
                $('#CbBssAudioTableAvailble option[value="' + data.parametros.tablaAudio.idtabla_bss + '"]').prop('selected', true);
            else
                $('#CbBssAudioTableAvailble option[value="-1"]').prop('selected', true);

            if (data.parametros.radio.bss != '0') {
                $('#BigSlavesZone').animate({ height: '580px' });
                if ($('#TbClimaxDelay option:selected').val() == 2)
                    $('#CompensationRow').show();
                else
                    $('#CompensationRow').hide();
            }
            else
                $('#BigSlavesZone').animate({ height: '512px' });


            // Panel comunicaciones
            switch (data.parametros.radio.tipo) {
                case 0: // Local simple
                    // Ocultar TX-B y RX-B para locales simple
                    $('#TxBRow').attr('style', 'display:table-column');
                    $('#RxBRow').attr('style', 'display:table-column');
                    // Ocultar boton añadir emplazamiento
                    if (($('#UriTxA')[0].value == null) || ($('#UriTxA')[0].value == '') &&
                        ($('#UriRxA')[0].value == null) || ($('#UriRxA')[0].value == ''))
                        $('#ListMenuSites li:first-child').find("a").text('+');
                    /** 201705 AGL Error Notificado... */
                    // else {
                    // 	try {
                    // 		('#ListMenuSites li:first-child').find("a").text('Colateral');
                    // 	}
                    // 	catch (err) {
                    // 		alertify.error("Error: "+err.message);
                    // 	}
                    // }
                    break;
                case 1:
                    $('#ListMenuSites li:first-child').find("a").text('Colateral');
                    // Mostrar TX-B y RX-B para locales simple
                    $('#TxBRow').attr('style', 'display:table-row');
                    $('#RxBRow').attr('style', 'display:table-row');
                    break;
                case 3:
                    // Mostrar TX-B y RX-B para locales simple
                    $('#TxBRow').attr('style', 'display:table-row');
                    $('#RxBRow').attr('style', 'display:table-row');
                    break;
                case 2:
                    // Ocultar TX-B y RX-B para locales simple
                    $('#TxBRow').attr('style', 'display:table-column');
                    $('#RxBRow').attr('style', 'display:table-column');
                    // Mostrar boton añadir emplazamiento
                    //$('#ListMenuSites li:first-child').find("a").text('+');
                    break;
            }
        }
        else {
            if (data.parametros.radio.tipo === 5)
                $('#BSSMethodRow').attr('style', 'display:table-column');

            else
                $('#BSSMethodRow').attr('style', 'display:table-row');	// Show
            // Recurso radio remotos
            $('#BSSAvailableRow').attr('style', 'display:table-column');
            $('#InternalDelayRow').attr('style', 'display:table-row');
            $('#BssAvailableRow').attr('style', 'display:table-column');	// Hide
            $('#PttPriorityRow').attr('style', 'display:table-column');	// Hide
            $('#SipPriorityRow').attr('style', 'display:table-column');	// Hide

            //if (data.parametros.radio.tipo != 5)
            //	$('#EnableRecordingRow').attr('style','display:table-row');

            $('#ListMenuParameters li:nth-child(5)').hide();
            $('#ListMenuParameters li:nth-child(4)').show();
            if ($('#SRestriccion option:selected').val() != 0) {
                $('#WhiteBlackList').attr('style', 'display:table');
            }
            else {
                $('#WhiteBlackList').attr('style', 'display:table-column');
            }
            $('#NewsUris').attr('style', 'display:table;padding-bottom: 5px;width: 100%; border-spacing: 5px;');

            // Seleccionar elemento en CB tabla calificación audio.
            if (data.parametros.tablaAudio != null)
                $('#CbBssAudioTable option[value="' + data.parametros.tablaAudio.idtabla_bss + '"]').prop('selected', true);
            else
                $('#CbBssAudioTable option[value="-1"]').prop('selected', true);

            $.ajax({
                type: 'GET',
                url: '/resources/lists',
                success: function(data) {
                    LoadUri(data);
                }
            });
        }
    });

    if (data.parametros.radio.tipo == 2 || data.parametros.radio.tipo == 3) {
        // Solo se muestra si el tipo de radio es frecuencia desplazada simple o principal/reserva
        $('#BSSEnableRow').attr('style', 'display:table-row');
        if (data.parametros.radio.bss != '0') {
            //$('#BSSMethodRow').attr('style','display:table-row');
            //$('#SquelchDeactRow').attr('style','display:table-row');
            $('#ClimaxDelayRow').attr('style', 'display:table-row');
            //$('#InternalDelayRow').attr('style','display:table-row');
            $('#CompensationRow').attr('style', 'display:table-row');
            $('#BssTimeRow').attr('style', 'display:table-row');
            //$('#BssSquelchRow').attr('style','display:table-row');
            //$('#PttSquelchRow').attr('style','display:table-row');
            if ($('#TbClimaxDelay option:selected').val() == 2 || $('#TbClimaxDelay option:selected').val() == 1) {
                $('#ModoCalculoClimaxRow').attr('style', 'display:table-row');
            }
        }
        else {
            //$('#BSSMethodRow').attr('style','display:table-column');
            //$('#SquelchDeactRow').attr('style','display:table-column');
            $('#ClimaxDelayRow').attr('style', 'display:table-column');
            $('#CompensationRow').attr('style', 'display:table-column');
            $('#BssTimeRow').attr('style', 'display:table-column');
            $('#BssSquelchRow').attr('style', 'display:table-column');
            //$('#PttSquelchRow').attr('style','display:table-column');
            $('#ModoCalculoClimaxRow').attr('style', 'display:table-column');
        }
    }
    else {
        $('#EnableRecordingRow').attr('style', 'display:none');
        $('#BSSEnableRow').attr('style', 'display:table-column');
        //$('#BSSMethodRow').attr('style','display:table-column');
        //$('#SquelchDeactRow').attr('style','display:table-column');
        $('#ClimaxDelayRow').attr('style', 'display:table-column');
        //$('#InternalDelayRow').attr('style','display:table-column');
        $('#CompensationRow').attr('style', 'display:table-column');
        $('#BssTimeRow').attr('style', 'display:table-column');
        $('#BssSquelchRow').attr('style', 'display:table-column');
        //$('#PttSquelchRow').attr('style','display:table-column');
        //if (data.parametros.radio.tipo > 3){ // Recurso radio remoto
        //$('#BSSMethodRow').attr('style','display:table-row');
        //$('#InternalDelayRow').attr('style','display:table-row');
        //}
        $('#ModoCalculoClimaxRow').attr('style', 'display:table-column');
    }

    $('#TbVad').val(data.parametros.radio.umbralVad);
    //$('#TbSqDesactivacion').val(data.parametros.radio.desactivacionSq);
    $('#TbClimaxDelay option[value="' + data.parametros.radio.climaxDelay + '"]').prop('selected', true);
    $('#CbCompensation').val(data.parametros.radio.tmRetardoFijo);
    $('#TbBssWindow').val(data.parametros.radio.tmVentanaRx);
    $('#TbBssSquelchQueue').val(data.parametros.radio.retrasoSqOff);
    $('#CbPttSquelchEvents').prop('checked', data.parametros.radio.evtPTT != '0');
    $('#TbGrsInternalDelay').val(data.parametros.radio.tGRSid);
    if ($('#TbClimaxDelay option:selected').val() == '2')
        $('#CompensationRow').show();
    else
        $('#CompensationRow').hide();

    $('#TbModoCalculoClimax option[value="' + data.parametros.radio.iModoCalculoClimax + '"]').prop('selected', true);
}
/**
 * GetTelResourceParameters
 * @param {any} idRecurso
 * @param {any} name
 */
function GetTelResourceParameters(idRecurso, name) {

    Trace("hardware.js:GetTelResourceParameters. idRecurso %s, name ", idResource, name);

    $.ajax({
        type: 'GET',
        url: '/resources/' + idRecurso + '/phoneParameters',
        success: function(data) {
            if (data != null)
                $('#DivParameters').data('idRecurso', idRecurso);
            $('#DivParameters').data('nombreRecurso', name);
            ShowTelParamsOfResource(data);
            GetAtsRange(idRecurso);
        }
    });
}
/**
 * GetAtsRange
 * @param {any} rsc
 */
function GetAtsRange(rsc) {

    Trace("hardware.js:GetAtsRange. rsc ", rsc);

    $.ajax({
        type: 'GET',
        url: '/resources/' + rsc + '/phoneParameters/range',
        success: function(data) {
            if (data != null)
                ShowRangeAts(data);
        }
    });
}
/**
 * ShowRangeAts
 * @param {any} dataReceived
 */
function ShowRangeAts(dataReceived) {

    Trace("hardware.js:ShowRangeAts. dataReceived ", dataReceived);

    var indexOrigen = 1;
    var indexDestino = 1;
    var data;

    if (dataReceived == null)
        data = dataAtsRange;
    else
        data = dataReceived;

    var cuantos = $('#rangeAtsOrigin tr').length;
    var i = 0;
    for (i = 2; i < cuantos; i++)
        $('#rangeAtsOrigin tr:nth-child(2)').remove();
    cuantos = $('#rangeAtsDestination tr').length;
    for (i = 2; i < cuantos; i++)
        $('#rangeAtsDestination tr:nth-child(2)').remove();

    $('#rangeAtsOrigin tr:last td:nth-child(1) input').val('');
    $('#rangeAtsOrigin tr:last td:nth-child(2) input').val('');
    $('#rangeAtsDestination tr:last td:nth-child(1) input').val('');
    $('#rangeAtsDestination tr:last td:nth-child(2) input').val('');

    translateWord('Update', function(result) {
        var actualiza = result;
        translateWord('Remove', function(result) {
            var remove = result;
            /** 20170511 AGL. PERFILES */
            var clase = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='New NotAllowedTd'" : "";
            var clase_a = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='ButtonNucleo NotAllowedBtn'" : "class='ButtonNucleo'";
            var clase_ = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false ? " class='NotAllowedBtn'" : "";
			/*var clase = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='New NotAllowedTd'" : "";
			 var clase_a = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='ButtonNucleo NotAllowedBtn'" : "class='ButtonNucleo'";
			 var clase_ = ($('#BodyRedan').data('perfil') & 1) == 1 ? " class='NotAllowedBtn'" : "";
			 *************************************************/
            if (data != 'NO_DATA') {
                $.each(data.ranks, function(index, value) {
                    if (value.origen == 1) {
                        indexOrigen++;
                        $('#rangeAtsOrigin tr:last').before('<tr data-idrango=' + value.idRANGOS + ' style="height:45px">' +
                            '<td align="center"' + clase + '><input ' + clase_ + ' value="' + value.inicial + '" style="width:55px;text-align: right"/></td>' +
                            '<td align="center"' + clase + '><input ' + clase_ + ' value="' + value.final + '" style="width:55px;text-align: right"/></td>' +
                            '<td align="center"' + clase + '><a ' + clase_a + ' onclick="UpdateRank(' + indexOrigen + ',true)" >' + actualiza + '</a></td>' +
                            '<td align="center"' + clase + '><a ' + clase_a + ' onclick="RemoveRank(' + indexOrigen + ',true)" >' + remove + '</a></td>' +
                            '</tr>');
                        if ($('#rangeAtsOrigin')[0].childNodes["0"].childNodes.length == 6)
                            $('#AddOrigenRow').hide();
                        else
                            $('#AddOrigenRow').show();
                    }
                    else {
                        indexDestino++;
                        $('#rangeAtsDestination tr:last').before('<tr data-idrango=' + value.idRANGOS + ' style="height:45px">' +
                            '<td align="center"' + clase + '><input ' + clase_ + ' value="' + value.inicial + '" style="width:55px;text-align: right"/></td>' +
                            '<td align="center"' + clase + '><input ' + clase_ + ' value="' + value.final + '" style="width:55px;text-align: right"/></td>' +
                            '<td align="center"' + clase + '><a ' + clase_a + ' onclick="UpdateRank(' + indexDestino + ',false)" >' + actualiza + '</a></td>' +
                            '<td align="center"' + clase + '><a ' + clase_a + ' onclick="RemoveRank(' + indexDestino + ',false)" >' + remove + '</a></td>' +
                            '</tr>');
                        if ($('#rangeAtsDestination')[0].childNodes["0"].childNodes.length == 6)
                            $('#AddDestinoRow').hide();
                        else
                            $('#AddDestinoRow').show();
                    }
                });
            }
        });
    });
}
/**
 * ShowTelParamsOfResources
 * @param {any} data
 */
function ShowTelParamsOfResource(data) {

    Trace("hardware.js:ShowTelParamsOfResources. data ", data);

    // Mantener datos del recurso
    var name = $('#NameResource').text();
    $('#NameResource').text(name + ' ' + $('#DivParameters').data('nombreRecurso'));

    $('#ListMenuParameters li:nth-child(5)').hide();

    GetTelephonicResources();

    // Parámetros Hw
    if (data.parametros.hardware !== null) {
        $('#CbAdAgc').prop('checked', data.parametros.hardware.AD_AGC != '0');
        $('#TbAdGain').val(parseFloat(data.parametros.hardware.AD_Gain) / 10);
        $('#CbDaAgc').prop('checked', data.parametros.hardware.DA_AGC != '0');
        $('#TbDaGain').val(parseFloat(data.parametros.hardware.DA_Gain) / 10);
    }

    // Parámetros tel
    if (data.parametros.telefonia !== null) {
        $('#LbTypeTel option[value="' + data.parametros.telefonia.tipo + '"]').prop('selected', true);
        $('#LbLado option[value="' + data.parametros.telefonia.lado + '"]').prop('selected', true);
        $('#LbEMType option[value="' + data.parametros.telefonia.t_eym + '"]').prop('selected', true);
        $('#LbEMLado option[value="' + data.parametros.telefonia.ladoeym + '"]').prop('selected', true);
        $('#CbVox').prop('checked', data.parametros.telefonia.detect_vox != '0');
        $('#TbUmbral').val(data.parametros.telefonia.umbral_vox);
        $('#TbInactividad').val(data.parametros.telefonia.tm_inactividad);
        //$('#LbAtsModo option[value="' + data.parametros.telefonia.modo +'"]').prop('selected', true);
        $('#CbResp').prop('checked', data.parametros.telefonia.r_automatica != '0');
        $('#LbWires option[value="' + data.parametros.telefonia.h2h4 + '"]').prop('selected', true);
        $('#TbLocalNumText').val(data.parametros.telefonia.no_test_local);
        $('#TbRemoteNumText').val(data.parametros.telefonia.no_test_remoto);
        $('#TbOptionsInterval').val(data.parametros.telefonia.it_release);
        $('#TbRemoteUri').val(data.parametros.telefonia.uri_remota != null ? data.parametros.telefonia.uri_remota.substring(4) : '');
        $('#CbOptionsSupervision').prop('checked', data.parametros.telefonia.superv_options == 1);
        $('#TbReleaseTime option[value="' + data.parametros.telefonia.tm_superv_options + '"]').prop('selected', true);
        $('#CbInterruptToneTime option[value="' + data.parametros.telefonia.iT_Int_Warning + '"]').prop('selected', true);

        if ($('#CbOptionsSupervision').prop('checked'))
            $('#ReleaseRow').show();
        else
            $('#ReleaseRow').hide();

        if ($('#CbResp').prop('checked'))
            $('#OptionsIntervalRow').show();
        else
            $('#OptionsIntervalRow').hide();

        ShowOptions($('#LbTypeTel option:selected').val());
    }
}
/**
 * GotoDestination
 * @param {any} frecuencia
 */
function GotoDestination(frecuencia) {

    Trace("hardware.js:GotoDestination. frecuencia", frecuencia);

    hidePrevious('#FormRadioDestinations', '#AddFormDestinations', '#DivDestinations');
    GetRadioDestinations();
    if (frecuencia != -1) {
        ShowDestination(frecuencia);
    }
    else {
        NewRadioDestination();
    }
}
/**
 * 
 * @param {any} element
 */
function ClickDaAgc(element) {

    Trace("hardware.js:ClickDaAgc. element ", element);

    if (element.checked) {
        $('#LblDA').hide();
        $('#TbDaGain').hide();
    }
    else {
        $('#LblDA').show();
        $('#TbDaGain').show();
    }
}
/**
 * 
 * @param {any} element
 */
function ClickAdAgc(element) {

    Trace("hardware.js:ClickAdAgc. element ", element);

    if (element.checked) {
        $('#LblAD').hide();
        $('#TbAdGain').hide();
    }
    else {
        $('#LblAD').show();
        $('#TbAdGain').show();
    }
}
/**
 * SelectBss
 * */
function SelectBss() {

    Trace("hardware.js:SelectBss.");

    if ($('#LbTypeRadio option:selected').val() >= 0 && $('#LbTypeRadio option:selected').val() <= 3) {

        if ($('#LbSquelchType option:selected').val() == 1)
            $('#VadRow').attr('style', 'display:table-row');
        else
            $('#VadRow').attr('style', 'display:table-column');

        loadUriSites(false);
        $('#SalidaAudioRow').attr('style', 'display:table-column');
        $('#InternalDelayRow').attr('style', 'display:table-column');
        $('#ListMenuParameters li:nth-child(5)').show();
        // Ocultar panel de listas B/N
        $('#ListMenuParameters li:nth-child(4)').hide();
        $('#PttPriorityRow').attr('style', 'display:table-row');	// Show
        $('#SipPriorityRow').attr('style', 'display:table-row');	// Show

        // Reset panel comunicaciones
        ShowUriNumber(0);

        $('#BSSMethodRow').attr('style', 'display:table-column');	// Hide
        $('#BssAvailableRow').attr('style', 'display:table-row');	// Show

        $('#BSSAvailableRow').attr('style', 'display:table-row');

        switch ($('#LbTypeRadio option:selected').val()) {
            case '0': // Local simple
                // Ocultar TX-B y RX-B para locales simple
                $('#TxBRow').attr('style', 'display:table-column');
                $('#RxBRow').attr('style', 'display:table-column');
                $('#ListMenuSites li:first-child').find("a").text('Colateral')
                    .attr('onclick', '');
                break;
            case '1':
                $('#ListMenuSites li:first-child').find("a").text('Colateral')
                    .attr('onclick', '');
                // Mostrar TX-B y RX-B 
                $('#TxBRow').attr('style', 'display:table-row');
                $('#RxBRow').attr('style', 'display:table-row');
                break;
            case '3':
                // Mostrar TX-B y RX-B 
                $('#TxBRow').attr('style', 'display:table-row');
                $('#RxBRow').attr('style', 'display:table-row');
                $('#ListMenuSites li:last-child').find("a").text('+')
                    .attr('onclick', 'ShowDestinationSite(this)');
                break;
            case '2':
                // Ocultar TX-B y RX-B 
                $('#TxBRow').attr('style', 'display:table-column');
                $('#RxBRow').attr('style', 'display:table-column');
                $('#ListMenuSites li:last-child').find("a").text('+')
                    .attr('onclick', 'ShowDestinationSite(this)');
                break;
        }

        $('#EnableRecordingRow').attr('style', 'display:none');
        $('#BSSAvailableRow').show();
        $('#BSSMethodRow').hide();

        GetUris($('#DivParameters').data('idRecurso'));
    }
    else {

        if ($('#LbSquelchType option:selected').val() == 1 && $('#LbTypeRadio option:selected').val() == 6)
            $('#VadRow').attr('style', 'display:table-row');
        else
            $('#VadRow').attr('style', 'display:table-column');

        $('#BSSMethodRow').attr('style', 'display:table-row');	// Hide
        $('#BssAvailableRow').attr('style', 'display:table-column');	// Show
        $('#PttPriorityRow').attr('style', 'display:table-column');	// Show
        $('#SipPriorityRow').attr('style', 'display:table-column');	// Show

        // Ocultar panel comunicaciones
        $('#ListMenuParameters li:nth-child(5)').hide();
        // Mostrar panel de listas B/N
        $('#ListMenuParameters li:nth-child(4)').show();
        if ($('#SRestriccion option:selected').val() != 0) {
            $('#WhiteBlackList').attr('style', 'display:table');
        }
        else {
            $('#WhiteBlackList').attr('style', 'display:table-column');
        }

        if ($('#LbTypeRadio option:selected').val() != 5)
            $('#EnableRecordingRow').attr('style', 'display:table-row');
        else
            $('#EnableRecordingRow').attr('style', 'display:none');

        $('#BSSAvailableRow').attr('style', 'display:table-column');
        $('#InternalDelayRow').attr('style', 'display:table-row');
        $('#BSSAvailableRow').hide();
        if ($('#LbTypeRadio option:selected').val() == 5) {
            $('#BSSMethodRow').hide();
            $('#EntradaAudioRow').hide();
        }
        else
            $('#EntradaAudioRow').show();


        if ($('#LbTypeRadio option:selected').val() == 6) {
            $('#InternalDelayRow').attr('style', 'display:table-column');
            $('#TbGrsInternalDelay').val(0);
        }
        else
            if (($('#LbTypeRadio option:selected').val() == 4) || ($('#LbTypeRadio option:selected').val() == 5)) {
                $('#TbGrsInternalDelay').prop('disabled', false);
            }

        if ($('#CbBssMethod option:selected').val() == 0 && ($('#LbTypeRadio option:selected').val() == 4 || $('#LbTypeRadio option:selected').val() == 6))
            $('#BSSMethodRow .SoloRssi').show();
        else
            $('#BSSMethodRow .SoloRssi').hide();
    }


    if ($('#LbTypeRadio option:selected').val() == 2 || $('#LbTypeRadio option:selected').val() == 3) {
        // Solo se muestra si el tipo de radio es frecuencia desplazada simple o principal/reserva
        $('#BSSEnableRow').attr('style', 'display:table-row');
        if ($('#CbBssEnable').prop('checked')) {
            $('#BigSlavesZone').animate({ bottom: '580px' });
            $('#ClimaxDelayRow').attr('style', 'display:table-row');
            if ($('#TbClimaxDelay option:selected').val() == 1)
                $('#CompensationRow').attr('style', 'display:table-column');
            else
                $('#CompensationRow').attr('style', 'display:table-row');
            if ($('#TbClimaxDelay option:selected').val() == 2 || $('#TbClimaxDelay option:selected').val() == 1) {
                $('#ModoCalculoClimaxRow').attr('style', 'display:table-row');
            }
        }
        else {
            $('#BigSlavesZone').animate({ bottom: '512px' });
            $('#ClimaxDelayRow').attr('style', 'display:table-column');
            $('#CompensationRow').attr('style', 'display:table-column');
            $('#BssTimeRow').attr('style', 'display:table-column');
            $('#BssSquelchRow').attr('style', 'display:table-column');
            $('#ModoCalculoClimaxRow').attr('style', 'display:table-column');
        }
    }
    else {
        if (($('#LbTypeRadio option:selected').val() == 4 || $('#LbTypeRadio option:selected').val() == 6)
            && $('#LbSquelchType option:selected').val() == 1) {
            $('#VadRow').attr('style', 'display:table-row');

        }
        if ($('#LbTypeRadio option:selected').val() == 4 || $('#LbTypeRadio option:selected').val() == 6) {
            SetAudioTableCB(function() {
             });
        }
        if ($('#LbTypeRadio option:selected').val() == 4 || $('#LbTypeRadio option:selected').val() == 5) {
            $('#SalidaAudioRow').attr('style', 'display:table-row');
        }
        if ($('#LbTypeRadio option:selected').val() == 6) {
            $('#SalidaAudioRow').attr('style', 'display:table-column');
            if ($('#LbSquelchType option:selected').val() == 1)
                $('#VadRow').attr('style', 'display:table-row');
        }
        $('#BSSEnableRow').attr('style', 'display:table-column');
        $('#ClimaxDelayRow').attr('style', 'display:table-column');
        $('#CompensationRow').attr('style', 'display:table-column');
        $('#BssTimeRow').attr('style', 'display:table-column');
        $('#BssSquelchRow').attr('style', 'display:table-column');
        $('#ModoCalculoClimaxRow').attr('style', 'display:table-column');
    }

}
/**
 * UpdateSite
 * @param {any} f
 */
function UpdateSite(f) {

    Trace("hardware.js:UpdateSite");

    if (($('#UriTxA').val() != '') ||
        ($('#UriTxB').val() != '') ||
        ($('#UriRxA').val() != '') ||
        ($('#UriRxB').val() != '')) {
        $.ajax({
            type: 'PUT',
            url: '/resources/' + $('table.resource').data('idRecurso') + '/uris',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                idUBICACIONES: $('#FormCommunications').data('idUri'),
                uriTxA: ($('#UriTxA').val() != '') ? ('sip:' + $('#UriTxA').val()) : $('#UriTxA').val(),
                uriTxB: ($('#UriTxB').val() != '') ? ('sip:' + $('#UriTxB').val()) : $('#UriTxB').val(),
                uriRxA: ($('#UriRxA').val() != '') ? ('sip:' + $('#UriRxA').val()) : $('#UriRxA').val(),
                uriRxB: ($('#UriRxB').val() != '') ? ('sip:' + $('#UriRxB').val()) : $('#UriRxB').val(),
                activoTx: $('#TxA').prop('checked') ? 0 : 1,
                activoRx: $('#RxA').prop('checked') ? 0 : 1
            }),
            success: function(data) {
                GetUris($('table.resource').data('idRecurso'));
                if (f != null)
                    f();

                alertify.success('Colateral actualizado.');
            }
        });
    }
}
/**
 * CommitSite
 * @param {any} f
 */
function CommitSite(f) {

    Trace("hardware.js:CommitSite.");

    if (($('#UriTxA').val() != '') ||
        ($('#UriTxB').val() != '') ||
        ($('#UriRxA').val() != '') ||
        ($('#UriRxB').val() != '')) {
        $.ajax({
            type: 'POST',
            url: '/resources/' + $('table.resource').data('idRecurso') + '/uris',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                RECURSO_idRECURSO: $('table.resource').data('idRecurso'),
                uriTxA: ($('#UriTxA').val() != '') ? ('sip:' + $('#UriTxA').val()) : $('#UriTxA').val(),
                uriTxB: ($('#UriTxB').val() != '') ? ('sip:' + $('#UriTxB').val()) : $('#UriTxB').val(),
                uriRxA: ($('#UriRxA').val() != '') ? ('sip:' + $('#UriRxA').val()) : $('#UriRxA').val(),
                uriRxB: ($('#UriRxB').val() != '') ? ('sip:' + $('#UriRxB').val()) : $('#UriRxB').val(),
                activoTx: 0,	// $('#TxA').prop('checked') ? 0 : 1,
                activoRx: 0	// $('#RxA').prop('checked') ? 0 : 1
            }),
            success: function(data) {
                alertify.success('Colateral añadido.');
                GetUris($('table.resource').data('idRecurso'));

                if (f != null)
                    f();
            }
        }
        );
    }
}
/**
 * RemoveSite
 * @param {any} f
 */
function RemoveSite(f) {

    Trace("hardware.js:RemoveSite");

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el colateral?",
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/resources/' + $('table.resource').data('idRecurso') + '/uris/' + $('#FormCommunications').data('idUri'),
                success: function(data) {
                    alertify.success('Colateral eliminado.');
                    GetUris($('table.resource').data('idRecurso'));
                    if (f != null)
                        f();
                }
            });

            //alertify.success('Ok'); 
        },
        function() { alertify.error('Cancelado'); }
    );

}
/**
 * ShowUriNumber
 * @param {any} page
 */
function ShowUriNumber(page) {

    Trace("hardware.js:ShowUriNumber. page ", page);

    if (page > 0) {
        $('#FormCommunications').data('idUri', destinationUris[page - 1].idUBICACIONES);

        $('#UriTxA').val(destinationUris[page - 1].uriTxA);
        $('#UriTxB').val(destinationUris[page - 1].uriTxB);
        $('#UriRxA').val(destinationUris[page - 1].uriRxA);
        $('#UriRxB').val(destinationUris[page - 1].uriRxB);

        // $('#TxA').prop('checked',destinationUris[page-1].activoTx==0);
        // $('#TxB').prop('checked',destinationUris[page-1].activoTx==1);
        // $('#RxA').prop('checked',destinationUris[page-1].activoRx==0);
        // $('#RxB').prop('checked',destinationUris[page-1].activoRx==1);

        $('#BtnUpdateSite').show();
        $('#BtnAddSite').hide();
        $('#BtnRemoveSite').show();
    }
    else if (page < 0) {
        // Alta de emplazamiento
        $('#FormCommunications').data('idUri', 0);

        $('#BtnUpdateSite').hide();
        $('#BtnAddSite').show();
        $('#BtnRemoveSite').hide();

        $('#UriRxA').val('');
        $('#UriRxB').val('');
        $('#UriTxA').val('');
        $('#UriTxB').val('');
    }
    else {
        var cuantos = $('#ListMenuSites li').length;
        for (var i = 0; i < cuantos - 1; i++)
            $('#ListMenuSites li:first-child').remove();
        $('#ListMenuSites li:first-child').find("a").attr('rel', -1)
            .text('+');

        $('#FormCommunications').data('idUri', 0);

        $('#BtnUpdateSite').hide();
        $('#BtnAddSite').show();
        $('#BtnRemoveSite').hide();

        $('#UriRxA').val('');
        $('#UriRxB').val('');
        $('#UriTxA').val('');
        $('#UriTxB').val('');
        //$('#FormCommunications')[0].reset();
    }
}
/**
 * ShowDestinationSite
 * @param {any} element
 */
function ShowDestinationSite(element) {

    Trace("hardware.js:ShowDestinationSite. element ", element);

    var tabs = [];
    tabs = document.getElementById('ListMenuSites').getElementsByTagName("a");
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].rel == element.rel)
            tabs[i].className = "selected";
        else
            tabs[i].className = "";
    }

    ShowUriNumber(parseInt(element.rel));
}
/**
 * OnCbBssEnable
 * @param {any} cb
 */
function OnCbBssEnable(cb) {
    if (cb.checked) {
        $('#BigSlavesZone').animate({ height: '580px' });
        //$('#BSSMethodRow').attr('style','display:table-row');
        //$('#BSSAvailableRow').attr('style','display:table-row');
        //$('#SquelchDeactRow').attr('style','display:table-row');
        $('#ClimaxDelayRow').attr('style', 'display:table-row');
        //$('#InternalDelayRow').attr('style','display:table-row');
        $('#CompensationRow').attr('style', 'display:table-row');
        if ($('#TbClimaxDelay option:selected').val() == 2)
            $('#CompensationRow').attr('style', 'display:table-row');
        else
            $('#CompensationRow').attr('style', 'display:table-column');

        $('#BssTimeRow').attr('style', 'display:table-row');
        //$('#BssSquelchRow').attr('style','display:table-row');
        //$('#PttSquelchRow').attr('style','display:table-row');
        if ($('#TbClimaxDelay option:selected').val() == 2 || $('#TbClimaxDelay option:selected').val() == 1) {
            $('#ModoCalculoClimaxRow').attr('style', 'display:table-row');
        }
    }
    else {
        $('#BigSlavesZone').animate({ height: '512px' });
        //$('#BSSMethodRow').attr('style','display:table-column');
        //$('#BSSAvailableRow').attr('style','display:table-column');
        //$('#SquelchDeactRow').attr('style','display:table-column');
        $('#ClimaxDelayRow').attr('style', 'display:table-column');
        $('#CompensationRow').attr('style', 'display:table-column');
        //$('#InternalDelayRow').attr('style','display:table-column');
        $('#CompensationRow').attr('style', 'display:table-column');
        $('#BssTimeRow').attr('style', 'display:table-column');
        $('#BssSquelchRow').attr('style', 'display:table-column');
        //$('#PttSquelchRow').attr('style','display:table-column');
        $('#ModoCalculoClimaxRow').attr('style', 'display:table-column');
    }
}
/**
 * OnChangeSite
 * @param {any} sel
 * @param {any} f
 */
function OnChangeSite(sel, f) {

    Trace("hardware.js:OnChangeSite. sel ", sel);

    $("#CBGroupOfSlave").empty();
    $('#TBGroup').val('');

    $.ajax({
        type: 'GET',
        url: '/sites/' + sel.value + '/groups/',
        success: function(data) {
            $('#TBGroup').val('');
            //var options=options += '<option value="-1"></option>';
            $('#CBGroupOfSlave').append($('<option>', {
                text: '',
                value: '-1'
            }));
            if (data != null && data.data != null) {
                $.each(data.data, function(index, item) {
                    //options += '<option value="' + value.idGRUPO + '">' + value.name + '</option>';
                    $('#CBGroupOfSlave').append($('<option>', {
                        text: item.name,
                        value: item.idGRUPO
                    }));
                });

                if (f != null)
                    f();
            }
        }
    });
}
/**
 * OnChangeTextGroup
 * */
function OnChangeTextGroup() {

    Trace("hardware.js:OnChangeTextGroup.");

    var grupo = $('#TBGroup').val();
    // Si el grupo tecleado no está en la lista, seleccionamos el primero con valor -1
    if ($('#CBGroupOfSlave option').filter(function() { return $(this).html() == grupo; }).length == 0)
        $('#CBGroupOfSlave option[value="-1"]').prop('selected', true);
}
/**
 * OnChangeGroup.
 * */
function OnChangeGroup() {
    $('#TBGroup').val($('#CBGroupOfSlave option:selected').text());
}
/****************************************/
/*	FUNCTION: OnChangeResourceType 		*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function OnChangeResourceType(sel) {

    Trace("hardware.js:OnChangeResourceType. sel ", sel);

    if (sel.value == 1) {//Radio
        SelectBss();
        $('#CbGranularity option[value="0"]').prop('selected', true);
        $('#GranularityRow').show();
        $('#DestinationRow').show();
        $('#BlackWhiteRow').show();
        $('#ListMenuParameters li:nth-child(1)').show();//Audio
        $('#ListMenuParameters li:nth-child(2)').show();//Radio
        $('#ListMenuParameters li:nth-child(3)').hide();//Telefonico
        $('#ListMenuParameters li:nth-child(4)').hide();
        $('#ListMenuParameters li:nth-child(5)').show();//Comunicaciones
        $('#ListMenuParameters li:nth-child(6)').hide();
        /** 20200715. Nuevos Parametros de Telefonia */
        $('#ListMenuParameters li:nth-child(7)').hide();// Colaterales Telefonicos
        //$('#DestinationRow').attr('style','display:table-row');
        //$('#BlackWhiteRow').attr('style','display:table-row');
    }
    else {//Telefono
        ShowOptions('0');//Opciones de telefono por defecto
        $('#CbGranularity option[value="1"]').prop('selected', true);
        $('#LbTypeTel option[value="0"]').prop('selected', true);
        $('#GranularityRow').hide();//Precisión de audio desactivado para tfno
        $('#DestinationRow').hide();
        $('#BlackWhiteRow').hide();
        $('#ListMenuParameters li:nth-child(1)').show();//Audio
        $('#ListMenuParameters li:nth-child(2)').hide();//Radio
        $('#ListMenuParameters li:nth-child(3)').show();//Telefonico
        $('#ListMenuParameters li:nth-child(4)').hide();
        $('#ListMenuParameters li:nth-child(5)').hide();
        /** 20200717. Ahora todos los recursos tienen al menos rangos ats origen */
        $('#ListMenuParameters li:nth-child(6)').show();
        /** 20200715. Nuevos Parametros de Telefonia */
        $('#ListMenuParameters li:nth-child(7)').show();// Colaterales Telefonicos
        //$('#DestinationRow').attr('style','display:table-column');
        //$('#BlackWhiteRow').attr('style','display:table-column');
    }
    //Esto recarga la pestaña de audio y la pone en el
    // foco para reiniciar la de radio o la de tfno.
    var element = $('#aHw');
    loadParam(element[0]);
}
/**
 * OnChangeRestriccion
 * @param {any} sel
 */
function OnChangeRestriccion(sel) {

    Trace("hardware.js:OnChangeRestriccion. sel ", sel);

    switch (sel.value) {
        case '0':
            $('#BlackList').attr('style', 'display:table-column');
            $('#WhiteList').attr('style', 'display:table-column');
            break;
        case '1':
            $('#BlackList').attr('style', 'display:table');
            $('#WhiteList').attr('style', 'display:table-column');
            break;
        case '2':
            $('#BlackList').attr('style', 'display:table-column');
            $('#WhiteList').attr('style', 'display:table');
            break;
    }
    //if (sel.value != 0){
    //	$('#WhiteBlackList').attr('style','display:table');
    /*$('#NewsUris').attr('style','display:table');
    $.ajax({type: 'GET', 
                        url: '/resources/lists', 
                        success: function(data){
                                LoadUri(data)
                        }
                    });*/
	/*	var rsc=$('table.resource').data('idRecurso');
		GetListsFromResource(rsc);
*/
    /** 20170517 AGL buscando 'undefined' */
    /*		if (sel.value) {
                $.ajax({type: 'GET', 
                                    url: '/resources/assignedlists/'+rsc+'/'+sel.value, 
                                    success: function(data1){
                                            LoadAssignedUriList(data1);
                                    }
                                });
            }
            else {
                if (DEBUG) alertify.error("OnChangeRestriccion. sel.value. undefined.");
            }
        	
        }
        else{
            $('#WhiteBlackList').attr('style','display:table-column');
            //$('#NewsUris').attr('style','display:table-column');	
        }
        */
}
/**
 * OnCbBssMethodAvailable
 * Mostrar u oculta CB selección tabla calificacion audio
 * @param {any} obj
 */
function OnCbBssMethodAvailable(obj) {

    Trace("hardware.js:OnCbBssMethodAvailable. obj ", obj);

    if (obj.value == 0)
        $('#BSSAvailableRow .SoloRssi').hide();
    else
        $('#BSSAvailableRow .SoloRssi').show();
}
/**
 * ClickEnableRegister
 * @param {any} obj
 */
function ClickEnableRegister(obj) {

    Trace("hardware.js:ClickEnableRegister. obj ", obj);

    if (obj.checked)
        $('.resource tr:nth-child(5)').show();
    else
        $('.resource tr:nth-child(5)').hide();
}
/**
 * SetAudioTableCB
 * @param {any} f
 */
function SetAudioTableCB(f) {

    Trace("hardware.js:SetAudioTableCB");

    $.ajax({
        type: 'GET',
        url: '/tableBss',
        success: function(data) {
            $('#CbBssAudioTable').empty();
            $('#CbBssAudioTable').append($('<option>', {
                text: 'Ninguna',
                value: '-1'
            }));
            $('#CbBssAudioTableAvailble').empty();
            $('#CbBssAudioTableAvailble').append($('<option>', {
                text: 'Ninguna',
                value: '-1'
            }));
            if (data != null && data.tables != null) {
                $.each(data.tables, function(index, item) {
                    //options += '<option value="' + value.idGRUPO + '">' + value.name + '</option>';
                    $('#CbBssAudioTable').append($('<option>', {
                        text: item.name,
                        value: item.idtabla_bss
                    }));
                    $('#CbBssAudioTableAvailble').append($('<option>', {
                        text: item.name,
                        value: item.idtabla_bss
                    }));
                });
            }

            if (f != null)
                f();
        }
    });
}
