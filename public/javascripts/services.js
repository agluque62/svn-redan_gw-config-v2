var CurrentService = {};
/******************************************************************************************************/
/****** Module: services.js												*******************************/
/****** Description: Módulo de soporte a la gestion de servicios		*******************************/
/******************************************************************************************************/

var GetAllServices = function() {
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

function GetService() {
    var serviceId = $("#ListServices option:selected").val();
    var urlString = '/services/' + serviceId;
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

function PostService(name) {
    var urlString = '/services/service';
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

function PostNewService(name, callback) {
    var urlString = '/services/service';
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

function CopyService(sourceService, targetService) {
    var urlString = '/services/service';
    CurrentService.name = targetService;
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

function AddServices(services, reset) {
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

function EditNewService(cgwName, callback) {

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

function CloneService(button) {
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

function RemoveService() {
    var serviceId = $("#ListServices option:selected").val();

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