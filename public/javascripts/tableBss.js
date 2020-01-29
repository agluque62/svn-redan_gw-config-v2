/******************************************************************************************************/
/****** Module: tableBss.js												*******************************/
/****** Description: Módulo de soporte a la gestion de usuarios			*******************************/
/******************************************************************************************************/
/** 20170516. AGL Gestor 'Aplicar cambios' */
var tbbssModified = false;

/************************************/
/*	FUNCTION: PutTable	 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var PutTable = function() {
    var listValues = [];
    for (var i = 0; i < 6; i++) {
        listValues[i] = $('#CbRssi' + i + ' option:selected').val();
    }
    $.ajax({
        type: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        url: '/tableBss',
        data: JSON.stringify({
            idtabla_bss: $('#FormTableBss').data('idtabla_bss'),
            name: $('#IdTable').val(),
            description: $('#DescTable').val(),
            UsuarioModificacion: $('#user').val(),
            TableValues: listValues
        }),
        success: function(data) {
            if (data.error == null) {
                alertify.success('Datos de la tabla \"' + $('#IdTable').val() + '\" actualizados.');
                /** 20170516. AGL. Activar Cambios... */
                tbbssModified = true;
                GetTablesBss(function() {
                    GetTable($('#FormTableBss').data('idtabla_bss'));
                });
                //Vamos a llamar a actualizar las pasarelas
                var idTabla = 0;
                if ($('#FormTableBss').data('idtabla_bss') != null)
                    idTabla = $('#FormTableBss').data('idtabla_bss');
                $.ajax({
                    type: 'GET',
                    url: '/gateways/updateTable/' + idTabla,
                    success: function(data) {
                        if (data.error == null)
                            alertify.success('Pasarelas actualizadas.');
                        else
                            alertify.error('Error: ' + data.error);
                    },
                    error: function(data) {
                        alertify.error('Error actualizando pasarelas.');
                    }
                });
            }
            else {
                alertify.error('Error: ' + data.error);
            }
        },
        error: function(data) {
            alertify.error('Error modificando la tabla de calificación de audio.');
        }
    });
};

/************************************/
/*	FUNCTION: GetTablesBss	 		*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetTablesBss = function(f) {
    /** 20170511 AGL PERFILES */
    //	if (Authorize($('#BodyRedan').data('perfil'),[ccAdminProfMsc,ccConfiProfMsc])==false) {
	/*if ((($('#BodyRedan').data('perfil') & 16) != 16) && (($('#BodyRedan').data('perfil') & 64) != 64)) {
		*****************************/
    //		alertify.error('No tiene asignados permisos para la gestión de las tablas de calificación de audio.');
    //		return;
    //	}

    $('#AddTableBss').hide();
    $("#FormTableBss").show();
    $('#DivTableBss').animate({ width: '535px' });

    $.ajax({
        type: 'GET',
        url: '/tableBss'
    })
        .done(function(data) {
            $("#listTablesBss").empty();
            if (data.tables != null && data.tables.length > 0) {
                $.each(data.tables, function(index, value) {
                    var item = $("<li><a onclick='GetTable(" + value.idtabla_bss + ")'>" + value.name + "</li>");
                    item.appendTo($("#listTablesBss"));
                });
                if (f != null)
                    f();
            }
            else if (f != null)
                f();
        });
};

/************************************/
/*	FUNCTION: GetTablesBss	 		*/
/*  PARAMS: idTable (IN)			*/
/*  REV 1.0.2 VMG					*/
/************************************/
var GetTable = function(idTable) {
    $('#DivTableBss').animate({ width: '950px' });
    $('#AddTableBss').show();

    if (idTable != -1) {
        $.ajax({
            type: 'GET',
            url: '/tableBss/' + idTable,
            success: function(data) {
                if (data.tables != null) {
                    translateWord('Update', function(result) {
                        $('#UpdateTableButton').text(result)
                            .attr('onclick', 'PutTable()');
                    });
                    $('#FormTableBss').data('idtabla_bss', data.tables[0].idtabla_bss);
                    $('#IdTable').val(data.tables[0].name);
                    $('#DescTable').val(data.tables[0].description);
                    $('#RowCreationUser').hide();
                    $('#RowCreationDate').show();
                    $('#RowModificationUser').hide();
                    $('#RowModificationDate').hide();
                    //$('#LblCreationUser').text(data.tables[0].UsuarioCreacion);
                    $('#LblCreationDate').text(data.tables[0].FechaCreacion);
                    //$('#LblModificationUser').text(data.tables[0].UsuarioModificacion);
                    //$('#LblModificationDate').text(data.tables[0].FechaModificacion);

                    $('#CbRssi0 option[value="' + data.tables[0].valor0 + '"]').prop('selected', true);
                    $('#CbRssi1 option[value="' + data.tables[0].valor1 + '"]').prop('selected', true);
                    $('#CbRssi2 option[value="' + data.tables[0].valor2 + '"]').prop('selected', true);
                    $('#CbRssi3 option[value="' + data.tables[0].valor3 + '"]').prop('selected', true);
                    $('#CbRssi4 option[value="' + data.tables[0].valor4 + '"]').prop('selected', true);
                    $('#CbRssi5 option[value="' + data.tables[0].valor5 + '"]').prop('selected', true);
                    $('#DeleteTableButton').show();
                    $('#RowValuesTable').show();
                }
            }
        });
    }
    else {
        $('#CbRssi0 option[value="0"]').prop('selected', true);
        $('#CbRssi1 option[value="0"]').prop('selected', true);
        $('#CbRssi2 option[value="0"]').prop('selected', true);
        $('#CbRssi3 option[value="0"]').prop('selected', true);
        $('#CbRssi4 option[value="0"]').prop('selected', true);
        $('#CbRssi5 option[value="0"]').prop('selected', true);
        translateWord('Add', function(result) {
            $('#UpdateTableButton').text(result)
                .attr('onclick', 'PostTable()');
        });
        translateWord('Cancel', function(result) {
            $('#CancelTableButton').text(result)
                .attr('onclick', 'GetTablesBss()');
        });

        $('#DeleteTableButton').hide();
        $('#FormTableBss').data('idtabla_bss', null);
        $('#IdTable').val('');
        $('#DescTable').val('');
        $('#RowCreationUser').hide();
        $('#RowCreationDate').hide();
        $('#RowModificationUser').hide();
        $('#RowModificationDate').hide();
        $('#RowValuesTable').show();
    }
};

/************************************/
/*	FUNCTION: PostTable	 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var PostTable = function() {

    if ($('#IdTable').val() == '') {
        alertify.alert('El nombre de la tabla no puede ser vacío. Utilize un nombre correcto.');
        return;
    }
    else {
        var listValues = [];
        for (var i = 0; i < 6; i++) {
            listValues[i] = $('#CbRssi' + i + ' option:selected').val();
        }
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            url: '/tableBss',
            data: JSON.stringify({
                name: $('#IdTable').val(),
                description: $('#DescTable').val(),
                UsuarioCreacion: $('#user').val(),
                UsuarioModificacion: $('#user').val(),
                TableValues: listValues
            }),
            success: function(data) {
                if (data.error == null) {
                    alertify.success('Tabla de calificación ' + $('#IdTable').val() + ' generada.');
                    GenerateHistoricEvent(ID_HW, ADD_CALIFICATION_AUDIO_TABLE, $('#IdTable').val(), $('#loggedUser').text());
                    /** 20170516. AGL. Activar Cambios... */
                    tbbssModified = true;
                    GetTablesBss(function() {
                        $('#UpdateTableButton').text('Actualizar');
                        $('#UpdateTableButton').attr('onclick', 'PutTable()');
                        GetTable(data.idTable);
                    });
                }
                else {
                    alertify.error('Error: ' + data.error);
                }
            },
            error: function(data) {
                alertify.error('Error generando la tabla de calificación de audio.');
            }
        });
    }
};



/************************************/
/*	FUNCTION: DelTable	 			*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
var DelTable = function() {
    alertify.confirm('Ulises G 5000 R', '¿Eliminar la tabla de calificación de audio ' + $('#IdTable').val() + '?',
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/tableBss/' + $('#FormTableBss').data('idtabla_bss'),
                success: function(data) {
                    if (data.error == 'CANT_DELETE') {
                        var mensaje = 'La tabla ' + $('#IdTable').val() +
                            ' está asignada al recurso: ' + data.ResourceName;
                        alertify.alert(mensaje);
                        alertify.error('No se puede eliminar una tabla asignada a un recurso');
                    }
                    else if (data.error == null) {
                        GenerateHistoricEvent(ID_HW, REMOVE_CALIFICATION_AUDIO_TABLE, $('#IdTable').val(), $('#loggedUser').text());
                        alertify.success('Tabla \"' + $('#IdTable').val() + '\" eliminada.');
                        /** 20170516. AGL. Activar Cambios... */
                        //tbbssModified = true;
                        GetTablesBss();
                    }
                },
                error: function(data) {
                    alertify.error('Error eliminando la tabla de calificación de audio.');
                }
            });
        },
        function() {
            alertify.error('Cancelado');
        }
    );
};
