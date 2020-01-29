
/**************************************************************************************************************/
/****** Module: configurations.js												*******************************/
/****** Description: Módulo de soporte a la gestion de configuraciones			*******************************/
/**************************************************************************************************************/

var blockDrag = false;
var configModified = false;
var isActiveConfig = false;
var configBackup = false;
/************************************/
/*	FUNCTION: getConfigurations 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetConfigurations = function(refreshActiva, f) {
    var cfgString = '';
    translateWord('Configurations', function(result) {
        $('#TitleH3').text(result);
    });

    translateWord('Configuration', function(result) {
        cfgString = result;
    });

    $('#FormConfiguration').show();
    $.ajax({
        type: 'GET',
        url: '/configurations',
        success: function(data) {
            if (data.error == null) {
                $("#listConfigurations").empty();
                $('#CBFreeGateways').empty();

                $.each(data.result, function(index, value) {
                    if (refreshActiva && value.idCFG == $('#DivConfigurations').data('cfgJson').idCFG) {
                        $('#DivConfigurations').data('cfgJson').activa = 1;
                        $('#DivConfigurations').data('cfgJson').ts_activa = value.ts_activa;
                        $('#DivConfigurations').data('cfgJson').ts_updated = value.ultima_actualizacion;

                    }

                    var item = $('<li>' +
                        '<a data-cfg=' + value.idCFG + ' ondrop="dropSiteToCfg(event)" ondragover="getOverDropC(event)" style="display:block" onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(value) + ')})\'>' + value.name + '</a>' +
                        '<ul class="gtwList" id="cfg-' + value.name + '" style="display:none"></ul>' +
                        '</li>');
                    if (value.activa)
                        item.addClass('active');
                    item.appendTo($("#listConfigurations"));

                    // Preparar la lista de configuraciones para filtrar las pasarelas
                    // en la asignación de pasarelas a una configuración
                    $('#CBFreeGateways').append($('<option>', {
                        text: cfgString + ' ' + value.name,
                        value: value.idCFG
                    }));
                });
                $('#Add').attr("onclick", "GetConfiguration(-1)");
                if (refreshActiva)
                    ShowCfg($('#DivConfigurations').data('cfgJson'));
                if (f != null)
                    f();
            }
            else
                alertify.error('Error SQL: ' + data.error);
        },
        error: function(data) {
            alertify.error('Se ha producido un error al intentar recuperar las configuraciones.');
        }
    });
};


var GetConfiguration = function(cfg) {
    if (cfg != '-1') {
        $.ajax({
            type: 'GET',
            url: '/configurations/' + cfg,
            success: function(cfg) {
                if (cfg.result != null && cfg.result.length > 0) {
                    $('#DivConfigurations').data('idCFG', cfg.result[0].idCFG);
                    $('#DivConfigurations').animate({ width: '1015px' });

                    $("#AddFormConfiguration").show();
                    $('#tableTools').show();
                    $('#BtnActivate').show();

                    $('#Component').text(cfg.result.name);
                    $('#name').val(cfg.result.name);
                    $('#activa').prop('checked', cfg.result.activa);

                    $('#desc').val(cfg.result.description);
                    $('#ts_activa').val(cfg.result.ts_activa != null ? (cfg.result.ts_activa + ' UTC') : '');
                    $('#ts_updated').val(cfg.result.ultima_actualizacion != null ? (cfg.result.ultima_actualizacion + ' UTC') : '');
                    $('#idCFG').val(cfg.result.idCFG),

                        translateWord('LoadConfig', function(result) {
                            $('#BtnActivate').text(result);
                            $('#BtnActivate').attr("onclick", "ActiveCfg()");

                            GetGatewaysBelongConfiguration(true, cfg.result.idCFG);
                        });

                }
            }
        });
    }
    else {
        translateWord('Configurations', function(result) {
            $('#TitleH3').text(result);
        });

        $('#AssignatedGatewaysDiv').hide();
        $('#AddFormsite').hide();
        $('#DivConfigurations').animate({ width: '1130px' });
        $("#AddFormConfiguration").show();
        $('#tableTools').hide();

        translateWord('Add', function(result) {
            $('#BtnActivate').text(result);
        });
        $('#BtnActivate').show();
        $('#BtnActivate').attr("onclick", "PostConfiguration()");

        $('#FormConfiguration').show();
        $('#name').val('');
        $('#activa').prop('checked', false);
        $('#desc').val('');
        $('#ts_activa').val('');
        $('#ts_updated').val('');

    }
};

/************************************/
/*	FUNCTION: ShowCfg 				*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var ShowCfg = function(cfg) {
    $('#AssignatedGatewaysDiv').hide();
    translateWord('Configurations', function(result) {
        $('#TitleH3').text(result + ': ' + cfg.name);
    });

    $('#DivConfigurations').data('idCFG', cfg.idCFG);
    $('#DivConfigurations').data('cfgJson', cfg);
    $('#DivConfigurations').animate({ width: '1150px' });

    $('#Component').text(cfg.name);
    $('#name').val(cfg.name);
    $('#AddFormsite').fadeOut(500, function() {
        $("#AddFormConfiguration").show();
        $('#tableTools').show();
        if (cfg.activa == 1) {
            $('#activeDateTimeRow').show();
            $('#BtnActivate').hide();
        }
        else {
            $('#activeDateTimeRow').hide();
            $('#BtnActivate').show();
        }

        translateWord('LoadConfig', function(result) {
            $('#BtnActivate').text(result);
        });
        $('#BtnActivate').attr("onclick", "ActiveCfg()");
    });

    $('#activa').prop('checked', cfg.activa);
    $('#desc').val(cfg.description);
    $('#ts_activa').val(cfg.ts_activa != null ? (cfg.ts_activa + ' UTC') : '');
    $('#ts_updated').val(cfg.ultima_actualizacion != null ? (cfg.ultima_actualizacion + ' UTC') : '');
    $('#idCFG').val(cfg.idCFG);

    translateWord('GatewaysInCfg', function(result) {
        $('#LblGatewaysInCfg').text(result + ' ' + cfg.name);
    });


    // Mostrar sus gateways
	var select_name = cfg.name.replace(/\./g,"\\.");
    var lista = '#cfg-' + select_name/*cfg.name*/;
    $('.gtwList').hide();
    $(lista).empty();

    //VMG en vez de por nombre se lo mandamos por id
    $.ajax({
        type: 'GET',
        url: '/configurations/' + cfg.idCFG,
        success: function(data) {
            if (data.error == null) {
                if (data.result.length > 0) {
                    if (data != 'NO_DATA') {
                        translateWord('LoadConfig', function(result) {
                            $('#BtnActivate').text(result);
                        });
                        //VMG La configuracion tiene al menos un emplazamiento
                        if (data.result[0].nameSite != null) {
                            var idCFGCopy = '';
                            //VMG No hay config o emplazamientos que es lo mas normal.
                            if (data != 'Configuration not found.' || data != 'Site not found.') {
                                $('#CancelGtwButton').attr('onclick', 'ShowSite(\'' + data.result[0].nameSite + '\',\'' + data.result[0].idEMPLAZAMIENTO + '\')');
								/*$('#CancelGtwButton').click(function(nameSite, idSite) {
								 ShowSite(nameSite, idSite);
								 });*/
                                $.each(data.result, function(index, value) {
                                    var item = $('<li data-texto-emp="' + value.idEMPLAZAMIENTO + '"  >' +
                                        '<a draggable="false" ondragstart="dragGatewayToSite(event)" ondrop="dropGatewayToSite(event)" ondragover="getOverDropC(event)" style="display:block; color:#b70028" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.idEMPLAZAMIENTO + '\')})"' + '>' + value.nameSite + '</a>' +
                                        '<ul class="gtwList" id="site-' + value.idEMPLAZAMIENTO + '" style="display:none"></ul>' +
                                        '</li>');

                                    item.appendTo($(lista));
                                    idCFGCopy = value.idCFG;
                                });
                                $(lista).show();
                                $('#ts_updated').val(data.result[0].ultima_actualizacion);
                                $('#DivConfigurations').data('idCFG', idCFGCopy);
                                //VMG esta parte es la que rellena las pasarelas de la config de abajo
                                GetGatewaysBelongConfiguration(true, idCFGCopy);
                                $('#CBFreeGateways option[value="0"]').prop('selected', true);
                                //VMG esta parte nos dirá si estan activas a o no.
                                //ClickCBFreeGateways();
                            }
                            else
                                GetGatewaysBelongConfiguration(false);
                        }
                    }
                    else {
                        alertify.error('La configuración no existe');
                    }
                }
            }
            else {
                alertify.error('Error SQL: ' + data.error);
            }
        },
        error: function(data) {
            alertify.error('Se ha producido un error al intentar recuperar los emplazamientos.');
        }
    });
};

var ShowCfgByName = function(cfgName, cfgId) {
    // Mostrar sus gateways
    var lista = '#cfg-' + cfgName;
    $('.gtwList').hide();
    $(lista).empty();

    $.ajax({
        type: 'GET',
        url: '/configurations/' + cfgName,
        success: function(data) {
            if (data != 'Configuration not found.') {
                $.each(data.result, function(index, value) {
                    //var item = $('<li data-texto="' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '" draggable="true" ondragstart="dragSiteToCfg(event)"><a style="display:block; color:#ff8c1a" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\')})"' + '>' + value.nameSite + '</a></li>');
                    //item.appendTo($(lista));
                    //var item = $('<li>' + 
                    var item = $('<li data-texto-emp="' + value.idEMPLAZAMIENTO + '" draggable="true" ondragstart="dragSiteToCfg(event)">' +
                        '<a style="display:block; color:#b70028" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.idEMPLAZAMIENTO + '\')})"' + '>' + value.nameSite + '</a>' +
                        '<ul class="gtwList" id="site-' + value.idEMPLAZAMIENTO + '" style="display:none"></ul>' +
                        '</li>');
                    item.appendTo($(lista));
                });
                $(lista).show();

                GetGatewaysBelongConfiguration(true, cfgId != null ? cfgId : $('#DivConfigurations').data('idCFG'));
            }
        }
    });
};

/************************************/
/*	FUNCTION: PostConfiguration 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var PostConfiguration = function() {
    if ($('#name').val().length == 0) {
        alertify.alert('Ulises G 5000 R', "Identificador de la configuración no válido.");
        alertify.error("Identificador de la configuración no válido.");
        return;
    }

    for (var i = 0; i < $("#listConfigurations").children().length; i++) {
        if ($('#name').val() == ($("#listConfigurations").children()[i]).childNodes[0].text) {
            alertify.alert('Ulises G 5000 R', "Ya existe una configuración con ese nombre.");
            alertify.error("Identificador de la configuración no válido.");
            return;
        }
    }
    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: '/configurations/cfg',
        data: JSON.stringify({
            "name": $('#name').val(),
            "description": $('#desc').val()
        }
        ),
        success: function(data) {
            if (data.error === null) {
                alertify.success('La configuración \"' + data.data.name + '\" ha sido cargada.');
                GetConfigurations();

                $('#DivConfigurations').data('idCFG', data.data.idCFG);
                GetConfiguration(data.data.name);
            }
            else if (data.error) {
                alertify.error('Error: ' + data.error);
            }
        },
        error: function(data) {
            alertify.error('Error creando la configuración.');
        }
    });
};

/************************************/
/*	FUNCTION: PutConfiguration 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var PutConfiguration = function() {
    if ($('#name').val().length == 0) {
        alertify.alert('Ulises G 5000 R', "Identificador de la configuración no válido.");
        alertify.error("Identificador de la configuración no válido.");
        return;
    }

    $.ajax({
        type: 'GET',
        url: '/configurations/checkConfigName/' + $('#name').val() + '/' + $('#DivConfigurations').data('idCFG'),
        success: function(data) {
            if (data.error != null) {
                alertify.error('Error: ' + data.error);
            }
            else if (data.data == 'DUP_NAME') {
                alertify.error('El nombre \"' + $('#name').val() + '\" ya existe en el sistema. Utilize otro.');
                return;
            }
            else {
                $.ajax({
                    type: 'PUT',
                    url: '/configurations/' + $('#DivConfigurations').data('idCFG'),
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "idCFG": $('#DivConfigurations').data('idCFG'),
                        "name": $('#name').val(),
                        "description": $('#desc').val(),
                        "activa": $('#activa').prop('checked')
                    }),
                    success: function(data) {
                        if (data.error == null) {
                            alertify.success('Configuración \"' + data.data.name + '\" actualizada.');
                            /** 20190213 Solo se activará el boton si se modifica la configuracion activa */
                            configModified = data.aplicarcambios && data.aplicarcambios != 0/* true*/;
                            GetConfigurations(function() {
                                ShowCfg(data.data);
                            });
                            // Añadir a la lista de pasarelas a reconfigurar
                            // todas las que pertenecen a la configuración activa
                            // (Poder "aplicar cambios" en la configuración activa después de un restore)
                            //AddGatewaysFromActiveToListOfGateways();
                        }
                        else if (data.error) {
                            alertify.error('Error: ' + data.error);
                        }
                    },
                    error: function(data) {
                        alertify.error('Se ha producido un error al actualizar la configuración.');
                        return;
                    }
                });
            }
        },
        error: function(data) {
            alertify.error('Se ha producido un error al actualizar la configuración.');
            return;
        }
    });
	/*for (var i = 0; i < $("#listConfigurations").children().length; i++) {
		if ($('#name').val() == ($("#listConfigurations").children()[i]).childNodes[0].text) {
			alertify.alert('Ulises G 5000 R', "Ya existe una configuración con ese nombre.");
			alertify.error("Identificador de la configuración no válido.");
			return;
		}
	}*/
};

/************************************/
/*	FUNCTION: DelConfiguration 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var DelConfiguration = function() {
    if ($('#activa').prop('checked')) {
        // La configuración activa no se puede borrar
        alertify.alert('Ulises G 5000 R', "No se permite eliminar la configuración activa.");
        alertify.error("No se permite eliminar la configuración activa.");
    }
    else {
        alertify.confirm('Ulises G 5000 R', "ATENCION. ¿Desea eliminar la configuración \"" + $('#name').val() + "\"? " +
            "<br />También se eliminarán todos los emplazamientos y pasarelas asociadas a dicha configuración.",
            function() {
                $.ajax({
                    type: 'DELETE',
                    url: '/configurations/' + $('#DivConfigurations').data('idCFG'),
                    success: function(data) {
                        if (data.error != null)
                            alertify.error('Error: ' + data.error);
                        else {
                            //TODO Queda pendiente ver si se genera códigos de incidencia para borrar o modificar configs
                            //GenerateHistoricEvent(ID_HW,REMOVE_GATEWAY,$('#nameGw').val(),$('#loggedUser').text());
                            alertify.success('Configuración \"' + $('#name').val() + '\" elminada.');
                            $('#AddFormConfiguration').hide();
                            $('#tableTools').hide();

                            GetConfigurations();
                        }
                    },
                    error: function(data) {
                        alertify.error('Error eliminando la configuración.');
                    }
                });
            },
            function() {
                alertify.error('Cancelado');
            });
    }
};

var postGatewayToConfig = function(cfgId, idGtw) {
    var sourceGtw = link_enlaces_libres[idGtw].valor;
    var sourceIdCfgOfGtw = link_enlaces_libres[idGtw].idCFG;


    // Si la pasarela ya existe en esta configuracion, sólo hay que asignarla
    if (sourceIdCfgOfGtw == cfgId)
        AssignGatewayToConfig(cfgId, idGtw);
    else {
        // Crear la pasarela en la configuración de trabajo: 'cfgId'
        // Obtener 'nombre' del emplazamiento sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO
        $.ajax({
            type: 'GET',
            url: 'sites/' + sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,
            success: function(data) {
                if (data != null) {
                    var siteName = data.name;

                    // Buscar en cfgId el emplazamiento 'siteName'
                    $.ajax({
                        type: 'GET',
                        url: 'configurations/' + cfgId + '/siteName/' + siteName,
                        success: function(data) {
                            // Si (emplazamiento !existe)
                            if (data == null) {
                                // Crear emplazamiento
                                $.ajax({
                                    type: 'POST',
                                    url: '/sites/' + siteName,
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        "cfg_idCFG": cfgId,
                                        "name": siteName
                                    }),
                                    success: function(data) {
                                        if (data.data != null) {
                                            sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = data.data;
                                            // Primero creo la pasarela
                                            $.ajax({
                                                type: 'COPY',
                                                dataType: 'json',
                                                contentType: 'application/json',
                                                data: JSON.stringify(sourceGtw),
                                                url: '/gateways/' + sourceGtw.idCGW,
                                                success: function(data) {
                                                    // Luego la asigno a la configuración
                                                    AssignGatewayToConfig(cfgId, data.data /*id de la nueva pasarela*/);
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                            else {
                                sourceGtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = data.idEMPLAZAMIENTO;
                                // Primero creo la pasarela
                                $.ajax({
                                    type: 'COPY',
                                    dataType: 'json',
                                    contentType: 'application/json',
                                    data: JSON.stringify(sourceGtw),
                                    url: '/gateways/' + sourceGtw.idCGW,
                                    success: function(data) {
                                        // Luego la asigno a la configuración
                                        AssignGatewayToConfig(cfgId, data.data /*id de la nueva pasarela*/);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    }
};

var AssignGatewayToConfig = function(cfgId, sourceGtw) {
    // Copiar sourceGtw	
    $.ajax({
        type: 'POST',
        url: '/configurations/' + cfgId + '/gateways/' + sourceGtw,
        // dataType: 'json', 
        // contentType:'application/json',
        // data: JSON.stringify(sourceGtw),
        success: function(data) {
            alertify.success('Gateway asignada.');
            ShowCfgByName($('#name').val());
            //GetGatewaysBelongConfiguration(true, data.data.CFG_idCFG);
        },
        error: function(data) {
            alertify.error('La Gateway \"' + data.data.CFG_idCFG + '\" ya existe.');
        }
    });
};

var deleteGatewayFromConfig = function(cfgId, gtwId) {
    $.ajax({
        type: 'DELETE',
        url: '/configurations/' + cfgId + '/gateways/' + gtwId,
        dataType: 'json',
        contentType: 'application/json',
        success: function(data) {
            alertify.success('Gateway liberada.');
            GetGatewaysBelongConfiguration(true, data.data.CFG_idCFG);
        },
        error: function(data) {
            alertify.error('Gateway ' + data.name + ' exists.');
        }
    });
};

/************************************************/
/*	FUNCTION: UpdateSynchroStateInConfig 		*/
/*  PARAMS: data								*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
var UpdateSynchroStateInConfig = function(data) {
    if (data.length != 0) {
        $.each(data, function(index, value) {
            $(".list li").each(function(index) {
                if ($(this).data('texto') == value.idGtw) {
                    if (value.online) {
                        if (value.isNotActiveCfg)
                            $(this).find('div:first').prop('class', 'dragableItem VivaNoActiva');
                        else if (value.isSinch)
                            $(this).find('div:first').prop('class', 'dragableItem apply');
                        else if (value.updatePend) {
                            $(this).find('div:first').prop('class', 'dragableItem VivaNoSincro');
                            configBackup = false;
                        }
                        else if (value.InConflict && !value.updatePend) {
                            $(this).find('div:first').prop('class', 'dragableItem InConflict');
                            configBackup = true; //Se activa el botón para actualizar
                        }
                        else {
                            $(this).find('div:first').prop('class', 'dragableItem VivaSincro');
                            configBackup = false;
                        }
                    }
                    else if (value.isSinch)
                        $(this).find('div:first').prop('class', 'dragableItem apply');
                    else {
                        if (value.isNotActiveCfg) {
                            //if($(this).find('div:first').prop('class', 'dragableItem')==false)
                            //  $(this).find('div:first').prop('class', 'dragableItem NoVivaNoActiva');
                            //else
                            $(this).find('div:first').prop('class', 'dragableItem NoVivaNoActiva');
                        }
                        else
                            $(this).find('div:first').prop('class', 'dragableItem NoVivaActiva');
                    }

                }
                //TODO Vamos por aqui!!!
				/*
					if (value.Viva == 1) {
						if (value.Activa == 1) {
							if (value.Sincro == 2) {
								$(this).find('div:first').prop('class', 'dragableItem VivaSincro');	// Verde claro
							}
							else if (value.Sincro == 1) {
								$(this).find('div:first').prop('class', 'dragableItem apply');			// Naranja
							}
							else
								$(this).find('div:first').prop('class', 'dragableItem VivaNoSincro');	// Amarillo
						}
					}
					else {	// No viva
						if (value.Activa) {
							// Si antes estaba como 'Viva' mensaje de aviso
							if ($(this).find('div:first').prop('class').indexOf('VivaSincro') != -1 ||
								$(this).find('div:first').prop('class').indexOf('VivaNoSincro') != -1)
								alertify.alert('Ulises G 5000 R', 'La pasarela ' + value.name + ' ha dejado de comunicar con el servidor.');
							
							$(this).find('div:first').prop('class', 'dragableItem NoVivaActiva');		// Azul claro
						}
					}
				}*/
            });
        });
    }
};

var ClickViewFreeGateways = function() {
    if ($('#CBViewFreeGateways').prop('checked')) {
        $('#CBFreeGateways').show();
        $('#freeGatewaysList').show();
/*		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(2) > td:nth-child(2)').attr('style','display:table-row')
		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(3) > td').attr('style','display:table-row')
*/	}
    else {
        $('#CBFreeGateways').hide();
        $('#freeGatewaysList').hide();
/*		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(2) > td:nth-child(2)').attr('style','display:table-column')
		$('#AssignatedGatewaysDiv > table > tbody > tr:nth-child(3) > td').attr('style','display:table-column')
*/	}
};

var ClickCBFreeGateways = function() {
    var cfgId = $('#CBFreeGateways option:selected').val();

    $("#freeGatewaysList").empty();
    link_enlaces_libres = [];

    if (cfgId == 0) {	// <Activa>
        $.ajax({
            type: 'GET',
            url: '/gateways/alive',
            success: function(data) {
                if (data != null && data.length > 0) {
                    $.each(data, function(index, value) {
                        link_enlaces_libres[value.idCGW] = { idCFG: value.idCFG, valor: value };

                        var clase = '';

                        if (value.Activa == 1) {
                            clase = 'dragableItem VivaSincro';		// Verde claro
                        }
                        else {	// No activa
                            clase = 'dragableItem VivaNoActiva';	// Verde Oscuro
                        }

                        var _cfgJson = { idCFG: value.idCFG, name: value.nameCfg, description: value.description, activa: value.activa, ts_activa: value.ts_activa };
                        var item = $('<li data-texto="' + value.idCGW + '"><div onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(_cfgJson) + '),ShowSite("' + value.site + '","' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '") , ShowHardwareGateway("' + value.idCGW + '","' + value.name + '")})\' style="width:300px;cursor:pointer" class="' +
                            clase + '" id="' + value.idCGW + '" draggable="false" ondragstart="dragGateway(event)">' + value.name +
                            '<div style="color:black' + '; font-size: 8px; margin-right: 0">' + value.site + '</div>' + '</li>');
                        item.appendTo($("#freeGatewaysList"));
                    });
                }
            }
        });
    }
    else {
        $.ajax({
            type: 'GET',
            url: '/configurations/' + cfgId + '/gateways',
            success: function(data) {
                $.each(data.general, function(index, value) {
                    link_enlaces_libres[value.idCGW] = { idCFG: value.idCFG, valor: value };

                    var clase = 'dragableItem';
                    /*
                    var clase = '';

                    if (value.Viva == 1){
                        if (value.Activa == 1){
                            if (value.Sincro == 2){
                                clase = 'dragableItem VivaSincro';		// Verde claro
                            }
                            else if (value.Sincro == 1){
                                clase = 'dragableItem apply';			// Naranja
                            }
                            else
                                clase = 'dragableItem VivaNoSincro';	// Amarillo
                        }
                        else{	// No activa
                            clase = 'dragableItem VivaNoActiva';		// Azul claro
                        }
                    }
                    else{	// No viva
                        if (value.Activa)
                            clase = 'dragableItem NoVivaActiva';		// Verde Oscuro
                        else
                            clase = 'dragableItem NoVivaNoActiva';		// Azul Oscuro
                    }
                    */
                    var _cfgJson = { idCFG: value.idCFG, name: value.nameCfg, description: value.description, activa: value.activa, ts_activa: value.ts_activa };
                    var item = $('<li data-texto="' + value.idCGW + '"><div onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(_cfgJson) + '),ShowSite("' + value.nameSite + '","' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '") , ShowHardwareGateway("' + value.idCGW + '","' + value.name + '")})\' style="width:300px;cursor:pointer" class="' +
                        clase + '" id="' + value.idCGW + '" draggable="false" ondragstart="dragGateway(event)">' + value.name +
                        '<div style="color:black' + '; font-size: 8px; margin-right: 0">' + value.nameSite + '</div>' + '</li>');
                    item.appendTo($("#freeGatewaysList"));
                });
            }
        });
    }
};

var GetGatewaysBelongConfiguration = function(show, cfgId) {
    link_enlaces = {};

    if (!show) {
        // Reset lista de pasarelas asignadas
        $("#assignatedGatewaysList").empty();
        $('#AssignatedGatewaysDiv').show();
    }
    else {
        // Ocultar div copia si estuviera abierto
        $('#CopyCfgForm')[0].reset();
        $('#CopyCfgDiv').hide();

        // translateWord('HideGateways',function(result){
        // 	$('#GatewaysButton').text(result);
        // })

        $('#BtnCopyCfg').prop('enabled', false);

        $('#AssignatedGatewaysDiv').show();
        $("#freeGatewaysList").addClass('dropable');
        $("#assignatedGatewaysList").addClass('dropable');

        //$('#CfgId').val(cfgId);

        $.ajax({
            type: 'GET',
            url: '/configurations/' + cfgId + '/gateways',
            success: function(data) {
                $("#assignatedGatewaysList").empty();
                if (data.general.length > 0) {
                    //$("#assignatedGatewaysList").attr('style','height: auto');

                    $.each(data.general, function(index, value) {
                        link_enlaces[value.idCGW] = { idCFG: cfgId, valor: value };
                        var item = '';
                        var clase = '';

                        //Por defecto
                        //UpdateSynchroStateInActiveConfig
                        value.Activa = 0;

                        if (value.Viva == 1) {
                            if (value.Activa == 1) {
                                if (value.Sincro == 2) {
                                    clase = 'dragableItem VivaSincro';		// Verde claro
                                }
                                else if (value.Sincro == 1) {
                                    clase = 'dragableItem apply';			// Naranja
                                }
                                else
                                    clase = 'dragableItem VivaNoSincro';	// Amarillo
                            }
                            else {	// No activa
                                clase = 'dragableItem';						// Si no es la activa, no se representa el estado
                            }
                        }
                        else {	// No viva
                            if (value.Activa)
                                clase = 'dragableItem NoVivaActiva';		// Verde Oscuro
                            else
                                clase = 'dragableItem';		// Azul Oscuro
                        }

                        link_enlaces[value.idCGW] = { idCFG: cfgId, valor: value };
                        item = $('<li data-texto="' + value.idCGW + '"><div onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\') , ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})" style="width:300px;cursor:pointer" class="' +
                            clase + '" id="' + value.idCGW + '" ondragstart="dragGateway(event)">' + value.name +
                            '<div style="color:black; font-size: 8px; margin-right: 0"> ' + value.nameSite + '</div>' + '</li>');
                        item.appendTo($("#assignatedGatewaysList"));

                        /*
                                                        switch (value.Activa){
                                                            case 0: // Asignada pero no activa
                                                                link_enlaces[value.idCGW]={idCFG: cfgId, valor: value};
                                                                item = $('<li data-texto="' + value.idCGW + '"><div onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\') , ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})" style="width:300px;cursor:pointer" class="' + 
                                                                            clase + '" id="' +  value.idCGW + '" ondragstart="dragGateway(event)">' + value.name + 
                                                                    '<div style="color:white; font-size: 8px; margin-right: 0"> ' + value.nameSite + '</div>' +'</li>');
                                                                item.appendTo($("#assignatedGatewaysList"));
                                                            break;
                                                            case 1: // Asignada y activa
                                                                link_enlaces[value.idCGW]={idCFG: cfgId, valor: value};
                                                                item = $('<li data-texto="' + value.idCGW + '"><div onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.nameSite + '\',\'' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '\') , ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})" style="width:300px;cursor:pointer" class="' + 
                                                                            clase + '" id="' +  value.idCGW + '" ondragstart="dragGateway(event)">' + value.name + 
                                                                    '<div style="color:black; font-size: 8px; margin-right: 0"> ' + value.nameSite + '</div>' +'</li>');
                                                                item.appendTo($("#assignatedGatewaysList"));
                                                            break;
                                                        }
                        */
                    });
                    $('#NewGateway').attr("onclick", "GetGateway()");
                }
            }
        });
		/*
		$("#freeGatewaysList").empty();
		$.ajax({type: 'GET', 
			url: '/configurations/' + cfgId + '/free',
			success: function(data){
				$.each(data.result, function(index, value){
					link_enlaces_libres[value.idCGW] = {idCFG: value.idCFG, valor: value};

					var clase = '';

					if (value.Viva == 1){
						if (value.Activa == 1){
							if (value.Sincro == 2){
								clase = 'dragableItem VivaSincro';		// Verde claro
							}
							else if (value.Sincro == 1){
								clase = 'dragableItem apply';			// Naranja
							}
							else
								clase = 'dragableItem VivaNoSincro';	// Amarillo
						}
						else{	// No activa
							clase = 'dragableItem VivaNoActiva';		// Azul claro
						}
					}
					else{	// No viva
						if (value.Activa)
							clase = 'dragableItem NoVivaActiva';		// Verde Oscuro
						else
							clase = 'dragableItem NoVivaNoActiva';		// Azul Oscuro
					}
					var _cfgJson={idCFG:value.idCFG,name:value.nameCfg,description:value.description,activa:value.activa,ts_activa:value.ts_activa};
					var item = $('<li data-texto="' + value.idCGW + '"><div onclick=\'CheckingAnyChange("GeneralContent", function(){ShowCfg(' + JSON.stringify(_cfgJson) + '),ShowSite("' + value.nameSite + '","' + value.EMPLAZAMIENTO_idEMPLAZAMIENTO + '") , ShowHardwareGateway("' + value.idCGW + '","' + value.name + '")})\' style="width:300px;cursor:pointer" class="' + 
									clase + '" id="' +  value.idCGW + '" draggable="true" ondragstart="dragGateway(event)">' + value.name + 
						'<div style="color:white; font-size: 8px; margin-right: 0"> [' + value.nameCfg + '] ' +  value.nameSite + '</div>' +'</li>');
					item.appendTo($("#freeGatewaysList"));
				});
			}
		});
		*/
    }
};

/************************************/
/*	FUNCTION: CopyConfiguration	 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var CopyConfiguration = function() {
    if ($('#nameCopy').val().length == 0) {
        alertify.alert('Ulises G 5000 R', "Identificador de la configuración no válido.");
        alertify.error("Identificador de la configuración no válido.");
        return;
    }

    for (var i = 0; i < $("#listConfigurations").children().length; i++) {
        if ($('#nameCopy').val() == ($("#listConfigurations").children()[i]).childNodes[0].text) {
            alertify.alert('Ulises G 5000 R', "Ya existe una configuración con ese nombre.");
            alertify.error("Identificador de la configuración no válido.");
            return;
        }
    }

    alertify.success('Copia de configuración en curso');

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: '/configurations/' + $('#idCFG').val() + '/copy',
        // New config: 
        data: JSON.stringify({
            "name": $('#nameCopy').val(),
            "description": $('#descCopy').val()
        }),
        success: function(data) {
            if (data.error == null) {
                alertify.success('La configuración ha sido copiada.');
                ShowCopyConfiguration(false);
                GetConfigurations();
                //GetConfiguration(data.data.name);
                ShowCfg(data.data);

            }
            else
                alertify.error('Error: ' + data.error);
        },
        error: function(data) {
            alertify.error('Error en la aplicación copiando la configuración.');
        }
    });
};

var ShowCopyConfiguration = function(on) {
    if (on === true) {
        if ($('#AssignatedGatewaysDiv').is(':visible')) {
            // translateWord('Gateways',function(result){
            // 	$('#GatewaysButton').text(result);
            // })

            //$('#GatewaysButton').text('Gateways');
            $('#AssignatedGatewaysDiv').hide();
        }
        $('#CopyCfgDiv').show();
    }
    else {
        $('#CopyCfgForm')[0].reset();
        $('#CopyCfgDiv').hide();
    }
};

/********************************************/
/*	FUNCTION: ExistGatewayWithoutResources	*/
/*  PARAMS: 								*/
/*  REV 1.0.2 VMG							*/
/********************************************/
var ExistGatewayWithoutResources = function(idCfg, f) {
    var retorno = false;
    $.ajax({
        type: 'GET',
        url: '/configurations/' + idCfg + '/gatewaysHasResources',
        success: function(result) {
            var strGateways = 'Las siguientes pasarelas no tienen recursos asignados:' + '<br />';
            var gtw = [];
            if (result.data != null) {
                $.each(result.data, function(index, value) {
                    if (value.radio == 0 && value.telefono == 0) {
                        retorno = true;
                        gtw.push(value.nombre);
                        strGateways += value.nombre + '<br />';
                    }
                });
                if (retorno) {
                    strGateways += '¿Desea activar la configuración de todas formas?';
                    alertify.confirm('Ulises G 5000 R', strGateways, function() {
                        f({ Aplicar: true, gateways: gtw });
                    },
                        function() {
                            f({ Aplicar: false, gateways: null });
                        });
                }
                else
                    f({ Aplicar: true, gateways: null });
            }
            else {//No hay datos de pasarelas... No aplicamos sacando un mensaje de error.
                alertify.error('No se han encontrado datos de recursos para esta configuración. ' +
                    'Operación cancelada.');
                f({ Aplicar: false, gateways: null });
            }
        }
    });
};
/*	$.ajax({
		type: 'GET',
		url: '/configurations/gatewaysHasResources/',
		success:
		function(result){
			var aplicar = true;
						
						/*var aplicar = true;
						if(result.general.length == 0)
							f({Aplicar:true});
						$.each(result.general, function(index, value){
							if (aplicar){
								$.ajax({
										type:'GET',
										url: '/gateways/' + value.idCGW + '/resources',
										success:function(data){
											if (index == result.general.length - 1 && aplicar){
												f({Aplicar:true});
											}
											else if (data.length == 0){
												aplicar = false;
												// No tiene recursos configurados
												alertify.confirm('Ulises G 5000 R','La pasarela ' + value.name + ' - ' +
															value.ipv + ' no tiene recursos asignados,<br />¿desea activar la configuración de todas formas?',function(){
														f({Aplicar:true});
													},
													function(){
														f({Aplicar:false});
													}
												);
											}
										}
								});
							}
						});*/
/*		}
	});
};*/

/************************************/
/*	FUNCTION: ExistGatewaysOut	 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var ExistGatewaysOut = function(idCfg, f) {
    var retorno = false;
    $.ajax({
        type: 'GET',
        url: '/configurations/' + idCfg + '/gatewaysOut',
        success: function(result) {
            var strGateways = 'Las siguientes pasarelas no tiene comunicación con el servidor:' + '<br />';
            var gtw = [];
            var gtwOnline = 0;
            $.each(result.gtwsInConfig.data, function(index, value) {
                for (var i = 0; i < result.aliveGateways.length; i++) {
                    if (value.idpasarela == result.aliveGateways[i].idGtw) {
                        if (result.aliveGateways[i].online)
                            gtwOnline = 1;
                    }
                }

                if (gtwOnline == 0) {
                    retorno = true;
                    gtw.push(value.name);
                    strGateways += value.name + ' - ' + value.ipv + '<br />';
                }
                gtwOnline = 0;
            });
            if (retorno) {
                strGateways += '¿Desea activar la configuración de todas formas?';
                alertify.confirm('Ulises G 5000 R', strGateways, function() {
                    f({ Aplicar: true, gateways: gtw });
                },
                    function() {
                        f({ Aplicar: false, gateways: null });
                    });
            }
            else
                f({ Aplicar: true, gateways: null });
        }
    });
};

/************************************/
/*	FUNCTION: ActiveCfg	 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var ActiveCfg = function(f) {
    alertify.confirm('Ulises G 5000 R', "¿Desea activar la configuración \"" + $('#name').val() + "\"?",
        function() {
            ExistGatewaysOut($('#DivConfigurations').data('idCFG'), function(existe) {
                if (existe.Aplicar) {
                    ExistGatewayWithoutResources($('#DivConfigurations').data('idCFG'), function(gateways) {
                        if (gateways.Aplicar) {
                            $.ajax({
                                type: 'GET',
                                url: '/configurations/' + $('#DivConfigurations').data('idCFG') + '/activate',
                                success: function(data) {
                                    if (data.result) {
                                        GenerateHistoricEvent(ID_HW, LOAD_REMOTE_CONFIGURATION, $('#name').val(), $('#loggedUser').text());
                                        alertify.success('Configuración \"' + $('#name').val() + '\" activada.');
                                        // Generar histórico con cada pasarela que no se pudo configurar
                                        // por estar desconectada del servidor
                                        //if (existe.gateways != null) {
                                        //	$.each(existe.gateways, function (index, value) {
                                        //		GenerateHistoricEventArray(ID_HW, LOAD_REMOTE_CONFIGURATION_FAIL, [$('#name').val(), value], $('#loggedUser').text());
                                        //	});
                                        //}
                                        GetActiveCfgAndActivate(true);
                                        /** 20190215. Cuando se activa una cfg no hace falta */
                                        //configModified = true;
                                        ///////////////////////////////////////////////////////
                                        isActiveConfig = true;
                                    }
                                    else {
                                        GenerateHistoricEvent(ID_HW, LOAD_REMOTE_CONFIGURATION_FAIL, $('#name').val(), $('#loggedUser').text());
                                        if (data.count == 0)
                                            alertify.error('No ha sido posible activar la configuración \"' + $('#name').val() + '\" al estar vacía.');
                                        else {
                                            alertify.error('No ha sido posible activar la configuración \"' + $('#name').val() + '\".');
                                            alertify.error('¿Tiene la configuración \"' + $('#name').val() + '\" alguna pasarela asignada?.');
                                        }
                                    }
                                    // Provocar una actualización  en la lista de configuraciones si hubiera un cambio de configuración activa
                                    GetConfigurations(true);
                                    //ShowCfg($('#DivConfigurations').data('cfgJson'));

                                }
                            });
                        }
                    });
                }
            });
        },
        function() { alertify.error('Cancelado'); }
    );
};

/*var ActiveCfg = function() {
	alertify.confirm('Ulises G 5000 R', "¿Desea activar la configuración \"" + $('#name').val() + "\".?",
	function () {
		$.ajax({
			type: 'GET',
			url: '/configurations/' + $('#DivConfigurations').data('idCFG') + '/activate',
			success: function (data) {
				if (data.result) {
					GenerateHistoricEvent(ID_HW, LOAD_REMOTE_CONFIGURATION, $('#name').val(), $('#loggedUser').text());
					alertify.success('Configuración \"' + $('#name').val() + '\" activada.');
					// Generar histórico con cada pasarela que no se pudo configurar
					// por estar desconectada del servidor
					if (existe.gateways != null) {
						$.each(existe.gateways, function (index, value) {
							GenerateHistoricEventArray(ID_HW, LOAD_REMOTE_CONFIGURATION_FAIL, [$('#name').val(), value], $('#loggedUser').text());
						});
					}
				}
				else {
					GenerateHistoricEvent(ID_HW, LOAD_REMOTE_CONFIGURATION_FAIL, $('#name').val(), $('#loggedUser').text());
					if (data.count == 0)
						alertify.error('No ha sido posible activar la configuración \"' + $('#name').val() + '\" al estar vacía.');
					else {
						alertify.error('No ha sido posible activar la configuración \"' + $('#name').val() + '\".');
						alertify.error('¿Tiene la configuración \"' + $('#name').val() + '\" alguna pasarela asignada?.');
					}
				}
				// Provocar una actualización  en la lista de configuraciones si hubiera un cambio de configuración activa
				GetConfigurations();
				ShowCfg($('#DivConfigurations').data('cfgJson'));
			}
		});
	});
}
	// Obtener aquellas pasarelas que no tiene comunicación con el servidor
	/*ExistGatewaysOut(function(existe){
	if (existe.Aplicar){
				// Comprobar si existe alguna pasarela de la configuración
								// a activar sin recursos configurados
								ExistGatewayWithoutResources(function(gateways){
									if (gateways.Aplicar){
										// Activar configuracion
										$.ajax({
											type: 'GET',
											url: '/configurations/' + $('#DivConfigurations').data('idCFG') + '/activate',
											success: function(data){
												if (data.result){
													GenerateHistoricEvent(ID_HW,LOAD_REMOTE_CONFIGURATION,$('#name').val(),$('#loggedUser').text());
													alertify.success('Configuración \"'+ $('#name').val() + '\" activada.');
													// Generar histórico con cada pasarela que no se pudo configurar
													// por estar desconectada del servidor
													if (existe.gateways != null){
														$.each(existe.gateways, function(index, value){
															GenerateHistoricEventArray(ID_HW,LOAD_REMOTE_CONFIGURATION_FAIL,[$('#name').val(),value],$('#loggedUser').text());
														});
													}
												}
												else{
													GenerateHistoricEvent(ID_HW,LOAD_REMOTE_CONFIGURATION_FAIL,$('#name').val(),$('#loggedUser').text());
													if(data.count == 0)
														alertify.error('No ha sido posible activar la configuración \"'+ $('#name').val() + '\" al estar vacía.');
													else {
														alertify.error('No ha sido posible activar la configuración \"'+ $('#name').val() + '\".');
														alertify.error('¿Tiene la configuración \"'+ $('#name').val() + '\" alguna pasarela asignada?.');
													}
												}
												// Provocar una actualización  en la lista de configuraciones si hubiera un cambio de configuración activa
												GetConfigurations();
												ShowCfg($('#DivConfigurations').data('cfgJson'));
											}
										});
									}
								});
							}
						});
				//alertify.success('Ok'); 
			},
			 function(){ alertify.error('Cancelado');}
	);
};
/****************************************/
/*	FUNCTION: GetActiveCfgAndActivate 	*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
var GetActiveCfgAndActivate = function (isAutomaticActive) {
    console.log('GetActiveCfgAndActivate entering: ' + isAutomaticActive);
    /** 20170516 AGL Este filtro ya no parece tener sentido. Comprobar... */
    $.ajax({
        type: 'GET',
        //url: '/configurations/active',
        url: '/configurations/pendingActive',
        success: function(data) {
            if (data != null) {
                var strmsg = '';
                if (isActiveConfig)
                    strmsg = '¿Desea activar la configuración \"' + data.name + '\" en las gateways?';
                else
                    strmsg = '¿Desea aplicar los cambios a las gateways de \"' + data.name + '\"?';
                console.log('GetActiveCfgAndActivate => /configurations/pendingActive success. ' + data.toString());
                if (isAutomaticActive) {
                    $.ajax({
                        type: 'GET',
                        url: '/gateways/updateUsers',
                        success: function(data) {
                            if (data.error == null) {
                                $.ajax({
                                    type: 'GET',
                                    url: '/configurations/' + data.idCFG + '/loadChangestoGtws',
                                    success: function(result) {
                                        if (result) {
                                            //GenerateHistoricEvent(ID_HW, LOAD_REMOTE_CONFIGURATION, data.name, $('#loggedUser').text());
                                            alertify.success('Configuración activada y pasarelas actualizadas.');
                                        }
                                    }
                                });
                            }
                            else if (data.error) {
                                alertify.error('Error: ' + data.error);
                            }
                        },
                        error: function(data) {
                            alertify.error('Error actualizando pasarelas.');
                        }
                    });
                }
                else {
                    alertify.confirm('Ulises G 5000 R', strmsg,
                        function() {
                            ExistGatewaysOut(data.idCFG, function(existe) {
                                if (existe.Aplicar) {
                                    // Comprobar si existe alguna pasarela de la configuración
                                    // a activar sin recursos configurados
                                    ExistGatewayWithoutResources(data.idCFG, function(gateways) {
                                        if (gateways.Aplicar) {
                                            //TODO esto quita solo la coma del final...
                                            listOfGateways = listOfGateways.substr(0, listOfGateways.length - 1);
/** 20190215. El PUT ponia todas las pasarelas de la configuracion activa como pendientes. */
                                            //$.ajax({
                                            //    type: 'PUT',
                                            //    url: '/configurations/' + $('#DivConfigurations').data('idCFG'),
                                            //    dataType: 'json',
                                            //    contentType: 'application/json',
                                            //    data: JSON.stringify({
                                            //        "idCFG": $('#DivConfigurations').data('idCFG'),
                                            //        "name": $('#name').val(),
                                            //        "description": $('#desc').val(),
                                            //        "activa": $('#activa').prop('checked')
                                            //    }),
                                            //    success: function(data) {
                                            //        console.log('GetActiveCfgAndActivate => PUT /configurations/<> success. ' + data.toString());
                                            //        if (data.error == null) {
                                            //            /** 20190212. Se estaba considerando que los datos estaban en el objeto 'data' y no en el 'data.data' */
                                            //            console.log(data.data);
                                            //            $.ajax({
                                            //                type: 'GET',
                                            //                url: '/configurations/' + data.data.idCFG + '/loadChangestoGtws',
                                            //                success: function(result) {
                                            //                    if (result) {
                                            //                        console.log(data.data);
                                            //                        GenerateHistoricEvent(ID_HW, LOAD_REMOTE_CONFIGURATION, data.data.name, $('#loggedUser').text());
                                            //                        var strmsg = '';
                                            //                        if (isActiveConfig)
                                            //                            strmsg = 'Configuración \"' + data.data.name + '\" activada.';
                                            //                        else
                                            //                            strmsg = 'Cambios aplicados en \"' + data.data.name + '\".';
                                            //                        alertify.success(strmsg);
                                            //                        isActiveConfig = false;
                                            //                        // Reset list of gateways to activate
                                            //                        //AddGatewayToList(null);
                                            //                        // 20170509. AGL Gestor 'Aplicar cambios' en usuarios
                                            //                        usersModified = false;
                                            //                        // 20170516. AGL. Activar Cambios...
                                            //                        tbbssModified = false;
                                            //                        // 20170516. AGL. Activar Cambios...
                                            //                        configModified = false;
                                            //                        // 20170516. AGL. Activar Cambios...
                                            //                        cgwModified = false;
                                            //                        // 20170516. AGL. Activar Cambios...
                                            //                        resModified = false;
                                            //                        //
                                            //                        configBackup = false;
                                            //                    }
                                            //                }
                                            //            });
                                            //        }
                                            //    }
                                            //});
                                            $.ajax({
                                                type: 'GET',
                                                url: '/configurations/' + data.idCFG + '/loadChangestoGtws',
                                                success: function (result) {
                                                    if (result) {
                                                        GenerateHistoricEvent(ID_HW, LOAD_REMOTE_CONFIGURATION, data.name, $('#loggedUser').text());
                                                        var strmsg = '';
                                                        if (isActiveConfig)
                                                            strmsg = 'Configuración \"' + data.name + '\" activada.';
                                                        else
                                                            strmsg = 'Cambios aplicados en \"' + data.name + '\".';
                                                        alertify.success(strmsg);
                                                        isActiveConfig = false;
                                                        // Reset list of gateways to activate
                                                        //AddGatewayToList(null);
                                                        // 20170509. AGL Gestor 'Aplicar cambios' en usuarios
                                                        usersModified = false;
                                                        // 20170516. AGL. Activar Cambios...
                                                        tbbssModified = false;
                                                        // 20170516. AGL. Activar Cambios...
                                                        configModified = false;
                                                        // 20170516. AGL. Activar Cambios...
                                                        cgwModified = false;
                                                        // 20170516. AGL. Activar Cambios...
                                                        resModified = false;
                                                        //
                                                        configBackup = false;
                                                    }
                                                }
                                            });
//------------------------------------------------------------------------
                                        }
                                    });
                                }
                            });
                        },
                        function() {
                            alertify.error('Cancelado');
                        }
                    );
                }
            }
            else {
                alertify.error('No existe una configuración activa en el sistema.');
                usersModified = false;
                // 20170516. AGL. Activar Cambios...
                tbbssModified = false;
                // 20170516. AGL. Activar Cambios...
                configModified = false;
                // 20170516. AGL. Activar Cambios...
                cgwModified = false;
                // 20170516. AGL. Activar Cambios...
                resModified = false;
                //
                configBackup = false;
            }
        }
    });
};

var GotoGateway = function(id, name, idSite, nameSite) {
    hidePrevious('#FormSites', '#AddFormsite', '#DivSites');
    GetSites(function() {
        ShowSite(nameSite, idSite);
        ShowHardwareGateway(id, name);
    });
};


/************************************/
/*	FUNCTION: GenerateData 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GenerateData = function(idCfg, f) {
    $.ajax({
        type: 'GET',
        url: '/configurations/SP_cfg/' + idCfg,
        success: function(data) {
            if (data != null) {
                f(data);
            }
            else {
                alertify.alert('Ulises G 5000 R', "No hay gateways asignados a la configuración o las gateways asignadas no tienen recursos.");
                alertify.error("No hay gateways asignados a la configuración o las gateways asignadas no tienen recursos.");
            }
        }
    });
};
//allowDrop(ev)
function checkDraggableItem() {
    alertify.alert('Ulises G 5000 R', "Estas seguro?");
}

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

/** 20170522 AGL Export to CSV */
var resSubtipoString = function(tipo, subtipo) {
    if (tipo == 1) {
        var subtiposradio = ["Local-Simple", "Local-P/R", "Local FD-Simple", "Local FD-P/R",
            "Remoto RxTx", "Remoto Tx", "Remoto Rx"];
        return subtipo < 7 ? subtiposradio[subtipo] : "????";
    }
    if (tipo == 2) {
        var subtipostel = ["PP-BL", "PP-BC", "PP-AB", "ATS-R2", "ATS-N5", "LCEN", "ATS-QSIG", "TUN-LOC", "TUN-REM"];
        return subtipo < 9 ? subtipostel[subtipo] : "????";
    }
    return "????";
};
var resColateralString = function(tipo, subtipo, reg) {
    if (tipo == 1) {
        switch (subtipo) {
            case 0:	// Simple
            case 2:	// FD Simple
                return ";" +
                    (reg.uriTxA != null ? reg.uriTxA : '') + ";" +
                    (reg.uriRxA != null ? reg.uriRxA : '') + ";;";
            case 1:
            case 3:
                return ";" +
                    (reg.uriTxA != null ? reg.uriTxA : '') + ";" +
                    (reg.uriTxB != null ? reg.uriTxB : '') + ";" +
                    (reg.uriRxA != null ? reg.uriRxA : '') + ";" +
                    (reg.uriRxB != null ? reg.uriRxB : '');
            case 4:
            case 5:
            case 6:
                return ";;;;";
            default:
                return ";????;????;????;????";
        }
    }
    if (tipo == 2) {
        return reg.uri_remota + ";;;;";
    }
    return "????;????;????;????;????";
};

/** 20170904. Obsoleta-eliminar */
var ExportCfgToExcel_v0 = function(idCfg, empl) {
    GenerateData(idCfg, function(result) {
        var rows = result.result;
        var cfgName = "";
        var csvData = "Configuracion;" +
            // "Emplazamiento;"+
            "Pasarela;" +
            "Slot;" +
            "Posicion;" +
            "Recurso;" +
            "Tipo;" +
            "Subtipo;" +
            "Colateral TEL;" +
            "Colateral TxA;" +
            "Colateral RxA;" +
            "Colateral TxB;" +
            "Colateral RxB\r\n";
        $.each(rows, function(index, reg) {
            var item = (reg.cfg_name + ";") +
                // empl.toString() + ";" + 
                (reg.cgw_name + ";") +
                (reg.slave + ";") +
                (reg.posicion + ";") +
                (reg.resource_name + ";") +
                (reg.resource_tipo == 1 ? "RADIO;" : reg.resource_tipo == 2 ? "TELEFONICO;" : "????;") +
                (resSubtipoString(reg.resource_tipo,
                    reg.resource_tipo == 1 ? reg.tipo_rad : reg.tipo_tel) + ";") +
                (resColateralString(reg.resource_tipo,
                    reg.resource_tipo == 1 ? reg.tipo_rad : reg.tipo_tel, reg) + ";") +
                "\r\n";
            csvData += item;
            cfgName = reg.cfg_name;
        });

        var myLink = document.createElement('a');
        myLink.download = 'Cfg_' + cfgName + '-' + $('#_hfecha').text() + '_InformeCfg.csv';
        myLink.href = "data:application/csv," + escape(csvData);
        myLink.click();
    });
};

/** 20170904. Obsoleta-eliminar */
var ExportCfgToPdf_v0 = function(idCfg) {
    // Llamar al SP para generar la tabla con los datos necesarios
    GenerateData(idCfg, function(result) {

        // Generate report
        var header = [
            { text: 'Pasarela', style: 'tableHeader' },
            { text: 'Slot', style: 'tableHeader' },
            { text: 'Posicion', style: 'tableHeader' },
            { text: 'Recurso', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' },
            { text: 'Subtipo', style: 'tableHeader' },
            { text: 'Colateral', style: 'tableHeader' }
        ];


        if (result.errno === 1305) {
            console.log('Error: ' + result.code);
            return;
        }
        var start = 0;
        var cuantos = 300;
        var rows = result.result;
        var items = rows.slice(start, cuantos);
        var lastGateway = '';
        var cfgName = items[0].cfg_name;
        while (items.length > 0) {
            // ** Array of arrays!! **/
            var data = [];
            data.push(header);

            $.each(items, function(index, value) {
                var row = [];
                var uris = [];
                var red = 'black';

                if (value.resource_tipo == 2) {
                    red = (value.uri_remota == null || value.uri_remota == '') ? 'red' : 'black';
                    // Telefónico
                    row.push({ text: value.cgw_name, color: red });
                    row.push({ text: value.slave.toString(), color: red });
                    row.push({ text: value.posicion.toString(), color: red });
                    row.push({ text: value.resource_name, color: red });
                    row.push({ text: "TELEFONICO", color: red });
                    switch (value.tipo_tel) {
                        case "0":
                            row.push({ text: 'PP-BL', color: red });
                            break;
                        case "1":
                            row.push({ text: 'PP-BC', color: red });
                            break;
                        case "2":
                            row.push({ text: 'PP-AB', color: red });
                            break;
                        case "3":
                            row.push({ text: 'ATS-R2', color: red });
                            break;
                        case "4":
                            row.push({ text: 'ATS-N5', color: red });
                            break;
                        case "5":
                            row.push({ text: 'LCEN', color: red });
                            break;
                        case "6":
                            row.push({ text: 'ATS-QSIG', color: red });
                            break;
                        case "7":
                            row.push({ text: 'TUN-LOC', color: red });
                            break;
                        case "8":
                            row.push({ text: 'TUN-REM', color: red });
                            break;
                    }
                    row.push({ text: value.uri_remota != null ? value.uri_remota : '', color: red });

                    data.push(row);
                }
                else {
                    // Radio
                    switch (value.tipo_rad) {
                        case "0": // Local-Simple
                            red = ((value.uriTxA == null || value.uriRxA == null) ? 'red' : 'black');

                            row.push({ text: value.cgw_name, color: red });
                            row.push({ text: value.slave.toString(), color: red });
                            row.push({ text: value.posicion.toString(), color: red });
                            row.push({ text: value.resource_name, color: red });
                            row.push({ text: "RADIO", color: red });
                            row.push({ text: "Local-Simple", color: red });
                            uris.push({ text: 'Tx:' + (value.uriTxA != null ? value.uriTxA : ''), color: red });
                            uris.push({ text: 'Rx:' + (value.uriRxA != null ? value.uriRxA : ''), color: red });
                            row.push(uris);
                            break;
                        case "1": // Local-P/R
                            red = (value.uriTxA == null || value.uriRxA == null || value.uriTxB == null || value.uriRxB == null) ? 'red' : 'black';

                            row.push({ text: value.cgw_name, color: red });
                            row.push({ text: value.slave.toString(), color: red });
                            row.push({ text: value.posicion.toString(), color: red });
                            row.push({ text: value.resource_name, color: red });
                            row.push({ text: 'RADIO', color: red });
                            row.push({ text: 'Local-P/R', color: red });
                            uris.push({ text: 'Tx A:' + (value.uriTxA != null ? value.uriTxA : ''), color: red });
                            uris.push({ text: 'Tx B:' + (value.uriTxB != null ? value.uriTxB : ''), color: red });
                            uris.push({ text: 'Rx A:' + (value.uriRxA != null ? value.uriRxA : ''), color: red });
                            uris.push({ text: 'Rx B:' + (value.uriRxB != null ? value.uriRxB : ''), color: red });
                            row.push(uris);
                            break;
                        case "2": // Local FD-Simple
                            red = (value.uriTxA == null || value.uriRxA == null) ? 'red' : 'black';

                            row.push({ text: value.cgw_name, color: red });
                            row.push({ text: value.slave.toString(), color: red });
                            row.push({ text: value.posicion.toString(), color: red });
                            row.push({ text: value.resource_name, color: red });
                            row.push({ text: 'RADIO', color: red });
                            row.push({ text: 'Local FD-Simple', color: red });
                            uris.push({ text: 'Tx:' + (value.uriTxA != null ? value.uriTxA : ''), color: red });
                            uris.push({ text: 'Rx:' + (value.uriRxA != null ? value.uriRxA : ''), color: red });
                            row.push(uris);
                            break;
                        case "3": // Local FD-P/R
                            red = (value.uriTxA == null || value.uriRxA == null || value.uriTxB == null || value.uriRxB == null);

                            row.push({ text: value.cgw_name, color: red });
                            row.push({ text: value.slave.toString(), color: red });
                            row.push({ text: value.posicion.toString(), color: red });
                            row.push({ text: value.resource_name, color: red });
                            row.push({ text: 'RADIO', color: red });
                            row.push({ text: 'Local FD-P/R', color: red });
                            uris.push({ text: 'Tx A:' + (value.uriTxA != null ? value.uriTxA : ''), color: red });
                            uris.push({ text: 'Tx B:' + (value.uriTxB != null ? value.uriTxB : ''), color: red });
                            uris.push({ text: 'Rx A:' + (value.uriRxA != null ? value.uriRxA : ''), color: red });
                            uris.push({ text: 'Rx B:' + (value.uriRxB != null ? value.uriRxB : ''), color: red });
                            row.push(uris);
                            break;
                        case "4": // Remoto RxTx
                            row.push({ text: value.cgw_name, color: red });
                            row.push({ text: value.slave.toString(), color: red });
                            row.push({ text: value.posicion.toString(), color: red });
                            row.push({ text: value.resource_name, color: red });
                            row.push({ text: 'RADIO', color: red });
                            row.push('Remoto RxTx');
                            row.push('');
                            break;
                        case "5": // Remoto Tx
                            row.push({ text: value.cgw_name, color: red });
                            row.push({ text: value.slave.toString(), color: red });
                            row.push({ text: value.posicion.toString(), color: red });
                            row.push({ text: value.resource_name, color: red });
                            row.push({ text: 'RADIO', color: red });

                            row.push('Remoto Tx');
                            row.push('');
                            break;
                        case "6": // Remoto Rx
                            row.push({ text: value.cgw_name, color: red });
                            row.push({ text: value.slave.toString(), color: red });
                            row.push({ text: value.posicion.toString(), color: red });
                            row.push({ text: value.resource_name, color: red });
                            row.push({ text: 'RADIO', color: red });

                            row.push('Remoto Rx');
                            row.push('');
                            break;
                    }
                    data.push(row);
                }
            });

            var base64 = getBase64Image(document.getElementById("imgLogo"));
            var docDefinition = {
                footer: function(currentPage, pageCount) { return { text: currentPage.toString() + ' / ' + pageCount, alignment: 'center', margin: [0, 5, 0, 0] }; },
                /*				background: function(currentPage){
                                    if (currentPage > 1)
                                        return	{ text: lastGateway, style: 'subheader'};
                                },
                */				// a string or { width: number, height: number }
                pageSize: 'A4',
                // by default we use portrait, you can change it to landscape if you wish
                pageOrientation: 'landscape',
                content: [
                    {
                        layout: 'noBorders',
                        table: {
                            widths: [100, '*'],
                            body: [
                                [
                                    {
                                        image: 'data:image/jpeg;base64,' + base64,
                                        alignment: 'left'
                                    },
                                    { text: $('#_hfecha').text() + ' ' + $('#_hsolohora').text(), style: 'subheader', alignment: 'right' }
                                ]
                            ]
                        }
                    },
                    { text: 'CONFIGURACION: ' + cfgName, style: 'header' },
                    //{ text:  data[start + 1][0], style: 'subheader' },
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            // keepWithHeaderRows: 1,
                            // dontBreakRows: true,
                            body: data
                        }
                    }
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
                        fontSize: 12,
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

            //pdfMake.createPdf(docDefinition).open();
            pdfMake.createPdf(docDefinition).download('U5K-G-' + cfgName + '-' + $('#_hfecha').text() + '.pdf');
            items = rows.slice(++start * cuantos, (start * cuantos) + cuantos);
        }
    });
};

/** 20170904. Nuevas Versiones de Informes de Configuracion*/
/** */
/* */
var RdTypes = [
    "Local Simple", "Local P/R", "Local FD Simple", "Local FD P/R",
    "Remoto TxRx", "Remoto Tx", "Remoto Rx"
];
var PhTypes = [
    "BL", "BC", "AB", "ATS-R2", "ATS-N5", "LCEN", "ATS-QSIG"
];
/***/
function PdfPrintGws(gws) {
    var content = [];
    content.push({ text: gws.length.toString() + ' Pasarelas en la configuracion', style: 'level0' });
    for (igw = 0; igw < gws.length; igw++) {
        var gw = gws[igw];
        PdfPrintGw(content, gw);
        if (igw < (gws.length - 1))
            content.push({ text: "", pageBreak: 'after' });
    }
    return content;
}
/**/
function PdfPrintGw(content, gw) {
    content.push({ text: 'Pasarela ' + gw.gw + ', en ' + gw.site, style: 'level1' });
    content.push({ text: 'Configuracion Radio. ' + gw.radios.length + ' Recursos.', style: 'level2' });
    if (gw.radios.length > 0) {
        content.push({
            columns: [
                { text: 'Recurso', width: 250 },
                { text: 'Frecuencia', width: 80 },
                { text: 'Tipo', width: 80 },
                { text: 'Colaterales', width: 120 }
            ], style: 'level3_header'
        });
        for (ir = 0; ir < gw.radios.length; ir++) {
            var rr = gw.radios[ir];
            PdfPrintRadioRs(content, rr);
        }
    }

    content.push({ text: 'Configuracion Telefonia. ' + gw.telef.length + ' Recursos.', style: 'level2' });
    if (gw.telef.length > 0) {
        content.push({
            columns: [
                { text: 'Recurso', width: 330 },
                { text: 'Tipo', width: 80 },
                { text: 'Colateral', width: 120 }
            ], style: 'level3_header'
        });
        for (it = 0; it < gw.telef.length; it++) {
            var rt = gw.telef[it];
            PdfPrintPhoneRs(content, rt);
        }
    }
}
/** */
function PdfPrintRadioRs(content, rd) {
    var rdInfo1 = ('(' + (rd.columna.toString() + '/' + rd.fila) + ')');
    rdInfo1 += (': ' + rd.nombre);
    var rdInfo2 = (rd.frecuencia.toFixed(3) + ' MHz.');
    var rdInfo3 = (RdTypes[rd.tipo_agente]);
    var colInfo = "";
    if (rd.tipo_agente < 4) {
        colInfo += (rd.col.length.toString() + ' Colaterales');
        for (ic = 0; ic < rd.col.length; ic++) {
            var col = rd.col[ic];
            colInfo += ('\r\n.    EMPL ' + Math.round(col.nivel_colateral / 2) + ', ' + col.tipo + ': ' + col.uri);
        }
    }
    content.push({
        columns: [
            { text: rdInfo1, width: 250 },
            { text: rdInfo2, width: 80 },
            { text: rdInfo3, width: 80 },
            { text: colInfo, width: 250 }
        ], style: 'level3'
    });
}
/** */
function PdfPrintPhoneRs(content, ph) {
    var phInfo1 = ('(' + (ph.columna.toString() + '/' + ph.fila) + ')');
    phInfo1 += (': ' + ph.nombre);
    var phInfo2 = (PhTypes[ph.tipo_interfaz_tel]);
    var phInfo3 = (ph.uri_telefonica);
    content.push({
        columns: [
            { text: phInfo1, width: 330 },
            { text: phInfo2, width: 80 },
            { text: phInfo3, width: 250 }
        ], style: 'level3'
    });
}

/** */
function PdfPrintRadioCol(content, col) {
    var clInfo = 'EMPL ' + Math.round(col.nivel_colateral / 2);
    clInfo += (', ' + col.tipo);
    clInfo += (': ' + col.uri);
    content.push({ text: clInfo, style: 'level5' });
}

/** */
var ExportCfgToExcel = function(idCfg, empl) {
    GenerateData(idCfg, function(gws) {
        var cfgName = gws.length == 0 ? "NO-GW" : gws[0].cfg;
        var strData = 'Config' +
            ';Emplazamiento' +
            ';Pasarela' +
            ';P-R-T-C' +
            ';Recurso' +
            ';Frecuencia (MHz)' +
            ';Tipo' +
            ';Colateral' + '\r\n';
        for (igw = 0; igw < gws.length; igw++) {
            var gw = gws[igw];
            // Registro de la Pasarela.
            strData += (gw.cfg + ';' +
                gw.site + ';' +
                gw.gw + ';' +
                '0' + ';' +
                '---' + ';' +
                '---' + ';' +
                '---' + ';' +
                '---' + '\r\n');
            // Registro Recursos RD
            for (ir = 0; ir < gw.radios.length; ir++) {
                var rr = gw.radios[ir];
                // Registro del Recurso
                strData += (gw.cfg + ';' +
                    gw.site + ';' +
                    gw.gw + ';' +
                    '1' + ';' +
                    rr.nombre + ';' +
                    rr.frecuencia.toFixed(3) + ';' +
                    RdTypes[rr.tipo_agente] + ';' +
                    '---' + '\r\n');
                if (rr.tipo_agente <= 4) {
                    for (ic = 0; ic < rr.col.length; ic++) {
                        var col = rr.col[ic];
                        var clInfo = 'EMPL ' + Math.round(col.nivel_colateral / 2);
                        clInfo += (', ' + col.tipo);
                        clInfo += (': ' + col.uri);          // Registro del Colateral
                        strData += (gw.cfg + ';' +
                            gw.site + ';' +
                            gw.gw + ';' +
                            '3' + ';' +
                            rr.nombre + ';' +
                            rr.frecuencia.toFixed(3) + ';' +
                            RdTypes[rr.tipo_agente] + ';' +
                            clInfo + '\r\n');
                    }
                }
            }
            // Registro Recursos TF
            for (it = 0; it < gw.telef.length; it++) {
                var rt = gw.telef[it];
                // Registro del Recurso
                strData += (gw.cfg + ';' +
                    gw.site + ';' +
                    gw.gw + ';' +
                    '2' + ';' +
                    rt.nombre + ';' +
                    '---' + ';' +
                    PhTypes[rt.tipo_interfaz_tel] + ';' +
                    rt.uri_telefonica + '\r\n');
            }

        }

        // Salvar el fichero...
        var myLink = document.createElement('a');
        myLink.download = 'Cfg_' + cfgName + '-' + $('#_hfecha').text() + '_InformeCfg.csv';
        myLink.href = "data:application/csv," + escape(strData);
        myLink.click();
        // var hiddenElement = document.createElement('a');
        //    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(strData);
        //    hiddenElement.target = '_blank';
        //    hiddenElement.download = 'redan-cfg.csv';
        //    document.body.appendChild(hiddenElement);
        //    hiddenElement.click();		
    });
};

var ExportCfgToPdf = function(idCfg) {
    // Llamar al SP para generar la tabla con los datos necesarios
    GenerateData(idCfg, function(data) {
        var cfgName = data.length == 0 ? "NO-GW" : data[0].cfg;
        // var logo = getBase64Image(document.getElementById("logo"));
        var docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            //pageMargins: [10,10,10,10],
            styles: {
                header: {
                    fontSize: 16,
                    bold: true,
                    color: 'red', alignment: 'center',
                    margin: [0, 20, 0, 10]
                },
                footer: {
                    fontSize: 9, color: 'red',
                    margin: [10, 10, 10, 20]
                },
                level0: {
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 20, 0, 10]
                },
                level1: {
                    fontSize: 12,
                    bold: true, color: 'blue',
                    alignment: 'left',
                    margin: [20, 20, 0, 0]
                },
                level2: {
                    fontSize: 12,
                    bold: true,
                    alignment: 'left',
                    margin: [40, 10, 0, 0]
                },
                level3_header: {
                    fontSize: 10,
                    bold: true,
                    alignment: 'left',
                    color: 'blue',
                    margin: [50, 2, 0, 0]
                },
                level3: {
                    fontSize: 9,
                    alignment: 'left',
                    margin: [50, 2, 0, 0]
                },
                level4: {
                    fontSize: 10,
                    bold: true,
                    alignment: 'left',
                    margin: [60, 0, 0, 0]
                },
                level5: {
                    fontSize: 9,
                    bold: true,
                    alignment: 'left',
                    margin: [90, 0, 0, 0]
                },
                defaultStyle: {
                    fontSize: 12,
                    color: 'green',
                    alignment: 'justify'
                }
            },
            header: {
                margin: [10, 10, 10, 10],
                text: "Ulises G 5000. Informe de Configuracion de Recursos: " + cfgName, style: 'header'
            },
            footer: function(currentPage, pageCount) {
                return {
                    margin: [10, 10, 10, 10],
                    columns: [
                        { text: (new Date()).toLocaleString(), style: 'footer', alignment: 'left' },
                        { text: "Nucleo. 2017-2019. All rights reserved.", style: 'footer', alignment: 'center' },
                        { text: 'Pg ' + currentPage.toString() + ' de ' + pageCount, style: 'footer', alignment: 'right' }
                    ]
                };
            },
            content: PdfPrintGws(data)
        };

        pdfMake.createPdf(docDefinition).download('U5K-G-' + cfgName + '-' + $('#_hfecha').text() + '.pdf');
        //pdfMake.createPdf(docDefinition).open();

    });
};

/**** */
var refreshTime = 1000;
/** Para no forrar al servidor... */
var answered1 = true;
var answered2 = true;
function SynchronizedGateways() {

    if (answered1 == true) {
        answered1 = false;
        $.ajax({
            type: 'GET',
            url: '/gateways/syncGateways/' + refreshTime,
            success: function (data) {
                UpdateSynchroStateInConfig(data);
                UpdateSynchroStateInSites(data);
                answered1 = true;
            },
            error: function () {
                answered1 = true;
            },
            timeout: 10000
        });
    }

    /** AGL. Polling de Sesion Activa */
    if (answered2 == true) {
        answered2 = false;
        $.ajax({
            type: 'GET',
            url: '/alive',
            success: function (data) {
                answered2 = true;
                if (!data.alive) {
                    $(location).attr('href', '/login');
                }
                else {
                    cgwModified = data.gwpendientes ? data.gwpendientes : 0;
                }
            },
            error: function () {
                answered2 = true;
                $(location).attr('href', '/login');
            },
            timeout: 10000
        });
    }
    setTimeout(function () { SynchronizedGateways() }, refreshTime);
}

function EnableAplicarCambios() {
    //Quitamos el translate para no pedir continuamente el fichero de lang
    //translateWord('Activate',function(result){

    if ($('#listaOpciones li:nth-last-child(2) a ').text() == 'Apply changes' ||
        $('#listaOpciones li:nth-last-child(2) a ').text() == 'Aplicar cambios') {

        /** 20170509. AGL Gestor 'Aplicar cambios' */
        if (listOfGateways.length == 0 && usersModified == false && tbbssModified == false
            && configModified == false && cgwModified == false && resModified == false && configBackup == false) {
            /* if (listOfGateways.length == 0 )
               ****************************************************/
            $('#listaOpciones li:nth-last-child(2)').addClass('menuListDisabled');
        }
        else {
            /* 20170511. AGL. PERFILES */
            if (Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccLoadcProfMsc]) == true)
                /* if(EnableAplicarCambiosPerfil($('#BodyRedan').data('perfil')))
                ******************************************/
                $('#listaOpciones li:nth-last-child(2)').removeClass('menuListDisabled');
            else
                $('#listaOpciones li:nth-last-child(2)').addClass('menuListDisabled');
        }
    }
    setTimeout(function () { EnableAplicarCambios(); }, 1000);
}
