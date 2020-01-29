var destinationUris = [];

var GetRadioDestinations = function() {
    //$('#Component').text('Radio destinations');	// Titulo
    //$('#DivComponents').attr('class','disabledDiv');
    $('#FormRadioDestinations').show();
    $('#AddFormDestinations').hide();
    $('#DestinationsToolsTable').hide();
    $.ajax({
        type: 'GET',
        url: '/destinations',
        success: function(data) {
            ShowDestinations(data);
        }
    });

    // GetFreeResources();
};

var ShowDestinations = function(data) {
    $("#listDestinations").empty();
    //$('#AddFormDestinations').hide();
    //$('#DestinationsToolsTable').hide();
    $.each(data.destinations, function(index, value) {
        var item = $('<li><a onclick="ShowDestination(\'' + value.idDESTINOS + '\')">' + value.name + '</li>');
        item.appendTo($("#listDestinations"));
    });
};

var NewRadioDestination = function() {
    $('#FormRadioDestinations').show();

    $('#DivDestinations').animate({ width: '625px' });
    $('#AddFormDestinations').show();
    $('#DestinationsToolsTable').show();
    $('#AddFormDestinations').show();
    $('#PostDestination').show();
    $('#FormDetails').show();

    $("#ResourceBag").empty();
    $("#ResourceBag").data('resourceName', '');
    $('#BtnUpdate').text('Add')
        .attr('onclick', 'AddRadioDestination()');
    $('#IdDestination').val('');
    $('#Principal').prop('checked', true);
    $('#Reserva').prop('checked', false);

    GetFreeResources();
};

var AddRadioDestination = function(f) {
    if ($('#IdDestination').val().length > 0) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            url: '/destinations/destination',
            data: JSON.stringify({
                name: $('#IdDestination').val(),
                tipoConmutacion: $('#Principal').prop('checked') ? 1 : 0
            }),
            success: function(data) {
                alertify.success('Frecuencia \"' + data.destination.name + '\" añadida.');
                //$("#PostDestination").hide();
                //$('#IdDestination').val('');
                $('#IdDestination').data('id', data.destination.idDESTINOS);
                GetRadioDestinations();
                if (f != null)
                    f();
            },
            error: function(data) {
                alertify.error('Error añadiendo destino \"' + data.destination.name + '\".');
            }
        });
    }
    else {
        alertify.alert('Ulises G 5000 R', "Identificador de frecuencia no válido.");
        alertify.error("Identificador de frecuencia no válido.");
    }
};

function GetResources() {
    $.ajax({
        type: 'GET',
        url: '/resources',
        success: function(data) {
            ShowResources(data);
        }
    }
    );
}

function GetFreeResources() {
    $.ajax({
        type: 'GET',
        url: '/resources/free',
        success: function(data) {
            ShowResources(data);
        }
    }
    );
}

function ShowDestination(id) {
    if ($('#AddFormDestinations').is(':visible')) {
        $('#AddFormDestinations').hide();
        $('#DivDestinations').animate({ width: '125px' });
    }

    $('#DivDestinations').animate({ width: '625px' });
    $('#AddFormDestinations').show();
    $('#DestinationsToolsTable').show();

    $("#ResourceBag").empty();
    $("#ResourceBag").data('resourceName', '');
    $('#BtnUpdate').text('Update')
        .attr('onclick', 'UpdateDestination()');
    // Actulizar lista de recursos libres
    //GetFreeResources();

    $.ajax({
        type: 'GET',
        url: '/destinations/' + id,
        success: function(data) {
            $('#AddFormDestinations').show();
            $('#PostDestination').show();
            $('#FormDetails').show();
            $('#IdDestination').val(data.destination.name);
            $('#IdDestination').data('id', id);
            $('#Principal').prop('checked', data.destination.tipoConmutacion == 1);
            $('#Reserva').prop('checked', data.destination.tipoConmutacion == 0);

            ResetForm();
            /*
            if (data.destination.idRecurso != null){
                var item = $('<a id="' + data.destination.idRecurso +'" class="dragableItem" style="color:#bf2a36;height:auto;width:95px" draggable="true" ondragstart="dragAssigned(event)"">' + 
                                "<img src='/images/iconRadio.gif' style='float: right'/>" + data.destination.resourceName + '</li>');
                item.appendTo($("#ResourceBag"));
                $("#ResourceBag").data('resourceName',data.destination.idRecurso);

                $('#listResources #' + data.destination.resourceName).remove();
            }
            */
        }
    });
}

function ResetForm() {
    var cuantos = $("#ListMenuSites li").length;
    for (var i = 0; i < cuantos - 1; i++) {
        $('#ListMenuSites li:nth-child(1)').remove();
    }

    $('#FormUris').hide();
    $('#FormResources').show();

    SelectFirstItem('ListMenuDestinations');
}

function UpdateDestination() {
    if ($('#IdDestination').val().length > 0) {
        $.ajax({
            type: 'PUT',
            url: '/destinations/' + $('#IdDestination').data('id'),
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                name: $('#IdDestination').val(),
                tipoConmutacion: $('#Principal').prop('checked') ? 1 : 0
            }),
            success: function(data) {
                alertify.success('Frecuencia \"' + data.destination.name + '\" modificada.');
                GetRadioDestinations();
            },
            error: function(data) {
                alertify.error('Error modificando destino \"' + data.destination.name + '\".');
            }
        });
    }
}

function DelDestination() {

    alertify.confirm('Ulises G 5000 R', "¿Eliminar la frecuencia: \"" + $('#IdDestination').val() + "\"?",
        function() {
            if ($('#IdDestination').val().length > 0) {
                $.ajax({
                    type: 'DELETE',
                    url: '/destinations/' + $('#IdDestination').data('id'),
                    success: function(data) {
                        if (data.destination == 0) {
                            alertify.alert('Ulises G 5000 R', "Una frecuencia asignada a un recurso no puede ser eliminada.");
                            alertify.error('Una frecuencia asignada a un recurso no puede ser eliminada.');
                        }
                        else {
                            alertify.success('Frecuencia elminada');
                            $('#IdDestination').val('');
                            $("#ResourceBag").data('resourceName', '');
                            $("#ResourceBag").empty();
                            GetRadioDestinations();
                            $('#PostDestination').hide();
                            $('#FormDetails').hide();
                        }
                    },
                    error: function(data) {
                        alertify.error('Error eliminando frecuencia.');
                    }
                });
            }


            //alertify.success('Ok'); 
        },
        function() { alertify.error('Cancelado'); }
    );


}

function ShowResources(data) {
    $("#listResources").empty();
    $.each(data.recursos, function(index, value) {
        if (value.tipo == 1 && value.idRECURSO != $("#ResourceBag").data('resourceName')) {	// Solo recursos de radio y no está asignado a este destino
            var item = $("<li id='" + value.name + "'><div id='" + value.idRECURSO + "' data-resourceId='" +
                value.idRECURSO + "' class='dragableItem' style='color:#bf2a36;height:auto;width:95px' draggable='true' ondragstart='drag(event)'>" +
                "<img src='/images/iconRadio.gif' style='float: right'/>" +
                value.name + "</div></li>");
            //item.append($("<img src='/images/iconRadio.gif' style='float: right'/>"));
            item.appendTo($("#listResources"));
        }
    });
}

function PostResourceToDestination(rscId, dstId, f) {
    //	if ($('#IdDestination').val().length > 0){
    $.ajax({
        type: 'POST',
        url: '/destinations/' + dstId + '/resources/' + rscId,
        success: function(data) {
            if (f != null)
                f();
            //$("#ResourceBag").data('resourceName',rscId);
            //GetFreeResources();
        },
        error: function(data) {
            alertify.error('Error asignando recurso.');
        }
    });
    //	}
}

function DeleteResourceFromDestination(rscId, dstId, f) {
    //	if (confirm("Do you want to delete resource " + rscId + " from frequency " + dstId + "?") == true) {
    //		if ($('#IdDestination').val().length > 0){
    $.ajax({
        type: 'DELETE',
        url: '/destinations/' + dstId + '/resources/' + rscId,
        success: function(data) {
            /*			 			$("#ResourceBag").data('resourceName','');
                                        $("#ResourceBag").empty();
                                        GetFreeResources();
            */
            if (f != null)
                f();
        },
        error: function(data) {
            alertify.error('Error eliminando recurso.');
        }
    });
    //		}
    //	}
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    if (ev.target.id == "") {
        ev.dataTransfer.setData("itemDragging", ev.target.parentElement.id);
        ev.dataTransfer.setData("itemDraggingParent", ev.target.parentElement.parentElement.parentElement.parentElement.id);
    }
    else {
        ev.dataTransfer.setData("itemDragging", ev.target.id);
        ev.dataTransfer.setData("itemDraggingParent", ev.target.parentElement.parentElement.parentElement.id);
    }

    $('.dropable').addClass('target');
}

function dragAssigned(ev) {
    if (ev.target.id == "") {
        ev.dataTransfer.setData("itemDragging", ev.target.parentElement.id);
        ev.dataTransfer.setData("itemDraggingParent", ev.target.parentElement.parentElement.id);
    }
    else {
        ev.dataTransfer.setData("itemDragging", ev.target.id);
        ev.dataTransfer.setData("itemDraggingParent", ev.target.parentElement.id);
    }
    $('.dropable').addClass('target');
}

/*****************************/
/*** Asignar una recurso 	**/
/*** libre a un destino		**/
/*****************************/
function dropAssigned(ev) {
    ev.preventDefault();
    $('.dropable').removeClass('target');


    if (ev.dataTransfer.getData("itemDraggingParent") == ev.target.id ||
        ev.dataTransfer.getData("itemDragging") == ev.target.id)
        return;

    var data = ev.dataTransfer.getData("itemDragging");
    var element = ev.target;
    var child = document.getElementById(data);
    while (element.localName != "div")
        element = element.parentElement;

    $("#ResourceBag").empty();
    element.appendChild(child);

    if ($('#BtnUpdate').text() === "Add") {
        // Si se está añadiendo un nuevo destino, este no existe todavía en la bd
        // Antes de asignale un recurso, hay que dar de alta el destino
        AddRadioDestination(function() {
            PostResourceToDestination(data, $('#IdDestination').data('id'));
            $('#BtnUpdate').text('Update')
                .attr('onclick', 'UpdateDestination()');
        });
    }
    else {
        if ($("#ResourceBag").data('resourceName') != '')
            // Si el destino tiene un recurso ya asignado, este se libera
            DeleteResourceFromDestination($("#ResourceBag").data('resourceName'), $('#IdDestination').data('id'), function() {
                PostResourceToDestination(data, $('#IdDestination').data('id'));
                ShowDestination($('#IdDestination').data('id'));
            });
        else
            PostResourceToDestination(data, $('#IdDestination').data('id'));
    }
}

/*********************************/
/*** Liberar un recurso 		**/
/*** asignado de un destino 	**/
/*********************************/
function dropFree(ev) {
    ev.preventDefault();
    $('.dropable').removeClass('target');

    var data = ev.dataTransfer.getData("itemDragging");

    if (ev.dataTransfer.getData("itemDraggingParent") == ev.target.id ||
        ev.dataTransfer.getData("itemDragging") == ev.target.id)
        return;
    // var element = ev.target;
    // if (element.localName === "a")
    // 	element = element.parentElement;

    // element.appendChild(document.getElementById(data));
    DeleteResourceFromDestination(data, $('#IdDestination').data('id'));
}

function dragEnd(ev) {
    ev.preventDefault();
    $('.dropable').removeClass('target');
}

function LoadSites() {
    $.ajax({
        type: 'GET',
        url: '/destinations/' + $('#IdDestination').data('id') + '/uris',
        success: function(data) {
            var cuantos = $("#ListMenuSites li").length;
            for (var i = 0; i < cuantos - 1; i++) {
                $('#ListMenuSites li:nth-child(1)').remove();
            }
            ShowUris(data);
        }
    }
    );
}

function RemoveSite() {

    alertify.confirm('Ulises G 5000 R', "¿Eliminar el emplazamiento \"" + $('#FormUris').data('idUri') + "\" de la frecuencia \"" + $('#IdDestination').data('id') + '\"?',
        function() {
            $.ajax({
                type: 'DELETE',
                url: '/destinations/' + $('#IdDestination').data('id') + '/uris/' + $('#FormUris').data('idUri'),
                success: function(data) {
                    alertify.success('Emplazamiento eliminado.');
                    ShowDestination($('#IdDestination').data('id'));
                }
            }
            );

            //alertify.success('Ok'); 
        },
        function() { alertify.error('Cancelado'); }
    );
}
