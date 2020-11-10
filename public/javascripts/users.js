/******************************************************************************************************/
/****** Module: users.js												*******************************/
/****** Description: Módulo de soporte a la gestion de usuarios			*******************************/
/******************************************************************************************************/
//var link_enlaces = [];
var gatewaysFromOperator = [];
/** 20170509. AGL Gestor 'Aplicar cambios' */
var usersModified = false;
/**
 * DelUsuario
 * */
var DelUsuario = function () {

    Trace("users.js:DelUsuario");

    if ($('#IdOperador').val() == $('#loggedUser').text()) {
        alertify.alert('Ulises G 5000 R', "No es posible eliminar el usuario con el que se está logeado.");
        alertify.error("No es posible eliminar el usuario con el que se está logeado.");
    }
    else {
        alertify.confirm('Ulises G 5000 R', "¿Eliminar el usuario \"" + $('#IdOperador').val() + "\"?",
            function() {
                $.ajax({
                    type: 'DELETE',
                    url: '/users/' + $('#IdOperador').val(),
                    //data: JSON.stringify( { "name": $('#IdOperador').val() } ),
                    success: function(data) {
                        if (data.error === 0) {
                            alertify.error('El usuario \"' + data.data + '\" no existe.');
                        }
                        else {
                            GenerateHistoricEvent(ID_HW, REMOVE_USER, $('#IdOperador').val(), $('#loggedUser').text());
                            alertify.success('Usuario \"' + data.data + '\" eliminado.');
                            GetUsuarios();
                            /** 20170509. AGL Gestor 'Aplicar cambios' */
                            usersModified = true;
                            $.ajax({
                                type: 'GET',
                                url: '/gateways/updateUsers',
                                success: function(data) {
                                    if (data.error == null) {
                                        alertify.success('Pasarelas actualizadas.');
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
                    },
                    error: function(data) {
                        alertify.error('El usuario \"' + data.data + '\" no existe.');
                    }
                });

                //alertify.success('Ok'); 
            },
            function() { alertify.error('Cancelado'); }
        );

    }
};
/**
 * PutUser
 * */
var PutUser = function() {

    Trace("users.js:PutUser");

    var perfil = GetPerfil();
    if ($('#IdOperador').val() == '') {
        alertify.alert('Ulises G 5000 R', "Identificador de usuario no válido.");
        alertify.error("Identificador de usuario no válido.");
        return;
    }
    if ($('#ClaveUser').val() == '') {
        alertify.alert('Ulises G 5000 R', "Clave de usuario no válida.");
        alertify.error("Clave de usuario no válida.");
        return;
    }
    if (perfil == 0) {
        alertify.alert('Ulises G 5000 R', "Debe seleccionar un nivel de acceso para el usuario.");
        alertify.error("Debe seleccionar un nivel de acceso para el usuario.");
        return;
    }

    var gateways = [];
	/* AGL *****************
	var permisoVisualizacionGatewayLocal = perfil & 128;
	var permisoAdministracionGatewayLocal = perfil & 256;
	if ((permisoVisualizacionGatewayLocal == 128) || (permisoAdministracionGatewayLocal==256)){
		// Usuarios con perfil de pasarelas asignadas.		
		$('.cbGtw').each(function( index ) {
			if ($(this)[0].checked)
  				gateways.push($(this).data('idgtw'));
		});
	}
	*********************/

    $.ajax({
        type: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        url: '/users/user',
        data: JSON.stringify({
            user:
            {
                "idOPERADORES": $('#AddFormUser').data('idOperador'),
                "name": $('#IdOperador').val(),
                "clave": btoa($("#ClaveUser").val()),
                "perfil": perfil
            },
            gateways: gateways
        }),
        success: function(data) {
            GenerateHistoricEvent(ID_HW, MODIFY_USER, $('#IdOperador').val(), $('#loggedUser').text());
            alertify.success('Usuario \"' + $('#IdOperador').val() + '\" actualizado.');
            GetUsuarios();
            /** 20170509. AGL Gestor 'Aplicar cambios' */
            usersModified = true;
            //Vamos a llamar a actualizar las pasarelas
            $.ajax({
                type: 'GET',
                url: '/gateways/updateUsers',
                success: function(data) {
                    if (data.error == null) {
                        alertify.success('Pasarelas actualizadas.');
                    }
                    else if (data.error) {
                        alertify.error('Error: ' + data.error);
                    }
                },
                error: function(data) {
                    alertify.error('Error actualizando pasarelas.');
                }
            });
        },
        error: function(data) {
            alertify.error('El usuario \"' + $('#IdOperador').val() + '\" no existe.');
        }
    });
};
/**
 * PostUser
 * */
var PostUser = function () {

    Trace("users.js:PostUser");

    if ($('#IdOperador').val() == '') {
        alertify.alert('Ulises G 5000 R', "Identificador de usuario no válido.");
        alertify.error("Identificador de usuario no válido.");
        return;
    }
    if ($('#ClaveUser').val() == '') {
        alertify.alert('Ulises G 5000 R', "Clave de usuario no válida.");
        alertify.error("Clave de usuario no válida.");
        return;
    }
    var perfil = GetPerfil();
    if (perfil == 0) {
        alertify.alert('Ulises G 5000 R', "Debe seleccionar un nivel de acceso para el usuario.");
        alertify.error("Debe seleccionar un nivel de acceso para el usuario.");
        return;
    }

    var gateways = [];

	/** AGL **********************
	var permisoVisualizacionGatewayLocal = perfil & 128;
	var permisoAdministracionGatewayLocal = perfil & 256;
	if ((permisoVisualizacionGatewayLocal == 128) || (permisoAdministracionGatewayLocal==256)){
		// Usuarios con perfil de pasarelas asignadas.		
		$('.cbGtw').each(function( index ) {
			if ($(this)[0].checked)
  				gateways.push($(this).data('idgtw'));
		});
	}
	*****************************/

    $.ajax({
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        url: '/users/user',
        data: JSON.stringify({
            user: {
                "name": $('#IdOperador').val(),
                "clave": window.btoa($("#ClaveUser").val()),
                "perfil": perfil
            },
            gateways: gateways
        }
        ),
        success: function(data) {
            if (data.error === null) {
                GenerateHistoricEvent(ID_HW, ADD_USER, $('#IdOperador').val(), $('#loggedUser').text());
                alertify.success('El usuario \"' + $('#IdOperador').val() + '\" ha sido creado.');
                GetUsuarios();
                /** 20170509. AGL Gestor 'Aplicar cambios' */
                usersModified = true;
                $.ajax({
                    type: 'GET',
                    url: '/gateways/updateUsers',
                    success: function(data) {
                        if (data.error == null) {
                            alertify.success('Pasarelas actualizadas.');
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
            else if (data.error == "ER_DUP_ENTRY")
                alertify.error('El usuario \"' + $('#IdOperador').val() + '\" ya existe.');
            else
                alertify.error('Error: ' + data.error);
        },
        error: function(data) {
            alertify.error('El usuario \"' + $('#IdOperador').val() + '\" no existe.');
        }
    });
};
/**
 * GetUsuario
 * @param {any} ind
 * @param {any} valor
 */
var GetUsuario = function (ind, valor) {

    Trace("users.js:GetUsuario. valor %s, ind ", valor, ind);

    /** AGL */
    var divOperadorShortWidth = { width: '535px' };
    var divOperadorLongWidth = { width: '535px' };
    var divDatoUsuarioWidth = { width: '350px' };

    if ($('#AddFormUser').is(':visible')) {
        $('#DivOperador').animate({ width: '535px' });
    }

    $('#DivOperador').animate({ width: '555px' });
    $("#FormOperador").show();
    $('#AddFormUser').show();

    if (ind >= 0) {
        //Ocultamos botón de eliminar para el propio usuario que está logueado
        var lIndex = $('#loggedUser').text().indexOf('(');

        if (valor.name == $('#loggedUser').text().substring(0, lIndex - 1))
            $('#DeleteUserButton').hide();
        else
            $('#DeleteUserButton').show();
        $(':checkbox.rol').prop('checked', false);
        $.ajax({
            type: 'GET',
            url: '/users/IdOperador,IdSistema,Clave',
            data: valor,	//link_enlaces[ind].valor,
            success: function(usuario) {
                $("#FormOperador").show();
                $("#IdOperador").val(usuario.name);
                $("#ClaveUser").val(window.atob(usuario.clave));
                $('#AddFormUser').data('idOperador', usuario.idOPERADORES);
                // Rellena la tabla de Perfiles...
                var valor = usuario.perfil;
                for (var i = 0; i < 16; i++) {
                    if ((i != 2) && (i != 5)) {		// el perfil 2 no existe, y el 5 es ingenieria					
                        if (valor & 1) {
                            var check_control = $('#prf_' + (Math.pow(2, i)));
                            // $('#' + (Math.pow(2,i))).prop('checked',true);
                            // $('#' + (Math.pow(2,i))).prop('disabled', false);
                            check_control.prop('checked', true);
                            check_control.prop('disabled', false);
                        }
                        //else
                        //$('#' + (Math.pow(2,i))).prop('disabled', true);
                    }
                    valor >>>= 1;
                }

                /** AGL ***************************************
                GetGatewaysToOp(usuario.idOPERADORES,function(){
                    GetSitesToOp();
                });
                *************************************/
                //$('#' + usuario.perfil).prop('checked',true);

                /** AGL... *************************************/
                $('#DivOperador').animate({ width: '1000px' });
                $('#DatosUsuario').animate({ width: '430px' });
                $('#GatewayToOp').hide();
                $('#IdOperador').prop("disabled", true);
                /*
                                    if ((usuario.perfil & 128) == 128 || (usuario.perfil & 256) == 256) {
                                        $('#DivOperador').animate({width: '1250px'});
                                        $('#DatosUsuario').animate({width: '650px'},function(){
                                            $('#GatewayToOp').show();
                                        });
                                    }
                                    else{
                                        $('#DivOperador').animate({width: '900px'});
                                        $('#DatosUsuario').animate({width: '290px'},function(){
                                            $('#GatewayToOp').hide();
                                        });
                                    }
                */

                translateWord('Update', function(result) {
                    $('#UpdateUserButton').text(result)
                        .attr('onclick', 'PutUser()');
                });
            }
        });
    }
    else {
        $('#GatewayToOp').hide();

		/** AGL **********************************	
		GetGatewaysToOp(-1,function(){
			GetSitesToOp();
		});
		****************************************/

        for (var i = 0; i < 16; i++) {
            /*La posicion 3 es el reconocimiento de alarmas que ya no se usa pero se mantienen  la posición del resto por compatibilidad con otras aplicaciones*/
            /*Con la 5 pasa lo mismo, era el perfil ingenieria*/
            if ((i != 2) && (i != 5)) {
                var valor1 = Math.pow(2, i);
                $('#prf_' + valor1).prop('disabled', false);
            }
        }

        $('#FormOperador').show();
        $('#DivOperador').animate({ width: '1000px' });
        /** AGL */
        $('#DatosUsuario').animate({ width: '430px' });
        $('#IdOperador').prop("disabled", false);
        /*****************/
        translateWord('Add', function(result) {
            $('#UpdateUserButton').text(result)
                .attr('onclick', 'PostUser()');
        });
        $('#IdOperador').val('');
        $('#ClaveUser').val('');
        $('#LbPerfil option[value="0"]').prop('selected', true);
        $('#LbPerfil input').prop('checked', false);
    }
};
/**
 * GetUsuarios.
 * */
var GetUsuarios = function() {

    Trace("users.js:GetUsuarios.");

    if ((($('#BodyRedan').data('perfil') & 16) != 16) && (($('#BodyRedan').data('perfil') & 64) != 64)) {
        alertify.error('No tiene asignados permisos para la gestión de usuarios.');
        return;
    }

    $('#DivOperador').animate({ width: '535px' });

    $("#FormOperador").show();
    translateWord('Update', function(result) {
        $('#UpdateUserButton').text(result)
            .attr('onclick', 'PutUser()');
    });

    $.ajax({
        type: 'GET',
        url: '/users'
    })
        .done(function(data) {
            $("#listUsers").empty();
            //link_enlaces.splice(0,link_enlaces.length);
            $.each(data.users, function(index, value) {
                //link_enlaces.push({indice: index, valor: value});
                var item = $("<li><a onclick='GetUsuario(" + index + "," + JSON.stringify(value) + ")'>" + value.name + "</li>");
                item.appendTo($("#listUsers"));
                // $('#Add').attr("onclick","GetUsuario(-1)");
            });
        });
};
/**
 * GetPerfil
 * */
var GetPerfil = function () {

    Trace("users.js:GetPerfil.");

    var valor = 0;
    for (var i = 0; i < 16; i++) {
        /*La posicion 3 es el reconocimiento de alarmas que ya no se usa pero se mantienen  la posición del resto por compatibilidad con otras aplicaciones*/
        /*Con la 5 pasa lo mismo, era el perfil ingenieria*/
        if ((i != 2) && (i != 5)) {
            var id = '#prf_' + (Math.pow(2, i));
            if ($(id).prop('checked'))
                valor += Math.pow(2, i);
        }
    }

    return valor;
};
/**
 * GetSitesToOp
 * */
var GetSitesToOp = function () {

    Trace("users.js:GetSitesToOp.");
};
/**
 * GetGtwToSite,
 * @param {any} id
 * @param {any} name
 * @param {any} showMe
 */
var GetGtwToSite = function (id, name, showMe) {

    Trace("users.js:GetGtwToSite. id %s, name %s, showMe ", id, name, showMe);

};
/**
 * CheckEveryGateway
 * @param {any} sender
 * @param {any} list
 */
var CheckEveryGateway = function (sender, list) {

    Trace("users.js:CheckEveryGateway. sender %s, list ", sender, list);
};
/**
 * ShowGateways
 * */
var ShowGateways = function () {

    Trace("users.js:ShowGateways.");

};
/**
 * GetGatewaysToOp
 * @param {any} idOperador
 * @param {any} f
 */
var GetGatewaysToOp = function (idOperador, f) {

    Trace("users.js:GetGatewaysToOp. idOperador ", idOperador);

};

/** AGL */
/**
 * OperationExt
 * @param {any} elem
 * @param {any} checkVis
 */
var OperationExt = function (elem, checkVis) {

    Trace("users.js:OperationExt. checkVis %s, elem ", checkVis, elem);

    if (checkVis == true) {
        if ($(elem).prop("checked")) {
            $('#1').prop("checked", true);
        }
    }
};



