/**
 * Created by vjmolina on 13/9/17.
 */

/************************************/
/*	FUNCTION: GetExtResources	 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetHRR = function(filter, f) {
    /** 20170511 AGL PERFILES */
    if (Authorize($('#BodyRedan').data('perfil'), [ccAdminProfMsc, ccConfiProfMsc]) == false) {
		/*if ((($('#BodyRedan').data('perfil') & 16) != 16) && (($('#BodyRedan').data('perfil') & 64) != 64)) {
		 *****************************/
        alertify.error('No tiene asignados permisos para la gestión de recursos externos.');
        return;
    }
    var filterOption = -1;
    if (typeof filter != 'undefined')
        filterOption = parseInt($('#extResFilter option:selected').val());
    else
        $('#extResFilter option[value="-1"]').prop('selected', true);

    //$('#AddResources').hide();
    $("#FormHRR").show();
    $('#DivHRR').animate({ width: '950px' });

    $.ajax({
        type: 'GET',
        url: '/hrr/getHrr',
        success: function(data) {
            $("#listConfigurationsHrr").empty();
            if (data.result != null && data.result.length > 0) {
                $.each(data.result, function(index, value) {
                    var item = $("<li><a onclick='GetHRRConfig(" + value.idCFG + ")'>" + value.name + "</li>");
                    item.appendTo($("#listConfigurationsHrr"));
                });
                //if (f != null)
                //	f(-1);
            }
            else {
                var item = $("<li>No hay elementos disponibles</li>");
                item.appendTo($("#listConfigurationsHrr"));
            }

            //else if (f != null)
            //	f();
        },
        error: function(data) {
            alertify.error('Se ha producido un error al intentar recuperar las configuraciones.');
        }
    });
};

/************************************/
/*	FUNCTION: GetExtResource	 	*/
/*  PARAMS: idExtResource (IN)		*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetHRRConfig = function(idCfg) {
    $('#DivResources').animate({ width: '950px' });
    $('#AddResources').show();

    if (idExtResource != -1) {
        $.ajax({
            type: 'GET',
            url: '/hrr/getHrrCfg/' + idCfg,
            success: function(data) {
                if (data.lista_recursos != null) {
                    translateWord('Update', function(result) {
                        $('#UpdateTableButton').text(result)
                            .attr('onclick', 'PutTable()');
                    });
                    $('#FormResources').data('idrecursos_externos', data.lista_recursos[0].idrecursos_externos);
                    $('#aliasExtResource').val(data.lista_recursos[0].alias);
                    $('#uriExtResource').val(data.lista_recursos[0].uri);

                    $('#extResType option[value="' + data.lista_recursos[0].tipo + '"]').prop('selected', true);
                    $('#UpdateExtResButton').text('Modificar');
                    $('#DeleteExtResButton').show();

                }
            }
        });
    }
    else {
        $('#FormResources').data('idrecursos_externos', -1);
        $('#aliasExtResource').val('');
        $('#uriExtResource').val('');
        $('#extResType option[value="0"]').prop('selected', true);
        $('#UpdateExtResButton').text('Insertar');
        $('#DeleteExtResButton').hide();
    }
};

/************************************/
/*	FUNCTION: PostExtResource	 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
// var PostExtResource = function() {
var PostHRR = function() {
    if ($('#aliasExtResource').val() == '' || $('#uriExtResource').val() == '') {
        alertify.alert('Los datos del recurso no pueden estar vacíos. Rellene todos los campos.');
        return;
    }
    else {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            url: '/externalResources/-1',
            data: JSON.stringify({
                alias: $('#aliasExtResource').val(),
                uri: $('#uriExtResource').val(),
                tipo: $('#extResType option:selected').val(),
                id_recurso: $('#FormResources').data('idrecursos_externos')
            }),
            success: function(data) {
                if (data.error == null) {
                    alertify.success('Recurso ' + $('#aliasExtResource').val() + ' generado.');
                    GetExtResources();
                }
                else {
                    alertify.error('Error: ' + data.error);
                }
            },
            error: function(data) {
                alertify.error('Error generando el recurso.');
            }
        });
    }
};

/************************************/
/*	FUNCTION: DeleteExtResource	 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
// var DeleteExtResource = function() {
var DeleteHRR = function() {
    alertify.confirm('Ulises G 5000 R', '¿Eliminar el recurso' + $('#aliasExtResource').val() + '?',
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/externalResources/getResource/' + $('#FormResources').data('idrecursos_externos'),
                success: function(data) {
                    if (data.error == null) {
                        alertify.success('Recurso \"' + $('#aliasExtResource').val() + '\" eliminado.');
                        GetExtResources();
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
        function() {
            alertify.error('Cancelado');
        }
    );
};
