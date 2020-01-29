var dataAtsRange = {};
dataAtsRange.ranks = [];
function ResetTelParameters() {
    $('#NameResource').text('Resource: ');

    // Ocultar tab de radio
    $('#ListMenuParameters li:nth-child(2)').hide();
    $('#ListMenuParameters li:nth-child(4)').hide();
    //  Mostrar tab de telefonia
    $('#ListMenuParameters li:nth-child(3)').show();

    //TODO esto está al reves?
    // Ocultar/Mostrar tab ATS dependiendo del tipo de recurso telefonico
    if ($('#LbTypeTel option:selected').val() == 3 ||
        $('#LbTypeTel option:selected').val() == 4)
        $('#ListMenuParameters li:nth-child(5)').hide();
    else
        $('#ListMenuParameters li:nth-child(5)').show();

    $('#CbAdAgc').prop('checked', false);
    $('#TbAdGain').val('0');
    $('#CbDaAgc').prop('checked', false);
    $('#TbDaGain').val('0');
    $('#GranularityRow').attr('style', 'display:table-column');

    // Parametros jitter
    $('#TbMin').val('0');
    $('#TbMax').val('0');

	/*
	$('#LbTypeTel option[value=0]').prop('selected', true);
	$('#LbLado option[value=0]').prop('selected', true);
	$('#LbEMType option[value=0]').prop('selected', true);
	$('#LbEMLado option[value=0]').prop('selected', true);
	$('#LbAtsModo option[value=0]').prop('selected', true);
	$('#CbResp').prop('checked',false);
	$('#LbWires option[value=0]').prop('selected', true);
	$('#TbNumText').val('');
	$('#TbSupTime').val('');
	*/
}

/************************************************/
/*	FUNCTION: GetRemoteTfnoResources 			*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function GetRemoteTfnoResources() {
    var options = '';


    $('#CBFacedTelType').empty();
    options = '<option value="" disabled selected>Seleccione tipo de recurso</option>';
    $('#CBFacedTelType').append(options);
    options = '<option value="0">Recursos configurados</option>';
    $('#CBFacedTelType').append(options);
    options = '<option value="1">Recursos externos</option>';
    $('#CBFacedTelType').append(options);

    $('#CBFacedTelSite').empty();
    $('#CBFacedTelGtw').empty();
    $('#CBFacedTelResources').empty();

}

/************************************************/
/*	FUNCTION: SelectPhoneSite 					*/
/*  PARAMS: resType: id de la configuración		*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectTelType(resType) {
    var cfgId = $('#DivConfigurations').data('idCFG');

    if (resType == 0)
        SelectPhoneSite(cfgId);
    else
        SelectPhoneExtResource();
}

/************************************************/
/*	FUNCTION: SelectPhoneExtResource 			*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectPhoneExtResource() {
    $('#CBFacedTelSite').empty();
    $('#CBFacedTelGtw').empty();
    $('#CBFacedTelResources').empty();

    $('#rowSelectTResourceType').show();
    $('#rowSelectTelSite').hide();
    $('#rowSelectTelGtw').hide();
    $('#CBFaced2ResourcesType option[value="-2"]').prop('selected', true);

	/*$.ajax({type: 'GET',
	url: '/externalResources/3'})
	.done(function(data) {
        if( data.lista_recursos == null) {
            var item = '<option value="0">No existen recursos...</option>';
            $('#CBFacedTelResources').append(item);
        }
        else {
            if (data.lista_recursos != null && data.lista_recursos.length > 0) {
                $.each(data.lista_recursos, function (index, value) {
                    var item = '<option value="' + value.uri + '">' + value.alias + '</option>';
                    $('#CBFacedTelResources').append(item);
                });
            }
        }
	});*/
}

/************************************************/
/*	FUNCTION: SelectPhResourcesType 			*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectPhResourcesType(option) {
    $('#CBFacedTelResources').empty();
    $('#FilterPhResource').val('');

    if (option == -1) { //Caso de buscar todos
        $('#rowFilterPhResource').hide();
        $('#rowFilterPhResourceBt').hide();
        $.ajax({
            type: 'GET',
            url: '/externalResources/3'
        })
            .done(function(data) {
                if (data.lista_recursos == null) {
                    var item = '<option value="0">No existen recursos...</option>';
                    $('#CBFacedTelResources').append(item);
                }
                else {
                    if (data.lista_recursos != null && data.lista_recursos.length > 0) {
                        $.each(data.lista_recursos, function(index, value) {
                            var item = '<option value="' + value.uri + '">' + value.alias + '</option>';
                            $('#CBFacedTelResources').append(item);
                        });
                    }
                }
            });
    }
    if (option == 4 || option == 5) {
        $('#rowFilterPhResource').show();
        $('#rowFilterPhResourceBt').show();
    }
}

/************************************************/
/*	FUNCTION: FilterResourcesBy 				*/
/*  PARAMS: 									*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function FilterPhResourcesBy() {

    var filterType = parseInt($("#CBFaced2ResourcesType option:selected").val());
    var chars2Find = $('#FilterPhResource').val();

    $('#CBFacedTelResources').empty();
    $.ajax({
        type: 'GET',
        url: '/externalResources/filterPhoneResources/' + filterType + '/' + chars2Find
    })
        .done(function(data) {
            if (data.lista_recursos == null) {
                var item = '<option value="0">No existen recursos...</option>';
                $('#CBFacedTelResources').append(item);
            }
            else {
                if (data.lista_recursos != null && data.lista_recursos.length > 0) {
                    $.each(data.lista_recursos, function(index, value) {
                        var item = '<option value="' + value.uri + '" tipo="' + value.tipo + '" title="' + value.uri + '">' + value.alias + '</option>';
                        $('#CBFacedTelResources').append(item);
                    });
                }
            }
        });
}
/************************************************/
/*	FUNCTION: SelectPhoneSite 					*/
/*  PARAMS: cfgId: id de la configuración		*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
function SelectPhoneSite(cfgId) {
    $('#CBFacedTelSite').empty();
    $('#CBFacedTelGtw').empty();
    $('#CBFacedTelResources').empty();
    $('#rowSelectTelSite').show();
    $('#rowSelectTelGtw').show();
    $('#rowSelectTResourceType').hide();
    $('#rowFilterPhResource').hide();
    $('#rowFilterPhResourceBt').hide();

    $.ajax({
        type: 'GET',
        url: '/resources/remote/' + cfgId + '/null/null/null',
        success: function(data) {
            $('#CBFacedTelSite').empty(); $('#CBFacedTelSite').text('');
            $('#CBFacedTelGtw').empty(); $('#CBFacedTelGtw').text('');
            $('#CBFacedTelResources').empty(); $('#CBFacedTelResources').text('');

            if (data.data != null) {
                var numCfg = 0;
                var options = '<option value="" disabled selected>Seleccione emplazamiento</option>';

                $('#CBFacedTelSite').append(options);
                $.each(data.data, function(index, value) {
                    var encontrado = false;

                    if ($("#CBFacedTelSite option[value='" + value.eName + "']").length == 0) {
                        options = '<option value="' + value.idemplazamiento + '">' + value.eName + '</option>';
                        $('#CBFacedTelSite').append(options);
                    }
                });
            }
        }
    });
}

function ShowOptions(tipo) {
    $('.BL').attr('style', 'display:none');
    $('.BC').attr('style', 'display:none');
    $('.AB').attr('style', 'display:none');
    $('.ATS').attr('style', 'display:none');
    $('.LCEN').attr('style', 'display:none');
    $('.EyM').attr('style', 'display:none');
    $('.QSIG').attr('style', 'display:none');
    $('#ListMenuParameters li:nth-child(6)').hide();
    $('#ReleaseRow').hide();

    switch (tipo) {
        case '0': //BL	
            $('.BL').attr('style', 'display:table-row');
            $('#CbVox').prop('checked', true);
            $('#CbVox').prop('disabled', true);
            $('#TbUmbral').prop('disabled', false);
            $('#TbInactividad').prop('disabled', false);
            break;
        case '1':   // BC
            $('.BC').attr('style', 'display:table-row');
            break;
        case '2': // AB
            $('.AB').attr('style', 'display:table-row');
            break;
		/*case '1':// BC
			$('.BL').attr('style','display:table-row');
			$('#CbVox').prop('disabled',false);
			$('#TbUmbral').prop('disabled',CbVox.checked ? false : 'disabled');
			$('#TbInactividad').prop('disabled',CbVox.checked ? false : 'disabled');
			break;*/
        case '3': 	// R2
            if ($('#CbOptionsSupervision').prop('checked'))
                $('#ReleaseRow').show();
            $('.ATS').attr('style', 'display:table-row');
            $('#ListMenuParameters li:nth-child(6)').show();
            if ($('#CbOptionsSupervision').prop('checked'))
                $('#ReleaseRow').show();
            break;
        case '4': 	// N5
            $('.ATS').attr('style', 'display:table-row');
            $('#ListMenuParameters li:nth-child(6)').show();
            if ($('#CbOptionsSupervision').prop('checked'))
                $('#ReleaseRow').show();
            break;
        case '5': 	// LCEN
            $('.LCEN').attr('style', 'display:table-row');
            if ($('#CbOptionsSupervision').prop('checked'))
                $('#ReleaseRow').show();
            break;
        case '6': 	// QSIG
            $('.QSIG').attr('style', 'display:table-row');
            break;
    }
}

function OnChangeType(sel) {
    ShowOptions(sel.value);
}

function AddPhoneParameters() {
    var hw = {
        RECURSO_idRECURSO: $('#DivParameters').data('idRecurso'),
        AD_AGC: $('#CbAdAgc').prop('checked') ? '1' : '0',
        AD_Gain: $('#TbAdGain').val() == '' ? 0 : parseFloat($('#TbAdGain').val()) * 10,
        DA_AGC: $('#CbDaAgc').prop('checked') ? '1' : '0',
        DA_Gain: $('#TbDaGain').val() == '' ? 0 : parseFloat($('#TbDaGain').val()) * 10
    };
    var tf = {
        RECURSO_idRECURSO: $('#DivParameters').data('idRecurso'),
        tipo: $('#LbTypeTel option:selected').val(),
        lado: $('#LbLado option:selected').val(),
        t_eym: $('#LbEMType option:selected').val(),
        ladoeym: $('#LbEMLado option:selected').val(),
        modo: '0', //$('#LbAtsModo option:selected').val(),
        r_automatica: $('#CbResp').prop('checked') ? '1' : '0',
        h2h4: $('#LbWires option:selected').val(),
        no_test_remoto: $('#TbRemoteNumText').val(),
        no_test_local: $('#TbLocalNumText').val(),
        it_release: $('#TbOptionsInterval').val() == '' ? 0 : $('#TbOptionsInterval').val(),
        uri_remota: $('#TbRemoteUri').val().length > 0 ? 'sip:' + $('#TbRemoteUri').val() : $('#TbRemoteUri').val(),
        detect_vox: $('#CbVox').prop('checked') ? '1' : '0',
        umbral_vox: $('#TbUmbral').val() == '' ? -15 : $('#TbUmbral').val(),
        tm_inactividad: $('#TbInactividad').val() == '' ? 0 : $('#TbInactividad').val(),
        superv_options: $('#CbOptionsSupervision').prop('checked') ? '1' : '0',
        tm_superv_options: $('#TbReleaseTime option:selected').val(),
        colateral_scv: $('#LbDestinationType option:selected').val(),
        iT_Int_Warning: $('#CbInterruptToneTime option:selected').val()
    };
    var jitter = {
        RECURSO_idRECURSO: $('#DivParameters').data('idRecurso'),
        min: $('#TbMin').val(),
        max: $('#TbMax').val()
    };

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: '/resources/' + $('#DivParameters').data('idRecurso') + '/phoneParameters',
        data: JSON.stringify({
            // Parámetros Hw
            "hw": hw,
            // Parámetros telefonia
            "tf": tf,
            // Jitter
            "jt": jitter
        }),
        success: function(data) {
            if (data.error == null) {
                GenerateHistoricEvent(ID_HW, MODIFY_HARDWARE_RESOURCE_LOGIC_PARAM, $('#TbNameResource').val(), $('#loggedUser').text());
                //alert ('Telephone parameters was been updated successfully.')
            }
            Close();
        }
    });
}
/********************************************/
/*	FUNCTION: AddRange 						*/
/*  PARAMS: 								*/
/*  REV 1.0.2 VMG							*/
/********************************************/
function AddRange(item, origin) {
    var inicial = '';
    var final = '';

    var index = item.parentElement.parentElement.rowIndex;

    if (origin) {
        // Inicio
        inicial = $('#rangeAtsOrigin tr:nth-child(' + (index + 1) + ') td:nth-child(1) input').val();

        // Fin
        final = $('#rangeAtsOrigin tr:nth-child(' + (index + 1) + ') td:nth-child(2) input').val();
    }
    else {
        // Inicio
        inicial = $('#rangeAtsDestination tr:nth-child(' + (index + 1) + ') td:nth-child(1) input').val();

        // Fin
        final = $('#rangeAtsDestination tr:nth-child(' + (index + 1) + ') td:nth-child(2) input').val();
    }


    if (inicial != '' && final == '') {
        final = inicial;
    }

    if (inicial == '' && final != '') {
        inicial = final;
    }

    if ((inicial != '' && final != '') &&
        (inicial <= final)) {
        var ranks = null;
        if (origin)
            ranks = { idRANGOS: '1', origen: 1, inicial: inicial, final: final, tipo: 1 };
        else
            ranks = { idRANGOS: '1', origen: 0, inicial: inicial, final: final, tipo: 0 };

        dataAtsRange.ranks.push(ranks);
		/*$.ajax({type: 'POST',
			dataType: 'json',
			contentType:'application/json',
			url: '/resources/' + $('#DivParameters').data('idRecurso') + '/phoneParameters/range',
			data: JSON.stringify({
				origen: origin,
				inicial: inicial,
				final: final
			}),
			success: function (data){
				if (data.error == null){
					GenerateHistoricEvent(ID_HW,MODIFY_ATS_ROUTES,$('#TbNameResource').val(),$('#loggedUser').text());
					alertify.success('Rango ATS añadido.');
					GetAtsRange($('#DivParameters').data('idRecurso'));
				}
			}
		});*/
    }
    else {
        alertify.error('Rango ATS incorrecto.');
    }
    ShowRangeAts();
}



function UpdateRank(index, origen) {
    var inicial = '';
    var final = '';
    var idRango = '';

    if (origen) {
        // Inicio
        inicial = $('#rangeAtsOrigin tr:nth-child(' + (index) + ') td:nth-child(1) input').val();

        // Fin
        final = $('#rangeAtsOrigin tr:nth-child(' + (index) + ') td:nth-child(2) input').val();

        idRango = $('#rangeAtsOrigin tr:nth-child(' + (index) + ')').data('idrango');
    }
    else {
        // Inicio
        inicial = $('#rangeAtsDestination tr:nth-child(' + (index) + ') td:nth-child(1) input').val();

        // Fin
        final = $('#rangeAtsDestination tr:nth-child(' + (index) + ') td:nth-child(2) input').val();

        idRango = $('#rangeAtsDestination tr:nth-child(' + (index) + ')').data('idrango');
    }

    var regx_atsval = /^[2-3][0-9]{5}$/;
    var matchValinicial = inicial.match(regx_atsval);
    var matchValfinal = final.match(regx_atsval);

    if (inicial != '' && final == '') {
        final = inicial;
    }

    if (inicial == '' && final != '') {
        inicial = final;
    }

    if ((inicial != '' && final != '') &&
        (inicial <= final) &&
        ((matchValinicial != null) || (matchValfinal != null))) {
        var ranks = null;
        if (origen)
            ranks = { idRANGOS: '1', origen: 1, inicial: inicial, final: final, tipo: 1 };
        else
            ranks = { idRANGOS: '1', origen: 0, inicial: inicial, final: final, tipo: 0 };

        dataAtsRange.ranks.push(ranks);
        RemoveRank(idRango, origen);
		/*$.ajax({type: 'PUT',
				dataType: 'json', 
				contentType:'application/json',
				url: '/resources/' + $('#DivParameters').data('idRecurso') + '/phoneParameters/range', 
				data: JSON.stringify({
					idRangos: idRango,
					origen: origen,
					inicial: inicial,
					final: final
				}),
				success: function (data){
					if (data.error == null){
						GenerateHistoricEvent(ID_HW,MODIFY_ATS_ROUTES,$('#TbNameResource').val(),$('#loggedUser').text());
						alertify.success('Rango ATS actualizado.');
						GetAtsRange($('#DivParameters').data('idRecurso'));
					}
				}
		});*/
    }
    else {
        if (origen) {
            $('#rangeAtsOrigin tr:nth-child(' + (index) + ') td:nth-child(1) input').val($('#rangeAtsOrigin tr:nth-child(' + (index) + ') td:nth-child(1) input')[0].defaultValue);
            $('#rangeAtsOrigin tr:nth-child(' + (index) + ') td:nth-child(2) input').val($('#rangeAtsOrigin tr:nth-child(' + (index) + ') td:nth-child(2) input')[0].defaultValue);
        }
        else {
            $('#rangeAtsDestination tr:nth-child(' + (index) + ') td:nth-child(1) input').val($('#rangeAtsDestination tr:nth-child(' + (index) + ') td:nth-child(1) input')[0].defaultValue);
            $('#rangeAtsDestination tr:nth-child(' + (index) + ') td:nth-child(2) input').val($('#rangeAtsDestination tr:nth-child(' + (index) + ') td:nth-child(2) input')[0].defaultValue);
        }

        alertify.error('Rango ATS incorrecto.');
    }
    ShowRangeAts();
}

function RemoveRank(index, origen) {
    var idRango;

    if (origen) {
        idRango = $('#rangeAtsOrigin tr:nth-child(' + (index) + ')').data('idrango');
        $('#rangeAtsOrigin tr:nth-child(' + (index) + ')').remove();
    }
    else {
        idRango = $('#rangeAtsDestination tr:nth-child(' + (index) + ')').data('idrango');
        $('#rangeAtsDestination tr:nth-child(' + (index) + ')').remove();
    }


	/*$.ajax({type: 'DELETE',
			url: '/resources/' + $('#DivParameters').data('idRecurso') + '/phoneParameters/range/' + idRango, 
			success: function (data){
				if (data.error == null){
					GenerateHistoricEvent(ID_HW,MODIFY_ATS_ROUTES,$('#TbNameResource').val(),$('#loggedUser').text());
					alertify.success('Rango ATS eliminado.');
					GetAtsRange($('#DivParameters').data('idRecurso'));
				}
			}
	});*/
}

function OnVoxDetection(cb) {
    if (cb.checked) {
        $('#TbUmbral').prop('disabled', false);
        $('#TbInactividad').prop('disabled', false);
    }
    else {
        $('#TbUmbral').prop('disabled', 'disabled');
        $('#TbInactividad').prop('disabled', 'disabled');
    }
}

function OnClickSupervision(cb) {
    if (cb.checked)
        $('#ReleaseRow').show();
    else
        $('#ReleaseRow').hide();
}
function OnClickPeriodoRespuesta(cb) {
    if (cb.checked)
        $('#OptionsIntervalRow').show();
    else
        $('#OptionsIntervalRow').hide();
}
/****************************************/
/*	FUNCTION: GetTelephonicResources 	*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function GetTelephonicResources() {
    var cfgName = $('#name').val();

    $('#CBFacedTelSite').empty();
    $('#CBFacedTelGtw').empty();
    $('#CBFacedTelResources').empty();

    SelectTelSite(cfgName);

	/*$.ajax({type: 'GET', 
		url: '/resources/tel/null/null/null',
		success: function(data){
			$('#CBFacedTelCfg').empty();
			$('#CBFacedTelSite').empty();
			$('#CBFacedTelGtw').empty();
			$('#CBFacedTelResources').empty();

			if (data.data != null){
			    var numCfg = 0;
			    var options = '<option value="" disabled selected>Seleccione configuración</option>';

				$('#CBFacedTelCfg').append(options);
				$.each(data.data, function(index, value){
					var encontrado = false;

					if ($("#CBFacedTelCfg option[value='" + value.cfName + "']").length == 0){
						options = '<option value="' + value.cfName + '">' + value.cfName + '</option>';
						$('#CBFacedTelCfg').append(options);
					}
				})
				
			}
		}
	});*/
}

/****************************************/
/*	FUNCTION: SelectTelSite 			*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function SelectTelSite(cfgName) {
    $.ajax({
        type: 'GET',
        url: '/resources/tel/' + cfgName + '/null/null',
        success: function(data) {
            $('#CBFacedTelSite').empty(); $('#CBFacedTelSite').text('');
            $('#CBFacedTelGtw').empty(); $('#CBFacedTelGtw').text('');
            $('#CBFacedTelResources').empty(); $('#CBFacedTelResources').text('');

            if (data.data != null) {
                var numCfg = 0;
                var options = '<option value="" disabled selected>Seleccione emplazamiento</option>';

                $('#CBFacedTelSite').append(options);
                $.each(data.data, function(index, value) {
                    var encontrado = false;

                    if ($("#CBFacedTelSite option[value='" + value.eName + "']").length == 0) {
                        options = '<option value="' + value.eName + '">' + value.eName + '</option>';
                        $('#CBFacedTelSite').append(options);
                    }
                });
            }
        }
    });
}

/****************************************/
/*	FUNCTION: SelectTelGtw 				*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function SelectTelGtw(cfgName, site) {
    $.ajax({
        type: 'GET',
        url: '/resources/tel/' + cfgName + '/' + site + '/null/null',
        success: function(data) {
            $('#CBFacedTelGtw').empty(); $('#CBFacedTelGtw').text('');
            $('#CBFacedTelResources').empty(); $('#CBFacedTelResources').text('');

            if (data.data != null) {
                var numCfg = 0;
                var options = '<option value="" disabled selected>Seleccione pasarela</option>';

                $('#CBFacedTelGtw').append(options);
                $.each(data.data, function(index, value) {
                    var encontrado = false;

                    if ($("#CBFacedTelGtw option[value='" + value.idpasarela + "']").length == 0) {
                        options = '<option value="' + value.idpasarela + '">' + value.gName + '</option>';
                        $('#CBFacedTelGtw').append(options);
                    }
                });
            }
        }
    });
}

/****************************************/
/*	FUNCTION: SelectTelGtw 				*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function SelectTelResource(cfgName, site, gtw) {
    var buttonText = $('#ButtonCommit')[0].outerHTML;

    var splitIndex = buttonText.search('InsertNewResource');
    var subString = buttonText.substring(splitIndex, buttonText.length);
    var array = subString.split(',');
    var radioId = array[1].replace(/\'/g, '');
    //Mandamos el id del recurso actual para no sacarlo en la lista
    $.ajax({
        type: 'GET',
        url: '/resources/tel/' + cfgName + '/' + site + '/' + gtw + '/' + radioId,
        success: function(data) {
            $('#CBFacedTelResources').empty(); $('#CBFacedTelResources').text('');

            if (data.data != null) {
                var numCfg = 0;
                var options = '<option value="" disabled selected>Seleccione recurso</option>';

                $('#CBFacedTelResources').append(options);
                $.each(data.data, function(index, value) {
                    var encontrado = false;

                    if ($("#CBFacedTelResources option[value='" + value.gIpv + "']").length == 0) {
                        options = '<option value="' + value.rName + '@' + value.gIpv + '">' + value.rName + '</option>';
                        $('#CBFacedTelResources').append(options);
                    }
                });
            }
        }
    });
}

function MakeFacedTelUri(target) {
	/*if ($('#CBFacedTelCfg option:selected').val() == ""){
		alertify.error('Seleccione configuración');
		return;
	}*/
    if ($('#CBFacedTelSite option:selected').val() == "") {
        alertify.error('Seleccione emplazamiento');
        return;
    }
    if ($('#CBFacedTelGtw option:selected').val() == "") {
        alertify.error('Seleccione pasarela');
        return;
    }
    if ($('#CBFacedTelResources option:selected').val() == "") {
        alertify.error('Seleccione recurso');
        return;
    }

    $(target).val($("#CBFacedTelResources option:selected").val());
}