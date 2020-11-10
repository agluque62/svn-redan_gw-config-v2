/**
 * 
 * */
var destinationUris = [];
/**
 * 
 * */
var GetRadioDestinations = function () {

    Trace("radioDestinatios.js:GetRadioDestinations");

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
/**
 * ShowDestinations
 * @param {any} data
 */
var ShowDestinations = function (data) {

    Trace("radioDestinatios.js:ShowDestinations. data ", data);

    $("#listDestinations").empty();
    $.each(data.destinations, function(index, value) {
        var item = $('<li><a onclick="ShowDestination(\'' + value.idDESTINOS + '\')">' + value.name + '</li>');
        item.appendTo($("#listDestinations"));
    });
};
/**
 * NewRadioDestination
 * */
var NewRadioDestination = function () {

    Trace("radioDestinatios.js:NewRadioDestination");

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
/**
 * AddRadioDestination
 * @param {any} f
 */
var AddRadioDestination = function (f) {

    Trace("radioDestinatios.js:AddRadioDestination.");

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
/**
 * GetResources
 * */
function GetResources() {

    Trace("radioDestinatios.js:GetResources");

    $.ajax({
        type: 'GET',
        url: '/resources',
        success: function(data) {
            ShowResources(data);
        }
    }
    );
}
/**
 * GetFreeResources
 * */
function GetFreeResources() {

    Trace("radioDestinatios.js:GetFreeResources");

    $.ajax({
        type: 'GET',
        url: '/resources/free',
        success: function(data) {
            ShowResources(data);
        }
    }
    );
}
/**
 * ShowDestination
 * @param {any} id
 */
function ShowDestination(id) {

    Trace("radioDestinatios.js:ShowDestination. id ", id);

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
        }
    });
}
/**
 * ResetForm
 * */
function ResetForm() {

    Trace("radioDestinatios.js:ResetForm");

    var cuantos = $("#ListMenuSites li").length;
    for (var i = 0; i < cuantos - 1; i++) {
        $('#ListMenuSites li:nth-child(1)').remove();
    }

    $('#FormUris').hide();
    $('#FormResources').show();

    SelectFirstItem('ListMenuDestinations');
}
/**
 * UpdateDestination
 * */
function UpdateDestination() {

    Trace("radioDestinatios.js:UpdateDestination");

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
/**
 * DelDestination
 * */
function DelDestination() {

    Trace("radioDestinatios.js:DelDestination");

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
        },
        function() { alertify.error('Cancelado'); }
    );
}
/**
 * ShowResources
 * @param {any} data
 */
function ShowResources(data) {

    Trace("radioDestinatios.js:ShowResources. data ", data);

    $("#listResources").empty();
    $.each(data.recursos, function(index, value) {
        if (value.tipo == 1 && value.idRECURSO != $("#ResourceBag").data('resourceName')) {	// Solo recursos de radio y no está asignado a este destino
            var item = $("<li id='" + value.name + "'><div id='" + value.idRECURSO + "' data-resourceId='" +
                value.idRECURSO + "' class='dragableItem' style='color:var(--main-color);height:auto;width:95px' draggable='true' ondragstart='drag(event)'>" +
                "<img src='/images/iconRadio.gif' style='float: right'/>" +
                value.name + "</div></li>");
            item.appendTo($("#listResources"));
        }
    });
}
/**
 * PostResourceToDestination
 * @param {any} rscId
 * @param {any} dstId
 * @param {any} f
 */
function PostResourceToDestination(rscId, dstId, f) {

    Trace("radioDestinatios.js:PostResourceToDestination. rscId %s, dstId %s", rscId, dstId);

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
}
/**
 * DeleteResourceFromDestination
 * @param {any} rscId
 * @param {any} dstId
 * @param {any} f
 */
function DeleteResourceFromDestination(rscId, dstId, f) {

    Trace("radioDestinatios.js:DeleteResourceFromDestination. rscId %s, dstId %s", rscId, dstId);

    $.ajax({
        type: 'DELETE',
        url: '/destinations/' + dstId + '/resources/' + rscId,
        success: function(data) {
            if (f != null)
                f();
        },
        error: function(data) {
            alertify.error('Error eliminando recurso.');
        }
    });
}
/**
 * allowDrop
 * @param {any} ev
 */
function allowDrop(ev) {
    ev.preventDefault();
}
/**
 * drag
 * @param {any} ev
 */
function drag(ev) {

    Trace("radioDestinatios.js:drag");

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
/**
 * dragAssigned
 * @param {any} ev
 */
function dragAssigned(ev) {

    Trace("radioDestinatios.js:dragAssigned");

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
/**
 * dropAssigned
 * Asignar un recurso libre a un destino.
 * @param {any} ev
 */
function dropAssigned(ev) {

    Trace("radioDestinatios.js:dropAssigned");

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
/**
 * dropFree
 * Liberar un recurso asignado de un destino
 * @param {any} ev
 */
function dropFree(ev) {

    Trace("radioDestinatios.js:dropFree");

    ev.preventDefault();
    $('.dropable').removeClass('target');

    var data = ev.dataTransfer.getData("itemDragging");

    if (ev.dataTransfer.getData("itemDraggingParent") == ev.target.id ||
        ev.dataTransfer.getData("itemDragging") == ev.target.id)
        return;
    DeleteResourceFromDestination(data, $('#IdDestination').data('id'));
}
/**
 * dragEnd
 * @param {any} ev
 */
function dragEnd(ev) {

    Trace("radioDestinatios.js:dragEnd");

    ev.preventDefault();
    $('.dropable').removeClass('target');
}
/**
 * LoadSites
 * */
function LoadSites() {

    Trace("radioDestinatios.js:LoadSites");

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
/**
 * RemoveSite
 * */
function RemoveSite() {

    Trace("radioDestinatios.js:RemoveSite");

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
        },
        function() { alertify.error('Cancelado'); }
    );
}

/** 20201103. From postRadioDestination.jade */
/**
 * loadDest
 * @param {any} element
 */
function loadDest(element) {

    Trace("radioDestinations.js:loadDest. element ", element)
    var tabs = [];
    switch (element.rel) {
        case "FormResources":
            tabs = document.getElementById('ListMenuDestinations').getElementsByTagName("a");
            $('#FormUris').hide();
            break;
        case "FormUris":
            tabs = document.getElementById('ListMenuDestinations').getElementsByTagName("a");
            $('#FormResources').hide();
            break;
    }
    $('#' + element.rel).show();
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].rel == element.rel)
            tabs[i].className = "selected";
        else
            tabs[i].className = "";
    }
}

