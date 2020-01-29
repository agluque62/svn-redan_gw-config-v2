
var GetSites = function(f) {
    $('#FormSites').show();
    $.ajax({
        type: 'GET',
        url: '/sites',
        success: function(data) {
            ShowSites(data, f);
        }
    });
};

/************************************************/
/*	FUNCTION: UpdateSynchroStateInSites 		*/
/*  PARAMS: data								*/
/*												*/
/*  REV 1.0.2 VMG								*/
/************************************************/
var UpdateSynchroStateInSites = function(data) {
    if (data.length != 0) {
        $.each(data, function(index, value) {
            $(".gtwList li").each(function(index) {
                //if(index!=0) {
                if ($(this).data('texto') == value.idGtw) {
                    if (value.online) {
                        if (value.isNotActiveCfg)
                            $(this).prop('class', 'VivaNoActiva');
                        else if (value.isSinch)
                            $(this).prop('class', 'apply');
                        else if (value.updatePend)
                            $(this).prop('class', 'VivaNoSincro');
                        else if (value.InConflict && !value.updatePend)
                            $(this).prop('class', 'InConflict');
                        else
                            $(this).prop('class', 'VivaSincroSite');
                    }
                    else if (value.isSinch)
                        $(this).prop('class', 'apply');
                    else {
                        if (value.isNotActiveCfg)
                            $(this).prop('class', 'NoVivaNoActia');
                        else
                            $(this).prop('class', 'NoVivaActivaSite');
                    }
                }
                //}
            });
        });
    }
};

function ShowSites(data, f) {
    $("#listSites").empty();
    $('#AddFormsite').hide();
    $('#DivSites').animate({ width: '350px' });

    translateWord('Sites', function(result) {
        $('#TitleSite').text(result);
    });

    $.each(data.data, function(index, value) {
        if (value.idEMPLAZAMIENTO != 1) {
            var item = $('<li>' +
                '<a data-site=' + value.idEMPLAZAMIENTO + ' ondrop="dropGatewayToSite(event)" ondragover="getOverDropS(event)" style="display:block" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowSite(\'' + value.name + '\',\'' + value.idEMPLAZAMIENTO + '\')})" >' + value.name + '</a>' +
                '<ul class="gtwList" id="gtw-' + value.name + '" style="display:none"></ul>' +
                '</li>');
            item.appendTo($("#listSites"));
        }
    });

    if (f != null)
        f();
}

function getOverDropS(ev) {
    //window.alert('Desde Sites');
}


/************************************/
/*	FUNCTION: ShowSite 				*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function ShowSite(site, id) {
    translateWord('Configurations', function(result) {
        var titulo = result + ': ' + $('#name').val();
        translateWord('Sites', function(result) {
            $('#TitleH3').text(titulo + ".\t" + result + ': ' + site + '.');
        });
    });

    if ($('#AddFormConfiguration').is(':visible')) {
        $('#AddFormConfiguration').fadeOut(500, function() {
            //$('#FormSites').fadeIn(500,function(){
            $('#AddFormsite').show();
            $('#BtnRemove').show();
            $('#BtnAddGateway').show();

            $('#TrCreateGateway').show();
            $('#TrToolsSite').show();
            $('#TrSite').show();
            //});	
        });

    }
    else if ($('#AddFormsite').is(':visible')) {
        $('#DivSites').animate({ width: '350px' });
        $('#BtnRemove').show();
        $('#BtnAddGateway').show();

        $('#TrCreateGateway').show();
        $('#TrToolsSite').show();
        $('#TrSite').show();
    }

    //$('#AddFormsite').show();

    translateWord('Sites', function(result) {
        $('#TitleSite').text(result + ": " + site);
    });
    translateWord('Update', function(result) {
        $('#BtnAdd').text(result)
            .attr('onclick', 'UpdateSingleSite()');
        // translateWord('AddSite',function(result){
        // 	$('#Add').text(result)
        // 			.attr('onclick',"CheckingAnyChange(\'GeneralContent\', function(){NewSite()})");
        // })
    });

    $('#DivSites').animate({ width: '715px' });
    $('#AddFormsite').animate({ width: '350px', height: '190px' });
    $('#hwGateway').hide();

    // Ocultar la lista de emplazamientos que estuviera abierta
    var lista = '#site-' + $('#IdSite').data('idSite');
    $(lista).hide();

    $('#IdSite').val(site);
    $('#IdSite').data('idSite', id);

    // Mostrar sus gateways
    lista = '#site-' + id;
    $(lista).empty()
        .show();
    $.ajax({
        type: 'GET',
        url: '/sites/' + $('#IdSite').data('idSite') + '/gateways',
        success: function(data) {
            if (data.error == null) {
                if (data.data.length != 0) {
                    $.each(data.data, function(index, value) {
                        var item = null;
                        var name1 = null;
                        var name2 = null;
                        if (value.name.length > 14 && value.name.length < 28) {
                            name1 = value.name.substring(0, 14);
                            name2 = value.name.substring(14, 28);
                            item = $('<li data-texto="' + value.idCGW + '">' +
                                '<a draggable="false" ondragstart="dragGatewayToSite(event)" style="display:block; color:#89001e" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})"' + '>' + name1 + '<br>' + name2 + '</a></li>');
                        }
                        else if (value.name.length < 14) {
                            item = $('<li data-texto="' + value.idCGW + '">' +
                                '<a draggable="false" ondragstart="dragGatewayToSite(event)" style="display:block; color:#89001e" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})"' + '>' + value.name + '</a></li>');

                        }
                        else {
                            name1 = value.name.substring(0, 14);
                            name2 = value.name.substring(14, 28);
                            var name3 = value.name.substring(28, 31);
                            item = $('<li data-texto="' + value.idCGW + '">' +
                                '<a draggable="false" ondragstart="dragGatewayToSite(event)" style="display:block; color:#89001e" onclick="CheckingAnyChange(\'GeneralContent\', function(){ShowHardwareGateway(\'' + value.idCGW + '\',\'' + value.name + '\')})"' + '>' + name1 + '<br>' + name2 + '<br>' + name3 + '</a></li>');
                        }
                        item.appendTo($(lista));
                    });
                }
            }
            else
                alertify.error('Error SQL: ' + data.error);
            //VMG No hay pasarelas para este emplazamiento
        },
        error: function(data) {
            alertify.error('Se ha producido un error al intentar recuperar las configuraciones.');
        }
        //TimeStamp de las pasarelas
    });
}

function dragGatewayToSite(ev) {
    ev.dataTransfer.setData("itemDraggingGateway", ev.target.parentNode.dataset.texto);
    //    $('.dropable').addClass('target');
}

/****************************/
/*** Cambiar una pasarela  **/
/*** de emplazamiento      **/
/****************************/
function dropGatewayToSite(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("itemDraggingGateway");

    // Solo progresa la operación drag&drop si el emplazamiento origen es distinto del destino
    if (data != "") {
        $('.dropable').removeClass('target');
        // Evitar un drop de otra cosa que no sea una pasarela
        if (ev.target.parentNode.dataset.texto != null) {
            $.ajax({
                type: 'PUT',
                url: '/gateways/' + data + '/site/' + ev.target.parentNode.dataset.texto,
                success: function(data) {
                    alertify.success('Gateway modificada.');
                    ShowSite(ev.target.parentNode.textContent, ev.target.parentNode.dataset.texto);
                },
                error: function(data) {
                    alertify.error('Error modificando gateway.');
                }
            });
        }
    }
    //else
    //	dropSiteToCfg(ev);
}

function dropSiteToCfg(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("itemDraggingGateway");

    // Solo progresa la operación drag&drop si la configuración del emplazamiento origen 
    // es distinta de la configuración del emplazamiento destino
    if (data != "") {
        $('.dropable').removeClass('target');
        // Evitar un drop de otra cosa que no sea un emplazamiento
        if (ev.target.dataset.cfg != null) {
            $.ajax({
                type: 'PUT',
                url: '/sites/' + data + '/cfg/' + ev.target.dataset.cfg,
                success: function(data) {
                    if (data.error == "ER_DUP_ENTRY") {
                        alertify.error('El emplazamiento ya existe en la configuración destino.');
                    }
                    else {
                        alertify.success('Emplazamiento modificado.');
                        ShowCfg($('#DivConfigurations').data('cfgJson'));
                    }

                },
                error: function(data) {
                    alertify.error('Error modificando emplazamiento.');
                }
            });
        }
    }

}

/************************************/
/*	FUNCTION: UpdateSingleSite 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function UpdateSingleSite() {
    if ($('#IdSite').val().length > 0) {
        $.ajax({
            type: 'PUT',
            url: '/sites/' + $('#IdSite').data('idSite') + '/' + $('#DivConfigurations').data('idCFG'),
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                name: $('#IdSite').val()
            }),
            success: function(data) {
                if (data.error == null) {
                    // Añade las pasarelas que pertenecen a este site y
                    // están vivas y en la configuración activa a la lista de pasarelas a activar
                    //AddGatewaysFromActiveToListOfGateways($('#IdSite').data('idSite'))//TODO he comentado esto porque no creo que haga falta.
                    alertify.success('Emplazamiento \"' + data.data + '\" modificado.');
                    ShowCfg($('#DivConfigurations').data('cfgJson'));
                    /** 20190213 Solo se activará el boton si se modifica la configuracion activa */
                    configModified = data.aplicarcambios && data.aplicarcambios != 0/* true*/;

                    //ShowSite(data.data,$('#IdSite').data('idSite'));//TODO esto no chuta
                }
                else if (data.error == 'ER_DUP_ENTRY') {
                    $('#IdSite').val($('#IdSite')['0'].oldValue);
                    alertify.error('Ya existe un emplazamiento \"' + data.dupName + '\" en esta configuración.');
                }
                else
                    alertify.error('Error: ' + data.error);
            },
            error: function(data) {
                alertify.error('Error modificando emplazamiento.');
            }
        });
    }
}

/************************************/
/*	FUNCTION: AddSite 				*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function AddSite() {
    if ($('#NewSite').val().length > 0) {
        $.ajax({
            type: 'POST',
            url: '/sites/' + $('#NewSite').val(),
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                cfg_idCFG: $('#DivConfigurations').data('idCFG'),
                name: $('#NewSite').val()
            }),
            success: function(data) {
                if (data.error == 'ER_DUP_ENTRY') {
                    alertify.error('Emplazamiento \"' + $('#NewSite').val() + '\" ya existe en esta configuración.');
                }
                else {
                    alertify.success('Emplazamiento \"' + $('#NewSite').val() + '\" creado.');
                    $('#NewSite').val('');
                    CancelAddSite();
                    ShowCfg($('#DivConfigurations').data('cfgJson'));
                }
            },
            error: function(data) {
                alertify.error('Error añadiendo emplazamiento.');
            }
        });
    }
}

function CreateSite() {
    $('#AddFormConfiguration').hide();
    $('#NavMenu').addClass('disabledDiv');
    $('#NavConfiguration').addClass('disabledDiv');

    $('#FormNewSite').show();
}

function CancelAddSite() {
    $('#FormNewSite').hide();
    $('#AddFormConfiguration').show();
    $('#NavMenu').removeClass('disabledDiv');
    $('#NavConfiguration').removeClass('disabledDiv');
}

/************************************/
/*	FUNCTION: DelSite	 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var DelSite = function() {

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el emplazamiento \"" + $('#IdSite').val() + "\"?" +
        "<br />Tenga en cuenta que se eliminarán todas las pasarelas asociadas a dicho emplazamiento.",
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/sites/' + $('#IdSite').data('idSite'),
                success: function(data) {
                    if (data.error != null)
                        alertify.error('Error: ' + data.error);
                    else {
                        //TODO Queda pendiente ver si se genera códigos de incidencia para borrar o modificar emplazamientos
                        //GenerateHistoricEvent(ID_HW,REMOVE_GATEWAY,$('#nameGw').val(),$('#loggedUser').text());
                        alertify.success('El emplazamiento \"' + $('#IdSite').val() + '\" ha sido eliminado.');
                        $('#IdSite').val('');
                        ShowCfg($('#DivConfigurations').data('cfgJson'));
                    }
                },
                error: function(data) {
                    alertify.error('Error en la aplicación eliminando el emplazamiento.');
                }
            });
        },
        function() {
            alertify.error('Cancelado');
        });
};

/*function DelSite(){
	if ($('#IdSite').data('idSite') == 1){
		// Obligatorio para RCS tener en base de datos el emplazamiento con id=1
		alertify.alert('Ulises G 5000 R',"No es posible eliminar el emplazamiento con identificador 1.");
		alertify.error("No es posible eliminar el emplazamiento con identificador 1.");
		return
	}

	alertify.confirm('Ulises G 5000 R', "¿Eliminar el emplazamiento \"" +$('#IdSite').val() + "\"?", 
		function(){ 
			if ($('#IdSite').val().length > 0){
				$.ajax({type: 'DELETE', 
				 		url: '/sites/' + $('#IdSite').data('idSite'), 
				 		success: function(data){
				 			if (data.data == 0){
				 				alertify.alert('Ulises G 5000 R',"Un emplazamiento con pasarelas asignadas no puede ser eliminado.");
				 			}
				 			else{
					 			alertify.success('El emplazamiento \"'+ $('#IdSite').val() + '\" ha sido eliminado.');
					 			$('#IdSite').val('');
					 			ShowCfg($('#DivConfigurations').data('cfgJson'));
					 			//GetSites();
					 		}
				 		},
				 		error: function(data){
				 			alertify.error('Error eliminando emplazamiento \"'+ data.data + '\".');
				 		}
				});
			}

			//alertify.success('Ok'); 
		}
        , function(){ alertify.error('Cancelado')}
    );
}*/

function NewSite() {
    if (!$('#AddFormsite').is(':visible')) {
        $('#AddFormsite').show();
        $('#DivSites').animate({ width: '715px' });
    }
    else {
        $('#DivSites').animate({ width: '715px' });

        $('#AddFormsite').show();
        $('#BtnRemove').show();
        $('#BtnAddGateway').show();

        $('#hwGateway').hide();
        $('#TrCreateGateway').show();
        $('#TrToolsSite').show();
        $('#TrSite').show();


        $('#AddFormGateway').show();
        $('#AddFormsite').animate({ width: '350px', height: '190px' });
        //$('#DivGateways').animate({width: '1015px'});
        //$('#GeneralContent').show();
        //$('#TableToolsGateway').show();

        translateWord('Sites', function(result) {
            $('#TitleSite').text(result);
        });

        translateWord('Update', function(result) {
            $('#BtnAdd').text(result)
                .attr('onclick', 'UpdateSingleSite()');
        });
    }

    $('#IdSite').val('');
    translateWord('Add', function(result) {
        $('#BtnAdd').text(result)
            .attr('onclick', 'AddSite()');
    });
    $('#BtnRemove').hide();
    $('#BtnAddGateway').hide();
}

function ShowHardwareGateway(id, name) {
    translateWord('Configurations', function(result) {
        var titulo = result + ': ' + $('#name').val();
        translateWord('Sites', function(result) {
            var titulo2 = titulo + ".\t" + result + ': ' + $('#IdSite').val() + '.';
            translateWord('Gateways', function(result) {
                $('#TitleH3').text(titulo2 + '\t' + result + ': ' + name + '.');
            });
        });
    });


    $('#IdSite').data('gatewayName', name);
    $('#IdSite').data('gatewayId', id);


    $('#labelSites').show();
    $('#ListSites').show();
    $('#DivSites').animate({ width: '1150px' }, function() {
        $('#TrCreateGateway').hide();
        $('#TrToolsSite').hide();
        $('#TrSite').hide();
        if (id == null) {
            $('#LblIdGateway').text('');
            $('#ListMenuGateways li:nth-child(3)').attr('style', 'display:none');
        }
        else
            $('#ListMenuGateways li:nth-child(3)').attr('style', 'display:block');

        //GetGateways(null,function(){
        GetGateway(id);
        $('#LblIdGateway').text(name);
        $('#CopyGtwButton').show();
        $('#hwGateway').fadeIn(500, function() {
            // translateWord('Sites',function(result1){
            // 	translateWord('Gateways',function(result2){
            // 		$('#TitleSite').text(result1 + ": " + $('#IdSite').val() + '. ' + result2 + ': ' + name)
            // 	})
            // })
        });
        //})
    });
}

/************************************/
/*	FUNCTION: ShowAssignedSlaves 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG		NO TOCADO	*/
/************************************/
function GotoResource(row, col, update) {

    if (update)
        $('#SResourceType').prop("disabled", true);
    else
        $('#SResourceType').prop("disabled", false);

    //if(!update && loadIndex == 16){
    //	alertify.error('No se pueden añadir mas recursos. Índice de carga máximo alcanzado.');
    //}
    //else {
    //if (totalIndex === 0)
    //	alertify.error("Un momento por favor. Se están actualizando los datos...");//Demasiado rapido
    //else {
    $('#AddFormsite').addClass('disabledDiv');
    $('#SitesList').addClass('disabledDiv');
    $('#NavMenu').addClass('disabledDiv');
    $('#listConfigurations').addClass('disabledDiv');
    $('#Add').addClass('disabledDiv');

    ResetResourcePanel();

    $('#LblIdResouce').text('Slot: ' + col + ' Interfaz: ' + row);


    // $.ajax({type: 'GET',
    // 	// Pasar la ipv de la pasarela
    // 	url: '/gateways/' + $('#ipv').val() + '/hardware',
    // 	success: function(data){
    // 		var i = 0;
    // 		ResetHardware(function(){
    // 			if (data.hardware != null && data.hardware.length > 0){
    // 				ShowAssignedSlaves(data,function(){
    // 					if (i++ == col){
    GetResource($('.Res' + row + col).data('idResource'), function() {
        if ($('#TbEnableRegister').prop('checked'))
            $('#KeyRow').show();
        else
            $('#KeyRow').hide();
        var t = null;
        var l = null;
        if (update == true) {
            // 20170511. Quitar Addradioparameters
            // $('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + row + "',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))}); AddRadioParameters()")
            $('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + row + "',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})");
            //if ($('#SResourceType option:selected').val() == 1) {
            //$('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + row + "','" + loadIndex + "','" + totalIndex + "',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))}); AddRadioParameters()")
            //$('#ButtonCommit').on('click', function (e) {
            //	alertify.error('No es posible modificar el recurso. Elimínelo y creelo de nuevo.');
            //});
            //}
            /*else {
                //$('#ButtonCommit').attr('onclick', "UpdateResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + row + "','" + loadIndex + "','" + totalIndex + "'function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))}); AddPhoneParameters()")
                $('#ButtonCommit').on('click', function (e) {
                    alertify.error('No es posible modificar el recurso. Elimínelo y creelo de nuevo.');
                });
            }*/
            $('#FormParameters').show();
            $('#BtnRemoveResource').show();

            t = ($('.Res' + row + col).offset().top - 94) + 'px';
            l = ($('.Res' + row + col).offset().left - 145) + 'px';
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
            });
        }
        else {
            $('#ButtonCommit').attr('onclick', "AddResource('" + $('.Slave' + col).data('idSLAVE') + "','" + col + "','" + row + "',function(){AddGatewayToList($(\'#DivGateways\').data(\'idCgw\'))})");
            $('#FormParameters').hide();
            $('#BtnRemoveResource').hide();
            $('#UriSipRow').hide();

            t = ($('.Res' + row + col).offset().top - 94) + 'px';
            l = ($('.Res' + row + col).offset().left - 145) + 'px';
            $('#BigSlavesZone').data('t', t);
            $('#BigSlavesZone').data('l', l);
            $('#BigSlavesZone').attr('style', 'position:absolute;width:0px;height:0px;top:' + t + ';left:' + l);
            $('#BigSlavesZone').show();
            $('#BigSlavesZone').animate({
                top: '40px',
                left: '120px',
                width: '23%',
                height: '510px'
            }, 500, function() {
                $('#BigSlavesZone').addClass('divNucleo');
            });
        }
    });
    // 					}
    // 				})
    // 			}
    // 		});
    // 	}
    // });
    //	}
    //}
    //if($('#SResourceType option:selected').val() == 1) {
    //$('#CbGranularity').val(0);
    //$('#CbGranularity').attr("disabled", "disabled");
    //}
}

function Close() {
    loadingContent();
    var t = $('#BigSlavesZone').data('t');
    var l = $('#BigSlavesZone').data('l');
    $('#BigSlavesZone').animate({ left: l, top: t, width: '0px', height: '0px' }, 500, function() {
        $('#BigSlavesZone').hide();
        $('#AddFormsite').removeClass('disabledDiv');
        $('#SitesList').removeClass('disabledDiv');
        $('#NavMenu').removeClass('disabledDiv');
        $('#listConfigurations').removeClass('disabledDiv');
        $('#Add').removeClass('disabledDiv');
    });
}

/************************************/
/*	FUNCTION: GetMySlaves 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
function GetMySlaves() {
    Close();
    $('#AddFormsite').animate({ width: '790px', height: '470px' });

    $.ajax({
        type: 'GET',
        url: '/gateways/' + $('#DivGateways').data('idCgw') + '/hardwareResume',
        success: function(data) {
            ResetHardware();
            if (data.error != null) {
                alertify.error('Error: ' + data.error);
            }
            else {
                ShowAssignedSlaves(data);
            }
        },
        error: function(data) {
            alertify.error('Error al obtener los recursos de la pasarela.');
        }
    });
}

/************************************/
/*	FUNCTION: ShowAssignedSlaves 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG		NO TOCADO	*/
/************************************/
function GetResource(rsc, f) {
    //	GetFrequencies(function(){
    if (rsc > 0) {
        $.ajax({
            type: 'GET',
            url: '/resources/' + rsc,
            success: function(data) {
                if (data != 'NO_DATA') {
                    ShowDataOfResource(data, function() {
                        ResourceParameters();
                        if (f != null)
                            f();
                    });
                }
                else
                    f();
            }
        });
    }
    else {
        if (f != null)
            f();
    }
    //	});
}

function GetFrequencies(f) {
    $.ajax({
        type: 'GET',
        url: '/destinations',
        success: function(data) {
            ShowFrequencies(data);
            f();
        }
    });
}

var CopySingleSite = function() {
    $('#AddFormsite').addClass('disabledDiv');
    $('#listConfigurations').addClass('disabledDiv');
    $('#NavMenu').addClass('disabledDiv');
    $('#Add').addClass('disabledDiv');

    $('#CopySiteZone').attr('style', 'position:absolute;width:0px;height:0px;top:80px;left:460px');
    $('#CopySiteZone').show();
    $('#CopySiteZone').animate({ width: '35%', height: '250px' }, 500, function() {
        $('#CopySiteZone').addClass('divNucleo');
    });
};

var CopySite = function() {
    if ($('#nameCopySite').val().length > 0) {
        CopyMethodSite($('#IdSite').data('idSite'), $('#nameCopySite').val());
    }

    CloseCopySite();
};

var CopyMethodSite = function(idSourceSite, nameTargetSite) {
    $.ajax({
        type: 'COPY',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ idCFG: $('#DivConfigurations').data('idCFG') }),
        url: '/sites/' + idSourceSite + '/' + nameTargetSite,
        success: function(data) {
            if (data.error == 'ER_DUP_ENTRY')
                alertify.error('El nombre de emplazamiento \"' + nameTargetSite + '\" ya existe para esta configuración.');
            else {
                alertify.success('Emplazamiento clonado.');
                ShowCfg($('#DivConfigurations').data('cfgJson'));
            }
        }
    });
};

var CloseCopySite = function() {
    $('#CopySiteZone').animate({ width: '0px', height: '0px' }, 500, function() {
        $('#CopySiteZone').hide();

        $('#AddFormsite').removeClass('disabledDiv');
        $('#listConfigurations').removeClass('disabledDiv');
        $('#NavMenu').removeClass('disabledDiv');
        $('#Add').removeClass('disabledDiv');
    });
};








