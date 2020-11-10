var ACCESS_SYSTEM_OK = 50;
var ACCESS_SYSTEM_FAIL = 51;
var ADD_USER = 52;
var REMOVE_USER = 53;
var MODIFY_USER = 54;
var USER_LOGOUT_SYSTEM = 55;
var LOAD_REMOTE_CONFIGURATION = 105;
var LOAD_REMOTE_CONFIGURATION_FAIL = 106;
var ADD_GATEWAY = 107;
var REMOVE_GATEWAY = 108;
var MODIFY_GATEWAY_COMMON_PARAM = 109;
//var MODIFY_ATS_ROUTES						=	110;
//var ADD_IA4_SLAVE							=	111;
//var REMOVE_IA4_SLAVE						=	112;
var ADD_HARDWARE_RESOURCE = 113;
var REMOVE_HARDWARE_RESOURCE = 114;
//var MODIFY_HARDWARE_RESOURCE_PARAM			=	115;
var MODIFY_HARDWARE_RESOURCE_LOGIC_PARAM = 116;
var REMOVE_CALIFICATION_AUDIO_TABLE = 117;
var ADD_CALIFICATION_AUDIO_TABLE = 118;

var ID_HW = 'CFG';
var script = document.createElement('script');

/** 20170511. AGL. PERFILES. Para la Gestion de Perfiles */
var visualProfMsc = 0x0001;
var ccUsersProfMsc = 0x0010;
var ccAdminProfMsc = 0x0040;
var ccHistoProfMsc = 0x0200;
var ccBackpProfMsc = 0x0400;
var ccConfiProfMsc = 0x8000;					// 0x4000 Se ha eliminado. Se asimila al siguiente....
var ccLoadcProfMsc = 0x8000;
/**
 * Authorize
 * @param {any} currentProfile
 * @param {any} authorizedProfiles
 */
function Authorize(currentProfile, authorizedProfiles) {

    // Trace("index.js:Authorize. currentProfile %s, authorizedProfiles: ", currentProfile, authorizedProfiles);

    if (!currentProfile || !authorizedProfiles)
        return false;
    for (i = 0; i < authorizedProfiles.length; i++) {
        var partialProfile = currentProfile & authorizedProfiles[i];
        if (partialProfile != 0)
            return true;
    }
    return false;
}
/**
 * strProfile
 * @param {any} pv
 * @param {any} pg
 * @param {any} pa
 * @param {any} ph
 * @param {any} pb
 * @param {any} pc
 * @param {any} pl
 */
function strProfile(pv, pg, pa, ph, pb, pc, pl) {

    var str = " (";

    str += (pv ? "v" : "");
    str += (pg ? "u" : "");
    str += (pa ? "a" : "");
    str += (ph ? "h" : "");
    str += (pb ? "b" : "");
    str += (pc ? "c" : "");
    str += (pl ? "l" : "");

    str += ')';

    Trace("index.js:strProfile: ", str);

    return str;
}
/**
 * indexInitUserData
 * @param {any} username
 * @param {any} userprofile
 */
function indexInitUserData(username, userprofile) {

    Trace("index.js:indexInitUserData. username %s, userprofile ", username, userprofile);

    var perfilVisualizacion = ((userprofile & visualProfMsc) ? true : false);
    var perfilGestUsuarios = ((userprofile & ccUsersProfMsc) ? true : false);
    var perfilAdministracion = ((userprofile & ccAdminProfMsc) ? true : false);
    var perfilHistoricos = ((userprofile & ccHistoProfMsc) ? true : false);
    var perfilBackup = ((userprofile & ccBackpProfMsc) ? true : false);
    var perfilConfiguraciones = ((userprofile & ccConfiProfMsc) ? true : false);
    var perfilCargaConfiguraciones = ((userprofile & ccLoadcProfMsc) ? true : false);

    if (!perfilVisualizacion &&
        !perfilGestUsuarios &&
        !perfilAdministracion &&
        !perfilHistoricos &&
        !perfilBackup &&
        !perfilConfiguraciones &&
        !perfilCargaConfiguraciones) {
        // $('#LoginIncorrect').show();
        // GenerateHistoricEvent(ID_HW,ACCESS_SYSTEM_FAIL,$('#Operador').val());
        // TODO... Logout, mensaje e Histórico.
        return;
    }

    GetVersion(true);		//Obtiene la versión para el footer al ser primera carga

    // Fijar region en el titulo
    SetRegion();

    // Register cookie TODO !!!!
    SetCookie('U5K-G', userprofile);

    $('#buttonLogout').show();

    // Hidden fields to render import.jade
    $('#user').val(username);
    $('#clave').val($('#Clave').val());
    $('#perfil').val(userprofile);

    $('#Login-Operador').hide();
    $('#loggedUser').text(username);

    /** 20170511 AGL. PERFILES. */
    $('#loggedUser').text(username +
        strProfile(perfilVisualizacion, perfilGestUsuarios, perfilAdministracion,
            perfilHistoricos, perfilBackup, perfilConfiguraciones, perfilCargaConfiguraciones));

    $('#MenuGeneral').attr('style', 'display:table-cell;width:11%');
    $('#MenuGeneral').removeClass('menuListDisabled');
    $('#MenuOpciones').removeClass('menuListDisabled');

    $('.New').addClass('NotAllowedTd');
    $('.New *:first-child').addClass('NotAllowedBtn');

    if (Authorize(userprofile, [ccAdminProfMsc, visualProfMsc, ccUsersProfMsc, ccConfiProfMsc, ccLoadcProfMsc]) == false) {
        $('#mgCfg').hide();
    }
    if (Authorize(userprofile, [ccAdminProfMsc, ccHistoProfMsc]) == false) {
        $('#mgHis').hide();
    }
    if (Authorize(userprofile, [ccAdminProfMsc, ccBackpProfMsc]) == false) {
        $('#mgBkp').hide();
    }
    if (Authorize(userprofile, [ccAdminProfMsc, visualProfMsc, ccConfiProfMsc, ccLoadcProfMsc]) == false) {
        $('#cfCfg').hide();
    }
    if (Authorize(userprofile, [ccAdminProfMsc, ccUsersProfMsc]) == false) {
        $('#lopcionUsuarios').hide();
    }
    if (Authorize(userprofile, [ccAdminProfMsc, ccConfiProfMsc, visualProfMsc]) == false) {
        $('#lopcionTabla').hide();
    }
    if (Authorize(userprofile, [ccAdminProfMsc, ccConfiProfMsc, ccLoadcProfMsc]) == true) {
        $('.New').removeClass('NotAllowedTd');
        $('.New *:first-child').removeClass('NotAllowedBtn');
    }
    if (Authorize(userprofile, [ccAdminProfMsc]) == false) {
        $('#cfCfgLocal').hide();
    }
    /** 20170512 AGL. OCULTAR BOTONES COPIA / IMPORT / EXPORT */
    //$('#BtnCopyCfg').hide();		// Copia Configuracion
    $('#BtnCopySite').hide();		// Copia Emplazamiento.
    $('#BtnImport').show();			// Boton IMPORT.
    $('#ExportGateway').show();		// Boton EXPORT.
}
/**
 * LogoutUser
 * */
function LogoutUser() {
    $(location).attr('href', '/logout');
}

/************************************************** */
/** 201705 AGL Control DEBUG */
var DEBUG = true;
/*******************************/
/** 20170518 AGL Opcion Filtrar SITES a la propia config para mover pasarelas */
var optGWMOVE_BETWEENCFG = false;
/****************************************************************************/

script.src = 'http://code.jquery.com/jquery-1.11.2.min.js';
script.type = 'text/javascript';

/**
 * SetCookie
 * @param {any} name
 * @param {any} value
 */
function SetCookie(name, value) {

    // Trace("index.js:SetCookie. name %s, value ", name, value);

    if ($('#BodyRedan').data('logintimeout') != '0') {
        var now = new Date();
        var time = now.getTime();
        var expireTime = time + $('#BodyRedan').data('logintimeout') * 60 * 1000;	// min*seg*msg
        now.setTime(expireTime);

        document.cookie = name + '=' + value + ';expires=' + now.toGMTString() + ';path=/';
        checkCookie = true;
    }
}
/**
 * ResetAfterImport
 * @param {any} datos
 */
function ResetAfterImport(datos) {
    var data = JSON.parse(datos);

    Trace("index.js:ResetAfterImport. datos ", datos);

    $('#loggedUser').text(data.user);
    $('#BodyRedan').data('perfil', data.perfil);
    $('#BodyRedan').data('LoginTimeout', data.LoginTimeout);
    $('#BodyRedan').data('region', data.Region);
    $('#BodyRedan').data('urlbackupservice', data.BackupServiceDomain);
    $('#BodyRedan').data('actualLocation', window.location.href);

    // Fijar region en el titulo
    SetRegion();
    // Register cookie
    SetCookie('U5K-G', data.perfil);

    // Hidden fields to render import.jade
    $('#user').val(data.user);
    $('#clave').val(data.clave);
    $('#perfil').val(data.perfil);

    $('#ImportResult').hide();
    $('#MenuOpciones').attr('style', 'display:table-cell;width:11%');
    translateWord('Activate', function(result) {
        if ($('#listaOpciones li:nth-last-child(2)').text() != result) {
            var item = $('<li style="margin-top:100px"><a id="opcionAplCambios" onclick="CheckingAnyChange(\'GeneralContent\', function(){GetActiveCfgAndActivate()})">' + result + '</li>');
            item.insertBefore($('#listaOpciones li:last-child'));
        }
    });
    EnableOptions(data.perfil);

    // Reinit layout.jade variables
    actual = '#FormConfiguration';
    actualShow = '#AddFormConfiguration';
    actualAnimate = '#DivConfigurations';

    $('#DivConfigurations').animate({ height: '670px' });
    GetConfigurations(function() {
        ShowCfg(JSON.parse(data.cfgData));
    });
}
/**
 * getAuthenticatedUser
 * @param {any} data
 */
function getAuthenticatedUser(data) {

    Trace("index.js:getAuthenticatedUser. data ", data);

    var index = data.toString().indexOf('.');

    if (index > -1)
        return data.toString().substring(index + 1);
    else
        return "";
}
/**
 * myEncode
 * @param {any} e
 */
function myEncode(e) {

    Trace("index.js:myEncode. e ", e);

    e.preventDefault();

    $('#BodyRedan').data('actualLocation', window.location.href);

    // Reconocer usuario puerta atrás
    if ($('#Operador').val() == "ULISESG5000R" &&
        window.btoa($('#TextClave').val()) == "KlVHNUtSKg==") {

        GenerateHistoricEvent(ID_HW, ACCESS_SYSTEM_OK, $('#Operador').val());
        $('#Login-Operador').hide();
        $('#loggedUser').text($('#Operador').val());
        $('#MenuGeneral').attr('style', 'display:table-cell;width:11%');
        //$('#MenuOpciones').attr('style','display:table-cell;width:11%')
        //$('#MenuMantenimiento').attr('style','display:table-column')
        $('#BodyRedan').data('perfil', 64);
        $('#BodyRedan').data('LoginTimeout', 0);
        $('#BodyRedan').data('region', $('#Login-Operador').data('region'));
        $('#BodyRedan').data('urlbackupservice', $('#Login-Operador').data('urlbackupservice'));

        // Hidden fields to render import.jade
        $('#user').val($('#Operador').val());
        $('#clave').val("KlVHNUtSKg==");
        $('#perfil').val(64);
    }
    else {
        $('#Clave').val(window.btoa($('#TextClave').val()));
        $.ajax({
            type: 'GET',
            url: '/users?name=' + $('#Operador').val() + '&clave=' + $('#Clave').val(),
            error: function(jqXHR, textStatus, errorThrown) {
                //alert('Error user login.' + textStatus + '.' + errorThrown)
                alertify.alert('Ulises G 5000 R', 'Error user login.' + textStatus + '.' + errorThrown);
                alertify.error('Error user login.' + textStatus + '.' + errorThrown);
            },
            success: function(usuario) {
                if (usuario === "User not found.") {
                    $('#LoginIncorrect').show();
                    GenerateHistoricEvent(ID_HW, ACCESS_SYSTEM_FAIL, $('#Operador').val());
                    return;
                }
                if (usuario.alreadyLoggedUserName !== "none") {
                    $('#AlreadyLogin').show();
                    $('#UserAlreadyLogin').show();
                    $('#UserAlreadyLogin').text(': ' + usuario.alreadyLoggedUserName);
                    GenerateHistoricEvent(ID_HW, ACCESS_SYSTEM_FAIL, $('#Operador').val());
                    return;
                }

                var perfilVisualizacion = ((usuario.perfil & 1) ? true : false);
                var perfilMando = ((usuario.perfil & 2) ? true : false);
                var perfilReconAlarmas = ((usuario.perfil & 8) ? true : false);
                var perfilGestUsuarios = ((usuario.perfil & 16) ? true : false);
                var perfilAdministracion = ((usuario.perfil & 64) ? true : false);
                var perfilVerLocalGateway = ((usuario.perfil & 128) ? true : false);
                var perfilAdminLocalGateway = ((usuario.perfil & 256) ? true : false);
                var perfilHistoricos = ((usuario.perfil & 512) ? true : false);
                var perfilBackup = ((usuario.perfil & 1024) ? true : false);
                var perfilBocina = ((usuario.perfil & 2048) ? true : false);
                var perfilGestionConfLocal = ((usuario.perfil & 4096) ? true : false);
                var perfilActualizacionSw = ((usuario.perfil & 8192) ? true : false);
                var perfilConfiguraciones = ((usuario.perfil & 16384) ? true : false);
                var perfilCargaConfiguraciones = ((usuario.perfil & 32768) ? true : false);

                /** 20170511. AGL. Reviso el perfil de los que pueden acceder */
                // if ((perfilMando || perfilReconAlarmas || perfilVerLocalGateway || perfilAdminLocalGateway || perfilBocina || perfilGestionConfLocal || perfilActualizacionSw) &&
                // 	(!perfilVisualizacion && !perfilGestUsuarios && !perfilAdministracion && !perfilHistoricos && !perfilBackup && !perfilConfiguraciones &&
                // 	 !perfilCargaConfiguraciones))
                if (!perfilVisualizacion && !perfilGestUsuarios && !perfilAdministracion && !perfilHistoricos && !perfilBackup && !perfilConfiguraciones &&
                    !perfilCargaConfiguraciones) {
                    $('#LoginIncorrect').show();
                    GenerateHistoricEvent(ID_HW, ACCESS_SYSTEM_FAIL, $('#Operador').val());
                    return;
                }

                // Resto de perfiles de usuario

                $('#BodyRedan').data('perfil', usuario.perfil);
                $('#BodyRedan').data('LoginTimeout', $('#Login-Operador').data('LoginTimeout'));
                $('#BodyRedan').data('region', $('#Login-Operador').data('region'));
                $('#BodyRedan').data('urlbackupservice', $('#Login-Operador').data('urlbackupservice'));
                $('#BodyRedan').data('version', $('#Login-Operador').data('version'));
                GetVersion(true);//Obtiene la versión para el footer al ser primera carga

                GenerateHistoricEvent(ID_HW, ACCESS_SYSTEM_OK, $('#Operador').val());

                // Fijar region en el titulo
                SetRegion();

                // Register cookie
                SetCookie('U5K-G', usuario.perfil);

                $('#buttonLogout').show();

                // Hidden fields to render import.jade
                $('#user').val($('#Operador').val());
                $('#clave').val($('#Clave').val());
                $('#perfil').val(usuario.perfil);

                $('#Login-Operador').hide();
                $('#loggedUser').text(usuario.name);

                /** 20170511 AGL. PERFILES. */
                $('#MenuGeneral').attr('style', 'display:table-cell;width:11%');
                $('#MenuGeneral').removeClass('menuListDisabled');
                $('#MenuOpciones').removeClass('menuListDisabled');

                $('.New').addClass('NotAllowedTd');
                $('.New *:first-child').addClass('NotAllowedBtn');

                if (Authorize(usuario.perfil, [ccAdminProfMsc, visualProfMsc, ccUsersProfMsc, ccConfiProfMsc, ccLoadcProfMsc]) == false) {
                    $('#mgCfg').hide();
                }
                if (Authorize(usuario.perfil, [ccAdminProfMsc, ccHistoProfMsc]) == false) {
                    $('#mgHis').hide();
                }
                if (Authorize(usuario.perfil, [ccAdminProfMsc, ccBackpProfMsc]) == false) {
                    $('#mgBkp').hide();
                }
                if (Authorize(usuario.perfil, [ccAdminProfMsc, visualProfMsc, ccConfiProfMsc, ccLoadcProfMsc]) == false) {
                    $('#cfCfg').hide();
                }
                if (Authorize(usuario.perfil, [ccAdminProfMsc, ccUsersProfMsc]) == false) {
                    $('#lopcionUsuarios').hide();
                }
                if (Authorize(usuario.perfil, [ccAdminProfMsc, ccConfiProfMsc]) == false) {
                    $('#lopcionTabla').hide();
                }
                if (Authorize(usuario.perfil, [ccAdminProfMsc, ccConfiProfMsc, ccLoadcProfMsc]) == true) {
                    $('.New').removeClass('NotAllowedTd');
                    $('.New *:first-child').removeClass('NotAllowedBtn');
                }

                /*
                var list = [
                    {id: '#opcionConfig', text: $('#opcionConfig').text(), func: $('#opcionConfig').attr('onclick')},
                    {id: '#opcionMant', text: $('#opcionMant').text(), func: $('#opcionMant').attr('onclick')},
                    {id: '#opcionBackup', text: $('#opcionBackup').text(), func: $('#opcionBackup').attr('onclick')},
                    {id: '#opcionConfigs', text: $('#opcionConfigs').text(), func: $('#opcionConfigs').attr('onclick')},
                    {id: '#opcionTabla', text: $('#opcionTabla').text(), func: $('#opcionTabla').attr('onclick')},
                    {id: '#opcionConfig', text: $('#opcionUsuarios').text(), func: $('#opcionUsuarios').attr('onclick')},
                    {id: '#opcionVersion', text: $('#opcionVersion').text(), func: $('#opcionVersion').attr('onclick')},
                    {id: '#opcionHistoric', text: $('#opcionHistoric').text(), func: $('#opcionHistoric').attr('onclick')},
                    {id: '#opcionEstadi', text: $('#opcionEstadi').text(), func: $('#opcionEstadi').attr('onclick')},
                    {id: '#opcionPasarel', text: $('#opcionPasarel').text(), func: $('#opcionPasarel').attr('onclick')}
                ];
        	
                $('#MenuGeneral').attr('style','display:table-cell;width:11%');
                $('#MenuGeneral').removeClass('menuListDisabled')
                $('#MenuOpciones').removeClass('menuListDisabled');
        	
                $('.New').addClass('NotAllowedTd');
                $('.New *:first-child').addClass('NotAllowedBtn');
        	
                $('#opcionConfig').text('');
                $('#opcionConfig').attr('onclick', '');
                $('#opcionConfig').addClass('hide');
                $('#opcionMant').text('');
                $('#opcionMant').attr('onclick', '');
                $('#opcionMant').addClass('hide');
                $('#opcionBackup').text('');
                $('#opcionBackup').attr('onclick', '');
                $('#opcionBackup').addClass('hide');
                $('#opcionConfigs').text('');
                $('#opcionConfigs').attr('onclick', '');
                $('#opcionConfigs').addClass('hide');
                $('#opcionTabla').text('');
                $('#opcionTabla').attr('onclick', '');
                $('#opcionTabla').addClass('hide');
                $('#opcionUsuarios').text('');
                $('#opcionUsuarios').attr('onclick', '');
                $('#opcionUsuarios').addClass('hide');
                $('#opcionVersion').text('');
                $('#opcionVersion').attr('onclick', '');
                $('#opcionVersion').addClass('hide');
                $('#opcionHistoric').text('');
                $('#opcionHistoric').attr('onclick', '');
                $('#opcionHistoric').addClass('hide');
                $('#opcionEstadi').text('');
                $('#opcionEstadi').attr('onclick', '');
                $('#opcionEstadi').addClass('hide');
                $('#opcionPasarel').text('');
                $('#opcionPasarel').attr('onclick', '');
                $('#opcionPasarel').addClass('hide');
            	
        	
                if (perfilAdministracion){
                    $('.New').removeClass('NotAllowedTd');
                    $('.New *:first-child').removeClass('NotAllowedBtn');
                	
                    $('#opcionConfig').text(list[0].text);
                    $('#opcionConfig').attr('onclick', list[0].func);
                    $('#opcionConfig').removeClass('hide');

                    $('#opcionMant').text(list[1].text);
                    $('#opcionMant').attr('onclick', list[1].func);
                    $('#opcionMant').removeClass('hide');

                    $('#opcionBackup').text(list[2].text);
                    $('#opcionBackup').attr('onclick', list[2].func);
                    $('#opcionBackup').removeClass('hide');

                    $('#opcionConfigs').text(list[3].text);
                    $('#opcionConfigs').attr('onclick', list[3].func);
                    $('#opcionConfigs').removeClass('hide');

                    $('#opcionTabla').text(list[4].text);
                    $('#opcionTabla').attr('onclick', list[4].func);
                    $('#opcionTabla').removeClass('hide');

                    $('#opcionUsuarios').text(list[5].text);
                    $('#opcionUsuarios').attr('onclick', list[5].func);
                    $('#opcionUsuarios').removeClass('hide');

                    $('#opcionVersion').text(list[6].text);
                    $('#opcionVersion').attr('onclick', list[6].func);
                    $('#opcionVersion').removeClass('hide');

                    $('#opcionHistoric').text(list[7].text);
                    $('#opcionHistoric').attr('onclick', list[7].func);
                    $('#opcionHistoric').removeClass('hide');

                    $('#opcionEstadi').text(list[8].text);
                    $('#opcionEstadi').attr('onclick', list[8].func);
                    $('#opcionEstadi').removeClass('hide');

                    $('#opcionPasarel').text(list[9].text);
                    $('#opcionPasarel').attr('onclick', list[9].func);
                    $('#opcionPasarel').removeClass('hide');
                    return;
                }
                if (perfilVisualizacion || perfilConfiguraciones || perfilGestUsuarios) {
                    $('#MenuGeneral').attr('style','display:table-cell;width:11%');
                    $('#MenuGeneral').removeClass('menuListDisabled');
                	
                    $('#opcionConfig').text(list[0].text);
                    $('#opcionConfig').attr('onclick', list[0].func);
                    $('#opcionConfig').removeClass('hide');

                    $('#opcionConfigs').text(list[3].text);
                    $('#opcionConfigs').attr('onclick', list[3].func);
                    $('#opcionConfigs').removeClass('hide');
                	
                    if(perfilConfiguraciones) {
                        $('.New').removeClass('NotAllowedTd');
                        $('.New *:first-child').removeClass('NotAllowedBtn');
                    }
                    if (perfilGestUsuarios){
                        $('#MenuGeneral').attr('style','display:table-cell;width:11%');
                        $('#MenuGeneral').removeClass('menuListDisabled');
                    	
                        $('#opcionUsuarios').text(list[5].text);
                        $('#opcionUsuarios').attr('onclick', list[5].func);
                        $('#opcionUsuarios').removeClass('hide');
                    }
                }					

                if (perfilHistoricos) {
                    $('#MenuGeneral').attr('style','display:table-cell;width:11%');
                    $('#MenuGeneral').removeClass('menuListDisabled');
                	
                    $('#opcionMant').text(list[1].text);
                    $('#opcionMant').attr('onclick', list[1].func);
                    $('#opcionMant').removeClass('hide');
                	
                    $('#opcionHistoric').text(list[7].text);
                    $('#opcionHistoric').attr('onclick', list[7].func);
                    $('#opcionHistoric').removeClass('hide');
                    $('#opcionEstadi').text(list[8].text);
                    $('#opcionEstadi').attr('onclick', list[8].func);
                    $('#opcionEstadi').removeClass('hide');
                }
        	
                if (perfilBackup) {
                    $('#MenuGeneral').attr('style','display:table-cell;width:11%');
                    $('#MenuGeneral').removeClass('menuListDisabled');
                	
                    $('#opcionBackup').text(list[2].text);
                    $('#opcionBackup').attr('onclick', list[2].func);
                    $('#opcionBackup').removeClass('hide');
                }
                **********************************************************************/

                //si es un perfil no controlado
                //$('#MenuGeneral').attr('style','display:table-cell;width:11%');
                //$('#MenuOpciones ul li').removeClass('menuListDisabled');

                /** 20170512 AGL. OCULTAR BOTONES COPIA / IMPORT / EXPORT */
                //$('#BtnCopyCfg').hide();		// Copia Configuracion
                $('#BtnCopySite').hide();		// Copia Emplazamiento.
                $('#BtnImport').show();			// Boton IMPORT.
                $('#ExportGateway').show();		// Boton EXPORT.

                return;


                /*	switch (usuario.perfil){
                        case 1: 	// Visualizacion
                            $('#MenuOpciones').attr('style','display:table-cell;width:11%');
                            EnableOptions(usuario.perfil);
                            $('.New').addClass('NotAllowedTd');
                            $('.New *:first-child').addClass('NotAllowedBtn');
                            $('.ActivateCfg').addClass('NotAllowedTd');
                            $('.ActivateCfg *:first-child').addClass('NotAllowedBtn');
                            break;
                        case 16: 	// Gestion Usuarios
                            $('#MenuOpciones').attr('style','display:table-cell;width:11%');
                            EnableOptions(usuario.perfil);
                            break;
                        case 32: // perfil ingenieria
                        case 64:
                            $('#MenuGeneral').attr('style','display:table-cell;width:11%');
                            EnableOptions(usuario.perfil);
                            break;
                */
                /*
                if (usuario.perfil >= 16) {
                    // if ((usuario.perfil & 32) == 32){
                    // 	$('#MenuOpciones').attr('style','display:table-cell;width:11%')
                    // 	EnableOptions(usuario.perfil);
                    // }
                    // else{
                        //$('#MenuGeneral').attr('style','display:table-cell;width:11%')
                        $('#MenuOpciones').attr('style','display:table-cell;width:11%')
                        EnableOptions(usuario.perfil);
                    //}
                }
                else{
                    if ((usuario.perfil & 4) == 4){
                        // Solo mantenimiento
                        hideMenu('#MenuHistoricos','#MenuMantenimiento'); 
                        LoadGatewaysInActiveConfiguration()
                    }
                    else{
                        //if ((usuario.perfil & 1) == 1){
                            $('.New').addClass('NotAllowedTd');
                            $('.New *:first-child').addClass('NotAllowedBtn')
                        //}
                    	
                        // Configuracion y administracion
                        //$('#MenuOpciones').attr('style','display:table-cell;width:11%')
                        EnableOptions(usuario.perfil);
                    }
                }
                */
                //}
            }
        });
    }
}
/**
 * EnableAplicarCambiosPerfil
 * @param {any} perfil
 */
function EnableAplicarCambiosPerfil(perfil) {

    Trace("index.js:EnableAplicarCambiosPerfil. perfil ", perfil);

    var perfilAdministracion = ((perfil & 64) ? true : false);
    var perfilCargaConfiguraciones = ((perfil & 32768) ? true : false);

    if (perfilAdministracion || perfilCargaConfiguraciones)
        return true;
    else
        return false;

}
/**
 * EnableOptions
 * @param {any} perfil
 */
function EnableOptions(perfil) {

    Trace("index.js:EnableOptions. perfil ", perfil);

    var perfilVisualizacion = ((perfil & 1) ? true : false);
    var perfilMando = ((perfil & 2) ? true : false);
    var perfilReconAlarmas = ((perfil & 8) ? true : false);
    var perfilGestUsuarios = ((perfil & 16) ? true : false);
    var perfilAdministracion = ((perfil & 64) ? true : false);
    var perfilVerLocalGateway = ((perfil & 128) ? true : false);
    var perfilAdminLocalGateway = ((perfil & 256) ? true : false);
    var perfilHistoricos = ((perfil & 512) ? true : false);
    var perfilBackup = ((perfil & 1024) ? true : false);


	/*if (perfilAdministracion){
		$('#MenuGeneral').attr('style','display:table-cell;width:11%');
		$('#MenuOpciones ul li').removeClass('menuListDisabled');	
		return;
	}

	if (perfilVisualizacion){
		$('#MenuOpciones ul li').removeClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(2)').addClass('menuListDisabled'); 
		return;
	}

	if (perfilGestUsuarios){
		//$('#MenuOpciones ul li').addClass('menuListDisabled');
		$('#MenuOpciones ul li').removeClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(1)').addClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(2)').addClass('menuListDisabled'); 
		$('#MenuOpciones ul li:nth-child(3)').removeClass('menuListDisabled'); // se cambia indice 3 por 2 para esconder tablaBSS
		return;
	}

	if (perfilVisualizacion){
		$('#MenuOpciones ul li').removeClass('menuListDisabled');
		$('#MenuOpciones ul li:nth-child(2)').addClass('menuListDisabled'); 
		return;
	}

	$('#MenuOpciones ul li').removeClass('menuListDisabled');	*/
}

// 20200508. Opcion de Forzar Audio Radio para Version 16 radios. 
// 20200715. Para esta version de pone como estaba.
var force_rdaudio_normal = false;
/**
 * ForceRdAudioPrecision
 * */
function ForceRdAudioPrecision() {

    Trace("index.js:ForceRdAudioPrecision. force_rdaudio_normal ", force_rdaudio_normal);

    if (force_rdaudio_normal == true) {
        /** Ocultar Modo de Audio */
        $('#GranularityRow').hide();
    }
}
/**
 * 20201020. Tracea las llamadas en el Cliente.
 * */
var TraceLevel = 1;
function Trace(msg, ...args) {
    switch (TraceLevel) {
        case 0:
            break;
        case 1:
            console.log(msg, ...args);
            break;
        case 2:
            console.trace(msg, ...args);
            break;
    }
}
/** 20201106. Para presentar o no el Indice de Carga. */
var LoadIndexControlEnabled = false;
/**
 * 
 * @param {any} srv_force_rdaudio_normal
 * @param {any} srv_LoadIndexControlEnabled
 */
function SetupOptionsForServer(srv_force_rdaudio_normal, srv_LoadIndexControlEnabled) {
    Trace("SetupOptionsForServer. force_rdaudio_normal %s, LoadIndexControlEnabled %s.", srv_force_rdaudio_normal, srv_LoadIndexControlEnabled);
    force_rdaudio_normal = srv_force_rdaudio_normal == 'true';
    LoadIndexControlEnabled = srv_LoadIndexControlEnabled == 'true';
}

/** 20201103. From LAYOUT-JADE */
var actual = '';
var actualShow = '';
var actualAnimate = '';
var checkCookie = false;
var PageLog;
// 20170809. Configuracion de ALERTIFY
alertify.defaults.transition = 'zoom';

window.onbeforeunload = function () {
    /** 20170522 AGL No se porque esta esto. Hace que funcione mal el 
        LOGIN / LOGOUT  De momento lo elimino */
    /* authentication();
    ***************************/
};

/**
 * SetRegion
 * */
function SetRegion() {
    Trace("index.js:SetRegion");
    $('#hRegion').text($('#BodyRedan').data('region'));
}
/**
 * SetVersion
 * */
function SetVersion() {
    Trace("index.js:SetVersion");
}
/**
 * StartTime
 * */
function startTime() {
    //Trace("index.js:startTime.");
    var ESdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];
    var ENdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();

    var y = today.getFullYear();
    var month = today.getMonth() + 1;
    var d = today.getDate();

    var weekDay = navigator.languages[0].substr(0, 2) == 'es' ? ESdays[today.getDay()] : ENdays[today.getDay()];
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('_hsolohora').innerHTML = h + ":" + m + ":" + s;
    document.getElementById('_hfecha').innerHTML = d + "/" + month + "/" + y + " (" + weekDay + ")";
    var t = setTimeout(function () { startTime() }, 500);

    if (checkCookie)
        CheckCookie();
}
/**
 * CheckCookie
 * */
function CheckCookie() {
    if (document.cookie.indexOf("U5K-G") < 0) {
        checkCookie = false;
        //alert('Login timeout after ' + $('#Login-Operador').data('logintimeout') + ' minutes.');
        alertify.alert('Ulises G 5000 R', 'Login timeout after ' + $('#BodyRedan').data('logintimeout') + ' minutes.');
        alertify.error('Login timeout after ' + $('#BodyRedan').data('logintimeout') + ' minutes.');
        window.location = $('#BodyRedan').data('actualLocation');
    }
}
/**
 * checkTime
 * @param {any} i
 */
function checkTime(i) {
    if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
    return i;
}
/**
 * RefreshCookie
 * */
function RefreshCookie() {
    if (document.cookie.indexOf("U5K-G") >= 0) {
        SetCookie('U5K-G', $('#BodyRedan').data('perfil'));
    }
}
/**
 * showMaintenancePanel.
 * @param {any} maintenanceService
 */
function showMaintenancePanel(maintenanceService) {
    Trace("index.js:showMaintenancePanel. maintenanceService ", maintenanceService);

    $('#FormHistorics').fadeOut(300, function () {
        $('#FormStatiscs').fadeOut(300);
        $('#MenuFiltros').fadeOut(300, function () {
            $('#MenuPasarelas').fadeOut(300, function () {
                if (maintenanceService === 'Pasarelas') {
                    $('#MenuPasarelas').fadeIn(300);
                    $('#MenuPasarelas').attr('style', 'display:table-cell;width:11%;vertical-align: top')
                    $('#FiltersStatics').hide();
                    $('#FiltersHistorics').hide();
                    $('#GotoGatewaysLocalConfiguration').show();
                }
                else {
                    $('#MenuFiltros').fadeIn(300);
                    $('#MenuFiltros').attr('style', 'display:table-cell;width:11%;vertical-align: top')
                    $('#GotoGatewaysLocalConfiguration').hide();
                    if (maintenanceService == "Maintenance") {
                        $('#FiltersStatics').hide();
                        $('#FiltersHistorics').show();
                    }
                    else {
                        $('#FiltersHistorics').hide();
                        $('#FiltersStatics').show();
                    }
                }
            });
        });
    });
}
/**
 * hidePreviuos
 * @param {any} form
 * @param {any} showThis
 * @param {any} animateThis
 */
function hidePrevious(form, showThis, animateThis) {
    Trace("index.js:hidePrevious. [form, showThis, animateThis]", form, showThis, animateThis);
    if (actual != form) {
        if (actual != '') {
            $(actualAnimate).animate({ width: '5px' });
            $('#FormParameters').hide();
            $(actualShow).hide();
            $(actual).hide();
            $(actualAnimate).fadeOut(100);
        }
        actual = form;
        actualShow = showThis;
        actualAnimate = animateThis;
        //if ( !$(actualAnimate).is(':visible'))
        $(actualAnimate).animate({ height: '670px' })
        $(actualAnimate).fadeIn(100);
        $(actualAnimate).animate((animateThis == '#DivGateways' || animateThis == '#DivConfigurations' || animateThis == '#DivHardware' || animateThis == '#DivTableBss') ? { width: '350px' } : { width: '145px' });
    }
}
/**
 * hidePreviousHistorics
 * @param {any} form
 * @param {any} showThis
 * @param {any} animateThis
 */
function hidePreviousHistorics(form, showThis, animateThis) {
    Trace("index.js:hidePreviousHistorics. [form, showThis, animateThis]", form, showThis, animateThis);

    $(actualAnimate).show();

    if (actual != '') {
        $(actualAnimate).animate({ width: '5px' });
        $(actualShow).hide();
        $(actual).hide();
    }
    actual = form;
    actualShow = showThis;
    actualAnimate = animateThis;
    $(actualAnimate).animate({ width: '175px' });
}
/**
 * hidePreviousBackup
 * @param {any} form
 * @param {any} showThis
 * @param {any} animateThis
 */
function hidePreviousBackup(form, showThis, animateThis) {
    Trace("index.js:hidePreviousBackup. [form, showThis, animateThis]", form, showThis, animateThis);
    if (actual != '') {
        $(actualAnimate).animate({ width: '5px' }, function () {
            $(actualShow).hide();
            $(actual).hide();
            $(actualAnimate).fadeOut(100, function () {
                actual = form;
                actualShow = showThis;
                actualAnimate = animateThis;

                $(actualAnimate).fadeIn(100, function () {
                    $(actualShow).show();
                    $(actual).show();
                    $(actualAnimate).animate(animateThis == '#DivLogs' ? { width: '1000px' } : { width: '375px' });
                });
            });
        });
    }
    else {
        actual = form;
        actualShow = showThis;
        actualAnimate = animateThis;

        $(actualAnimate).fadeIn(100, function () {
            $(actualShow).show();
            $(actual).show();
            $(actualAnimate).animate(animateThis == '#DivLogs' ? { width: '1000px' } : { width: '375px' });
        });
    }
}
/**
 * hideMenu
 * @param {any} menu
 * @param {any} form
 */
function hideMenu(menu, form) {
    Trace("index.js:hideMenu. [form, menu]", form, menu);
    $('#Menu').fadeOut(500, function () {
        $('#MenuGeneral').attr('style', 'display:table-column');
        $(menu).fadeIn(500);
        $(form).attr('style', 'display:table-cell;width:11%');

        if (menu == "#MenuConfiguration") {
            translateWord('Activate', function (result) {
                if ($('#listaOpciones li:nth-last-child(2)').text() != result) {
                    var item = $('<li id="aplicaCambios" style="margin-top:100px"><a id="opcionAplCambios" onclick="CheckingAnyChange(\'GeneralContent\', function(){GetActiveCfgAndActivate()})">' + result + '</li>');
                    item.insertBefore($('#listaOpciones li:last-child'));
                }
            })
            /*if(EnableAplicarCambios($('#BodyRedan').data('perfil')))
                $('#aplicaCambios').removeClass('menuListDisabled');
            else
                $('#aplicaCambios').addClass('menuListDisabled');
            */

            /*if (($('#BodyRedan').data('perfil') & 16) == 16){
                $('#MenuOpciones').attr('style','display:table-cell;width:11%');
                EnableOptions($('#BodyRedan').data('perfil'));
            }
            else
                EnableOptions($('#BodyRedan').data('perfil'));
                */
        }
    })
}
/**
 * hide
 * */
function hide() {
    Trace("index.js:hide.");

    if (actual != '') {
        $(actualAnimate).fadeOut(500, function () {
            $(actualShow).hide();
            $(actual).hide();
            $('#FormParameters').hide();
            actual = '';
        });
    }

    if ($('#MenuConfiguration').is(':visible')) {
        $('#MenuConfiguration').fadeOut(500, function () {
            $('#Menu').fadeIn(500);
            $('#MenuGeneral').attr('style', 'width:11%;display:table-cell');
        });
    }
    if ($('#MenuHistoricos').is(':visible')) {
        $('#MenuHistoricos').fadeOut(500, function () {
            $('#MenuFiltros').attr('style', 'display:table-column');
            $('#MenuPasarelas').attr('style', 'display:table-column');
            $('#Menu').fadeIn(500, function () {
                $('#MenuGeneral').attr('style', 'width:11%;display:table-cell');
            });
        });
    }
    if ($('#MenuBackup').is(':visible')) {
        $('#MenuBackup').fadeOut(500, function () {
            $('#Menu').fadeIn(500);
            $('#MenuGeneral').attr('style', 'width:11%;display:table-cell');
        });
    }
}
/**
 * loadPendingChanges
 * */
function loadPendingChanges() {
    Trace("index.js:loadPendingChanges");
    $.ajax({
        type: 'GET',
        url: '/configurations/listOfGateways/',

        success: function (data) {
            if (data != 'NO_DATA') {
                if (data.result != null && data.result.length > 0) {
                    $.each(data.result, function (index, value) {
                        listOfGateways = listOfGateways.concat(value.Gateway + ',')
                    })
                }
            }
        }
    });
}
/**
 * Logout
 * */
function Logout() {
    Trace("index.js:Logout.");
    authentication();
    var index = BodyRedan.baseURI.indexOf('#');
    if (index > -1)
        BodyRedan.baseURI = BodyRedan.baseURI.substr(0, index - 1);

    window.location.href = $('#BodyRedan').data('actualLocation')
    GenerateHistoricEvent(ID_HW, USER_LOGOUT_SYSTEM, $('#loggedUser').text(), $('#loggedUser').text());
    this.document.location.reload();
}
/**
 * restoreInfo
 * */
function restoreInfo() {
    Trace("index.js:restoreInfo");
    alertify.alert("Información", "Para Restaurar la Base de Datos, consultar 'ULISES G 5000-REDAN. Configuración Remota. Manual de Usuario.docx' Punto 6.2.");
}
/**
 * About
 * */
function About() {
    Trace("index.js:About");
    // alertify.alert("Acerca de...");
    if (!alertify.About) {
        //define a new dialog
        alertify.dialog('About', function factory() {
            return {
                main: function (message) {
                    this.message = message;
                },
                setup: function () {
                    return {
                        buttons: [{ text: "Aceptar", key: 27/*Esc*/ }],
                        focus: { element: 0 }
                    };
                },
                prepare: function () {
                    this.setContent(this.message);
                },
                build: function () {
                    this.setHeader('REDAN. Aplicación de Configuración.');
                    this.set('resizable', true);
                }
            }
        });
    }

    $.ajax({
        type: 'GET',
        url: '/version',
        success: function (data) {
            console.log(data);
            //launch it
            var url_license = "http://" + window.location.hostname + ':' + window.location.port + '/COPYING.AUTHORIZATION.txt';
            var msg = '<div>' +
                '<h2>REDAN CFGR</h2>' +
                '<p style="text-align:center; color: black;">Version ' + data.version + '.' + data.subversion + ', ' + data.date + '</p>' +
                '<p style="text-align:center">Nucleo CC Copyright ©2018..2109 Todos los Derechos Reservados.</p>' +
                '<p style="text-align: right"><a href="' + url_license + '" target="_blank">Acuerdo de Licencia</a></p>' +
                '</div>';
            alertify.About(msg).resizeTo(500, 270);
        }
    });
}
/**
 * AboutColors
 * */
function AboutColours() {
    Trace("index.js:AboutColors.");
    // alertify.alert("Acerca de...");
    if (!alertify.About) {
        //define a new dialog
        alertify.dialog('About', function factory() {
            return {
                main: function (message) {
                    this.message = message;
                },
                setup: function () {
                    return {
                        buttons: [{ text: "Aceptar", key: 27/*Esc*/ }],
                        focus: { element: 0 }
                    };
                },
                prepare: function () {
                    this.setContent(this.message);
                },
                build: function () {
                    this.setHeader('REDAN. Estado BBDD de la Pasarela');
                    this.set('resizable', true);
                }
            }
        });
    }
    var msg = '<div>' +
        '<h2>CODIGO DE COLORES</h2>' +
        '<hr/>' +
        '<p style = "text-align: center;" ><b>CONFIGURACIONES</b></p>' +
        '<table style = "width: 300px; margin-left: auto; margin-right: auto;" cellspacing="15" >' +
        '<tbody>' +
        '<tr>' +
        '<td style = "text-align: center;" bgcolor = "#99FF66"> CONFIGURACION ACTIVA </td>' +
        '</tr>' +
        '<tr>' +
        '<td style="text-align: center;" bgcolor = "#FFFFFF">CONFIGURACION NO ACTIVA&nbsp;&nbsp;</td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '<p>&nbsp;</p>' +
        '<hr/>' +
        '<p style="text-align: center;"><b>PASARELAS</b></p>' +
        '<table style = "width: 100%;" cellspacing = "20" >' +
        '<tbody>' +
        '<tr>' +
        '<td style = "width: 150px; text-align: center;" ><b><u>PASARELAS EN CONFIGURACION ACTIVA</u></b></td>' +
        '<td style = "width: 150px; text-align: center;" ><b><u>PASARELAS EN CONFIGURACION NO ACTIVA</u></b></td>' +
        '</tr>' +
        '<tr>' +
        '<td style = "width: 150px; text-align: center;" bgcolor = "#EDEDED" >PASARELA DESCONOCIDA</td>' +
        '<td style = "width: 150px; text-align: center;" bgcolor = "#EDEDED" >PASARELA DESCONOCIDA</td>' +
        '</tr>' +
        '<tr>' +
        '<td style = "width: 348px; text-align: center;" bgcolor = "#99FF66">PASARELA CONECTADA</td>' +
        '<td style = "width: 348px; text-align: center;" bgcolor = "#206600"><span style="color: #ffffff;">PASARELA CONECTADA</span></td>' +
        '</tr>' +
        '<tr>' +
        '<td style = "width: 348px; text-align: center;" bgcolor = "#80BFFF">PASARELA DESCONECTADA</td>' +
        '<td style = "width: 348px; text-align: center;" bgcolor = "#004D99"><span style="color: #ffffff;">PASARELA DESCONECTADA</span></td>' +
        '</tr>' +
        '</tbody>' +
        '</table>' +
        '<table style = "width: 300px; margin-left: auto; margin-right: auto;" cellspacing="15" >' +
        '<tbody>' +
        '<tr>' +
        '<td style = "text-align: center;" bgcolor = "#ffff99"> PASARELA NO SINCRONIZADA </td>' +
        '</tr>' +
        '<tr>' +
        '<td style="text-align: center;" bgcolor = "#ff8c1a">PASARELA SINCRONIZANDOSE</td>' +
        '</tr>' +
        //'<tr>' +
        //'<td style="text-align: center;" bgcolor = "#C1022C"><span style="color: #ffffff;">PASARELA EN ERROR</span></td>' +
        //'</tr>' +
        '</tbody>' +
        '</table>' +
        '</div>';
    alertify.About(msg).resizeTo(200, 600);
}

