var dataOfResource = null;
var listOfGateways = '';
var totalRecursos = 0;
var cicloCompleto = 0;

var listaUris = [];
var cgwModified = false;
var resModified = false;
/******************************************************************************************************/
/****** Module: gateways.js												*******************************/
/****** Description: Módulo de soporte a la gestion de pasarelas		*******************************/
/******************************************************************************************************/
var link_enlaces = [];
var link_enlaces_libres = [];

/** 20170518 AGL Devuelve la CFG propia de la lista de emplazamientos */
function Site2Config(mySite, sites) {
    var cfgName = "";
    $.each(sites, function(index, value) {
        if (mySite == sites[index].idEMPLAZAMIENTO) {
            cfgName = sites[index].nameCfg;
        }
    });
    return cfgName;
}

/************************************/
/*	FUNCTION: Copy 					*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var Copy = function() {
    if ($('#nameCopyGw').val().length > 0) {
        var regx_idval = /^[a-zA-Z0-9\-_.]{1,32}$/;
        var match = $('#nameCopyGw').val().match(regx_idval);
        if (match != null) {
            if ($('#ipCopyCpu0').val().length > 0) {
                if ($('#ipCopyCpu1').val().length > 0) {
                    if ($('#IpvCopyGateway').val().length > 0) {
                        if ($('#ipCopyCpu0').val() != $('#ipCopyCpu1').val()) {
                            CopyMethodGateway($('#DivGateways').data('idCgw'), $('#nameCopyGw').val(),
                                $('#ipCopyCpu0').val(), $('#ipCopyCpu1').val(), $('#IpvCopyGateway').val());
                        }
                        else
                            alertify.error('Los valores para la CPU0 y la CPU1 deben ser diferentes.');
                    }
                    else
                        alertify.error('El valor de la Ip virtual no puede ser vacío.');
                }
                else
                    alertify.error('El valor de la Ip para la CPU1 no puede ser vacío.');
            }
            else
                alertify.error('El valor de la Ip para la CPU0 no puede ser vacío.');
        }
        else
            alertify.error('Identificador de la configuración no válido. No se pueden usar caracteres especiales como ?,-,@,...');
    }
    else
        alertify.error('El identificador de la pasarela no puede ser vacío.');

    CloseCopy();
};

/************************************/
/*	FUNCTION: PostGateWay 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function PostGateWay(idSite, isUpdate, isChangeSite) {

    console.log('SPPE <= ', $('#sppe').val());
    console.log('DVRRP <= ', $('#dvrrp').val());

    var newGateway = {};
    var proxys = [];
    var registrars = [];
    var traps = [];
    var listServers = [];

    ///////////////////////////
    //PESTAÑA GENERAL
    if ($('#nameGw').val() == '') {
        translateWord('ErrorGatewayHaveNoName', function(result) {
            alertify.error(result);
        });
        return;
    }
    if ($('#ipv').val() == '') {
        translateWord('ErrorGatewayHaveNoIP', function(result) {
            alertify.error(result);
        });
        return;
    }
    //CPU 0
    if ($('#ipb1').val() == '') {
        translateWord('ErrorIPCPU', function(result) {
            alertify.error(result + " 0");
        });
        return;
    }
    if ($('#ipg1').val() == '') {
        translateWord('ErrorIPGateway', function(result) {
            alertify.error(result + " 0");
        });
        return;
    }
    if ($('#msb1').val() == '') {
        translateWord('ErrorCPUMask', function(result) {
            alertify.error(result + " 0");
        });
        return;
    }
    if ($('#dual').prop('checked')) {
        //CPU 1
        if ($('#ipb2').val() == '') {
            translateWord('ErrorIPCPU', function(result) {
                alertify.error(result + " 1");
            });
            return;
        }
        if ($('#ipg2').val() == '') {
            translateWord('ErrorIPGateway', function(result) {
                alertify.error(result + " 1");
            });
            return;
        }
        if ($('#msb2').val() == '') {
            translateWord('ErrorCPUMask', function(result) {
                alertify.error(result + " 1");
            });
            return;
        }
        if ($('#ipb1').val() == $('#ipb2').val() && $('#ipb1').val() != '') {
            translateWord('ErrorEqualCPUIp', function(result) {
                alertify.error(result);
            });
            return;
        }
    }
    ///////////////////////////
    //PESTAÑA SERVICIOS
    //SIP
    // Proxy list
    $('#ProxysList option').each(function() {
        var selected = $("#ProxysList option:selected").val() == $(this).val();
        proxys.push({ 'ip': $(this).val(), 'selected': selected });
    });
    // Registrars list
    $('#RegistrarsList option').each(function() {
        var selected = $("#RegistrarsList option:selected").val() == $(this).val();
        registrars.push({ 'ip': $(this).val(), 'selected': selected });
    });
    //SINCRONIZACION
    //Ntp
    $('#NtpServersList option').each(function() {
        var selected = $("#NtpServersList option:selected").val() == $(this).val();
        listServers.push({ 'ip': $(this).val(), 'selected': selected });
    });
    //SNMP
    //Aquí ponemos el text porque parseamos las ips luego en modo 1,2.2.2.2/345 y el
    //	value una vez las guarda así (en la creación) y en el update guarda solo la ip :S
    // Traps list
    $('#TrapsList option').each(function() {
        traps.push($(this).text());
    });
    //WEB
    //GRABACION

    //Insertamos los datos
    //GENERAL
    newGateway.nombre = $('#nameGw').val();
    newGateway.ipv = $('#ipv').val();
    newGateway.ipb1 = $('#ipb1').val();
    newGateway.ipg1 = $('#ipg1').val();
    newGateway.msb1 = $('#msb1').val();
    newGateway.ipb2 = $('#ipb2').val();
    newGateway.ipg2 = $('#ipg2').val();
    newGateway.msb2 = $('#msb2').val();
    newGateway.sppe = parseInt($('#sppe').val());
    newGateway.dvrrp = parseInt($('#dvrrp').val());
    //SIP
    newGateway.PuertoLocalSIP = $('#PuertoLocalSIP').val();//Fixed
    newGateway.proxys = proxys;
    newGateway.registrars = registrars;

    newGateway.periodo_supervision = $('#TbUpdatePeriod').val();
    //SINCRONIZACION
    newGateway.listServers = listServers;
    //SNMP
    newGateway.puerto_servicio_snmp = $('#sport').val();
    newGateway.puerto_snmp = $('#snmpp').val();
    if ($('#agv2').prop('checked')) {
        newGateway.snmpv2 = 1;
        newGateway.comunidad_snmp = $('#agcomm').val();
    }
    else {
        newGateway.snmpv2 = 0;
        newGateway.comunidad_snmp = $('#agcomm').val();
    }
    newGateway.traps = traps;
    //WEB
    newGateway.puerto_servicio_web = $('#wport').val();
    newGateway.tiempo_sesion = $('#stime').val();
    //GRABACION
    newGateway.puerto_rtsp = $('#rtsp_port').val();
    newGateway.servidor_rtsp = $('#rtsp_ip').val();
    newGateway.servidor_rtspb = $('#rtspb_ip').val();

    if (newGateway.ipv == newGateway.ipb1) {
        alertify.error('La Ip Virtual y la de la CPU0 tienen que ser distintas.');
        return;
    }
    if (newGateway.ipv == newGateway.ipb2) {
        alertify.error('La Ip Virtual y la de la CPU1 tienen que ser distintas.');
        return;
    }
    if (!isChangeSite) {
        var idUpdatedCgw = 'noData';
        if (isUpdate)
            idUpdatedCgw = $('#DivGateways').data('idCgw');

        if (typeof ($('#DivConfigurations').data('idCFG')) != 'undefined') {
            var regx_ipval = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

            var matchIp = newGateway.ipv.match(regx_ipval);
            if (newGateway.ipv != '' && matchIp == null) {
                alertify.error('La Ip Virtual no es válida.');
                return;
            }
            matchIp = newGateway.ipb1.match(regx_ipval);
            if (newGateway.ipb1 != '' && matchIp == null) {
                alertify.error('La Ip de la CPU0 no es válida.');
                return;
            }
            matchIp = newGateway.ipb2.match(regx_ipval);
            if (newGateway.ipb2 != '' && matchIp == null) {
                alertify.error('La Ip de la CPU1 no es válida.');
                return;
            }
            //IPV
            $.ajax({
                type: 'GET',
                url: '/gateways/checkipaddr/' + newGateway.ipv + '/' + $('#DivConfigurations').data('idCFG') + '/' + idUpdatedCgw,
                success: function(data) {
                    if (data == "IP_DUP") {
                        alertify.error('La dirección ip: ' + newGateway.ipv + ' ya se encuentra dada de alta en esta configuración.');
                        return;
                    }
                    else {
                        //IPB1
                        $.ajax({
                            type: 'GET',
                            url: '/gateways/checkipaddr/' + newGateway.ipb1 + '/' + $('#DivConfigurations').data('idCFG') + '/' + idUpdatedCgw,
                            success: function(data) {
                                if (data == "IP_DUP") {
                                    alertify.error('La dirección ip: ' + newGateway.ipb1 + ' ya se encuentra dada de alta en esta configuración.');
                                    return;
                                }
                                else {
                                    //IPB2
                                    $.ajax({
                                        type: 'GET',
                                        url: '/gateways/checkipaddr/' + newGateway.ipb2 + '/' + $('#DivConfigurations').data('idCFG') + '/' + idUpdatedCgw,
                                        success: function(data) {
                                            if (data == "IP_DUP") {
                                                alertify.error('La dirección ip: ' + newGateway.ipb2 + ' ya se encuentra dada de alta en esta configuración.');
                                                return;
                                            }
                                            else {
                                                //Nombre
                                                $.ajax({
                                                    type: 'GET',
                                                    url: '/gateways/checkgtwname/' + newGateway.nombre + '/' + $('#DivConfigurations').data('idCFG') + '/' + idUpdatedCgw,
                                                    success: function(data) {
                                                        if (data == "NAME_DUP") {
                                                            alertify.error('El identificador de pasarela: ' + newGateway.nombre + ' ya se encuentra dado de alta en esta configuración.');
                                                            return;
                                                        }
                                                        else {
                                                            //Nueva Pasarela
                                                            if (isUpdate == false) {
                                                                $.ajax({
                                                                    type: 'POST',
                                                                    dataType: 'json',
                                                                    contentType: 'application/json',
                                                                    url: '/gateways/createNewGateway/:newGateway/:idSite',
                                                                    data: JSON.stringify({
                                                                        "newGateway": newGateway,
                                                                        "idSite": idSite
                                                                    }
                                                                    ),
                                                                    success: function(data) {
                                                                        if (data.error == null) {
                                                                            alertify.success('La pasarela \"' + data.name + '\" ha sido creada.');
                                                                            GenerateHistoricEvent(ID_HW, ADD_GATEWAY, $('#nameGw').val(), $('#loggedUser').text());
                                                                            ShowSite($('#IdSite').val(), $('#IdSite').data('idSite'));
                                                                            /** 20190213 Solo se activará el boton si se modifica la configuracion activa */
                                                                            cgwModified = data.aplicarcambios && data.aplicarcambios != 0/* true*/;
                                                                            console.log(data);
                                                                            //GetGateways(null,function(){
                                                                            //	ShowHardwareGateway(data.insertId, data.name);
                                                                            //});//TODO esto no muestra nada de lo que tiene que mostrar
                                                                        }
                                                                        else if (data.error) {
                                                                            alertify.error('Error: ' + data.error);
                                                                        }
                                                                    },
                                                                    error: function(data) {
                                                                        alertify.error('Error creando la pasarela.');
                                                                    }
                                                                });
                                                            }
                                                            //Modifica Pasarela
                                                            else {
                                                                var idGtw = $('#DivGateways').data('idCgw');
                                                                $.ajax({
                                                                    type: 'POST',
                                                                    dataType: 'json',
                                                                    contentType: 'application/json',
                                                                    url: '/gateways/updateGateway/:newGateway/:idGtw',
                                                                    data: JSON.stringify({
                                                                        "newGateway": newGateway,
                                                                        "idGtw": idGtw
                                                                    }
                                                                    ),
                                                                    success: function(data) {
                                                                        if (data.error == null) {
                                                                            alertify.success('La pasarela \"' + data.name + '\" ha sido modificada!.');
                                                                            GenerateHistoricEvent(ID_HW, MODIFY_GATEWAY_COMMON_PARAM, $('#nameGw').val(), $('#loggedUser').text());
                                                                            ShowSite($('#IdSite').val(), $('#IdSite').data('idSite'));
                                                                            /** 20190213 Solo se activará el boton si se modifica la configuracion activa */
                                                                            cgwModified = data.aplicarcambios && data.aplicarcambios != 0/* true*/;
                                                                            console.log(data);
                                                                            //GetGateways(null,function(){
                                                                            //	ShowHardwareGateway(data.insertId, data.name);
                                                                            //});//TODO esto no muestra nada de lo que tiene que mostrar
                                                                            //AddGatewayToList(idGtw);
                                                                        }
                                                                        else if (data.error) {
                                                                            alertify.error('Error: ' + data.error);
                                                                        }
                                                                    },
                                                                    error: function(data) {
                                                                        alertify.error('Error modificando la pasarela.');
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    },
                                                    error: function(data) {
                                                        alertify.error('Error al comprobar los identificadores existentes en el sistema.');
                                                        return;
                                                    }
                                                });
                                            }
                                        },
                                        error: function(data) {
                                            alertify.error('Error al comprobar las direcciones ip existentes en el sistema.');
                                            return;
                                        }
                                    });
                                }
                            },
                            error: function(data) {
                                alertify.error('Error al comprobar las direcciones ip existentes en el sistema.');
                                return;
                            }
                        });
                    }
                },
                error: function(data) {
                    alertify.error('Error al comprobar las direcciones ip existentes en el sistema.');
                    return;
                }
            });


        }
        else {
            alertify.error('Error al comprobar las direcciones ip existentes en el sistema.');
            return;
        }
    }
    else {
        var idGtw = $('#DivGateways').data('idCgw');
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            url: '/gateways/updateGateway/:newGateway/:idGtw',
            data: JSON.stringify({
                "newGateway": newGateway,
                "idGtw": idGtw
            }
            ),
            success: function(data) {
                if (data.error == null) {
                    alertify.success('La pasarela \"' + data.name + '\" ha sido modificada.');
                    GenerateHistoricEvent(ID_HW, MODIFY_GATEWAY_COMMON_PARAM, $('#nameGw').val(), $('#loggedUser').text());
                    ShowSite($('#IdSite').val(), $('#IdSite').data('idSite'));
                    /** 20190213 Solo se activará el boton si se modifica la configuracion activa */
                    cgwModified = data.aplicarcambios && data.aplicarcambios != 0/* true*/;
                    console.log(data);
                    //GetGateways(null,function(){
                    //	ShowHardwareGateway(data.insertId, data.name);
                    //});//TODO esto no muestra nada de lo que tiene que mostrar
                    //AddGatewayToList(idGtw);
                }
                else if (data.error) {
                    alertify.error('Error: ' + data.error);
                }
            },
            error: function(data) {
                alertify.error('Error modificando la pasarela.');
            }
        });
    }
}

/************************************/
/*	FUNCTION: ChangeGateWaySite 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var ChangeGateWaySite = function(data) {
    var oldIndex = data[data.oldValue].value;
    var newIndex = data[data.selectedIndex].value;
    var idCgw = $('#DivGateways').data('idCgw');
    var oldEmpl = data[data.oldValue].outerText;
    var newEmpl = data[data.selectedIndex].outerText;
    var ipb1 = '';
    if ($('#ipb1')['0'].oldValue == null)
        ipb1 = $('#ipb1').val();
    else
        ipb1 = $('#ipb1')['0'].oldValue;

    var ipb2 = '';
    if ($('#ipb2')['0'].oldValue == null)
        ipb2 = $('#ipb2').val();
    else
        ipb2 = $('#ipb2')['0'].oldValue;

    $.ajax({
        type: 'GET',
        //url: '/gateways/' + $('#Component').text() + '/services/' + serviceId,
        url: '/gateways/checkipaddr4changesite/' + ipb1 + '/' + ipb2 + '/' + newIndex,
        success: function(data) {
            if (data == "IP_DUP_1") {
                $('#ListSites option[value="' + oldIndex + '"]').prop('selected', true);
                alertify.error('La dirección ip: ' + ipb1 + ' ya se encuentra dada de alta en el emplazamiento de destino.');
            }
            else if (data == "IP_DUP_2") {
                $('#ListSites option[value="' + oldIndex + '"]').prop('selected', true);
                alertify.error('La dirección ip: ' + ipb2 + ' ya se encuentra dada de alta en el emplazamiento de destino.');
            }
            else {
                alertify.confirm('Ulises G 5000 R', "¿Quiere trasladar la pasarela del emplazamiento \"" + oldEmpl +
                    "\" al emplazamiento \"" + newEmpl + "\"?",
                    function() {
                        $.ajax({
                            type: 'POST',
                            url: '/gateways/changesite/' + idCgw + '/' + oldIndex + '/' + newIndex,
                            success: function(data) {
                                if (data.data == 'DUP_ENTRY_NAME') {
                                    $('#ListSites option[value="' + oldIndex + '"]').prop('selected', true);
                                    alertify.error('Ya existe una pasarela con el mismo nombre en el emplazamiento de destino seleccionado.');
                                }
                                else if (data.error != null) {
                                    $('#ListSites option[value="' + oldIndex + '"]').prop('selected', true);
                                    alertify.error('Error en la operacion');
                                }
                                else {
                                    alertify.success('La pasarela ha sido cambiada de emplazamiento.');
                                    PostGateWay('"' + idCgw + '"', true, true);
                                    //ShowCfg($('#DivConfigurations').data('idCFG'));
                                }
                            },
                            error: function(data) {
                                $('#ListSites option[value="' + oldIndex + '"]').prop('selected', true);
                                alertify.error('Error en la operacion');
                            }
                        });
                        //alertify.success('Ok');
                    },

                    function() {
                        $('#ListSites option[value="' + oldIndex + '"]').prop('selected', true);
                        //ShowSite($('#IdSite').val(),$('#IdSite').data('idSite'));
                        alertify.error('Cancelado');
                    }
                );
            }
        },
        error: function(data) {
            $('#ListSites option[value="' + oldIndex + '"]').prop('selected', true);
            alertify.error('Error al comprobar las direcciones ip existentes en el sistema.');
        }
    });
};

/****************************************/
/*	FUNCTION: showDataForRadioResource 	*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function showDataForRadioResource(data) {
    //Nombre
    $('#TbNameResource').val(data.nombre);
    //Codec
    //$('#SCodec option').val(data.codec).prop('selected', true);
    //Frecuencia
    $('#IdDestination').val(data.frecuencia.toFixed(3));
    //Habilitar Registro
    if (data.clave_registro != null) {
        $('#KeyRow').show();
        $('#TbEnableRegister').prop('checked', true);
        $('#TbKey').val(data.clave_registro);
    }
    else {
        $('#TbEnableRegister').prop('checked', false);
        $('#KeyRow').hide();
    }
    //Ajuste A/D
    if (data.ajuste_ad != null) {
        $('#LblAD').show();
        $('#TbAdGain').show();
        $('#CbAdAgc').prop('checked', false);
        $('#TbAdGain').val(data.ajuste_ad);
    }
    else {
        $('#LblAD').hide();
        $('#TbAdGain').hide();
        $('#CbAdAgc').prop('checked', true);
    }
    //Ajuste D/A
    if (data.ajuste_da != null) {
        $('#LblDA').show();
        $('#TbDaGain').show();
        $('#CbDaAgc').prop('checked', false);
        $('#TbDaGain').val(data.ajuste_da);
    }
    else {
        $('#LblDA').hide();
        $('#TbDaGain').hide();
        $('#CbDaAgc').prop('checked', true);
    }
    //Precisión Audio
    $('#CbGranularity option[value="' + data.precision_audio + '"]').prop('selected', true);

    //PESTAÑA RADIO
    //Tipo de Agente Radio
    $('#LbTypeRadio option[value="' + data.tipo_agente + '"]').prop('selected', true);
    //Ponemos todos los campos en su sitio
    SelectBss();
    //Indicación entrada audio
    $('#LbSquelchType option[value="' + data.indicacion_entrada_audio + '"]').prop('selected', true);
    //Umbral VAD (dB)
    $('#TbVad').val(data.umbral_vad);
    //Indicación salida audio 
    $('#LbPttType option[value="' + data.indicacion_salida_audio + '"]').prop('selected', true);
    //Método BSS disponible/preferido 
    if (data.tipo_agente == "4" || data.tipo_agente == "6") {
        $('#CbBssMethod option[value="' + data.metodo_bss + '"]').prop('selected', true);
        $('#BSSMethodRow .SoloRssi').show();
    }
    else {
        $('#CbBssMethodAvailable option[value="' + data.metodo_bss + '"]').prop('selected', true);
        $('#BSSMethodRow .SoloRssi').hide();
    }
    //Eventos PTT/Squelch
    if (data.evento_ptt_squelch == 1)
        $('#CbPttSquelchEvents').prop('checked', true);
    else
        $('#CbPttSquelchEvents').prop('checked', false);
    //Prioridad PTT
    $('#LbPttPriority option[value="' + data.prioridad_ptt + '"]').prop('selected', true);
    //Prioridad Sesion SIP
    $('#LbSipPriority option[value="' + data.prioridad_sesion_sip + '"]').prop('selected', true);
    //BSS/CLIMAX
    if ($('#LbTypeRadio option:selected').val() == 2 || $('#LbTypeRadio option:selected').val() == 3) {
        if (data.climax_bss == 1) {
            $('#CbBssEnable').prop('checked', true);
            $('#BssTimeRow').attr('style', 'display:table-row');
            $('#ClimaxDelayRow').attr('style', 'display:table-row');
            $('#ModoCalculoClimaxRow').attr('style', 'display:table-row');
        }
        else {
            if ($('#LbTypeRadio option:selected').val() >= 4 && $('#LbTypeRadio option:selected').val() <= 6) {
                $('#CompensationRow').attr('style', 'display:table-column');
                if ($('#LbSquelchType option:selected').val() == 1)
                    $('#VadRow').attr('style', 'display:table-row');
                else
                    $('#VadRow').attr('style', 'display:table-column');
            }
            else
                $('#CompensationRow').attr('style', 'display:table-row');
            $('#CbBssEnable').prop('checked', false);
        }

    }
    //Ventana BSS (ms)
    $('#TbBssWindow').val(data.ventana_bss);
    //BSS Cola Squelch (ms)
    if (data.cola_bss_sqh == null)
        $('#TbBssSquelchQueue').val('');
    else
        $('#TbBssSquelchQueue').val(data.cola_bss_sqh);
    //Retraso Climax
    $('#TbClimaxDelay option[value="' + data.tipo_climax + '"]').prop('selected', true);
    //Retraso Climax
    $('#TbModoCalculoClimax option[value="' + data.metodo_climax + '"]').prop('selected', true);
    //Retraso interno GRS
    $('#TbGrsInternalDelay').val(data.retraso_interno_grs);
    //Tabla Calificacion de audio
    SetAudioTableCB(function() {//Primero hay que inicializar los valores de la tabla.
        if (data.tabla_bss_id == 0)
            $('#CbBssAudioTable option[value="-1"]').prop('selected', true);
        else
            $('#CbBssAudioTable option[value="' + data.tabla_bss_id + '"]').prop('selected', true);
    });
    if (($('#LbTypeRadio option:selected').val() == 2 || $('#LbTypeRadio option:selected').val() == 3)
        && data.tipo_climax == 0)
        $('#CompensationRow').attr('style', 'display:table-column');

    if ($('#LbTypeRadio option:selected').val() != 0 && $('#LbTypeRadio option:selected').val() != 1) {
        if (data.tipo_climax == 1)
            $('#CompensationRow').attr('style', 'display:table-column');
        else
            $('#CompensationRow').attr('style', 'display:table-row');
    }
    $('#CbCompensation').val(data.retardo_fijo_climax);
    //Habilita grabación
    if (data.habilita_grabacion == 1)
        $('#CbEnableRecording').prop('checked', true);
    else
        $('#CbEnableRecording').prop('checked', false);

    $('#SRestriccion option[value="' + data.restriccion_entrantes + '"]').prop('selected', true);

    if (($('#LbTypeRadio option:selected').val() >= 0 || $('#LbTypeRadio option:selected').val() <= 3)
        && $('#LbSquelchType option:selected').val() == 1) {
        $('#VadRow').attr('style', 'display:table-row');
    }
    if ($('#LbTypeRadio option:selected').val() == 2 || $('#LbTypeRadio option:selected').val() == 3) {
        if ($('#TbClimaxDelay option:selected').val() == 1)
            $('#CompensationRow').attr('style', 'display:table-column');
    }
    if ($('#LbTypeRadio option:selected').val() == 4 || $('#LbTypeRadio option:selected').val() == 5 || $('#LbTypeRadio option:selected').val() == 6)
        $('#CompensationRow').attr('style', 'display:table-column');


    if (data.restriccion_entrantes == 0) {
        $('#BlackList').attr('style', 'display:table-column');
        $('#WhiteList').attr('style', 'display:table-column');
    }
    if (data.restriccion_entrantes == 1) {
        $('#BlackList').attr('style', 'display:table');
        $('#WhiteList').attr('style', 'display:table-column');
        showWhiteBlackList(data.idrecurso_radio, 'LSN');
    }
    if (data.restriccion_entrantes == 2) {
        $('#BlackList').attr('style', 'display:table-column');
        $('#WhiteList').attr('style', 'display:table');
        showWhiteBlackList(data.idrecurso_radio, 'LSB');
    }
}
/********************************************/
/*	FUNCTION: showDataForTelephoneResource 	*/
/*  PARAMS: 								*/
/*  REV 1.0.2 VMG							*/
/********************************************/
function showDataForTelephoneResource(data) {
    CleanResourceControls();
    //Nombre
    $('#TbNameResource').val(data.nombre);
    //Codec
    //$('#SCodec option').val(data.codec).prop('selected', true);
    //Habilitar Registro
    if (data.clave_registro != null) {
        $('#KeyRow').show();
        $('#TbEnableRegister').prop('checked', true);
        $('#TbKey').val(data.clave_registro);
    }
    else {
        $('#TbEnableRegister').prop('checked', false);
        $('#KeyRow').hide();
    }
    //Ajuste A/D
    if (data.ajuste_ad != null) {
        $('#LblAD').show();
        $('#TbAdGain').show();
        $('#CbAdAgc').prop('checked', false);
        $('#TbAdGain').val(data.ajuste_ad);
    }
    else {
        $('#LblAD').hide();
        $('#TbAdGain').hide();
        $('#CbAdAgc').prop('checked', true);
    }
    //Ajuste D/A
    if (data.ajuste_da != null) {
        $('#LblDA').show();
        $('#TbDaGain').show();
        $('#CbDaAgc').prop('checked', false);
        $('#TbDaGain').val(data.ajuste_da);
    }
    else {
        $('#LblDA').hide();
        $('#TbDaGain').hide();
        $('#CbDaAgc').prop('checked', true);
    }
    //Precisión Audio
    $('#CbGranularity option[value="' + data.precision_audio + '"]').prop('selected', true);
    ShowOptions(data.tipo_interfaz_tel.toString());//Opciones de telefono por defecto
    //Tipo de Interfaz Telefónico
    $('#LbTypeTel option[value="' + data.tipo_interfaz_tel + '"]').prop('selected', true);

    //URI remota
    $('#TbRemoteUri').val(data.uri_telefonica.substr(4, data.uri_telefonica.length));
    //Detección VOX
    if (data.deteccion_vox == 1)
        $('#CbVox').prop('checked', true);
    else
        $('#CbVox').prop('checked', false);
    //Umbral Vox (dB) umbral_vox
    $('#TbUmbral').val(data.umbral_vox);
    //Cola Vox (sg.) cola_vox
    $('#TbInactividad').val(data.cola_vox);
    //Respuesta automática
    if (data.respuesta_automatica == 1) {
        $('#CbResp').prop('checked', true);
        $('#OptionsIntervalRow').show();
        //Periodo tonos resp. estado (sg.)
        $('#TbOptionsInterval').val(data.periodo_tonos);
    }
    else {
        $('#CbResp').prop('checked', false);
        $('#OptionsIntervalRow').hide();
    }

    //Lado
    $('#LbLado option[value="' + data.lado + '"]').prop('selected', true);
    //Origen llamadas salientes de test
    $('#TbLocalNumText').val(data.origen_test);
    //Destino llamadas salientes de test
    $('#TbRemoteNumText').val(data.destino_test);
    //Supervisa colateral
    if (data.supervisa_colateral == 1) {
        $('#CbOptionsSupervision').prop('checked', true);
        $('#ReleaseRow').show();
        $('#TbReleaseTime option[value="' + data.tiempo_supervision + '"]').prop('selected', true);
    }
    else {
        $('#CbOptionsSupervision').prop('checked', false);
        $('#ReleaseRow').hide();
    }
    //Duración tono interrupción (sg.)
    $('#CbInterruptToneTime option[value="' + data.duracion_tono_interrup + '"]').prop('selected', true);

    //Peticion rangos ATS
    // Ocultar/Mostrar tab ATS dependiendo del tipo de recurso telefonico
    if ($('#LbTypeTel option:selected').val() == 3 ||
        $('#LbTypeTel option:selected').val() == 4) {
        $('#ListMenuParameters li:nth-child(5)').show();
        $.ajax({
            type: 'GET',
            url: '/resources/' + data.idrecurso_telefono + '/phoneParameters/range',
            success: function(data) {
                if (data != null) {
                    //ShowRangeAts(data);
                    //dataAtsRange = data;
                    CleanResourceControls();
                    if (data != 'NO_DATA') {
                        var kOrigen = 0, kDestino = 0;
                        data.ranks.forEach(function(rango) {
                            if (rango.tipo == 0) {//Origen
                                kOrigen++;
                                if (kOrigen == 1) {
                                    $('#OrigenInicio1').val(rango.inicial);
                                    $('#OrigenFinal1').val(rango.final);
                                }
                                if (kOrigen == 2) {
                                    $('#OrigenInicio2').val(rango.inicial);
                                    $('#OrigenFinal2').val(rango.final);
                                }
                                if (kOrigen == 3) {
                                    $('#OrigenInicio3').val(rango.inicial);
                                    $('#OrigenFinal3').val(rango.final);
                                }
                                if (kOrigen == 4) {
                                    $('#OrigenInicio4').val(rango.inicial);
                                    $('#OrigenFinal4').val(rango.final);
                                }
                            }
                            else {//Destino
                                kDestino++;
                                if (kDestino == 1) {
                                    $('#DestinoInicio1').val(rango.inicial);
                                    $('#DestinoFinal1').val(rango.final);
                                }
                                if (kDestino == 2) {
                                    $('#DestinoInicio2').val(rango.inicial);
                                    $('#DestinoFinal2').val(rango.final);
                                }
                                if (kDestino == 3) {
                                    $('#DestinoInicio3').val(rango.inicial);
                                    $('#DestinoFinal3').val(rango.final);
                                }
                                if (kDestino == 4) {
                                    $('#DestinoInicio4').val(rango.inicial);
                                    $('#DestinoFinal4').val(rango.final);
                                }
                            }
                        });
                    }
                }//else no data
            },
            error: function(data) {
                alertify.error('Error cconsultando los rangos ATS.');
            }
        });
    }

    else
        $('#ListMenuParameters li:nth-child(5)').hide();

    if (data.tipo_interfaz_tel == 0 || data.tipo_interfaz_tel == 1 || data.tipo_interfaz_tel == 2) {
        $('#OptionsIntervalRow').hide();
        $('#ReleaseRow').hide();
    }
    /** 20190208. Nuevo Parametro ATS USER del Recurso TbTelATSUser */
    data.ats_user = data.ats_user == undefined ? "399999" : data.ats_user;
    $('#TbTelATSUser').val(data.ats_user);
    console.log(data.ats_user + " => ATSUser");
    /** 20190219. Nuevo Parametro DET POLARIDAD del Recurso DetInversionPol */
    data.DetInversionPol = data.DetInversionPol == undefined ? 0 : data.DetInversionPol;
    $('#DetInversionPol').val(data.DetInversionPol);
    console.log(data.DetInversionPol.toString() + " => DetInversionPol");
}

/********************************************/
/*	FUNCTION: isResNameDup 					*/
/*  PARAMS: 								*/
/*											*/
/*  REV 1.0.2 VMG							*/
/********************************************/
function isResNameDup(resourceName, idCgw, idRes) {
    $.ajax({
        type: 'GET',
        url: '/hardware/checkresname/' + resourceName + '/' + idCgw + '/' + idRes,
        success: function(data) {
            if (data == "NAME_DUP")
                return true;
            else
                return false;
        }
    });
}

/************************************************/
/*	FUNCTION: InsertNewResource 				*/
/*  PARAMS: 									*/
/*	Si es nuevo recurso, isUpdate=false			*/
/* 	col y row son la columna y la fila donde	*/
/*	se va a insertar el recurso.				*/
/*	Si es editar, isUpdate=true y:				*/
/*	col es tipo de recurso 1 radio y 2 tfno		*/
/*	row es el id del recurso a editar			*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
var InsertNewResource = function(col, row, isUpdate, realCol, realRow) {
    var resourceId = row;
    var radioResource = {};
    var telephoneResource = {};
    var resourceType = 0;
    var isUrisCleaned = false;
    var isNoTableBssSelected = false;
    var isUriPhoneClear = false;
    //Para no tener que hacer ningún SELECT de la id de la pasarela
    var idCgw = $('#DivGateways').data('idCgw');

    ////////////////////
    //RADIO
    if ($('#SResourceType option:selected').val() == 1) {
        //Campos para identificar el recurso
        resourceType = 1;
        radioResource.pasarela_id = idCgw;
        radioResource.fila = row;
        radioResource.columna = col;
        //Nombre
        if ($('#TbNameResource').val() == '') {
            alertify.error('El nombre del recurso no puede ser vacío.');
            return;
        }
        else
            radioResource.nombre = $('#TbNameResource').val();
        //Codec
        radioResource.codec = $('#SCodec option:selected').val();
        //Habilitar registro?
        if ($('#TbEnableRegister').prop('checked'))
            radioResource.clave_registro = $('#TbKey').val();
        //Frecuencia
        if ($('#IdDestination').val() == '') {
            alertify.error('El recurso debe de tener un valor de frecuencia válido.');
            return;
        }
        else
            radioResource.frecuencia = $('#IdDestination').val();
        //AGC en A/D
        if (!$('#CbAdAgc').prop('checked')) {
            if ($('#TbAdGain').val() == '')
                radioResource.ajuste_ad = 0;//Valor Defecto
            else
                radioResource.ajuste_ad = $('#TbAdGain').val();
        }
        //AGC en D/A
        if (!$('#CbDaAgc').prop('checked')) {
            if ($('#TbDaGain').val() == '')
                radioResource.ajuste_da = 0;//Valor Defecto
            else
                radioResource.ajuste_da = $('#TbDaGain').val();
        }
        //Precisión audio
        radioResource.precision_audio = $('#CbGranularity option:selected').val();
        //Tipo de Agente Radio
        radioResource.tipo_agente = $('#LbTypeRadio option:selected').val();
        //Indicación entrada audio
        radioResource.indicacion_entrada_audio = $('#LbSquelchType option:selected').val();
        //Umbral VAD (dB)
        if ($('#TbVad').val() != '')
            radioResource.umbral_vad = $('#TbVad').val();
        else
            radioResource.umbral_vad = -27;
        //Indicación salida audio
        radioResource.indicacion_salida_audio = $('#LbPttType option:selected').val();
        //Métodos BSS disponibles
        if ($('#LbTypeRadio option:selected').val() == "4" || $('#LbTypeRadio option:selected').val() == "6")
            radioResource.metodo_bss = $('#CbBssMethod option:selected').val();
        else
            radioResource.metodo_bss = $('#CbBssMethodAvailable option:selected').val();
        //Eventos PTT/Squelch
        if ($('#CbPttSquelchEvents').prop('checked'))
            radioResource.evento_ptt_squelch = 1;
        else
            radioResource.evento_ptt_squelch = 0;
        //Prioridad PTT
        radioResource.prioridad_ptt = $('#LbPttPriority option:selected').val();
        //Prioridad Sesion SIP
        radioResource.prioridad_sesion_sip = $('#LbSipPriority option:selected').val();
        //BSS/CLIMAX
        if ($('#CbBssEnable').prop('checked'))
            radioResource.climax_bss = 1;
        else
            radioResource.climax_bss = 0;
        //Método BSS preferido
        // **Es el Métodos BSS disponibles pero para Rxs

        //Tabla calificación audio
        if ($('#CbBssAudioTable option:selected').val() == -1)
            radioResource.tabla_bss_id = 0;
        else {
            /** 20190212 Solo rellena la tabla si el tipo de agente es de Recepcion Remoto */
            var tabla_bss_id = radioResource.tipo_agente == 4 || radioResource.tipo_agente == 6 ? $('#CbBssAudioTable option:selected').val() : 0;
            radioResource.tabla_bss_id = tabla_bss_id;
        }

        //Retraso interno GRS
        if ($('#TbGrsInternalDelay').val() == '')
            radioResource.retraso_interno_grs = 0;//Valor Defecto
        else
            radioResource.retraso_interno_grs = $('#TbGrsInternalDelay').val();
        //Habilita grabación
        if ($('#CbEnableRecording').prop('checked'))
            radioResource.habilita_grabacion = 1;
        else
            radioResource.habilita_grabacion = 0;
        //ToDo
        radioResource.tipo_climax = $('#TbClimaxDelay option:selected').val();
        radioResource.metodo_climax = $('#TbModoCalculoClimax option:selected').val();

        if ($('#TbBssWindow').val() != '')
            radioResource.ventana_bss = $('#TbBssWindow').val();
        else
            radioResource.ventana_bss = 500;
        if ($('#CbCompensation').val() != '')
            radioResource.retardo_fijo_climax = $('#CbCompensation').val();
        else
            radioResource.retardo_fijo_climax = 100;


        //Lista de URIS
        var listaUris = [];
        var uri2Insert = {};

        if ($('#UriTxA1').val() != '') {
            uri2Insert.uri = $('#UriTxA1').val();
            uri2Insert.tipo = 'TXA';
            uri2Insert.nivel_colateral = 1;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriRxA1').val() != '') {
            uri2Insert.uri = $('#UriRxA1').val();
            uri2Insert.tipo = 'RXA';
            uri2Insert.nivel_colateral = 1;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriTxB1').val() != '') {
            uri2Insert.uri = $('#UriTxB1').val();
            uri2Insert.tipo = 'TXB';
            uri2Insert.nivel_colateral = 2;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriRxB1').val() != '') {
            uri2Insert.uri = $('#UriRxB1').val();
            uri2Insert.tipo = 'RXB';
            uri2Insert.nivel_colateral = 2;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriTxA2').val() != '') {
            uri2Insert.uri = $('#UriTxA2').val();
            uri2Insert.tipo = 'TXA';
            uri2Insert.nivel_colateral = 3;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriRxA2').val() != '') {
            uri2Insert.uri = $('#UriRxA2').val();
            uri2Insert.tipo = 'RXA';
            uri2Insert.nivel_colateral = 3;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriTxB2').val() != '') {
            uri2Insert.uri = $('#UriTxB2').val();
            uri2Insert.tipo = 'TXB';
            uri2Insert.nivel_colateral = 4;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriRxB2').val() != '') {
            uri2Insert.uri = $('#UriRxB2').val();
            uri2Insert.tipo = 'RXB';
            uri2Insert.nivel_colateral = 4;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriTxA3').val() != '') {
            uri2Insert.uri = $('#UriTxA3').val();
            uri2Insert.tipo = 'TXA';
            uri2Insert.nivel_colateral = 5;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriRxA3').val() != '') {
            uri2Insert.uri = $('#UriRxA3').val();
            uri2Insert.tipo = 'RXA';
            uri2Insert.nivel_colateral = 5;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriTxB3').val() != '') {
            uri2Insert.uri = $('#UriTxB3').val();
            uri2Insert.tipo = 'TXB';
            uri2Insert.nivel_colateral = 6;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }
        if ($('#UriRxB3').val() != '') {
            uri2Insert.uri = $('#UriRxB3').val();
            uri2Insert.tipo = 'RXB';
            uri2Insert.nivel_colateral = 6;

            listaUris.push(uri2Insert);
            uri2Insert = {};
        }

        //Mensaje de relleno de URIS
        switch ($('#LbTypeRadio option:selected').val()) {
            case '0':
                if ($('#UriTxA1').val() == '' && $('#UriRxA1').val() == '')
                    isUrisCleaned = true;
                break;
            case '1':
                if ($('#UriTxA1').val() == '' && $('#UriRxA1').val() == '' &&
                    $('#UriTxB1').val() == '' && $('#UriRxB1').val() == '')
                    isUrisCleaned = true;
                break;
            case '2':
                if ($('#UriTxA1').val() == '' && $('#UriRxA1').val() == '' &&
                    $('#UriTxA2').val() == '' && $('#UriRxA2').val() == '' &&
                    $('#UriTxA3').val() == '' && $('#UriRxA3').val() == '')
                    isUrisCleaned = true;
                break;
            case '3':
                if ($('#UriTxA1').val() == '' && $('#UriRxA1').val() == '' &&
                    $('#UriTxA2').val() == '' && $('#UriRxA2').val() == '' &&
                    $('#UriTxA3').val() == '' && $('#UriRxA3').val() == '' &&
                    $('#UriTxB1').val() == '' && $('#UriRxB1').val() == '' &&
                    $('#UriTxB2').val() == '' && $('#UriRxB2').val() == '' &&
                    $('#UriTxB3').val() == '' && $('#UriRxB3').val() == '')
                    isUrisCleaned = true;
                break;
            case '4':
                if ($('#CbBssAudioTable option:selected').val() == -1)
                    isNoTableBssSelected = true;
                break;
            case '6':
                if ($('#CbBssAudioTable option:selected').val() == -1)
                    isNoTableBssSelected = true;
                break;
        }

        radioResource.listaUris = insertBNList(listaUris);
        radioResource.restriccion_entrantes = $('#SRestriccion option:selected').val();

        if ($('#SRestriccion option:selected').val() == 2) {
            if ($('#Uri1WL').val() == '' && $('#Uri2WL').val() == '' && $('#Uri3WL').val() == '' && $('#Uri4WL').val() == '' &&
                $('#Uri5WL').val() == '' && $('#Uri6WL').val() == '' && $('#Uri7WL').val() == '' && $('#Uri8WL').val() == '') {
                alertify.alert('Ulises G 5000 R', "<b>Información:</b> No se han añadido URIS en la lista blanca por tanto el recurso no será accesible.");
            }
        }
    }
    ////////////////////
    //TELEFONO
    else {
        //Campos para identificar el recurso
        resourceType = 2;
        telephoneResource.pasarela_id = idCgw;
        telephoneResource.fila = row;
        telephoneResource.columna = col;
        //Nombre
        if ($('#TbNameResource').val() == '') {
            alertify.error('El nombre del recurso no puede ser vacío.');
            return;
        }
        else
            telephoneResource.nombre = $('#TbNameResource').val();
        //Codec
        telephoneResource.codec = $('#SCodec option:selected').val();
        //Habilitar registro?
        if ($('#TbEnableRegister').prop('checked'))
            telephoneResource.clave_registro = $('#TbKey').val();
        //AGC en A/D
        if (!$('#CbAdAgc').prop('checked')) {
            if ($('#TbAdGain').val() == '')
                telephoneResource.ajuste_ad = 0;//Valor Defecto
            else
                telephoneResource.ajuste_ad = $('#TbAdGain').val();
        }
        //AGC en D/A
        if (!$('#CbDaAgc').prop('checked')) {
            if ($('#TbDaGain').val() == '')
                telephoneResource.ajuste_da = 0;//Valor Defecto
            else
                telephoneResource.ajuste_da = $('#TbDaGain').val();
        }
        //Tipo de Interfaz Telefónico
        telephoneResource.tipo_interfaz_tel = $('#LbTypeTel option:selected').val();
        //URI remota
        telephoneResource.uri_telefonica = $('#TbRemoteUri').val();
        //Detección VOX
        if ($('#CbVox').prop('checked'))
            telephoneResource.deteccion_vox = 1;
        else
            telephoneResource.deteccion_vox = 0;
        //Umbral Vox (dB)
        telephoneResource.umbral_vox = $('#TbUmbral').val();
        //Cola Vox (sg.)
        telephoneResource.cola_vox = $('#TbInactividad').val();
        //Respuesta automática
        if ($('#CbResp').prop('checked'))
            telephoneResource.respuesta_automatica = 1;
        else
            telephoneResource.respuesta_automatica = 0;
        //Periodo tonos resp. estado (sg.)
        telephoneResource.periodo_tonos = $('#TbOptionsInterval').val();
        //Lado
        telephoneResource.lado = $('#LbLado option:selected').val();
        //Origen llamadas salientes de test
        telephoneResource.origen_test = $('#TbLocalNumText').val();
        //Destino llamadas salientes de test
        telephoneResource.destino_test = $('#TbRemoteNumText').val();
        //Supervisa colateral
        if ($('#CbOptionsSupervision').prop('checked')) {
            telephoneResource.supervisa_colateral = 1;
            //Tiempo supervisión (sg.)
            telephoneResource.tiempo_supervision = $('#TbReleaseTime option:selected').val();
        }
        else {
            telephoneResource.supervisa_colateral = 0;
            telephoneResource.tiempo_supervision = 5;
        }
        //Duración tono interrupción (sg.)
        telephoneResource.duracion_tono_interrup = $('#CbInterruptToneTime option:selected').val();

        var rank = {};
        var atsRanks = [];
        if (($('#OrigenInicio1').val() != '' && $('#OrigenFinal1').val() == '') ||
            ($('#OrigenInicio1').val() == '' && $('#OrigenFinal1').val() != '')) {
            alertify.error('El Rango 1 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#OrigenInicio1').val() != '' && $('#OrigenFinal1').val() != '') {
                if ($('#OrigenInicio1').val() > $('#OrigenFinal1').val() != '') {
                    alertify.error('El valor inicial del rango 1 debe de tener un valor menor o igual al valor final.');
                    return;
                }
                else {
                    rank.inicial = $('#OrigenInicio1').val();
                    rank.final = $('#OrigenFinal1').val();
                    rank.tipo = 0;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        if (($('#OrigenInicio2').val() != '' && $('#OrigenFinal2').val() == '') ||
            ($('#OrigenInicio2').val() == '' && $('#OrigenFinal2').val() != '')) {
            alertify.error('El Rango 2 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#OrigenInicio2').val() > $('#OrigenFinal2').val() != '') {
                alertify.error('El valor inicial del rango 2 debe de tener un valor menor o igual al valor final.');
                return;
            }
            else {
                if ($('#OrigenInicio2').val() != '' && $('#OrigenFinal2').val() != '') {
                    rank.inicial = $('#OrigenInicio2').val();
                    rank.final = $('#OrigenFinal2').val();
                    rank.tipo = 0;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        if (($('#OrigenInicio3').val() != '' && $('#OrigenFinal3').val() == '') ||
            ($('#OrigenInicio3').val() == '' && $('#OrigenFinal3').val() != '')) {
            alertify.error('El Rango 3 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#OrigenInicio3').val() > $('#OrigenFinal3').val() != '') {
                alertify.error('El valor inicial del rango 3 debe de tener un valor menor o igual al valor final.');
                return;
            }
            else {
                if ($('#OrigenInicio3').val() != '' && $('#OrigenFinal3').val() != '') {
                    rank.inicial = $('#OrigenInicio3').val();
                    rank.final = $('#OrigenFinal3').val();
                    rank.tipo = 0;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        if (($('#OrigenInicio4').val() != '' && $('#OrigenFinal4').val() == '') ||
            ($('#OrigenInicio4').val() == '' && $('#OrigenFinal4').val() != '')) {
            alertify.error('El Rango 4 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#OrigenInicio4').val() > $('#OrigenFinal4').val() != '') {
                alertify.error('El valor inicial del rango 4 debe de tener un valor menor o igual al valor final.');
                return;
            }
            else {
                if ($('#OrigenInicio4').val() != '' && $('#OrigenFinal4').val() != '') {
                    rank.inicial = $('#OrigenInicio4').val();
                    rank.final = $('#OrigenFinal4').val();
                    rank.tipo = 0;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        if (($('#DestinoInicio1').val() != '' && $('#DestinoFinal1').val() == '') ||
            ($('#DestinoInicio1').val() == '' && $('#DestinoFinal1').val() != '')) {
            alertify.error('El Rango 1 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#DestinoInicio1').val() > $('#DestinoFinal1').val() != '') {
                alertify.error('El valor inicial del rango 1 debe de tener un valor menor o igual al valor final.');
                return;
            }
            else {
                if ($('#DestinoInicio1').val() != '' && $('#DestinoFinal1').val() != '') {
                    rank.inicial = $('#DestinoInicio1').val();
                    rank.final = $('#DestinoFinal1').val();
                    rank.tipo = 1;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        if (($('#DestinoInicio2').val() != '' && $('#DestinoFinal2').val() == '') ||
            ($('#DestinoInicio2').val() == '' && $('#DestinoFinal2').val() != '')) {
            alertify.error('El Rango 2 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#DestinoInicio2').val() > $('#DestinoFinal2').val() != '') {
                alertify.error('El valor inicial del rango 2 debe de tener un valor menor o igual al valor final.');
                return;
            }
            else {
                if ($('#DestinoInicio2').val() != '' && $('#DestinoFinal2').val() != '') {
                    rank.inicial = $('#DestinoInicio2').val();
                    rank.final = $('#DestinoFinal2').val();
                    rank.tipo = 1;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        if (($('#DestinoInicio3').val() != '' && $('#DestinoFinal3').val() == '') ||
            ($('#DestinoInicio3').val() == '' && $('#DestinoFinal3').val() != '')) {
            alertify.error('El Rango 3 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#DestinoInicio3').val() > $('#DestinoFinal3').val() != '') {
                alertify.error('El valor inicial del rango 3 debe de tener un valor menor o igual al valor final.');
                return;
            }
            else {
                if ($('#DestinoInicio3').val() != '' && $('#DestinoFinal3').val() != '') {
                    rank.inicial = $('#DestinoInicio3').val();
                    rank.final = $('#DestinoFinal3').val();
                    rank.tipo = 1;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        if (($('#DestinoInicio4').val() != '' && $('#DestinoFinal4').val() == '') ||
            ($('#DestinoInicio4').val() == '' && $('#DestinoFinal4').val() != '')) {
            alertify.error('El Rango 4 debe de tener un valor inicial y final.');
            return;
        }
        else {
            if ($('#DestinoInicio4').val() > $('#DestinoFinal4').val() != '') {
                alertify.error('El valor inicial del rango 4 debe de tener un valor menor o igual al valor final.');
                return;
            }
            else {
                if ($('#DestinoInicio4').val() != '' && $('#DestinoFinal4').val() != '') {
                    rank.inicial = $('#DestinoInicio4').val();
                    rank.final = $('#DestinoFinal4').val();
                    rank.tipo = 1;
                    atsRanks.push(rank);
                    rank = {};
                }
            }
        }
        telephoneResource.ranks = atsRanks;
        if ($('#TbRemoteUri').val() == '')
            isUriPhoneClear = true;
        /** 20190208. Nuevo Parametro ATS USER del Recurso TbTelATSUser solo en interfaces BL, BC, AB y LCEN */
        var ats_user = telephoneResource.tipo_interfaz_tel == 0 ||
            telephoneResource.tipo_interfaz_tel == 1 ||
            telephoneResource.tipo_interfaz_tel == 2 ||
            telephoneResource.tipo_interfaz_tel == 5 ? $('#TbTelATSUser').val() : "";
        telephoneResource.ats_user = ats_user;
        /** 20190219. Nuevo Parametro DET POL del Recurso DetInversionPol solo en interfaces AB */
        var DetInversionPol = telephoneResource.tipo_interfaz_tel == 2 ? parseInt($('#DetInversionPol').val()) : 0;
        telephoneResource.DetInversionPol = DetInversionPol;
        console.log("DetInversionPol => " + telephoneResource.DetInversionPol);
    }
    //Usamos la misma estructura tanto para nuevo como para editar ya que aunque no usemos toda
    // la info, así solo hay que usar lo que se neceiste en cada operación de BBDD del servidor.
    var resource2Insert = { radio: radioResource, telephone: telephoneResource };

    //
    //Calculo del índice de carga para sacar mensaje
    var localLoadIndex = 0;
    var newIndex2Add = 0;
    var stopLoop = false;
    for (var rowIndex = 0; rowIndex < 4 && !stopLoop; rowIndex++) {
        for (var colIndex = 0; colIndex < 4 && !stopLoop; colIndex++) {
            if ($('.Res' + rowIndex + colIndex).data('loadIndex') != 0) {
                localLoadIndex = $('.Res' + rowIndex + colIndex).data('loadIndex');
                stopLoop = true;
            }
        }
    }
    //Carga de los índices nuevos Esta mal porque habría que restar el anterior... xS
    if (resourceType == 2)
        newIndex2Add = 1;
    else {
        if ($('#LbTypeRadio option:selected').val() == '2' || $('#LbTypeRadio option:selected').val() == '3')
            newIndex2Add = 8;
        else
            newIndex2Add = 2;
    }
    //Si es vacio (0) hacemos los cálculos normales. Sino nos traemos el índice de carga del anterior
    if (isUpdate == "true")
        localLoadIndex = localLoadIndex - $('.Res' + realRow + realCol).data('localLoadIndex');
    localLoadIndex += newIndex2Add;

    if (localLoadIndex <= 16) {
        checkResRestrictionsAndInsert(isUriPhoneClear, isUrisCleaned, isNoTableBssSelected, isUpdate,
            resource2Insert, resourceType, resourceId, false);
    }
    else {
        alertify.confirm('Ulises G 5000 R', 'El índice de carga al añadir este tipo de ' +
            'recurso es de: ' + localLoadIndex + '. ¿Desea continuar?',
            function() {
                checkResRestrictionsAndInsert(isUriPhoneClear, isUrisCleaned, isNoTableBssSelected, isUpdate,
                    resource2Insert, resourceType, resourceId, true);
            },
            function() {
                alertify.error('Cancelado');
            }
        );
    }
};

/************************************/
/*	FUNCTION: ajaxInsertUpdateRes 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function checkResRestrictionsAndInsert(isUriPhoneClear, isUrisCleaned, isNoTableBssSelected, isUpdate,
    resource2Insert, resourceType, resourceId, setTimeOut) {
    var localTimeOut = 100;
    //Ponemos un timeout porque si venimos de otro alert, al no ponerlo se solapa con el otro y no se muestra el segundo
    //Recomiendan mínimo de 300 para asegurarse de que salen los dos mensajes.
    if (setTimeOut)
        localTimeOut = 700;
    setTimeout(function() {
        if (resourceType == 2) {//Phone
            if (isUriPhoneClear) {
                alertify.confirm('Ulises G 5000 R', 'El campo URI remota se encuentra vacío. ¿Desea continuar?',
                    function() {
                        ajaxInsertUpdateRes(isUpdate, resource2Insert, resourceType, resourceId);
                    },
                    function() {
                        alertify.error('Cancelado');
                    }
                );
            }
            else
                ajaxInsertUpdateRes(isUpdate, resource2Insert, resourceType, resourceId);
        }
        else {//Radio
            if (isNoTableBssSelected) {
                alertify.confirm('Ulises G 5000 R', 'No se ha seleccionado tabla de calificación de audio para el ' +
                    'tipo de recurso radio seleccionado. ¿Desea continuar?',
                    function() {
                        ajaxInsertUpdateRes(isUpdate, resource2Insert, resourceType, resourceId);
                    },
                    function() {
                        alertify.error('Cancelado');
                    }
                );
            }
            else {
                if (isUrisCleaned) {
                    alertify.confirm('Ulises G 5000 R', 'Los campos URI para el tipo de recurso radio ' +
                        'seleccionado se encuentran vacíos. ¿Desea continuar?',
                        function() {
                            ajaxInsertUpdateRes(isUpdate, resource2Insert, resourceType, resourceId);
                        },
                        function() {
                            alertify.error('Cancelado');
                        }
                    );
                }
                else
                    ajaxInsertUpdateRes(isUpdate, resource2Insert, resourceType, resourceId);
            }
        }
    }, localTimeOut);
}

/************************************/
/*	FUNCTION: ajaxInsertUpdateRes 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function ajaxInsertUpdateRes(isUpdate, resource2Insert, resourceType, resourceId) {
    //Nuevo Recurso
    if (isUpdate == 'false') {
        $.ajax({
            type: 'GET',
            url: '/hardware/checkresname/' + $('#TbNameResource').val() + '/' + $('#DivGateways').data('idCgw') + '/0',
            success: function(data) {
                if (data == "NAME_DUP") {

                    alertify.alert('El nombre del recurso \"' + $('#TbNameResource').val() +
                        '\" ya se encuentra dada de alta en la pasarela. Utilize otro nombre.');
                    return;
                }
                else {
                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        contentType: 'application/json',
                        url: '/gateways/insertNewResource/:resource2Insert/:resourceType',
                        data: JSON.stringify({
                            "resource2Insert": resource2Insert,
                            "resourceType": resourceType
                        }
                        ),
                        success: function(data) {
                            if (data.error == null) {
                                alertify.success('El recurso se ha añadido correctamente.');
                                GenerateHistoricEvent(ID_HW, ADD_HARDWARE_RESOURCE, $('#TbNameResource').val(), $('#loggedUser').text());
                                GetMySlaves();
                                if (data.activa)//Solo si es config activa se habilita el botón de Aplicar Cambios
                                    resModified = true;
                            }
                            else
                                alertify.error('Error: ' + data.error);
                        },
                        error: function(data) {
                            alertify.error('Error insertando el nuevo recurso.');
                        }
                    });
                    GetMySlaves();
                }
            }
        });
    }
    //Actualizar Recurso
    else {
        $.ajax({
            type: 'GET',
            url: '/hardware/checkresname/' + $('#TbNameResource').val() + '/' + $('#DivGateways').data('idCgw') + '/' + resourceId,
            success: function(data) {
                if (data == "NAME_DUP") {
                    alertify.alert('El nombre del recurso \"' + $('#TbNameResource').val() +
                        '\" ya se encuentra dada de alta en la pasarela. Utilize otro nombre.');
                    return;
                }
                else {
                    $.ajax({
                        type: 'PUT',
                        dataType: 'json',
                        contentType: 'application/json',
                        url: '/gateways/updateResource/:resource2Insert/:resourceType/:resourceId',
                        data: JSON.stringify({
                            "resource2Insert": resource2Insert,
                            "resourceType": resourceType,
                            "resourceId": resourceId
                        }
                        ),
                        success: function(data) {
                            if (data.error == null) {
                                //var paramHistoric={0:}
                                GenerateHistoricEvent(ID_HW, MODIFY_HARDWARE_RESOURCE_LOGIC_PARAM, $('#TbNameResource').val(), $('#loggedUser').text());
                                alertify.success('El recurso se ha actualizado correctamente.');
                                if (data.activa)//Solo si es config activa se habilita el botón de Aplicar Cambios
                                    resModified = true;
                            }
                            else
                                alertify.error('Error: ' + data.error);
                        },
                        error: function(data) {
                            alertify.error('Error actualizando el recurso.');
                        }
                    });
                    GetMySlaves();
                }
            }
        });
    }
    GetMySlaves();
}

/************************************/
/*	FUNCTION: DelGateway 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var DelGateway = function() {

    alertify.confirm('Ulises G 5000 R', "¿Eliminar la gateway \"" + $('#LblIdGateway').text() + "\"?",
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/gateways/' + $('#DivGateways').data('idCgw'),
                success: function(data) {
                    if (data.error != null)
                        alertify.error('Error: ' + data.error);
                    else {
                        GenerateHistoricEvent(ID_HW, REMOVE_GATEWAY, $('#nameGw').val(), $('#loggedUser').text());
                        alertify.success('Gateway \"' + $('#nameGw').val() + '\" eliminada.');
                        ShowSite($('#IdSite').val(), $('#IdSite').data('idSite'));
                    }
                },
                error: function(data) {
                    alertify.error('Error eliminando la pasarela.');
                }
            });
        },
        function() {
            alertify.error('Cancelado');
        });
};

var CloseCopy = function() {
    $('#CopyGatewayZone').animate({ width: '0px', height: '0px' }, 500, function() {
        $('#CopyGatewayZone').hide();

        $('#AddFormsite').removeClass('disabledDiv');
        $('#SitesList').removeClass('disabledDiv');
        $('#NavMenu').removeClass('disabledDiv');
        $('#NavConfiguration').removeClass('disabledDiv');
    });
};

/************************************/
/*	FUNCTION: CopyGateway 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var CopyGateway = function() {
    //Reset Values
    $('#nameCopyGw').val('');
    $('#ipCopyCpu0').val('');
    $('#ipCopyCpu1').val('');

    $('#AddFormsite').addClass('disabledDiv');
    $('#SitesList').addClass('disabledDiv');
    $('#NavMenu').addClass('disabledDiv');
    $('#NavConfiguration').addClass('disabledDiv');

    $('#CopyGatewayZone').attr('style', 'position:absolute;width:0px;height:0px;top:180px;left:260px');
    $('#CopyGatewayZone').show();
    $('#CopyGatewayZone').animate({ width: '30%', height: '290px' }, 500, function() {
        $('#IpvCopyGateway').val($('#ipv').val());
        $('#LblNameCopyGateway').text($('#nameGw').val());

        $('#CopyGatewayZone').addClass('divNucleo');
    });
};

var CopyGateway2 = function() {
    alertify.success('Test!');
    //Prueba del Json completo
    $.ajax({
        type: 'GET',
        url: '/gateways/1.1.1.2/testconfig',
        success: function(data) {
            if (data.error != null)
                alertify.error('Error: ' + data.error);
            else {
                alertify.success('Success');
            }
        },
        error: function(data) {
            alertify.error('Error en el test.');
        }
    });
    //Prueba del Json completo
	/*$.ajax({
		type: 'GET',
		url: '/gateways/getAll/' + $('#DivGateways').data('idCgw'),
		success: function (data) {
			if (data.error != null)
				alertify.error('Error: ' + data.error);
			else {
				alertify.success('Success');
				
			}
		},
		error: function(data){
			alertify.error('Error en el test.');
		}
	});*/
};



/************************************/
/*	FUNCTION: CopyMethodGateway 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var CopyMethodGateway = function(idSourceGateway, nameTargetGateway, ip0TargetGateway,
    ip1TargetGateway, ipvTargetGateway) {

    $.ajax({
        type: 'COPY',
        dataType: 'json',
        url: '/gateways/' + idSourceGateway + '/' + nameTargetGateway + '/' + ip0TargetGateway +
            '/' + ip1TargetGateway + '/' + ipvTargetGateway,
        success: function(data) {
            if (data.error == 'ER_DUP_ENTRY')
                alertify.error('El nombre \"' + nameTargetGateway + '\" ya existe en esta configuración.');
            else if (data.error == 'ER_DUP_IP0_ENTRY')
                alertify.error('La ip \"' + ip0TargetGateway + '\" ya existe en esta configuración.');
            else if (data.error == 'ER_DUP_IP1_ENTRY')
                alertify.error('La ip \"' + ip1TargetGateway + '\" ya existe en esta configuración.');
            else {
                ShowSite($('#IdSite').val(), $('#IdSite').data('idSite'));
                alertify.success('Gateway clonado.');
				/*GetGateways(null,function(){
					ShowHardwareGateway(data.data,nameTargetGateway);
				});*/
            }
        }
    });
};


var PostGateway2 = function(f) {
    
    var cpus = [];
    var sip = {};
    var proxys = [];
    var registrars = [];
    var web = {};
    var snmp = {};
    var traps = [];
    var rec = {};
    var grab = {};
    var sincr = {};
    var listServers = [];
    var mensaje = '';
    var mensajeNoName = '';
    var mensajeNoIp = '';
    var mensajeServiceError = '';

    // RECORDING SERVICE
    grab = {
        "rtsp_port": $('#rtsp_port').val(),
        //"rtsp_uri": $('#rtsp_uri').val(),
        "rtsp_uri": '',
        "rtsp_ip": $('#rtsp_ip').val(),
        /** 20170517. AGL. Segundo Servidor */
        "rtspb_ip": $('#rtspb_ip').val(),
        //"rtsp_rtp": $('#rtp_tramas').prop('checked') ? 1 : 0
        "rtsp_rtp": 1
    };

    // SINCR. SERVICE
    $('#NtpServersList option').each(function() {
        var selected = $("#NtpServersList option:selected").val() == $(this).val();
        listServers.push({ 'ip': $(this).val(), 'selected': selected });
    });
    sincr = {
        "ntp": 2,
        "servidores": listServers
    };
    // Proxy list
    $('#ProxysList option').each(function() {
        var selected = $("#ProxysList option:selected").val() == $(this).val();
        proxys.push({ 'ip': $(this).val(), 'selected': selected });
    });
    // Registrars list
    $('#RegistrarsList option').each(function() {
        var selected = $("#RegistrarsList option:selected").val() == $(this).val();
        registrars.push({ 'ip': $(this).val(), 'selected': selected });
    });
    // Traps list
    $('#TrapsList option').each(function() {
        traps.push($(this).val());
    });

    translateWord('ErrorServiceToGateway', function(result) {
        mensaje = result;
    });
    translateWord('ErrorGatewayHaveNoName', function(result) {
        mensajeNoName = result;
    });
    translateWord('ErrorGatewayHaveNoIP', function(result) {
        mensajeNoIp = result;
    });
    translateWord('ErrorGeneratingService', function(result) {
        mensajeServiceError = result;
    });

    translateWord('Update', function(result) {
        if ($('#UpdateGtwButton').text() === result) {

            if ($("#ListServices option:selected").val() == "") {
                alertify.error(mensaje);
                return;
            }

            if ($('#nameGw').val() == '') {
                alertify.error(mensajeNoName);
                return;
            }

            if ($('#ipv').val() == '') {
                alertify.error(mensajeNoIp);
                return;
            }

			/*if ($('#ips').val() == ''){
				translateWord('ErrorIPServerConf',function(result){
					alertify.error(result);
				});
				return;
			}*/

            //CPU 0
            if ($('#ipb1').val() == '') {
                translateWord('ErrorIPCPU', function(result) {
                    alertify.error(result + " 0");
                });
                return;
            }
            if ($('#ipg1').val() == '') {
                translateWord('ErrorIPGateway', function(result) {
                    alertify.error(result + " 0");
                });
                return;
            }
            if ($('#msb1').val() == '') {
                translateWord('ErrorCPUMask', function(result) {
                    alertify.error(result + " 0");
                });
                return;
            }
            if ($('#dual').prop('checked')) {
                //CPU 1						
                if ($('#ipb2').val() == '') {
                    translateWord('ErrorIPCPU', function(result) {
                        alertify.error(result + " 1");
                    });
                    return;
                }
                if ($('#ipg2').val() == '') {
                    translateWord('ErrorIPGateway', function(result) {
                        alertify.error(result + " 1");
                    });
                    return;
                }
                if ($('#msb2').val() == '') {
                    translateWord('ErrorCPUMask', function(result) {
                        alertify.error(result + " 1");
                    });
                    return;
                }
            }



            /****************/
            /*	PUT Method  */
            /****************/
            if ($('#dual').prop('checked')) {
                cpus = [
                    // CPU-1
                    {
                        "num": 1,
                        "tlan": 1,	//$("#Lan1 option:selected").val(),
                        "ip0": $('#ip01').val(),
                        "ms0": $('#ms01').val(),
                        "ip1": $('#ip11').val(),
                        "ms1": $('#ms11').val(),
                        "ipb": $('#ipb1').val(),
                        "msb": $('#msb1').val(),
                        "ipg": $('#ipg1').val()
                    },
                    // CPU-2
                    {
                        "num": 2,
                        "tlan": 1,	//$("#Lan2 option:selected").val(),
                        "ip0": $('#ip02').val(),
                        "ms0": $('#ms02').val(),
                        "ip1": $('#ip12').val(),
                        "ms1": $('#ms12').val(),
                        "ipb": $('#ipb2').val(),
                        "msb": $('#msb2').val(),
                        "ipg": $('#ipg2').val()
                    }
                ];
            }
            else {
                cpus = [{
                    "num": 1,
                    "tlan": 1,	//$("#Lan1 option:selected").val(),
                    "ip0": $('#ip01').val(),
                    "ms0": $('#ms01').val(),
                    "ip1": $('#ip11').val(),
                    "ms1": $('#ms11').val(),
                    "ipb": $('#ipb1').val(),
                    "msb": $('#msb1').val(),
                    "ipg": $('#ipg1').val()
                }
                ];
            }

            // WEB
            web = {
                "wport": $('#wport').val(),
                "stime": $('#stime').val()
            };
            // SNMP
            snmp = {
                "agcomm": $('#agcomm').val(),
                "agcont": $('#agcont').val(),
                "agloc": $('#agloc').val(),
                "agname": $('#agname').val(),
                "agv2": $('#agv2').prop('checked'),
                "sport": $('#sport').val(),
                "snmpp": $('#snmpp').val(),
                "traps": traps
            };
            // SERVICES
            // SIP
            sip = {
                "proxys": proxys,
                "registrars": registrars,
                "PuertoLocalSIP": $('#PuertoLocalSIP').val() == '' ? 5060 : $('#PuertoLocalSIP').val(),
                "KeepAlivePeriod": 200, //$('#kap').val(),
                "KeepAliveMultiplier": 10, //$('#kam').val(),
                "SupresionSilencio": false, //$('#SupresionSilencio').prop('checked'),
                "PeriodoSupervisionSIP": $('#CbRUpdatePeriod').prop('checked') ? $('#TbUpdatePeriod').val() : '90'
            };
            $.ajax({
                type: 'PUT',
                url: '/gateways/gtw',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    "idConf": $('#name').val(),
                    "general": {
                        "idCGW": $('#DivGateways').data('idCgw'),
                        "name": $('#nameGw').val(),
                        'emplazamiento': $('#IdSite').val(),	//$('#CBEmplazamiento option:selected').text(),
                        "servicio": $("#ListServices option:selected").val(),
                        "ipv": $('#ipv').val(),
                        "ips": $('#ips').val(),
                        "dualidad": $('#dual').prop('checked'),
                        "cpus": cpus
                    },
                    "servicios": {
                        "idSERVICIOS": $("#ListServices option:selected").val(),
                        "sip": sip,
                        "web": web,
                        "snmp": snmp,
                        "grab": grab,
                        "sincr": sincr
                    }
                }
                ),
                success: function(data) {
                    if (data.error == 'ER_DUP_ENTRY') {
                        alertify.error('Gateway \"' + $('#nameGw').val() + '\" o dirección IP ya existe');
                    }
                    else {
                        // Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
                        if (f != null)
                            f();

                        GenerateHistoricEvent(ID_HW, MODIFY_GATEWAY_COMMON_PARAM, data.name, $('#loggedUser').text());
                        alertify.success('Gateway \"' + data.name + '\" actualizada.');
                        ShowSite($('#IdSite').val(), $('#IdSite').data('idSite'));
                        GetGateways(null, function() {
                            ShowHardwareGateway(data.idCGW, data.name);
                        });
                    }
                },
                error: function(data) {
                    alertify.error('Gateway \"' + data.name + '\" ya existe.');
                }
            });
        }
        else {
            // Antes de dar de alta una pasarela es necesario que esta tenga asignado un servicio
			/*if ($("#ListServices option:selected").val() == ""){
				alertify.error(mensaje);
				return;
			}*/
            //TODO ya no haria falta

            if ($('#nameGw').val() == '') {
                alertify.error(mensajeNoName);
                return;
            }

            if ($('#ipv').val() == '') {
                alertify.error(mensajeNoIp);
                return;
            }
			/*if ($('#ips').val() == ''){
				translateWord('ErrorIPServerConf',function(result){
						alertify.error(result);
				});
				return;
			}*/
            // TODO AGL

            //Comprobar que se han introducido los datos de las CPU
            //CPU 0
            if ($('#ipb1').val() == '') {
                translateWord('ErrorIPCPU', function(result) {
                    alertify.error(result + " 0");
                });
                return;
            }
            if ($('#ipg1').val() == '') {
                translateWord('ErrorIPGateway', function(result) {
                    alertify.error(result + " 0");
                });
                return;
            }
            if ($('#msb1').val() == '') {
                translateWord('ErrorCPUMask', function(result) {
                    alertify.error(result + " 0");
                });
                return;
            }
            //CPU 1
            if ($('#dual').prop('checked')) {
                if ($('#ipb2').val() == '') {
                    translateWord('ErrorIPCPU', function(result) {
                        alertify.error(result + " 1");
                    });
                    return;
                }
                if ($('#ipg2').val() == '') {
                    translateWord('ErrorIPGateway', function(result) {
                        alertify.error(result + " 1");
                    });
                    return;
                }
                if ($('#msb2').val() == '') {
                    translateWord('ErrorCPUMask', function(result) {
                        alertify.error(result + " 1");
                    });
                    return;
                }
            }
            var claveServicio = $('#name').val() + '-' + $('#nameGw').val();
            //La última parte es crear el servicio.
            var newService;
            EditNewService(claveServicio, function(newService) {
                if (!newService || newService == null) {
                    alertify.error(mensajeServiceError);
                    return;
                }
                else {
                    /*****************/
                    /*	POST Method  */
                    /*****************/
                    if ($('#dual').prop('checked')) {
                        cpus = [
                            // CPU-1
                            {
                                "num": 1,
                                "tlan": 1,	//$('#Lan1 option:selected').val(),
                                "ip0": $('#ip01').val(),
                                "ms0": $('#ms01').val(),
                                "ip1": $('#ip11').val(),
                                "ms1": $('#ms11').val(),
                                "ipb": $('#ipb1').val(),
                                "msb": $('#msb1').val(),
                                "ipg": $('#ipg1').val()
                            },
                            // CPU-2
                            {
                                "num": 2,
                                "tlan": 1,	//$('#Lan2 option:selected').val(),
                                "ip0": $('#ip02').val(),
                                "ms0": $('#ms02').val(),
                                "ip1": $('#ip12').val(),
                                "ms1": $('#ms12').val(),
                                "ipb": $('#ipb2').val(),
                                "msb": $('#msb2').val(),
                                "ipg": $('#ipg2').val()
                            }
                        ];
                    }
                    else {
                        cpus = [{
                            "num": 1,
                            "tlan": 1,	//$('#Lan1 option:selected').val(),
                            "ip0": $('#ip01').val(),
                            "ms0": $('#ms01').val(),
                            "ip1": $('#ip11').val(),
                            "ms1": $('#ms11').val(),
                            "ipb": $('#ipb1').val(),
                            "msb": $('#msb1').val(),
                            "ipg": $('#ipg1').val()
                        }
                        ];
                    }

                    // SERVICES
                    // SIP
                    sip = {
                        "proxys": proxys,
                        "registrars": registrars,
                        "PuertoLocalSIP": 5060,
                        "KeepAlivePeriod": 200, //$('#kap').val(),
                        "KeepAliveMultiplier": 10, //$('#kam').val(),
                        "SupresionSilencio": false, //$('#SupresionSilencio').prop('checked'),
                        "PeriodoSupervisionSIP": $('#CbRUpdatePeriod').prop('checked') ? $('#TbUpdatePeriod').val() : '90'
                    };
                    // WEB
                    web = {
                        "wport": 8080,
                        "stime": 0
                    };
                    snmp = {
                        "agcomm": "public",
                        "agcont": "NUCLEO-DF DT. MADRID. SPAIN",
                        "agloc": "NUCLEO-DF LABS",
                        "agname": "ULISESG5000i",
                        "agv2": 1,
                        "sport": 65000,
                        "snmpp": 161,
                        "traps": traps
                    };

                    $.ajax({
                        type: 'POST',
                        dataType: 'json',
                        contentType: 'application/json',
                        url: '/gateways/gtw',
                        data: JSON.stringify({
                            "idConf": $('#name').val(),
                            "general": {
                                "name": $('#nameGw').val(),
                                'emplazamiento': $('#IdSite').val(),	//$('#CBEmplazamiento option:selected').text(),
                                "ipv": $('#ipv').val(),
                                "ips": $('#ips').val(),                                
                                "dualidad": $('#dual').prop('checked'),
                                "cpus": cpus
                            },
                            "servicios": {
                                idSERVICIOS: newService.idSERVICIOS,
                                "name": newService.name,
                                "sip": sip,
                                "web": web,
                                "snmp": snmp,
                                "grab": grab,
                                "sincr": sincr
                            }
                        }),
                        success: function(data) {
                            if (data.error === null) {
                                $('#DivGateways').data('idCgw', data.data.idCGW);
                                // Si existe f, se añade la gateway a la lista para actualizar su configuración con 'Aplicar cambios'
                                if (f != null)
                                    f(data.data.idCGW);

                                GenerateHistoricEvent(ID_HW, ADD_GATEWAY, data.data.name, $('#loggedUser').text());
                                alertify.success('Gateway \"' + data.data.name + '\" añadida.');
                                ShowSite($('#IdSite').val(), $('#IdSite').data('idSite'));
                                GetGateways(null, function() {
                                    ShowHardwareGateway(data.data.idCGW, data.data.name);
                                });
                            }
                            else if (data.error == "ER_DUP_ENTRY") {
                                alertify.error('Gateway \"' + $('#nameGw').val() + '\" o dirección IP ya existe');
                            }
                        },
                        error: function(data) {
                            alertify.error('Gateway \"' + $('#nameGw').val() + '\" no existe');
                        }
                    });
                }
            });

        }

    });

};


var GetGateways = function(cfg, f) {
    translateWord('Gateways', function(result) {
        $('#GatewaysH3').text(result);
    });

    if (cfg == null) {
        //$('#FormGateway').show();
		/*
		$.ajax({type: 'GET', 
				url: '/sites', 
				success: function(data){
					$("#CBEmplazamiento").empty();
				    var options = '<option value="" disabled selected>Select site name</option>';
					$.each(data.data, function(index, value){
						options += '<option value="' + value.idEMPLAZAMIENTO + '">' + value.name + '</option>';
					});
					$('#CBEmplazamiento').html(options);
				}
		});*/
        $.ajax({
            type: 'GET',
            url: '/gateways',
            success: function(data) {
                $("#listGateways").empty();
                link_enlaces = [];
                $.each(data.general, function(index, value) {
                    link_enlaces[value.idCGW] = { idCFG: null, valor: value };
                    var item = $('<li value=' + value.idCGW + '><a onclick="GetGateway(\'' + value.idCGW + '\',\'' + value.LastUpdate + '\')" draggable=false ondrop="ResourceChangeOfGateway(event,\'' + value.idCGW + '\',\'' + value.name + '\')" ondragover="allowDrop(event)">' + value.name + '</li>');
                    if (value.Activa != null && value.Activa != 0) {
                        if (value.Sincro == 1)
                            item.addClass('sincro');
                        else
                            item.addClass('active');
                    }
                    item.addClass('dropable')
                        .appendTo($("#listGateways"));
                });
                $('#NewGateway').attr("onclick", "GetGateway()");
                if (f != null)
                    f();
            }
        });
    }
};

/************************************/
/*	FUNCTION: GetGateway 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetGateway = function(gtw, lastUpdate, f) {
    //	if ($('#AddFormGateway').is(':visible')){
    //			$('#DivGateways').animate({width: '145px'});
    //		}
    totalRecursos = 0;
    $('#AddFormGateway').show();
    $('#AddFormsite').animate({ width: '790px', height: '410px' });
    $('#DivGateways').animate({ width: '1015px' });
    $('#GeneralContent').show();
    $('#TableToolsGateway').show();

    $('#lips').hide();
    $('#ips').hide();

    /** 20170512 AGL. OCULTAR BOTONES COPIA / IMPORT / EXPORT */
	/* $('#ExportGateway').show();
	*******************************************/

    if (gtw != null) {
        var urlString = '/gateways/' + gtw;
        $.ajax({
            type: 'GET',
            url: urlString,
            success: function(gtw) {
                // Recoger el idCGW de la pasarela
                $('#DivGateways').data('idCgw', gtw.result[0].idCGW);

                //VMG Carga de cambios de emplazamiento
				/*$.ajax({type: 'GET',
					url: '/sites',
					success: function(data) {
						// Load Site list
						loadSiteList(data.data, gtw.general.EMPLAZAMIENTO_idEMPLAZAMIENTO);
					}
				});*/
                ReinitFormGateways();

                /* Si la función es llamada desde site form no se muestra FormGateway */
                //$('#FormGateway').show();
                //$("#AddFormGateway").show();
                //$('#AddFormsite').animate({width: '680px', height: '380px'});
                $('#RemoveGateway').show();

                $("#nameGw").val(gtw.result[0].name);
                $('#ipv').val(gtw.result[0].ipv);
                $('#ips').val(gtw.result[0].ips);
                
                $('#sppe').val(gtw.result[0].sppe ? gtw.result[0].sppe : 0);
                console.log('SPPE => ', $('#sppe').val());
                $('#dvrrp').val(gtw.result[0].dvrrp ? gtw.result[0].dvrrp : 2000);
                console.log('DVRRP => ', $('#dvrrp').val());

                $('#dual').prop('checked', true);
                $('#dual').prop('disabled', true);

                $('#lan12').hide();
                $('#lan22').hide();
                $('#nic2').show();
                $('#liCpu2').show();
                $('#lan11').hide();
                $('#lan21').hide();
                $('#nic1').show();

                // CPU-1
                $('#ipb1').val(gtw.result[0].ip_cpu0);
                $('#ipg1').val(gtw.result[0].ip_gtw0);
                $('#msb1').val(gtw.result[0].mask_cpu0);

                // CPU-2
                $('#ipb2').val(gtw.result[0].ip_cpu1);
                $('#ipg2').val(gtw.result[0].ip_gtw1);
                $('#msb2').val(gtw.result[0].mask_cpu1);


                //SERVICES
                //Lista de Ips para proxys, registrars, ntp y traps
                GetIps4Gateway(gtw.result[0].idCGW);
                //SIP
                RenderSipService(null, true);//Para mostrar el primer item.

                $('#PuertoLocalSIP').val(gtw.result[0].puerto_sip.toString());

                $('#TbUpdatePeriod').val(gtw.result[0].periodo_supervision.toString());

                //SNMP
                $('#sport').val(gtw.result[0].puerto_servicio_snmp);
                $('#snmpp').val(gtw.result[0].puerto_snmp);
                $('#agname').val(gtw.result[0].nombre_snmp);
                $('#agloc').val(gtw.result[0].localizacion_snmp);
                $('#agcont').val(gtw.result[0].contacto_snmp);

                $('#agcomm').val(gtw.result[0].comunidad_snmp);
                if (gtw.result[0].snmpv2 == 1) {
                    $('#agv2').prop('checked', true);
                    $('#agcomm').prop('disabled', false);
                }
                else {
                    $('#agv2').prop('checked', false);
                    $('#agcomm').prop('disabled', true);
                }
                //WEB
                if (gtw.result[0].puerto_servicio_web != null)
                    $('#wport').val(gtw.result[0].puerto_servicio_web.toString());
                $('#stime').val(gtw.result[0].tiempo_sesion.toString());

                //GRABACION
                if (gtw.result[0].puerto_rtsp != null)
                    $('#rtsp_port').val(gtw.result[0].puerto_rtsp.toString());
                if (gtw.result[0].servidor_rtsp != null)
                    $('#rtsp_ip').val(gtw.result[0].servidor_rtsp.toString());
                if (gtw.result[0].servidor_rtspb != null)
                    $('#rtspb_ip').val(gtw.result[0].servidor_rtspb.toString());

				/*var title = $('#TitleH3').text().split(" ");
				var aux = title[1].replace(".	Emplazamientos:", "-");
				var site = '<option value="">'+aux+title[2].replace(".	Pasarelas:", "")+'</option>';
				$('#ListSites').html(site);
				*/
                //TODO peticion de sites
                $.ajax({
                    type: 'GET',
                    url: '/sites/' + $('#DivConfigurations').data('idCFG'),
                    success: function(data) {
                        // Load Site list
                        loadSiteList(data.data, gtw.result[0].EMPLAZAMIENTO_idEMPLAZAMIENTO);
                    }
                });

				/*$('#ProxysList').append($('<option>', {
					value: 1,
					text: 'My option'
				}));*/
                //$('#CBEmplazamiento option[value="' + gtw.general.EMPLAZAMIENTO_idEMPLAZAMIENTO + '"]').prop('selected', true);

                //GetServices(false);
				/*
				// CPU-0
				$('#ipg1').val(gtw.general.cpus[0].ipg);
				//$("#Lan1 option[value='" + gtw.general.cpus[0].tlan +"']").prop('selected',true);
				$('#bound1').prop('checked', !gtw.general.cpus[0].tlan);
				$('#ip01').val(gtw.general.cpus[0].ip0);
				$('#ms01').val(gtw.general.cpus[0].ms0);
				$('#ip11').val(gtw.general.cpus[0].ip1);
				$('#ms11').val(gtw.general.cpus[0].ms1);
				$('#ipb1').val(gtw.general.cpus[0].ipb);
				$('#msb1').val(gtw.general.cpus[0].msb);

				$('#lan11').hide();
				$('#lan21').hide();
				$('#nic1').show();

				if (gtw.general.cpus.length === 2){
					// CPU-1
					$('#lan12').hide();
					$('#lan22').hide();
					$('#nic2').show();

					//$("#Lan2 option[value='" + gtw.general.cpus[1].tlan +"']").prop('selected',true);
					$('#bound2').prop('checked', !gtw.general.cpus[1].tlan);
					$('#ip02').val(gtw.general.cpus[1].ip0);
					$('#ms02').val(gtw.general.cpus[1].ms0);
					$('#ip12').val(gtw.general.cpus[1].ip1);
					$('#ms12').val(gtw.general.cpus[1].ms1);
					$('#ipg2').val(gtw.general.cpus[1].ipg);
					$('#ipb2').val(gtw.general.cpus[1].ipb);
					$('#msb2').val(gtw.general.cpus[1].msb);
				}
				*/
                var idSite = $('#IdSite').data('idSite');
                translateWord('Update', function(result) {
                    $('#UpdateGtwButton').text(result)
                        .attr('onclick', 'PostGateWay(' + idSite + ',true,false)');
                });

				/*if (gtw.general.dualidad)
					$('#liCpu2').show();
				else
					$('#liCpu2').hide();
				*/
                // Reset .oldValue of input tags to check any changes
                ResetOldValue('GeneralContent');


                if (f != null)
                    f();
            }
        });

    }
    else {
        $('#DivGateways').data('idCgw', '');

        // $('#ListMenuGateways li:nth-child(2)').hide();
        // $('#ListMenuGateways li:nth-child(3)').hide();
        // $('#ListMenuGateways li:nth-child(4)').hide();
        GetServices(false);

        $('#DivComponents').attr('class', 'disabledDiv');
        //$('#FormGateway').show();
        $('#AddFormGateway').show();
        $('#NewGateway').show();
        translateWord('Gateways', function(result) {
            $('#GatewaysH3').text(result);	// Titulo
        });
        //$('#ServicesFormGateway').hide();
        $('#BtnShowGateway').hide();
        $('#RemoveGateway').hide();
        //$('#TableToolsGateway').hide();
        ReinitFormGateways();
        $('#tab2').hide();
        $('#UpdateGtwButton').show();
        translateWord('Add', function(result) {
            $('#UpdateGtwButton').text(result)
                .attr('onclick', 'PostGateway(function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})');
        });
        $('#nameGw').val('');
        $('#ipv').val('');
        $('#ips').val('');
        $('#lips').hide();
        $('#ips').hide();
        $('#dual').prop('checked', true);
        // CPU-0
        $('#lan11').hide();
        $('#lan21').hide();
        $('#nic1').show();

        //$("#Lan1 option[value='1']").prop('selected',true);
        $('#ip01').val('');
        $('#ms01').val('');
        $('#ip11').val('');
        $('#ms11').val('');
        $('#ipg1').val('');
        $('#ipb1').val('');
        $('#msb1').val('');
        // CPU-1
        //$('#lan12').hide();
        $('#liCpu2').show();
        $('#lan12').hide();
        $('#lan22').hide();
        $('#nic2').show();

        //$("#Lan2 option[value='1']").prop('selected',true);
        $('#ip02').val('');
        $('#ms02').val('');
        $('#ip12').val('');
        $('#ms12').val('');
        $('#ipg2').val('');
        $('#ipb2').val('');
        $('#msb2').val('');

        $('#sppe').val(0);
        $('#vrrp').val(2000);

        $('#ExportGateway').show();
        var title = $('#TitleH3').text().split(" ");
        var aux = title[1].replace(".	Emplazamientos:", "-");
        var site = '<option value="">' + aux + title[2].replace(".	Pasarelas:", "") + '</option>';
        $('#ListSites').html(site);
    }
};

/************************************/
/*	FUNCTION: GetGateway 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetIps4Gateway = function(idCgw) {
    var listOfIps = [];
    if (idCgw != null) {
        var urlString = '/gateways/iplist/' + idCgw;
        $.ajax({
            type: 'GET',
            url: urlString,
            success: function(data) {
                $.each(data, function(i, data) {
                    if (data.tipo == 'PRX') {
                        $('#ProxysList').append($('<option>', {
                            value: data.ip,
                            text: data.ip
                        }));
                    }
                    else if (data.tipo == 'REG') {
                        $('#RegistrarsList').append($('<option>', {
                            value: data.ip,
                            text: data.ip
                        }));
                    }
                    else if (data.tipo == 'NTP') {
                        $('#NtpServersList').append($('<option>', {
                            value: data.ip,
                            text: data.ip
                        }));
                    }
                    else if (data.tipo == 'TRPV1') {
                        $('#TrapsList').append($('<option>', {
                            value: data.ip,
                            text: data.ip
                        }));
                    }
                    else if (data.tipo == 'TRPV2') {
                        $('#TrapsList').append($('<option>', {
                            value: data.ip,
                            text: data.ip
                        }));
                    }
                });
            },
            error: function(data) {
                alertify.error('Se ha producido recuperando los datos de las ips.');
            }
        });
    }
};

/*******************************************************************************/
/****** Function: AddGatewayToList											****/
/****** Description: Añade el idCgw a la lista de pasarelas modificadas o	****/
/****** 			 reset la lista si idCgw == null						****/
/****** Parameters: idCgw 													****/
/*******************************************************************************/
/*var AddGatewayToList = function(idCgw){
	if (idCgw == null){
		listOfGateways='';
		$.ajax({type: 'PUT', 
				url: '/configurations/listOfGateways/',
				dataType: 'json', 
				contentType:'application/json',
				data: JSON.stringify( {Gateway:idCgw} ),

				success: function(data){
						},
				error: function(data){
						}
		});
	}
	else{
		// Sólo si idCgw pertenece a la configuración activa...
		// Y no está ya en la lista
		if (listOfGateways.indexOf(idCgw) == -1){
			// Consultar las pasarelas que pertenecen a la configuracion activa y están vivas
			$.ajax({type: 'GET', 
				url: '/gateways/activeCfg/' + idCgw, 
				success: function(data){
					if (data){
						listOfGateways = listOfGateways.concat(idCgw + ',');
						//$.ajax({type: 'PUT',
						//		url: '/configurations/listOfGateways/',
						//		dataType: 'json',
						//		contentType:'application/json',
						//		data: JSON.stringify( {Gateway:idCgw} ),

						//		success: function(data){
										},
						//		error: function(data){
										}
						//});
						$.ajax({type: 'PUT',
							url: '/configurations/setUpdateGateway/',
							dataType: 'json',
							contentType:'application/json',
							data: JSON.stringify( {Gateway:idCgw} ),
							
							success: function(data){
							},
							error: function(data){
							}
						});
					}
				}
			});
		}
	}
};*/

/***********************************************************************************/
/****** Function: AddGatewaysFromActiveToListOfGateways							****/
/****** Description: Añade todas las pasarelas de la configuración activa		****/
/****** 			 y vivas en el sistema a la lista de pasarelas a activar	****/
/****** Parameters: 	 														****/
/***********************************************************************************/
/*var AddGatewaysFromActiveToListOfGateways = function(idSite){
	$.ajax({type: 'GET', 
			url: '/gateways/activeCfg',
			success: function(data){
				$.each(data, function(index, value){
					if (idSite == null || value.EMPLAZAMIENTO_idEMPLAZAMIENTO == idSite)
						AddGatewayToList(value.idCGW);
				});
			}
		});
};
*/
function UpdateGateway() {
    var idGtw = $('#DivGateways').data('idCgw');
    if (serviceId != null) {
        $.ajax({
            type: 'PUT',
            //url: '/gateways/' + $('#Component').text() + '/services/' + serviceId,
            url: '/gateways/' + $('#DivGateways').data('idCgw') + '/services/' + serviceId,
            success: function(data) {
                //GetServices(false);
                PostGateway(f);
            },
            error: function(data) {
                alertify.error('Error asignando servicio a gateway.');
            }
        });
    }
    else
        PostGateway(f);
}

var GoBackGateway = function() {
    $('#DivConfigurations').attr('class', 'fadeNucleo divNucleo');
    $('#FormGateway').hide();
    $("#AddFormGateway").hide();
};

var GetServices = function(resetContent) {

    GetAllServices();
    //if ($('#UpdateGtwButton').text() === 'Add'){
    translateWord('Add', function(result) {
        if (resetContent == true &&
            $('#UpdateGtwButton').text() === result) {
            SelectFirstItem('ServicesFormGateway');
            // SIP Service
            RenderSipService(null, true);
        }
        else {
            // var urlString = '/gateways/' + $('#Component').text() + '/services';
            var urlString = '/gateways/' + $('#DivGateways').data('idCgw') + '/services';
            $.ajax({
                type: 'GET',
                url: urlString,
                success: function(gtw) {
                    if (gtw.servicios != null) {
                        CurrentService = gtw.servicios;

                        SelectServiceName(gtw.servicios.idSERVICIOS);

                        SelectFirstItem('ServicesFormGateway');
                        // SIP Service
                        RenderSipService(gtw.servicios.sip, true);
                        // WEB Service
                        RenderWebService(gtw.servicios.web, false);
                        // SNMP Service
                        RenderSnmpService(gtw.servicios.snmp, false);
                        // Recording Service
                        RenderRecordingService(gtw.servicios.grab, false);
                        // Sincronization Service
                        RenderSincronizationService(gtw.servicios.sincr, false);
                    }
                    else
                        $('#ServicesFormGateway')[0].reset();
                },
                error: function() {
                    $('#ServicesFormGateway')[0].reset();
                }
            });
        }
    });
};
/*
var UpdateSynchroStateInGateways = function(data){
	$.each(data.general,function(index,value){
		$("#listGateways li" ).each(function( index ) {
			if ($( this ).text() == value.name){
				if (value.Activa != null && value.Activa != 0){
					if (value.Sincro == 2)
						$( this ).prop('class','dropable sincro');
					else if (value.Sincro == 1)
						$( this ).prop('class','dropable apply');
					else if (value.Activa)
						$( this ).prop('class','dropable active');
				}
				else
					$( this ).prop('class','dropable');	
			}
		});
	})
}
*/
/*********************************/
/*** Asignar una pasarela libre **/
/*** a una configuración		**/
/*********************************/
function dropAssignedGateway(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("itemDragging");

    if (link_enlaces_libres[data] != null) {
        if (link_enlaces_libres[data].valor.Activa == -1 ||	// Puede que la pasarela esté en la lista de 'No Asignadas' pero aún no se haya activado la configuración.
            !isIpvIn(link_enlaces_libres[data].valor.ipv, link_enlaces)) {
            ev.target.appendChild(document.getElementById(data));
            alertify.confirm('Ulises G 5000 R', "¿Desea mover la pasarela a esta configuración?",
                function() {
                    $('.dropable').removeClass('target');
                    postGatewayToConfig($('#idCFG').val(), data);
                },
                function() {
                    alertify.error('Cancelado');
                    ev.target.removeChild(document.getElementById(data));
                }
            );
        }
        else {
            translateWord('ErrorGatewayAlreadyAssigned', function(result) {
                alertify.error(result);
            });
        }
    }
}

/*************************************/
/*** Liberar una pasarela asignada 	**/
/*** a una configuración			**/
/*************************************/
function dropFreeGateway(ev) {
    ev.preventDefault();
    $('.dropable').removeClass('target');

    var data = ev.dataTransfer.getData("itemDragging");
    if (link_enlaces[data] != null) {
        //document.getElementById(data).classList.remove('sincro');
        ev.target.appendChild(document.getElementById(data));
        deleteGatewayFromConfig(link_enlaces[data].idCFG, link_enlaces[data].valor.idCGW);
    }
}

/*******************************************/
/*** Liberar una slave asignada 		  **/
/*** a una pasarela						  **/
/*******************************************/
function SlaveFree(ev) {
    var idCgw = $('#DivGateways').data('idCgw');

    ev.preventDefault();
    $('th.dropable').removeClass('target');

    var data = JSON.parse(ev.dataTransfer.getData("slaveDragging"));
    //ev.target.appendChild(document.getElementById(data));
    ReleaseSlaveFromGateway(idCgw, data.idSLAVES, data.rank);
}

/*******************************************/
/*** Asignar un recurso en otra slave     **/
/*** asignada a la misma pasarela 		  **/
/*******************************************/
function ResourceAssigned(ev, fila, columna) {
    loadingContent();
    $('td.dropable').removeClass('target');
    $('li.dropable').removeClass('target');

    var slaveTo = $('.Slave' + columna).data('idSLAVE');

    if (ev.dataTransfer.getData("resourceDragging") != '') {
        var data = JSON.parse(ev.dataTransfer.getData("resourceDragging"));
        // Cloning data
        var dataFrom = JSON.parse(JSON.stringify(data));

        data.SLAVES_idSLAVES = slaveTo;
        data.rank = fila;
        data.dataFrom = dataFrom;

        $.ajax({
            type: 'PUT',
            url: '/hardware/positions/' + $('#DivGateways').data('idCgw'),
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(data) {
                resModified = true;
                GetMySlaves();
            }
        });
    }
    else
        alertify.error('Operación no permitida.');
}

/*******************************************/
/*** Asignar un recurso en otra slave     **/
/*** asignada a otra pasarela 			  **/
/*******************************************/
function ResourceChangeOfGateway(ev, idCgw, nameCgw) {
    //$('td.dropable').removeClass('target');
    $('li.dropable').removeClass('target');

    if ($('#DivGateways').data('idCgw') != idCgw) {
        alertify.success('Recurso asignado a gateway \"' + nameCgw + '\"');

        dataOfResource = JSON.parse(ev.dataTransfer.getData("resourceDragging"));
        GetGateway(idCgw, 'null', function() {
            $('#TabHw').click();
        });

    }
    else {
        $('td.dropable').removeClass('target');
        alertify.error('Recurso ya asignado a este gateway.');
    }
}
function ClickToChangeResourceOfGateway(fila, columna) {
    if ($('#DivGateways').data('noSlaves')) {
        alertify.error('Esta gateway no tiene asignados esclavos.');
    }
    else if (dataOfResource != null) {
        $('td.dropable').removeClass('target');

        var slaveTo = $('.Slave' + columna).data('idSLAVE');
        var dataTo = JSON.parse(JSON.stringify(dataOfResource));
        dataTo.SLAVES_idSLAVES = slaveTo;
        dataTo.rank = fila;

        $.ajax({
            type: 'PUT',
            url: '/hardware/positions',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(dataTo),
            success: function(data) {
                if ($('.Res' + fila + columna).data('pos') != null) {
                    var pos = $('.Res' + fila + columna).data('pos');
                    dataOfResource.idPOS = pos;

                    $.ajax({
                        type: 'PUT',
                        url: '/hardware/positions',
                        dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(dataOfResource),
                        success: function(data) {
                            dataOfResource = null;
                            GetAllSlaves();
                        }
                    });
                }
                else {
                    dataOfResource = null;
                    GetAllSlaves();
                }
            }
        });

    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function dragSlave(ev, rank, slave) {
    ev.dataTransfer.setData("slaveDragging", JSON.stringify({ idSLAVES: slave, rank: rank }));
    //    $('th.dropable').addClass('target');
}

/*******************************************/
/*** Asignar una slave libre o asignada   **/
/*** en otra pasarela a una pasarela	  **/
/*******************************************/
function SlaveAssigned(ev, rank, idSlave) {
    if (ev.dataTransfer.getData("slavedragging") != '') {
        loadingContent();
        ev.preventDefault();
        $('.dropable').removeClass('target');

        var idCgw = $('#DivGateways').data('idCgw');
        //var idSlave = '';
        var source = { 'idSlave': '', 'rank': '' };
        var target = { 'idSlave': '', 'rank': '' };

        //idSlave = ev.dataTransfer.getData("itemDragging");
		/*
		 if (idSlave != ""){
		 //	Se asigna un slave desde la lista
		 // Si la posición está ocupada, esta se libera y luego se asigna
		 if (ev.target.id != "" && $('#'+ev.target.id).data('idSLAVE') != '')
		 ReleaseSlaveFromGateway(idCgw, $('#'+ev.target.id).data('idSLAVE'), rank);
		 
		 AssigSlaveToGateway(idSlave, idCgw, rank);
		 }
		 else{
		 */
        // Se cambia la slave de slot (o intercambio de slave)
        source.idSlave = JSON.parse(ev.dataTransfer.getData('slaveDragging')).idSLAVES;
        source.rank = JSON.parse(ev.dataTransfer.getData('slaveDragging')).rank;
        target.idSlave = idSlave; //$('#'+ev.target.id).data('idSLAVE');
        target.rank = rank;

        //VMG Vamos a hacerlo solo una vez, que sea la query la que haga todo el trabajo ;)
        changeSlaveFromGateway(target.rank, source.idSlave, idCgw);
        //if (target.idSlave != ""){
        // El slot destino está ocupado. => Intercambio de slave

        //PutSlaveFromGateway(source.rank,target.idSlave,idCgw);
        //}
        GetMySlaves();
        //}
    }
    else
        alertify.error('Operación no permitida.');
}


function dragResource(ev, idPos, rank, idSLAVES, type, resId) {
    ev.dataTransfer.setData("resourceDragging", JSON.stringify({
        "idPOS": idPos,
        "SLAVES_idSLAVES": idSLAVES,
        "rank": rank,
        "type": type,
        "resId": resId
    }
    )
    );

    //	$('td.dropable').addClass('target');
    //	$('li.dropable').addClass('target');
}

function dragGateway(ev) {
    ev.dataTransfer.setData("itemDragging", ev.target.id);
    //    $('.dropable').addClass('target');
}

function modify(editText, select) {
    $(editText).val($(select).val());
}

/** AGL. 20170516. AGL. Funcion Generica ADD Elemento a Lista Desplegable */
function Add2Select(idSelect, Item2Insert, limit, idTipo) {
    var currentItems = $(idSelect)["0"].length;
    if (currentItems >= limit) {
        alertify.error('Solo se pueden insertar ' + limit + ' ' + idTipo);
        return;
    }
    if (Item2Insert != '') {
        /** Comprobar que no esta repetido... */
        $(idSelect + " > option").each(function() {
            if (this.text == Item2Insert) {
                alertify.error('El elemento ' + idTipo + ' ' + Item2Insert + ", ya está en la lista");
                Item2Insert = null;
            }
        });
        /** Insertar el ITEM. */
        if (Item2Insert) {
            $(idSelect).append($('<option>', {
                value: Item2Insert,
                text: Item2Insert
            }));
            alertify.success('Elemento ' + idTipo + ' ' + Item2Insert + " añadido...");
        }
    }
}

/** 20170516. AGL. No dejar insertar No duplicados */
function AddProxy() {
    Add2Select('#ProxysList', $('#ProxyEdit').val(), 2, 'PROXY');
	/*
	if($('#ProxysList')["0"].length != 2) {
		if ($('#ProxyEdit').val() != ''){
			alertify.success('Proxy añadido.');
			$('#ProxysList').append($('<option>',{
				value: $('#ProxyEdit').val(), 
				text: $('#ProxyEdit').val()
			}));
		}
	}
	else
		alertify.error('Solo se pueden insertar dos proxies para este servicio.');
		*******************/
}

function RemoveProxy() {

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el proxy \"" + $("#ProxysList option:selected").val() + "\"?",
        function() {
            $("#ProxysList option:selected").remove();
            $('#ProxysList option:eq(1)');
            modify('#ProxyEdit', '#ProxysList');

            //alertify.success('Ok'); 
        },
        function() { alertify.error('Cancelado'); }
    );

}

/** 20170516. AGL. No dejar insertar No duplicados */
function AddRegistrar() {
    Add2Select('#RegistrarsList', $('#RegistrarEdit').val(), 2, 'REGISTRAR');
	/*
	if($('#RegistrarsList')["0"].length != 2) {
		if ($('#RegistrarEdit').val() != '') {
			alertify.success('Registrar añadido.');
			$('#RegistrarsList').append($('<option>', {
				text: $('#RegistrarEdit').val()
			}));
		}
	}
	else
		alertify.error('Solo se pueden insertar dos registrars para este servicio.');
		***************************/
}

function RemoveRegistrar() {

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el registrar \"" + $("#RegistrarsList option:selected").val() + "\"?",
        function() {
            $("#RegistrarsList option:selected").remove();
            $('#RegistrarsList option:eq(1)');
            modify('#RegistrarEdit', '#RegistrarsList');
        },
        function() { alertify.error('Cancelado'); }
    );

}

/** 20170516. AGL. No dejar insertar No duplicados */
function AddTrap() {
    if ($('#TrapIP').val() == '' || $('#TrapPort').val() == '') {
        alertify.error("Es obligatorio rellenar campos validos para -Direccion IP- y -Puerto-");
        return;
    }
    var Item2Insert = $('#TrapVersion').val() + ',' + $('#TrapIP').val() + '/' + $('#TrapPort').val();
    Add2Select('#TrapsList', Item2Insert, 4, 'Destinos TRAPS');
	/*
	if($('#TrapsList').length == 4 || $('#TrapsList')[0].childNodes.length == 4 ) {
		translateWord('ErrorNumberTrap',function(result){
			alertify.error(result);
		});
	}
	else {
		if ($('#TrapIP').val() != '' && $('#TrapPort').val() != ''){
			$('#TrapsList').append($('<option>',{
				text: $('#TrapVersion').val() + ',' + $('#TrapIP').val() + '/' + $('#TrapPort').val()
			}));
			$('#TrapIP').val('');
			$('#TrapPort').val('');
		}
		else{
			translateWord('ErrorAddingTrap',function(result){
				alertify.error(result);
			});
		}
	}
	**************************/
}
/** 20190201. AGL. Solucion Incidencia 3405: Eliminar Trap sin seleccionar ninguno */
function RemoveTrap() {

    var SelectedTrap = $("#TrapsList option:selected").val();
    if (SelectedTrap != undefined) {

        alertify.confirm('Ulises G 5000 R', "¿Eliminar trap \"" + $("#TrapsList option:selected").val() + "\"?",
            function() {
                $("#TrapsList option:selected").remove();
                $('#TrapIP').val('');
                $('#TrapPort').val('');
            },
            function() { alertify.error('Cancelado'); }
        );
    }
    else {
        alertify.error("Seleccione un item para eliminar.");
    }
}

/** 20170516. AGL. No dejar insertar No duplicados */
function AddServer() {
    Add2Select('#NtpServersList', $('#ServerEdit').val(), 2, 'NTP SERVER');
	/*
	if ($('#ServerEdit').val() != ''){
		if ($('#NtpServersList option:eq(1)').text().length>0)
		{
			alertify.error("Superado el número máximo de servidores NTP. Se permiten dos.");
			$('#ServerEdit').val('');		
			return;
		}

		$('#NtpServersList').append($('<option>',{
			text: $('#ServerEdit').val()
		}));
	}
	*************************/
    $('#ServerEdit').val('');
}

function RemoveServer() {

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el servidor NTP \"" + $("#NtpServersList option:selected").val() + "\"?",
        function() {
            $("#NtpServersList option:selected").remove();
            $('#ServerEdit').val('');
            $('#NtpServersList option:eq(1)');
            //alertify.success('Ok'); 
        },
        function() { alertify.error('Cancelado'); }
    );

}

/*
function AddServiceName(serviceName, seleccionar){
	// Load service names list
    var options = '';
	options += '<option value="' + serviceName + '">' + serviceName + '</option>';

	$('#ListServices').html(options);
	if (seleccionar)
		$('#ListServices option:eq(1)');
}
*/

function OnClickUpdatePeriod(cb) {
    $('#TbUpdatePeriod').prop('disabled', !cb.checked);
    //if (!cb.checked)
    //	$('#TbUpdatePeriod').val('');
}

function RenderSipService(sip, visible) {

    if (visible) {
        $('#AddFormsite').animate({ width: '790px', height: '500px' });
        $('#SipServiceGateway').show();
        $('#sipService').addClass('selected');
        $('#sincrService').removeClass('selected');
        $('#snmppService').removeClass('selected');
        $('#webService').removeClass('selected');
        $('#grabService').removeClass('selected');
        $('#SincrServiceGateway').hide();
        $('#SnmpServiceGateway').hide();
        $('#WebServiceGateway').hide();
        $('#RecordingServiceGateway').hide();
    }
    else
        $('#SipServiceGateway').hide();

    if (sip == null) return;

    $('#PuertoLocalSIP').val(sip.PuertoLocalSIP);
    //$('#kap').val(sip.KeepAlivePeriod);
    //$('#kam').val(sip.KeepAliveMultiplier);
    //$('#SupresionSilencio').prop('checked',sip.SupresionSilencio);
    $('#CbRUpdatePeriod').prop('checked', sip.PeriodoSupervisionSIP != 0);
    $('#TbUpdatePeriod').prop('disabled', sip.PeriodoSupervisionSIP == 0);
    $('#TbUpdatePeriod').val(sip.PeriodoSupervisionSIP);

    // Load proxys list
    var options = '';
    for (var i = 0; i < sip.proxys.length; i++) {
        if (sip.proxys[i].ip != "")
            options += '<option value="' + sip.proxys[i].ip + '">' + sip.proxys[i].ip + '</option>';
        /*		if (i==0)
                    $('#ProxyEdit').val(sip.proxys[i].ip);*/
    }
    $('#ProxysList').html(options);
    $('#ProxysList option:eq(1)');

    // Load registrars list
    options = '';
    for (var j = 0; j < sip.registrars.length; j++) {
        if (sip.registrars[j].ip !== "")
            options += '<option value="' + sip.registrars[j].ip + '">' + sip.registrars[j].ip + '</option>';
        /*		if (i==0)
                    $('#RegistrarEdit').val(sip.registrars[i].ip);*/
    }
    $('#RegistrarsList').html(options);
    $('#RegistrarsList option:eq(1)');
}

function loadSiteList(data, gtwSite) {
    // Load proxys list
    $('#ListSites').empty();
    var options = '';
    var currentCfg = Site2Config(gtwSite, data);

    for (var i = 0; i < data.length; i++) {

        if (data[i].idEMPLAZAMIENTO === gtwSite) {
            if (optGWMOVE_BETWEENCFG == true) {
                options += '<option selected="true" value="' + data[i].idEMPLAZAMIENTO + '">' + data[i].nameCfg + '-' + data[i].name + '</option>';
            }
            else {
                options += '<option selected="true" value="' + data[i].idEMPLAZAMIENTO + '">' + data[i].name + '</option>';
            }
        }
        else {
            /** 20170518 AGL Opcion de Mover Pasarelas entre configuraciones */
            if (optGWMOVE_BETWEENCFG == false) {
                if (data[i].nameCfg != currentCfg)
                    continue;
                options += '<option value="' + data[i].idEMPLAZAMIENTO + '">' + data[i].name + '</option>';
            }
            else {
                options += '<option value="' + data[i].idEMPLAZAMIENTO + '">' + data[i].nameCfg + '-' + data[i].name + '</option>';
            }
        }
    }
    $('#ListSites').html(options);
    //$('#ListSites').refresh();
}

function RenderWebService(web, visible) {
    if (visible)
        $('#WebServiceGateway').show();
    else
        $('#WebServiceGateway').hide();

    if (web == null) return;

    $('#wport').val(web.wport);
    $('#stime').val(web.stime);
}

function RenderSnmpService(snmp, visible) {
    if (visible) {
        $('#SnmpServiceGateway').show();
    }
    else
        $('#SnmpServiceGateway').hide();

    if (snmp == null) return;

    $('#agv2').prop('checked', snmp.agv2 == 1);
    OnChangeVersionSnmp();

    $('#agcomm').prop('enabled', snmp.agv2 == 1);
    if (snmp.agv2 == 1)
        $('#agcomm').val(snmp.agcomm);
    $('#snmpp').val(snmp.snmpp == null ? '65001' : snmp.snmpp);
    $('#sport').val(snmp.sport == null ? '161' : snmp.sport);
    $('#agcont').val(snmp.agcont);
    $('#agloc').val(snmp.agloc);
    $('#agname').val(snmp.agname);
    // Trap info
    $('#TrapsList').empty();
    // Load registrars list
    var options = '';
    if (snmp.traps != null) {
        for (var i = 0; i < snmp.traps.length; i++) {
            if (snmp.traps[i] != '')
                options += '<option value="' + snmp.traps[i] + '">' + snmp.traps[i] + '</option>';
        }
    }
    $('#TrapsList').html(options);
}

function RenderRecordingService(grab, visible) {
    if (visible)
        $('#RecordingServiceGateway').show();
    else
        $('#RecordingServiceGateway').hide();

    if (grab == null) return;

    $('#rtsp_port').val(grab.rtsp_port);
    //$('#rtsp_uri').val(grab.rtsp_uri);
    $('#rtsp_ip').val(grab.rtsp_ip);
    /** 20170517 AGL. Segundo Grabador */
    $('#rtspb_ip').val(grab.rtspb_ip);
    //$('#rtp_tramas').prop('checked', grab.rtsp_rtp ? 1 : 0);
}

function RenderSincronizationService(sincr, visible) {
    if (visible)
        $('#SincrServiceGateway').show();
    else
        $('#SincrServiceGateway').hide();

    if (sincr == null) return;

    // Load servers list
    var options = '';
    if (sincr.servidores != null && sincr.servidores.length > 0) {
        for (var i = 0; i < sincr.servidores.length; i++) {
            if (sincr.servidores[i].ip != "")
                options += '<option value="' + sincr.servidores[i].ip + '">' + sincr.servidores[i].ip + '</option>';
        }
        $('#NtpServersList').html(options);
        $('#NtpServersList option:eq(1)');
    }
}

function ReinitFormGateways() {
    $('#LblEmplazamiento').text($('#IdSite').val());

    SelectFirstItem('ListMenuGateways');	// Seleccionar primera opción del menú (General)
    SelectFirstItem('AddFormGateway');		// Seleccionar primera opción de CPUs
    $('#tab1').show(); $('#tab2').hide();

    $('#ServicesFormGateway').hide();
    $('#HwFormGateway').hide();
    $('#ServicesFormGateway')[0].reset();
    //$('#CBEmplazamiento option:eq(0)').prop('selected', true);

    // Reset list of class: toReset
    $('.toReset')
        .find('option')
        .remove();
}

function SelectServiceName(name) {
    $('#ListServices option[value="' + name + '"]').prop('selected', true);
}

function SelectFirstItem(form) {
    var tabs = document.getElementById(form).getElementsByTagName("a");
    for (var i = 0; i < tabs.length; i++) {
        if (i == 0)
            tabs[i].className = "selected";
        else
            tabs[i].className = "";
    }
}

function GetAllSlaves() {
    // Identificador de la pasarela
    // var idCgw = $('#DivGateways').data('idCgw');

    $.ajax({
        type: 'GET',
        url: '/hardware',
        success: function(data) {
            ResetHardware();
            ShowAssignedSlaves(data);
        }
    });
}

function ResetFiltering() {
    // Identificador de la pasarela
    var idCgw = $('#DivGateways').data('idCgw');

	/*
	$.ajax({type: 'GET', 
			url: '/hardware/site/' + $('#CBEmplazamiento option:selected').val(), 
			success: function(data){
				var groups=[];

				$('#LFiltering li:gt(0)').remove();
				$('#CBAll').prop('checked',true);

				if (data.hardware != null){
					$.each(data.hardware, function(index, value){
						// Gestión de grupos de esclavas
						if ($.inArray(value.nameOfGroup,groups) < 0){
							groups.push(value.nameOfGroup);
							var item = $("<li>" + value.nameOfGroup + "<input id='" + value.nameOfGroup + "' type='checkbox' style='float:right' onclick='ClickFilteringGroup(this)' disabled='disabled'></li>");
							item.appendTo($("#LFiltering"));
						}
					});
				}
			}
	});	
*/
}

function UpdateHardware(f) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $('.Res' + i + j).data('updated', false);
        }
    }

    if (f != null)
        f();
}

function UpdateAssignedSlaves(data) {
    //var loadIndex = 0;//Indica el índice de carga de la pasarela
    var idCgw = $('#DivGateways').data('idCgw');
    // Se utiliza en el click de cambio de recurso entre pasarelas
    $('#DivGateways').data('noSlaves', true);

    if (data.hardware != null) {
        $.each(data.hardware, function(index, value) {
            if (idCgw != null && value.CGW_idCGW == idCgw) {
                $('#DivGateways').data('noSlaves', false);
                //if ($('.Slave'+value.rank).data('idSLAVE') != value.idSLAVES)
                //{
                $('.Slave' + value.rank).data('idSLAVE', value.idSLAVES);

                //assignedSlaves.push(value.name);
                //$('.listHardware li').filter(function() { return $.text([this]) === value.name; }).remove();

                $('.Slave' + value.rank + ' a:first-child').text(value.name)
                    .attr('style', 'color:black')
                    .attr('id', value.idSLAVES)
                    .data('idSLAVE', value.idSLAVES);
                $('.Slave' + value.rank + ' a:first-child').text(value.tp == '0' ? 'IA4' : 'IQ1')
                    .attr('style', 'color:black; font-size: 8px; margin-right: 0')
                    .attr('id', value.idSLAVES)
                    .data('idSLAVE', value.idSLAVES);

                $('.Slave' + value.rank).addClass('dragableItem occuped')
                    .attr('draggable', true)
                    .attr('ondrop', "SlaveAssigned(event," + value.rank + "," + value.idSLAVES + ")")
                    .attr('ondragstart', "dragSlave(event," + value.rank + "," + value.idSLAVES + ")")
                    .data('idSLAVE', value.idSLAVES);
                // Obtener los recursos de la slave
                $.ajax({
                    type: 'GET',
                    url: '/hardware/' + value.idSLAVES,
                    success: function(data) {
                        //ShowResourcesFromSlave(value.idSLAVES,value.rank, data, function(){if ( i>=data.hardware.length && f != null) f()});
                        //Este es el que lee constantemente
                        ShowResourcesFromSlave(value.idSLAVES, value.rank, data, false, function() {
                            for (var i = 0; i < 4; i++) {
                                for (var j = 0; j < 4; j++) {
                                    if ($('.Res' + i + j).data('updated') == false) {
                                        $('.Res' + i + j + ' a').text('')
                                            .data('pos', null)
                                            .data('idResource', null)
                                            .data('loadIndex', 0)
                                            .attr('draggable', false)
                                            .attr('ondragstart', "");
                                        //if(loadIndex>=totalRecursos)
                                        //	totalRecursos = loadIndex;
                                        $('.Res' + i + j).attr('onclick', "GetResourceFromGateway('" + i + "','" + j + "',false)");
                                    }
                                }
                            }
                        });
                    }
                });
                //}
            }
        });
    }
}

function ResetHardware(f) {
    //$(".listHardware").empty();
    //$('#SiteOfSlave').text($('#CBEmplazamiento option:selected').text())

    //$('#LFiltering li:gt(0)').remove();
    //$('#CBAll').prop('checked',true);

    $('#HardwareZone a').text('')
        .data('idSLAVE', '');
    $('#HardwareZone th').removeClass('occuped')
        .attr('draggable', false)
        .data('idSLAVE', '');

    // Reset data y attr de recursos
    if (dataOfResource == null) {
        $('td.dropable').data('pos', null)
            .attr('draggable', false);
        //.attr('onclick','');
        for (var i = 0; i < 4; i++) {
            $('.Slave' + i).removeClass('occuped');
        }

        for (var h = 0; h < 4; h++) {
            for (var j = 0; j < 4; j++) {
                $('.Res' + h + j).data('pos', null)
                    .data('idResource', null)
                    .data('loadIndex', 0)
                    .attr('draggable', false)
                    .attr('ondragstart', "")
                    .attr('onclick', "GetResourceFromGateway('" + h + "','" + j + "',false)");
            }
        }

        if (f != null)
            f();
    }
    else {
        for (var k = 0; k < 4; k++) {
            for (var m = 0; m < 4; m++) {
                $('.Res' + k + m).data('pos', null)
                    .data('idResource', null)
                    .attr('draggable', false)
                    .attr('onclick', "ClickToChangeResourceOfGateway(" + k + "," + m + ")");
            }
        }

        if (f != null)
            f();
    }
}

/************************************/
/*	FUNCTION: ShowAssignedSlaves 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function ShowAssignedSlaves(data) {
    var iconRadio = "<img src='/images/iconRadio.gif' style='float: right'/>";
    var iconRadioIn = "<img src='/images/iconRadioIn.gif' style='float: right'/>";
    var iconRadioOut = "<img src='/images/iconRadioOut.gif' style='float: right'/>";
    var iconRadioInOut = "<img src='/images/iconRadioInOut.gif' style='float: right'/>";
    var iconPhone = "<img src='/images/iconPhone.gif' style='float: right'/>";
    var iconOperator = "<img src='/images/iconOperator.gif' style='float: right'/>";

    var loadIndex = 0;
    $('#LbLoadIndex').text('Indice de carga: ');
    loadIndex = calculateLoadIndex(data);
    $('#LbLoadIndex').append(loadIndex);

    if (loadIndex > 16) {
        $('#LbLoadIndex').append(' - Indice máximo sobrepasado.');
        $('#LbLoadIndex').css('color', 'red');
    }
    else
        $('#LbLoadIndex').css('color', 'black');
    var idCgw = $('#DivGateways').data('idCgw');
    //var assignedSlaves=[];
    //var freeSlaves=[];
    //var groups=[];
    //var i=0;

    // Se utiliza en el click de cambio de recurso entre pasarelas
    $('#DivGateways').data('noSlaves', true);

    //Empezamos desde aquí
    //Inicializar las IA4
    var isAuthorized = Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]);

    for (var i = 0; i < 4; i++) {
        var dragStart = '';
        var onDrop = "SlaveAssigned(event," + i + "," + i + ")";
        if (isAuthorized) {
            dragStart = "dragSlave(event," + i + "," + i + ")";
        }

        $('.Slave' + i + ' a:first-child').text(i)
            .attr('style', 'color:black')
            .attr('id', 'IA4' + i)
            .data('idSLAVE', i);

        $('.Slave' + i + ' a:first-child').text('IA4')
            .attr('style', 'color:black; font-size: 8px; margin-right: 0')
            .attr('id', 'IA4' + i)
            .data('idSLAVE', i);

        $('.Slave' + i).addClass('dragableItem occuped')
            .attr('draggable', true)
            .attr('ondrop', onDrop)
            .attr('ondragstart', dragStart)
            .data('idSLAVE', i);
    }

    if (data.radio != null || data.tfno != null) {
        $.each(data.radio, function(index, value) {
            var dragStartResRadio = '';
            if (isAuthorized) {
                dragStartResRadio = "dragResource(event," + value.columna + "," + value.fila + "," + value.columna + ",1," + value.idrecurso_radio + ")";
            }
            $('.Res' + value.fila + value.columna).data('idResource', value.idrecurso_radio);
            $('.Res' + value.fila + value.columna).data('updated', true).data('loadIndex', loadIndex)
                .attr('onclick', "GetResourceFromGateway('" + value.fila + "','"
                    + value.columna + "',true,'1','" + value.idrecurso_radio + "')");

            if (value.tipo_agente == 4)
                $('.Res' + value.fila + value.columna + ' a').text(value.nombre).append(' - ' + value.frecuencia.toFixed(3) + ' MHz').append(iconRadioInOut);
            else if (value.tipo_agente == 5)
                $('.Res' + value.fila + value.columna + ' a').text(value.nombre).append(' - ' + value.frecuencia.toFixed(3) + ' MHz').append(iconRadioOut);
            else if (value.tipo_agente == 6)
                $('.Res' + value.fila + value.columna + ' a').text(value.nombre).append(' - ' + value.frecuencia.toFixed(3) + ' MHz').append(iconRadioIn);
            else
                $('.Res' + value.fila + value.columna + ' a').text(value.nombre).append(' - ' + value.frecuencia.toFixed(3) + ' MHz').append(iconOperator);
            $('.Res' + value.fila + value.columna + ' a')
                .attr('draggable', true)
                .attr('ondragstart', dragStartResRadio);

            if (value.tipo_agente == 2 || value.tipo_agente == 3)
                $('.Res' + value.fila + value.columna).data('localLoadIndex', 8);
            else
                $('.Res' + value.fila + value.columna).data('localLoadIndex', 2);
        });
        $.each(data.tfno, function(index, value) {
            var dragStartResPhone = '';
            if (isAuthorized) {
                dragStartResPhone = "dragResource(event," + value.columna + "," + value.fila + "," + value.columna + ",2," + value.idrecurso_telefono + ")";
            }
            $('.Res' + value.fila + value.columna).data('idResource', value.idrecurso_telefono);
            $('.Res' + value.fila + value.columna).data('updated', true).data('loadIndex', loadIndex)
                .attr('onclick', "GetResourceFromGateway('" + value.fila + "','"
                    + value.columna + "',true,'2','" + value.idrecurso_telefono + "')");
            $('.Res' + value.fila + value.columna + ' a').text(value.nombre).append(iconPhone);
            $('.Res' + value.fila + value.columna + ' a')
                .attr('draggable', true)
                .attr('ondragstart', dragStartResPhone);
            $('.Res' + value.fila + value.columna).data('localLoadIndex', 1);

        });
    }
    //Terminamos aquí

	/*if (data.hardware != null){
		$.each(data.hardware, function(index, value){
			//i++;
			// Guardar idSLAVE en la columna correspondiente
			//$('.Slave'+value.rank).data('idSLAVE',value.idSLAVES);

			if (idCgw != null && value.CGW_idCGW == idCgw){
				$('#DivGateways').data('noSlaves',false);
				$('.Slave'+value.rank).data('idSLAVE',value.idSLAVES);//Aquí se pinta la IA4

				//assignedSlaves.push(value.name);
				//$('.listHardware li').filter(function() { return $.text([this]) === value.name; }).remove();

				$('.Slave'+value.rank  + ' a:first-child').text(value.name)
														.attr('style','color:black')
														.attr('id',value.idSLAVES)
														.data('idSLAVE',value.idSLAVES);
				$('.Slave'+value.rank + ' a:first-child').text(value.tp=='0' ? 'IA4' : 'IQ1')
														.attr('style','color:black; font-size: 8px; margin-right: 0')
														.attr('id',value.idSLAVES)
														.data('idSLAVE',value.idSLAVES);

				$('.Slave'+value.rank).addClass('dragableItem occuped')
										.attr('draggable',true)
										.attr('ondrop',"SlaveAssigned(event," + value.rank + "," + value.idSLAVES + ")")
										.attr('ondragstart',"dragSlave(event," + value.rank + "," + value.idSLAVES + ")")
										.data('idSLAVE',value.idSLAVES);

				// Obtener los recursos de la slave
				$.ajax({type: 'GET', 
						url: '/hardware/' + value.idSLAVES, 
						success: function(data){
									//ShowResourcesFromSlave(value.idSLAVES,value.rank, data, function(){if ( i>=data.hardware.length && f != null) f()});
									 ShowResourcesFromSlave(value.idSLAVES,value.rank, true, data);//Aquí lee los 4 primeros slaves
									cicloCompleto++;
								}
				});
			}
			// else{
			// 	// Solo las tarjetas no asignadas a esta pasarela se muestran en la lista
			// 	if ($.inArray(value.name,assignedSlaves) < 0 &&
			// 		$.inArray(value.name,freeSlaves) < 0){
			// 		freeSlaves.push(value.name);
				
			// 		var clase="dragableItem";

			// 		if (value.CGW_idCGW != null)
			// 			clase="dragableItemOccuped";

			// 		var item = $("<li data-group='" + value.nameOfGroup + "'><div id='" + value.idSLAVES + "' class='" + clase + "' style='color:#bf2a36' draggable='true' ondragstart='dragGateway(event)'>" + value.name + "</li>");
			// 		item.appendTo($(".listHardware"));
			// 	}
			// }

			//i++;
		});
		//}
		//
	}*/
}

function ShowResourcesFromSlave(idSlave, slave, data, isFirstLoad, f) {
    //var i = 0;
    //if(isFirstLoad && cicloCompleto == 0)
    //	alertify.error("Cargando datos... Por favor, espere para seleccionar los recursos.");
	/*if(cicloCompleto == 4){
		alertify.success("Datos cargados con éxito.");
		cicloCompleto = 0;
	}*/



    //Esto no termina de funcionar bien, ya que aún permite la edición aunque salga el mensaje
    //var loadIndex = 0;
    if (data.hardware != null && data.hardware.length > 0) {
        $.each(data.hardware, function(rowIndex, r) {
			/*if(data.hardware[0].tipo === 0)
				loadIndex++;
			else
			{
				if(data.hardware[0].subtipo === 2 || data.hardware[0].subtipo === 3)
					loadIndex = loadIndex + 8;
				else
					loadIndex = loadIndex + 2;
			}*/

            var fila = r.P_rank;
            var col = slave;
            if (r.resource != null) {
                if (dataOfResource == null) {
                    // Guardar idSLAVE en la columna correspondiente
                    $('.Res' + fila + col).data('idResource', r.idRECURSO);
                    $('.Res' + fila + col).data('updated', true);

                    // No viene de una operacion de D&D sobre otra pasarela
                    $('.Res' + fila + col)//.attr('onclick','GotoSlave(' + idSlave + ')')
                        .data('pos', r.POS_idPOS)
                        .attr('draggable', true)
                        .attr('ondragstart', "dragResource(event," + r.POS_idPOS + "," + fila + "," + idSlave + ")")
                        .attr('onclick', "GetResourceFromGateway('" + fila + "','" + col + "',true" + ")");
                    //.attr('onclick',"UpdateResource('" + idSlave + "','" + fila + "')");
                }
                else {
                    $('.Res' + fila + col).data('idResource', -1);

                    $('.Res' + fila + col).attr('onclick', "ClickToChangeResourceOfGateway(" + fila + "," + col + ")")
                        .data('pos', r.POS_idPOS)
                        .attr('draggable', false)
                        .attr('ondragstart', "dragResource(event," + r.POS_idPOS + "," + fila + "," + idSlave + ")");
                }

                if (r.tipo == 1) {
                    $('.Res' + fila + col + ' a').text(r.resource).append(' - ' + r.Frecuencia + ' MHz').append($("<img src='/images/iconRadio.gif' style='float: right'/>"));
                }
                else
                    $('.Res' + fila + col + ' a').text(r.resource).append($("<img src='/images/iconPhone.gif' style='float: right'/>"));



            }
        });
        //totalRecursos += loadIndex;
    }

    if (f != null)
        f();
}

function GotoSlave(idSLAVE) {
    hidePrevious('#FormHardware', '#BigSlavesZone', '#DivHardware');
    GetHardware();
    GetSlave(idSLAVE);
}

function OnChangeVersionSnmp() {
    if ($('#agv2').prop('checked')) {
        $('#agLabelComm').show();
        $('#agcomm').show();
        $('#agcomm').prop('disabled', false);
    }
    else {
        //$('#agLabelComm').hide();
        //$('#agcomm').hide();
        $('#agcomm').prop('disabled', true);
    }
}

function ClickFilteringGroup(item) {
    $('.listHardware li').attr('style', 'display:none');
    $('#LFiltering li:gt(0)').find('input').prop('disabled', false);
    $.each($('#LFiltering input:checked'), function(index, value) {
        if (value.id === 'CBAll') {
            $('.listHardware li').attr('style', 'display:list-item');
            $('#LFiltering li:gt(0)').find('input').prop('disabled', 'disabled');
            return false;
        }
        /*		if (value.id === 'CBNone'){
                    $('.listHardware li').attr('style','display:none')
                    return false;
                }
        */
        $.each($(".listHardware li"), function(index, group) {
            if ($(group).data('group') == value.id)
                $(group).attr('style', 'display:list-item');
        });
    });
}

function isIpvIn(ipv, lista) {
    var array = $.map(lista, function(value, index) {
        return [value];
    });

    for (var i = 0; i < array.length; i++) {
        if (array[i] != null && array[i].valor.ipv == ipv)
            return true;
    }

    return false;
}

/************************************/
/*	FUNCTION: ExportConfiguration 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var ExportConfiguration = function() {
    var idGateway = $('#IdSite').data('gatewayId');

    $.ajax({
        type: 'GET',
        url: '/configurations/export/' + idGateway,

        success: function(data) {
            var myLink = document.createElement('a');
            myLink.download = data.general.emplazamiento + '_' + data.general.name + '_' + data.fechaHora + '.json';
            myLink.href = "data:application/json," + JSON.stringify(data, null, '\t');
            myLink.click();
        },
        error: function(data) {

        }
    });
};

var CloseImportConfiguration = function() {
    $('#ImportZone').animate({ width: '0px', height: '0px' }, 500, function() {
        $('#ColumnImportZone').attr('style', 'display:none');
        $('#ImportZone').hide();

        $('#AddFormsite').removeClass('disabledDiv');
        $('#SitesList').removeClass('disabledDiv');
        $('#NavMenu').removeClass('disabledDiv');
        $('#NavConfiguration').removeClass('disabledDiv');
    });
};

var ImportConfiguration = function() {

    $('#fileselectbtn').val('');

    $('#AddFormsite').addClass('disabledDiv');
    $('#SitesList').addClass('disabledDiv');
    $('#NavMenu').addClass('disabledDiv');
    $('#NavConfiguration').addClass('disabledDiv');

    // Datos necesarios para realizar la importación
    $('#config').val($('#DivConfigurations').data('idCFG'));
    $('#site').val($('#IdSite').data('idSite'));
    $('#cfgData').val(JSON.stringify($('#DivConfigurations').data('cfgJson')));


    $('#ColumnImportZone').attr('style', 'display:inline');
    $('#ImportZone').attr('style', 'position:absolute;width:0px;height:0px;top:180px;left:460px;display:inline-table');
    $('#ImportZone').animate({ width: '35%', height: '195px' }, 500, function() {
        $('#ImportZone').addClass('divNucleo');
    });

};

/************************************/
/*	FUNCTION: NewGateway 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function NewGateway() {
    translateWord('Configurations', function(result) {
        var titulo = result + ': ' + $('#name').val();
        translateWord('Sites', function(result) {
            var titulo2 = titulo + ".\t" + result + ': ' + $('#IdSite').val() + '.';
            translateWord('Gateways', function(result) {
                $('#TitleH3').text(titulo2 + '\t' + result + ': ' + name + '.');
            });
        });
    });
    var idSite = $('#IdSite').data('idSite');
    translateWord('CreateGateway', function(result) {
        $('#UpdateGtwButton').text(result)//TsODO Create Gateway
            .attr('onclick', 'PostGateWay(' + idSite + ',false,false)');
    });
    //$('#IdSite').data('gatewayName',name)
    //$('#IdSite').data('gatewayId',id)

    $('#DivSites').animate({ width: '1150px' }, function() {
        $('#TrCreateGateway').hide();
        $('#TrToolsSite').hide();
        $('#TrSite').hide();
        //if (id == null){
        $('#LblIdGateway').text('');
        $('#ListMenuGateways li:nth-child(3)').attr('style', 'display:none');
        //}
        //else
        //	$('#ListMenuGateways li:nth-child(3)').attr('style','display:block');

        //GetGateways(null,function(){
        $('#AddFormGateway').show();
        $('#AddFormsite').animate({ width: '790px', height: '410px' });
        $('#DivGateways').animate({ width: '1015px' });
        $('#GeneralContent').show();
        $('#TableToolsGateway').show();

        $('#lips').hide();
        $('#ips').hide();

        ReinitFormGateways();

        $('#RemoveGateway').hide();

        $('#dual').prop('checked', true);
        $('#dual').prop('disabled', true);

        $('#lan12').hide();
        $('#lan22').hide();
        $('#nic2').show();
        $('#liCpu2').show();
        $('#lan11').hide();
        $('#lan21').hide();
        $('#nic1').show();

        //$('#TbUpdatePeriod').prop('disabled', true);
        $('#TbUpdatePeriod').val('90');
        RenderSipService(null, true);//Para mostrar el primer item.
        //$('#LblIdGateway').text(name);
        $('#hwGateway').fadeIn(500, function() {
            // translateWord('Sites',function(result1){
            // 	translateWord('Gateways',function(result2){
            // 		$('#TitleSite').text(result1 + ": " + $('#IdSite').val() + '. ' + result2 + ': ' + name)
            // 	})
            // })
        });
        //})
    });
    //ResetAllFields();
    $('#nameGw').val('');
    $('#ipv').val('');
    $('#ipb1').val('');
    $('#ipg1').val('');
    $('#msb1').val('');
    $('#ipb2').val('');
    $('#ipg2').val('');
    $('#msb2').val('');
	//ToDo No funciona el inicializar el valor del emplazamiento, se resetea despues...
	/*var title = $('#TitleH3').text().split(" ");
	var aux = title[1].replace(".	Emplazamientos:", "-");
	var site = '<option value="">'+aux+title[2].replace(".	Pasarelas:", "")+'</option>';
	$('#ListSites').html(site);
	$('#ListSites').html(options);
	*/$('#ListSites').append($('<option>', {
        value: 1,
        text: 'My option'
    }));

    $('#labelSites').hide();
    $('#ListSites').hide();
    $('#CopyGtwButton').hide();
    $('#sppe').val(0);
    $('#dvrrp').val(2000);

}

/************************************/
/*	FUNCTION: getServices4Copy 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function getServices4Copy() {
    var options = '';
    $.ajax({
        type: 'GET',
        url: '/gateways/availableservices',
        success: function(data) {
            if (data.error != null) {
                options = '<option value="" disabled selected>Error seleccionando los servicios.</option>';
                alertify.error('Error ' + data.error + '. Al recuperar los servicios.');
            }
            else {
                translateWord('SelectService', function(result) {
                    options = '<option value="" disabled selected>' + result + '</option>';

                    $.each(data.result, function(index, value) {
                        if (value.nombre != null)
                            options += '<option value="' + value.idpasarela + '">' + value.nombre + '</option>';
                    });

                    $('#ListServices').html(options);
                });
            }
        }
    });
}

/************************************/
/*	FUNCTION: copyServiceData 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function copyServiceData() {
    var idSourceCgw = $('#ListServices')[0].value;

    $.ajax({
        type: 'GET',
        url: '/gateways/getServiceData/' + idSourceCgw,
        success: function(data) {
            if (data.error != null) {
                alertify.error('Error ' + data.error + '. Al recuperar los datos del servicio.');
            }
            else {
                //Borramos todos los selects antes
                $('#ProxysList').empty();
                $('#RegistrarsList').empty();
                $('#NtpServersList').empty();
                $('#TrapsList').empty();
                //Peticion de las uris
                GetIps4Gateway(idSourceCgw);
                $('#PuertoLocalSIP').val(data.result[0].puerto_sip.toString());


                $('#TbUpdatePeriod').val(data.result[0].periodo_supervision.toString());

                //SNMP
                $('#sport').val(data.result[0].puerto_servicio_snmp);
                $('#snmpp').val(data.result[0].puerto_snmp);
                $('#agname').val(data.result[0].nombre_snmp);
                $('#agloc').val(data.result[0].localizacion_snmp);
                $('#agcont').val(data.result[0].contacto_snmp);

                $('#agcomm').val(data.result[0].comunidad_snmp);
                if (data.result[0].snmpv2 == 1) {
                    $('#agv2').prop('checked', true);
                    $('#agcomm').prop('disabled', false);
                }
                else {
                    $('#agv2').prop('checked', false);
                    $('#agcomm').prop('disabled', true);
                }
                //WEB
                if (data.result[0].puerto_servicio_web != null)
                    $('#wport').val(data.result[0].puerto_servicio_web.toString());
                $('#stime').val(data.result[0].tiempo_sesion.toString());

                //GRABACION
                if (data.result[0].puerto_rtsp != null)
                    $('#rtsp_port').val(data.result[0].puerto_rtsp.toString());
                if (data.result[0].servidor_rtsp != null)
                    $('#rtsp_ip').val(data.result[0].servidor_rtsp.toString());
                if (data.result[0].servidor_rtspb != null)
                    $('#rtspb_ip').val(data.result[0].servidor_rtspb.toString());
            }
        }
    });
}

/****************************************/
/*	FUNCTION: loadUriList 				*/
/*  PARAMS: idRecurso					*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function loadUriList(idRecurso) {
    // Obtener la lista de uris del recurso
    $.ajax({
        type: 'GET',
        url: '/resources/' + idRecurso + '/loadUriList',
        success: function(data) {
            if (data != null)
                ShowUris(data);
        }
    });
}
/****************************************/
/*	FUNCTION: GetResourceFromGateway 	*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function GetResourceFromGateway(row, col, update, resourceType, resourceId) {
    //Inicializar la primera pestaña para obligar a la carga de uris
    var element = { rel: "FormHw" };
    loadParam(element);
    $('#LblUriSip').text('');
    if (update) {
        $('#FormComm').attr('onclick', "loadParam(this);");
        $('#SResourceType').prop("disabled", true);
        $('#BtnRemoveResource').show();
        loadUriList(resourceId);
    }
    else {
        $('#TbLocalNumText').val('');
        $('#TbRemoteNumText').val('');
        resetUrisValues();
        $('#SRestriccion option[value="0"]').prop('selected', true);
        $('#LbTypeRadio option[value="0"]').prop('selected', true);
        $('#SRestriccion option[value="0"]').prop('selected', true);
        $('#FormComm').attr('onclick', "loadParam(this);ShowUris(null)");
        $('#SResourceType').prop("disabled", false);
        $('#BtnRemoveResource').hide();
    }
    $('#AddFormsite').addClass('disabledDiv');
    $('#SitesList').addClass('disabledDiv');
    $('#NavMenu').addClass('disabledDiv');
    $('#listConfigurations').addClass('disabledDiv');
    $('#Add').addClass('disabledDiv');

    ResetResourcePanel();

    $('#LblIdResouce').text('Slot: ' + col + ' Interfaz: ' + row);

    var t = ($('.Res' + row + col).offset().top - 94) + 'px';
    var l = ($('.Res' + row + col).offset().left - 145) + 'px';
    $('#BigSlavesZone').data('t', t);
    $('#BigSlavesZone').data('l', l);
    $('#BigSlavesZone').attr('style', 'display:none;position:absolute;width:0px;height:0px;top:' + t + ';left:' + l);
    $('#BigSlavesZone').show();
    $('#BigSlavesZone').animate({
        top: '40px',
        left: '90px',
        width: '90%',
        height: '510px'
    }, 500, function() {
        $('#BigSlavesZone').addClass('divNucleo');
        $('#FormParameters').show();
    });

    if (update) {
        $('#CbGranularity').prop("disabled", true);
        $('#ButtonCommit').text('Actualizar');
        //$('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' +
        //		col).data('idSLAVE') + "','" + col + "','" + row +
        //	"',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})")
        $.ajax({
            type: 'GET',
            url: '/gateways/getResource/' + resourceType + '/' + resourceId,
            success: function(data) {
                if (data.error == null) {
                    //1 RADIO y 2 TFNO
                    $('#SResourceType option[value="' + resourceType + '"]').prop('selected', true);
                    $('#ListMenuParameters li:nth-child(1)').show();
                    if (resourceType == '1') {
                        $('#EntradaAudioRow').show();
                        $('#CbGranularity option[value="0"]').prop('selected', true);
                        showDataForRadioResource(data);
                        $('#ListMenuParameters li:nth-child(2)').show();//Radio
                        $('#ListMenuParameters li:nth-child(3)').hide();//Telefono
                        //Mostrar pestaña listas B/N
                        if (data.tipo_agente == 4 || data.tipo_agente == 5 || data.tipo_agente == 6)
                            $('#ListMenuParameters li:nth-child(4)').show();
                        else
                            $('#ListMenuParameters li:nth-child(4)').hide();
                        //Mostrar pestaña de comunicaciones
                        if (data.tipo_agente == 0 || data.tipo_agente == 1 || data.tipo_agente == 2 || data.tipo_agente == 3)
                            $('#ListMenuParameters li:nth-child(5)').show();
                        else
                            $('#ListMenuParameters li:nth-child(5)').hide();
                        if (data.tipo_agente == 5)
                            $('#EntradaAudioRow').hide();
                        else
                            $('#EntradaAudioRow').show();
                        $('#ListMenuParameters li:nth-child(6)').hide();
                        $('#BtnRemoveResource').attr('onclick', "removeRadioResource('" + data.idrecurso_radio + "')");
                        $('#ButtonCommit').attr('onclick', "InsertNewResource('1','" + data.idrecurso_radio + "','true','" + col + "','" + row + "')");
                        $('#ResId').attr('res-id', data.idrecurso_radio);
                        $('#LblUriSip').text(data.nombre + '@' + $('#ipv').val());
                    }
                    else if (resourceType == '2') {
                        $('#CbGranularity option[value="1"]').prop('selected', true);
                        showDataForTelephoneResource(data);
                        $('#DestinationRow').hide();
                        $('#ListMenuParameters li:nth-child(2)').hide();
                        $('#ListMenuParameters li:nth-child(3)').show();
                        $('#ListMenuParameters li:nth-child(4)').hide();
                        $('#ListMenuParameters li:nth-child(5)').hide();
                        $('#ListMenuParameters li:nth-child(6)').hide();
                        $('#BtnRemoveResource').attr('onclick', "removePhoneResource('" + data.idrecurso_telefono + "')");
                        $('#ButtonCommit').attr('onclick', "InsertNewResource('2','" + data.idrecurso_telefono + "','true','" + col + "','" + row + "')");
                        if ($('#LbTypeTel')[0].value == 3 || $('#LbTypeTel')[0].value == 4) {
                            $('#ListMenuParameters li:nth-child(6)').show();
                        }
                        $('#LblUriSip').text(data.nombre + '@' + $('#ipv').val());
                    }
                }
                else if (data.error) {
                    alertify.error('Error: ' + data.error);
                }
            },
            error: function(data) {
                alertify.error('Error consultando los recursos.');
            }
        });
    }
    else {
        $('#ButtonCommit').text('Insertar');
        $('#BtnRemoveResource').hide();
        $('#KeyRow').hide();
        $('#CbGranularity').prop("disabled", true);
        $('#CbGranularity option[value="0"]').prop('selected', true);
        $('#ButtonCommit').attr('onclick', "InsertNewResource('" + col + "','" + row +
            "','false')");

        //Por defecto metemos Radio
        SelectBss();//Inicializar. Recarga el tipo de radio para ponerlo en el primero.
        $('#ListMenuParameters li:nth-child(1)').show();//Audio
        $('#ListMenuParameters li:nth-child(2)').show();//Radio
        $('#ListMenuParameters li:nth-child(3)').hide();
        $('#ListMenuParameters li:nth-child(4)').hide();
        $('#ListMenuParameters li:nth-child(5)').show();
        $('#ListMenuParameters li:nth-child(6)').hide();

        $('#TbVad').val('-27');
        $('#TbOptionsInterval').val('5');
        $('#TbUmbral').val('-27');
        $('#TbInactividad').val('5');
        // Borrar valores residuales en el insertar new
        CleanResourceControls();
    }
}

function insertBNList(listaUris) {
    var uri2Insert = {};

    //Lista negra
    if ($('#Uri1BL').val() != '') {
        uri2Insert.uri = $('#Uri1BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri2BL').val() != '') {
        uri2Insert.uri = $('#Uri2BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri3BL').val() != '') {
        uri2Insert.uri = $('#Uri3BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri4BL').val() != '') {
        uri2Insert.uri = $('#Uri4BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri5BL').val() != '') {
        uri2Insert.uri = $('#Uri5BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri6BL').val() != '') {
        uri2Insert.uri = $('#Uri6BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri7BL').val() != '') {
        uri2Insert.uri = $('#Uri7BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri8BL').val() != '') {
        uri2Insert.uri = $('#Uri8BL').val();
        uri2Insert.tipo = 'LSN';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    //Lista Blanca
    if ($('#Uri1WL').val() != '') {
        uri2Insert.uri = $('#Uri1WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri2WL').val() != '') {
        uri2Insert.uri = $('#Uri2WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri3WL').val() != '') {
        uri2Insert.uri = $('#Uri3WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri4WL').val() != '') {
        uri2Insert.uri = $('#Uri4WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri5WL').val() != '') {
        uri2Insert.uri = $('#Uri5WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri6WL').val() != '') {
        uri2Insert.uri = $('#Uri6WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri7WL').val() != '') {
        uri2Insert.uri = $('#Uri7WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    if ($('#Uri8WL').val() != '') {
        uri2Insert.uri = $('#Uri8WL').val();
        uri2Insert.tipo = 'LSB';
        uri2Insert.nivel_colateral = 0;

        listaUris.push(uri2Insert);
        uri2Insert = {};
    }
    return listaUris;
}

function resetUrisValues() {
    //Resetear los valores ATS...
    $('#OrigenInicio1').val('');
    $('#OrigenInicio2').val('');
    $('#OrigenInicio3').val('');
    $('#OrigenInicio4').val('');
    $('#OrigenFinal1').val('');
    $('#OrigenFinal2').val('');
    $('#OrigenFinal3').val('');
    $('#OrigenFinal4').val('');
    $('#DestinoInicio1').val('');
    $('#DestinoInicio2').val('');
    $('#DestinoInicio3').val('');
    $('#DestinoInicio4').val('');
    $('#DestinoFinal1').val('');
    $('#DestinoFinal2').val('');
    $('#DestinoFinal3').val('');
    $('#DestinoFinal4').val('');
    //Reset los valores Listas B/N...
    $('#Uri1BL').val('');
    $('#Uri2BL').val('');
    $('#Uri3BL').val('');
    $('#Uri4BL').val('');
    $('#Uri5BL').val('');
    $('#Uri6BL').val('');
    $('#Uri7BL').val('');
    $('#Uri8BL').val('');
    $('#Uri1WL').val('');
    $('#Uri2WL').val('');
    $('#Uri3WL').val('');
    $('#Uri4WL').val('');
    $('#Uri5WL').val('');
    $('#Uri6WL').val('');
    $('#Uri7WL').val('');
    $('#Uri8WL').val('');
}

function showWhiteBlackList(idRecurso, listType) {

    $.ajax({
        type: 'GET',
        url: '/resources/' + idRecurso + '/radioParameters/wblist/' + listType,
        success: function(data) {
            if (data.list != null && data.list.length > 0) {
                resetUrisValues();
                var kNegra = 0, kBlanca = 0;
                data.list.forEach(function(lista) {
                    if (lista.tipo == 'LSN') {//Lista Negra
                        kNegra++;
                        if (kNegra == 1)
                            $('#Uri1BL').val(lista.uri.substring(4, lista.uri.length));
                        if (kNegra == 2)
                            $('#Uri2BL').val(lista.uri.substring(4, lista.uri.length));
                        if (kNegra == 3)
                            $('#Uri3BL').val(lista.uri.substring(4, lista.uri.length));
                        if (kNegra == 4)
                            $('#Uri4BL').val(lista.uri.substring(4, lista.uri.length));
                        if (kNegra == 5)
                            $('#Uri5BL').val(lista.uri.substring(4, lista.uri.length));
                        if (kNegra == 6)
                            $('#Uri6BL').val(lista.uri.substring(4, lista.uri.length));
                        if (kNegra == 7)
                            $('#Uri7BL').val(lista.uri.substring(4, lista.uri.length));
                        if (kNegra == 8)
                            $('#Uri8BL').val(lista.uri.substring(4, lista.uri.length));
                    }
                    if (lista.tipo == 'LSB') {//Lista Blanca
                        kBlanca++;
                        if (kBlanca == 1)
                            $('#Uri1WL').val(lista.uri.substring(4, lista.uri.length));
                        if (kBlanca == 2)
                            $('#Uri2WL').val(lista.uri.substring(4, lista.uri.length));
                        if (kBlanca == 3)
                            $('#Uri3WL').val(lista.uri.substring(4, lista.uri.length));
                        if (kBlanca == 4)
                            $('#Uri4WL').val(lista.uri.substring(4, lista.uri.length));
                        if (kBlanca == 5)
                            $('#Uri5WL').val(lista.uri.substring(4, lista.uri.length));
                        if (kBlanca == 6)
                            $('#Uri6WL').val(lista.uri.substring(4, lista.uri.length));
                        if (kBlanca == 7)
                            $('#Uri7WL').val(lista.uri.substring(4, lista.uri.length));
                        if (kBlanca == 8)
                            $('#Uri8WL').val(lista.uri.substring(4, lista.uri.length));
                    }
                });
            }
        },
        error: function(data) {
            alertify.error('Error al obtener las listas Blancas y Negras.');
        }
    });
}

function calculateLoadIndex(data) {
    var loadIndex = 0;
    /** 20190201. Se actualiza a la nueva tabla. */
    /** Radio. Los Receptores y Transceptores remotos tienen indice 4 debido al analizador de calidad. */
    for (var i = 0; i < data.radio.length; i++) {
        if (data.radio[i].tipo_agente == 2 || data.radio[i].tipo_agente == 3)
            loadIndex += 8;
        else if (data.radio[i].tipo_agente == 4 || data.radio[i].tipo_agente == 6)
            loadIndex += 4;
        else
            loadIndex += 2;
    }
    /** Telefonia. Las líneas con protocolo en linea (R2, N5, LCEN) tienen indice 2 debido al proceso de DSP necesario. */
    for (i = 0; i < data.tfno.length; i++) {
        var iftel = data.tfno[i];
        if (iftel.tipo_interfaz_tel == 5 || iftel.tipo_interfaz_tel == 4 || iftel.tipo_interfaz_tel == 3) {
            loadIndex += 2;
        }
        else {
            loadIndex++;
        }
    }
    console.log("calculateLoadIndex = " + loadIndex);
    return loadIndex;
}

/** 20190214. Rutina para limpiar los controles de recursos que se consideren... despues de salvarlos en BDT */
function CleanResourceControls() {
    $('#TbTelATSUser').val('');
    $('#DetInversionPol').val(0);

    $('#OrigenInicio1').val('');
    $('#OrigenFinal1').val('');
    $('#OrigenInicio2').val('');
    $('#OrigenFinal2').val('');
    $('#OrigenInicio3').val('');
    $('#OrigenFinal3').val('');
    $('#OrigenInicio4').val('');
    $('#OrigenFinal4').val('');
    $('#DestinoInicio1').val('');
    $('#DestinoFinal1').val('');
    $('#DestinoInicio2').val('');
    $('#DestinoFinal2').val('');
    $('#DestinoInicio3').val('');
    $('#DestinoFinal3').val('');
    $('#DestinoInicio4').val('');
    $('#DestinoFinal4').val('');
    console.log('public/gateways.js/CleanResourceControls');
}

