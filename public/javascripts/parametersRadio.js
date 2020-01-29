function ResetRadioParameters() {
    $('#NameResource').text('Resource: ');

    // Ocultar tab de telefonia
    $('#ListMenuParameters li:nth-child(3)').hide();
    $('#ListMenuParameters li:nth-child(6)').hide();
    //  Mostrar tab de radio
    $('#ListMenuParameters li:nth-child(2)').show();

    // Ocultar/Mostrar tab listas dependiendo de si esta seleccionada o no la restricción
    if ($('#LbTypeRadio option:selected').val() < 4 || $('#SRestriccion option:selected').val() == 0)
        $('#ListMenuParameters li:nth-child(4)').hide();
    else
        $('#ListMenuParameters li:nth-child(4)').show();

    $('#CbAdAgc').prop('checked', false);
    $('#TbAdGain').val('0');
    $('#CbDaAgc').prop('checked', false);
    $('#TbDaGain').val('0');
    $('#GranularityRow').attr('style', 'display:table-row');

    // Parametros jitter
    $('#TbMin').val('0');
    $('#TbMax').val('0');
    //$('#TbJitterBufferDelay').val('0');


    $('#LbTypeRadio option[value=0]').prop('selected', true);
    $('#LbSquelchType option[value=0]').prop('selected', true);
    $('#LbPttType option[value=0]').prop('selected', true);
    //$('#TbTiempoMaxPtt').val('0');
    $('#CbBssEnable').prop('checked', false);
    $('#CbBssMethod option[value=0]').prop('selected', true);
    $('#CbBssMethodAvailable option[value=0]').prop('selected', true);
    $('#TbVad').val('0');
    $('#TbSqDesactivacion').val('1');
    $('#TbClimaxDelayoption[value=0]').prop('selected', true);
    $('#CbCompensation').val('100');
    $('#TbBssWindow').val('0');
    $('#TbBssSquelchQueue').val('0');
    $('#CbPttSquelchEvents').prop('checked', false);
    $('#TbGrsInternalDelay').val('0');
    $('#LbPttPriority option[value=0]').prop('selected', true);
    $('#LbSipPriority option[value=0]').prop('selected', true);
}


function AddRadioParameters() {
    var hw = {
        RECURSO_idRECURSO: $('#DivParameters').data('idRecurso'),
        AD_AGC: $('#CbAdAgc').prop('checked') ? '1' : '0',
        AD_Gain: $('#TbAdGain').val() == '' ? 0 : parseFloat($('#TbAdGain').val()) * 10,
        DA_AGC: $('#CbDaAgc').prop('checked') ? '1' : '0',
        DA_Gain: $('#TbDaGain').val() == '' ? 0 : parseFloat($('#TbDaGain').val()) * 10
    };
    var rd = {
        RECURSO_idRECURSO: $('#DivParameters').data('idRecurso'),
        tipo: $('#LbTypeRadio option:selected').val(),
        sq: $('#LbSquelchType option:selected').val(),
        ptt: $('#LbPttType option:selected').val(),
        tiempoPtt: 0, //$('#TbTiempoMaxPtt').val()=='' ? 0 : $('#TbTiempoMaxPtt').val(),
        bss: $('#CbBssEnable').prop('checked') ? '1' : '0',
        metodoBss: $('#LbTypeRadio option:selected').val() > 3 ? $('#CbBssMethod option:selected').val() : $('#CbBssMethodAvailable option:selected').val(),
        umbralVad: $('#TbVad').val() == '' ? 0 : $('#TbVad').val(),
        desactivacionSq: 1, //$('#TbSqDesactivacion').val()=='' ? 0 : $('#TbSqDesactivacion').val(),
        climaxDelay: $('#TbClimaxDelay option:selected').val(),
        tmRetardoFijo: $('#CbCompensation').val() == '' ? 10 : $('#CbCompensation').val(),
        tmVentanaRx: $('#TbBssWindow').val() == '' ? 0 : $('#TbBssWindow').val(),
        retrasoSqOff: $('#TbBssSquelchQueue').val() == '' ? 0 : $('#TbBssSquelchQueue').val(),
        evtPTT: $('#CbPttSquelchEvents').prop('checked') ? '1' : '0',
        tjbd: 0,	//$('#TbJitterBufferDelay').val()=='' ? 0 : $('#TbJitterBufferDelay').val(),
        tGRSid: $('#TbGrsInternalDelay').val() == '' ? 0 : $('#TbGrsInternalDelay').val(),
        iEnableGI: $('#CbEnableRecording').prop('checked') ? '1' : '0',
        iPttPrio: $('#LbPttPriority option:selected').val(),
        iSesionPrio: $('#LbSipPriority option:selected').val(),
        iPrecisionAudio: $('#CbGranularity option:selected').val(),
        iModoCalculoClimax: (($('#LbTypeRadio option:selected').val() == 2 || $('#LbTypeRadio option:selected').val() == 3) &&
            $('#CbBssEnable').prop('checked') &&
            ($('#TbClimaxDelay option:selected').val() == 1 || $('#TbClimaxDelay option:selected').val() == 2)) ? $('#TbModoCalculoClimax option:selected').val() : 0

        //ForcedSignal: 		$('#CbInputSignalForced').prop('checked') ? '1' : '0', 
    };
    var jitter = {
        RECURSO_idRECURSO: $('#DivParameters').data('idRecurso'),
        min: $('#TbMin').val() == '' ? 0 : $('#TbMin').val(),
        max: $('#TbMax').val() == '' ? 0 : $('#TbMax').val()
    };


    if (($('#LbTypeRadio option:selected').val() == 4 || $('#LbTypeRadio option:selected').val() == 6) &&
        $('#CbBssMethod option:selected').val() == 0 && $('#CbBssAudioTable option:selected').val() == -1) {
        alertify.error('El recurso radio debe tener asignado una tabla de calificación de audio.');
        return;
    }

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: '/resources/' + $('#DivParameters').data('idRecurso') + '/radioParameters',
        data: JSON.stringify({
            // Parámetros Hw
            "hw": hw,
            // Parámetros radio
            "rd": rd,
            // Jitter
            "jt": jitter,
            // Tabla calificación de audio
            "tAudio": rd.tipo > 3 ? /* Remoto */ $('#CbBssAudioTable option:selected').val() : /* Local */ $('#CbBssAudioTableAvailble option:selected').val()
        }),
        success: function(data) {
            if (data.error == null) {
                GenerateHistoricEvent(ID_HW, MODIFY_HARDWARE_RESOURCE_LOGIC_PARAM, $('#TbNameResource').val(), $('#loggedUser').text());
                //alert ('Radio parameters was been updated successfully.')
            }
            Close();
        }
    });
}

function OnChangeClimax(sel) {
    if (sel.value == '2') {
        $('#CompensationRow').attr('style', 'display:table-row');
        //$('#TbGrsInternalDelay').show();
        //$('#LblClimax').show();
    }
    else {
        $('#CompensationRow').attr('style', 'display:table-column');
        //$('#TbGrsInternalDelay').hide();
        //$('#LblClimax').hide();
    }

    if (sel.value == '1' || sel.value == '2') {
        $('#ModoCalculoClimaxRow').attr('style', 'display:table-row');
    }
    else {
        $('#ModoCalculoClimaxRow').attr('style', 'display:table-column');
    }
}

function OnSelectSQActivation(sel) {
    if (sel.value != 1)
        $('#VadRow').attr('style', 'display:table-column');
    else
        $('#VadRow').attr('style', 'display:table-row');
}

/************************************************/
/*	FUNCTION: GetRemoteTfnoResources 			*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function GetRemoteRadioResources() {
    var options = '';

    $('#CBFacedType').empty();
    options = '<option value="" disabled selected>Seleccione tipo de recurso</option>';
    $('#CBFacedType').append(options);
    options = '<option value="0">Recursos configurados</option>';
    $('#CBFacedType').append(options);
    options = '<option value="1">Recursos externos</option>';
    $('#CBFacedType').append(options);

    $('#CBFacedSite').empty();
    $('#CBFacedGtw').empty();
    $('#CBFacedResources').empty();

}

/************************************************/
/*	FUNCTION: SelectPhoneSite 					*/
/*  PARAMS: resType: id de la configuración		*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectERType(resType) {
    var cfgId = $('#DivConfigurations').data('idCFG');

    if (resType == 0)
        SelectSite(cfgId);
    else
        SelectExtResource(resType);
}

/************************************************/
/*	FUNCTION: SelectRadioExtResource 			*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectExtResource(resType) {
    $('#CBFacedSite').empty();
    $('#CBFacedGtw').empty();
    $('#CBFacedResources').empty();

    $('#rowSelectFResourceType').show();
    $('#CBFacedResourcesType option[value="-2"]').prop('selected', true);
    $('#rowSelectFSite').hide();
    $('#rowSelectFGtw').hide();

}

/************************************************/
/*	FUNCTION: SelectResourcesType 				*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectResourcesType(resType) {

    $('#FilterFResource').val('');
    $('#CBFacedResources').empty();

    if (resType == '4' || resType == '5') {
        $('#rowFilterFResource').show();
        $('#rowFilterFResourceBt').show();
        $('#CBFacedResources').empty();
        $('#BtnFindFilterRes').css('min-width', '');
    }
    else {
        $('#rowFilterFResource').hide();
        $('#rowFilterFResourceBt').hide();

        $.ajax({
            type: 'GET',
            url: '/externalResources/radio/' + resType
        })
            .done(function(data) {
                if (data.lista_recursos == null) {
                    var item = '<option value="0">No existen recursos...</option>';
                    $('#CBFacedResources').append(item);
                }
                else {
                    if (data.lista_recursos != null && data.lista_recursos.length > 0) {
                        $.each(data.lista_recursos, function(index, value) {
                            var item = '<option value="' + value.uri + '" tipo="' + value.tipo + '" title="' + value.uri + '">' + value.alias + '</option>';
                            $('#CBFacedResources').append(item);
                        });
                    }
                    SelectBtnsResources($("#CBFacedResources option:selected"));
                }
            });
    }
}

/************************************************/
/*	FUNCTION: FilterResourcesBy 				*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function FilterResourcesBy() {

    var filterType = parseInt($("#CBFacedResourcesType option:selected").val());
    var chars2Find = $('#FilterFResource').val();

    $('#CBFacedResources').empty();
    $.ajax({
        type: 'GET',
        url: '/externalResources/filterResources/' + filterType + '/' + chars2Find
    })
        .done(function(data) {
            if (data.lista_recursos == null) {
                var item = '<option value="0">No existen recursos...</option>';
                $('#CBFacedResources').append(item);
            }
            else {
                if (data.lista_recursos != null && data.lista_recursos.length > 0) {
                    $.each(data.lista_recursos, function(index, value) {
                        var item = '<option value="' + value.uri + '" tipo="' + value.tipo + '" title="' + value.uri + '">' + value.alias + '</option>';
                        $('#CBFacedResources').append(item);
                    });
                }
                SelectBtnsResources($("#CBFacedResources option:selected"));
            }
        });
}
/************************************************/
/*	FUNCTION: SelectSite 						*/
/*  PARAMS: cfgId: id de la configuración		*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectSite(cfgId) {
    $('#CBFacedSite').empty();
    $('#CBFacedGtw').empty();
    $('#CBFacedResources').empty();
    $('#rowSelectFSite').show();
    $('#rowSelectFGtw').show();
    $('#rowSelectFResourceType').hide();
    $('#rowFilterFResource').hide();
    $('#rowFilterFResourceBt').hide();


    $.ajax({
        type: 'GET',
        url: '/resources/remote/' + cfgId + '/null/null/null',
        success: function(data) {
            $('#CBFacedSite').empty(); $('#CBFacedSite').text('');
            $('#CBFacedGtw').empty(); $('#CBFacedGtw').text('');
            $('#CBFacedResources').empty(); $('#CBFacedResources').text('');

            if (data.data != null) {
                var numCfg = 0;
                var options = '<option value="" disabled selected>Seleccione emplazamiento</option>';

                $('#CBFacedSite').append(options);
                $.each(data.data, function(index, value) {
                    var encontrado = false;

                    if ($("#CBFacedSite option[value='" + value.eName + "']").length == 0) {
                        options = '<option value="' + value.idemplazamiento + '">' + value.eName + '</option>';
                        $('#CBFacedSite').append(options);
                    }
                });
            }
        }
    });
}

/************************************************/
/*	FUNCTION: SelectGtw 						*/
/*  PARAMS: siteId: id del emplazamiento		*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectGtw(siteId) {
    $.ajax({
        type: 'GET',
        url: '/resources/remote/null/' + siteId + '/null/null',
        success: function(data) {
            $('#CBFacedGtw').empty(); $('#CBFacedGtw').text('');
            $('#CBFacedResources').empty(); $('#CBFacedResources').text('');

            if (data.data != null) {
                var numCfg = 0;
                var options = '<option value="" disabled selected>Seleccione pasarela</option>';

                $('#CBFacedGtw').append(options);
                $.each(data.data, function(index, value) {
                    var encontrado = false;

                    if ($("#CBFacedGtw option[value='" + value.gName + "']").length == 0) {
                        options = '<option value="' + value.idpasarela + '">' + value.gName + '</option>';
                        $('#CBFacedGtw').append(options);
                    }
                });
            }
        }
    });
}
/************************************************/
/*	FUNCTION: SelectResource 					*/
/*  PARAMS: gtwId: id de la pasarela			*/
/*												*/
/*			***resId: id del recurso que no hay */
/*			que mostrar 						*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectResource(gtw) {

    var resId = $('#ResId').attr('res-id');

    $.ajax({
        type: 'GET',
        url: '/resources/remote/null/null/' + gtw + '/' + resId,
        success: function(data) {
            $('#CBFacedResources').empty(); $('#CBFacedResources').text('');

            if (data.data != null) {
                var numCfg = 0;
                var options = '<option value="" disabled selected>Seleccione recurso</option>';

                $('#CBFacedResources').append(options);
                $.each(data.data, function(index, value) {
                    var encontrado = false;

                    if ($("#CBFacedResources option[value='" + value.gIpv + "']").length == 0) {
                        options = '<option value="' + value.rName + '@' + value.gIpv + ':' +
                            value.puerto_sip + '">' + value.rName + '</option>';
                        $('#CBFacedResources').append(options);
                    }
                });
            }
        }
    });
}

function MakeFacedUri(target) {
    // if ($('#CBFacedCfg option:selected').val() == ""){
    // 	alertify.error('Seleccione configuración');
    // 	return;
    // }
    if ($('#CBFacedSite option:selected').val() == "") {
        alertify.error('Seleccione emplazamiento');
        return;
    }
    if ($('#CBFacedGtw option:selected').val() == "") {
        alertify.error('Seleccione pasarela');
        return;
    }
    if ($('#CBFacedResources option:selected').val() == "") {
        alertify.error('Seleccione recurso');
        return;
    }

    $(target).val($("#CBFacedResources option:selected").val());
}

/************************************/
/*	FUNCTION: SelectBtnsResources	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function SelectBtnsResources(element) {

    //0 Radio Tx || 1 Radio TxRx || 2 Radio Rx
    switch (element["0"].attributes[1].nodeValue) {
        case '0':
            $('#BtnSelectRxA1').addClass('NotAllowedTd');
            $('#BtnSelectRxA1').removeAttr("onclick");
            $('#BtnSelectRxB1').addClass('NotAllowedTd');
            $('#BtnSelectRxB1').removeAttr("onclick");
            $('#BtnSelectRxA2').addClass('NotAllowedTd');
            $('#BtnSelectRxA2').removeAttr("onclick");
            $('#BtnSelectRxB2').addClass('NotAllowedTd');
            $('#BtnSelectRxB2').removeAttr("onclick");
            $('#BtnSelectRxA3').addClass('NotAllowedTd');
            $('#BtnSelectRxA3').removeAttr("onclick");
            $('#BtnSelectRxB3').addClass('NotAllowedTd');
            $('#BtnSelectRxB3').removeAttr("onclick");

            $('#BtnSelectTxA1').removeClass('NotAllowedTd');
            $('#BtnSelectTxA1').attr('onclick', 'MakeFacedUri("#UriTxA1")');
            $('#BtnSelectTxB1').removeClass('NotAllowedTd');
            $('#BtnSelectTxB1').attr('onclick', 'MakeFacedUri("#UriTxB1")');
            $('#BtnSelectTxA2').removeClass('NotAllowedTd');
            $('#BtnSelectTxA2').attr('onclick', 'MakeFacedUri("#UriTxA2")');
            $('#BtnSelectTxB2').removeClass('NotAllowedTd');
            $('#BtnSelectTxB2').attr('onclick', 'MakeFacedUri("#UriTxB2")');
            $('#BtnSelectTxA3').removeClass('NotAllowedTd');
            $('#BtnSelectTxA3').attr('onclick', 'MakeFacedUri("#UriTxA3")');
            $('#BtnSelectTxB3').removeClass('NotAllowedTd');
            $('#BtnSelectTxB3').attr('onclick', 'MakeFacedUri("#UriTxB3")');
            break;
        case '1':
            $('#BtnSelectRxA1').removeClass('NotAllowedTd');
            $('#BtnSelectRxA1').attr('onclick', 'MakeFacedUri("#UriRxA1")');
            $('#BtnSelectRxB1').removeClass('NotAllowedTd');
            $('#BtnSelectRxB1').attr('onclick', 'MakeFacedUri("#UriRxB1")');
            $('#BtnSelectRxA2').removeClass('NotAllowedTd');
            $('#BtnSelectRxA2').attr('onclick', 'MakeFacedUri("#UriRxA2")');
            $('#BtnSelectRxB2').removeClass('NotAllowedTd');
            $('#BtnSelectRxB2').attr('onclick', 'MakeFacedUri("#UriRxB2")');
            $('#BtnSelectRxA3').removeClass('NotAllowedTd');
            $('#BtnSelectRxA3').attr('onclick', 'MakeFacedUri("#UriRxA3")');
            $('#BtnSelectRxB3').removeClass('NotAllowedTd');
            $('#BtnSelectRxB3').attr('onclick', 'MakeFacedUri("#UriRxB3")');

            $('#BtnSelectTxA1').removeClass('NotAllowedTd');
            $('#BtnSelectTxA1').attr('onclick', 'MakeFacedUri("#UriTxA1")');
            $('#BtnSelectTxB1').removeClass('NotAllowedTd');
            $('#BtnSelectTxB1').attr('onclick', 'MakeFacedUri("#UriTxB1")');
            $('#BtnSelectTxA2').removeClass('NotAllowedTd');
            $('#BtnSelectTxA2').attr('onclick', 'MakeFacedUri("#UriTxA2")');
            $('#BtnSelectTxB2').removeClass('NotAllowedTd');
            $('#BtnSelectTxB2').attr('onclick', 'MakeFacedUri("#UriTxB2")');
            $('#BtnSelectTxA3').removeClass('NotAllowedTd');
            $('#BtnSelectTxA3').attr('onclick', 'MakeFacedUri("#UriTxA3")');
            $('#BtnSelectTxB3').removeClass('NotAllowedTd');
            $('#BtnSelectTxB3').attr('onclick', 'MakeFacedUri("#UriTxB3")');
            break;
        case '2':
            $('#BtnSelectRxA1').removeClass('NotAllowedTd');
            $('#BtnSelectRxA1').attr('onclick', 'MakeFacedUri("#UriRxA1")');
            $('#BtnSelectRxB1').removeClass('NotAllowedTd');
            $('#BtnSelectRxB1').attr('onclick', 'MakeFacedUri("#UriRxB1")');
            $('#BtnSelectRxA2').removeClass('NotAllowedTd');
            $('#BtnSelectRxA2').attr('onclick', 'MakeFacedUri("#UriRxA2")');
            $('#BtnSelectRxB2').removeClass('NotAllowedTd');
            $('#BtnSelectRxB2').attr('onclick', 'MakeFacedUri("#UriRxB2")');
            $('#BtnSelectRxA3').removeClass('NotAllowedTd');
            $('#BtnSelectRxA3').attr('onclick', 'MakeFacedUri("#UriRxA3")');
            $('#BtnSelectRxB3').removeClass('NotAllowedTd');
            $('#BtnSelectRxB3').attr('onclick', 'MakeFacedUri("#UriRxB3")');

            $('#BtnSelectTxA1').addClass('NotAllowedTd');
            $('#BtnSelectTxA1').removeAttr("onclick");
            $('#BtnSelectTxB1').addClass('NotAllowedTd');
            $('#BtnSelectTxB1').removeAttr("onclick");
            $('#BtnSelectTxA2').addClass('NotAllowedTd');
            $('#BtnSelectTxA2').removeAttr("onclick");
            $('#BtnSelectTxB2').addClass('NotAllowedTd');
            $('#BtnSelectTxB2').removeAttr("onclick");
            $('#BtnSelectTxA3').addClass('NotAllowedTd');
            $('#BtnSelectTxA3').removeAttr("onclick");
            $('#BtnSelectTxB3').addClass('NotAllowedTd');
            $('#BtnSelectTxB3').removeAttr("onclick");
            break;
    }
}