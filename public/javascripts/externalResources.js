/**
 * Created by vjmolina on 13/9/17.
 */

/* AGL */
function itemListStr(alias, uri) {
    var stralias = alias.length > 20 ? alias.substr(0, 19) + "..." : alias;
    var struri = uri.length > 32 ? "..." + uri.substr(uri.length - 32, uri.length - 1) : uri;
    return stralias + " : " + struri;
}
/************************************/
/*	FUNCTION: GetExtResources	 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetExtResources = function(filter, f) {
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

    $('#AddResources').hide();
    $("#FormResources").show();
    $('#DivResources').animate({ width: '950px' });

    $.ajax({
        type: 'GET',
        url: '/externalResources/' + filterOption
    })
        .done(function(data) {
            $("#listResources").empty();
            if (data.lista_recursos != null && data.lista_recursos.length > 0) {
                $.each(data.lista_recursos, function(index, value) {
                    //var item = $("<li><a onclick='GetExtResource(" + value.idrecursos_externos + ")'>" + value.alias + ": " + value.uri + "</li>");
                    var item = $("<li><a onclick='GetExtResource(" + value.idrecursos_externos + ")' style='font-size:80%;'>" + itemListStr(value.alias, value.uri) + "</li>");
                    item.appendTo($("#listResources"));
                });
                //if (f != null)
                //	f(-1);
            }
            else {
                var item = $("<li>No hay elementos disponibles</li>");
                item.appendTo($("#listResources"));
            }

            //else if (f != null)
            //	f();
        });
};

/************************************/
/*	FUNCTION: GetExtResource	 	*/
/*  PARAMS: idExtResource (IN)		*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetExtResource = function(idExtResource) {
    $('#DivResources').animate({ width: '950px' });
    $('#AddResources').show();

    if (idExtResource != -1) {
        $.ajax({
            type: 'GET',
            url: '/externalResources/getResource/' + idExtResource,
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
var PostExtResource = function() {
    if ($('#aliasExtResource').val() == '' || $('#uriExtResource').val() == '') {
        alertify.alert('Los datos del recurso no pueden estar vacíos. Rellene todos los campos.');
        return;
    }
    else {
        var id_recurso = $('#FormResources').data('idrecursos_externos');        
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
                    var strAction = id_recurso==-1 ? ' generado ' : ' modificado ';
                    alertify.success('Recurso ' + $('#aliasExtResource').val() + strAction);
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
var DeleteExtResource = function() {
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
