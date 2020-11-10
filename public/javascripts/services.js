/******************************************************************************************************/
/****** Module: services.js												*******************************/
/****** Description: Módulo de soporte a la gestion de servicios		*******************************/
/******************************************************************************************************/
var CurrentService = {};
/**
 * GetAllServices
 * */
var GetAllServices = function () {

    Trace("services.js:GetAllServices.");

    var urlString = '/services';
    $.ajax({
        type: 'GET',
        url: urlString,
        success: function(services) {
            if (services != null) {
                AddServices(services, true);
            }
        }
    });
};
/**
 * GetService
 * */
function GetService() {
    var serviceId = $("#ListServices option:selected").val();
    var urlString = '/services/' + serviceId;

    Trace("services.js:GetService. serviceId %s, urlString ", serviceId, urlString);

    $.ajax({
        type: 'GET',
        url: urlString,
        success: function(data) {
            $('#ServicesFormGateway')[0].reset();
            if (data.servicios != null) {
                CurrentService = data.servicios;
                SelectServiceName(data.servicios.idSERVICIOS);

                SelectFirstItem('ServicesFormGateway');
                // SIP Service
                RenderSipService(data.servicios.sip, true);
                // WEB Service
                RenderWebService(data.servicios.web, false);
                // SNMP Service
                RenderSnmpService(data.servicios.snmp, false);
                // Recording Service
                RenderRecordingService(data.servicios.grab, false);
                // Sincronization Service
                RenderSincronizationService(data.servicios.sincr, false);
            }
        },
        error: function() {
            $('#ServicesFormGateway')[0].reset();
        }
    });
}
/**
 * PostService
 * @param {any} name
 */
function PostService(name) {
    var urlString = '/services/service';

    Trace("services.js:PostService. name %s, urlString ", name, urlString);

    $.ajax({
        type: 'POST',
        url: urlString,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            "name": name,
            "sip": null,
            "web": null,
            "snmp": null,
            "grab": null,
            "sincr": null
        }),
        success: function(data) {
            if (data.error != 0) {
                var services = [];
                services.push(data.service);
                AddServices(services, false);
            }
        }
    });
}
/**
 * PostNewService
 * @param {any} name
 * @param {any} callback
 */
function PostNewService(name, callback) {
    var urlString = '/services/service';

    Trace("services.js:PostNewService. name %s, urlString ", name, urlString);

    $.ajax({
        type: 'POST',
        url: urlString,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            "name": name,
            "sip": null,
            "web": null,
            "snmp": null,
            "grab": null,
            "sincr": null
        }),
        success: function(data) {
            if (data.error != 0) {
                var services = [];
                services.push(data.service);
                AddServices(services, false);
                callback(data.service);
            }
        }
    });
}
/**
 * CopyService
 * @param {any} sourceService
 * @param {any} targetService
 */
function CopyService(sourceService, targetService) {
    var urlString = '/services/service';
    CurrentService.name = targetService;

    Trace("services.js:CopyService. source %s, target ", sourceService, targetService);

    $.ajax({
        type: 'COPY',
        url: urlString,
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(CurrentService),
        success: function(data) {
            if (data.error == null) {
                var services = [];
                services.push({ idSERVICIOS: data.service.idSERVICIOS, name: data.service.name });
                AddServices(services, false);
                alertify.success('Servicio \"' + targetService + '\" copiado.');
                GetService();
            }
        }
    });
}
/**
 * AddServices
 * @param {any} services
 * @param {any} reset
 */
function AddServices(services, reset) {

    Trace("services.js:AddServices. reset %s, services ", reset, services);

    if (reset) {
        translateWord('SelectService', function(result) {
            options += '<option value="" disabled selected>' + result + '</option>';

            $.each(services, function(index, value) {
                if (value.name != null)
                    options += '<option value="' + value.idSERVICIOS + '">' + value.name + '</option>';
            });

            $('#ListServices').html(options);
        });
    }
    else {
        var options = $('#ListServices').prop('options');
        $.each(services, function(index, value) {
            if (value.name != null)
                options[options.length] = new Option(value.name, value.idSERVICIOS, true, true);
        });
        $('#ServicesFormGateway')[0].reset();
    }
}
/**
 * EditNewService
 * @param {any} cgwName
 * @param {any} callback
 */
function EditNewService(cgwName, callback) {

    Trace("services.js:EditNewService. cgwName ", cgwName);

    if ($('#PuertoLocalSIP').val().length == 0) {
        alertify.error("Debe introducir el puerto SIP");
        callback();
        return;
    }

    if ($('#CbRUpdatePeriod').prop('checked') && $('#TbUpdatePeriod').val().length == 0) {
        alertify.error("Debe introducir el periodo de supervisión");
        callback();
        return;
    }

    if ($("#NtpServersList option:selected").text().length == 0) {
        alertify.error("Debe seleccionar un servidor NTP");
        callback();
        return;
    }

    if ($('#wport').val().length == 0) {
        alertify.error("Debe introducir el puerto de servicio WEB");
        callback();
        return;
    }

    if ($('#stime').val().length == 0) {
        alertify.error("Debe introducir el tiempo de seseión WEB");
        callback();
        return;
    }

    if ($('#snmpp').val().length == 0) {
        alertify.error("Debe introducir el puerto SNMP");
        callback();
        return;
    }

    if ($('#TrapsList option:eq(0)').val() == null) {
        alertify.error("Debe introducir algún trap");
        callback();
        return;
    }

    // Crea servicio vacío sin asignar a ninguna pasarela
    PostNewService(cgwName, function(data) {
        alertify.success('Servicio creado para la pasarela ' + cgwName);
        callback(data);
    });
}
/**
 * CloneService
 * @param {any} button
 */
function CloneService(button) {

    Trace("services.js:CloneService. button ", button);

    if (!$('#NewServiceEdit').is(':visible')) {
        $(button).text('Copy');
        $('#AddButton').hide();
        $('#RemoveButton').hide();
        $('#NewServiceEdit').show();
    }
    else {
        if ($('#NewServiceEdit').val().length > 0) {
            // Copia el servicio seleccionado 
            CopyService($('#ListServices option:selected').val(), $('#NewServiceEdit').val());
        }
        $(button).text('Copiar servicio');
        $('#NewServiceEdit').hide();
        $('#AddButton').show();
        $('#RemoveButton').show();
    }
}
/**
 * RemoveService
 * */
function RemoveService() {
    var serviceId = $("#ListServices option:selected").val();

    Trace("services.js:RemoveService. serviceId ", serviceId);

    // Comprobar que el servicio que se pretende eliminar 
    // no este asignado a ninguna pasarela
    $.ajax({
        type: 'GET',
        url: '/services/' + serviceId + '/gateways',
        success: function(data) {
            if (data.length > 0) {
                translateWord('ErrorServiceAssignedToGateway', function(result) {
                    alertify.error(result);
                    return;
                });
            }
            else {
                var urlString = '/services/' + serviceId;
                $.ajax({
                    type: 'DELETE',
                    url: urlString,
                    success: function(data) {
                        if (data.error == null) {
                            alertify.success('Servicio eliminado correctamente.');
                            GetServices(false);
                        }
                    }
                });
            }
        }
    });
}