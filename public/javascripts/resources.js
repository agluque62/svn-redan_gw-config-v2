/******************************************************************************************************/
/****** Module: resources.js											*******************************/
/****** Description: Módulo de soporte a la gestion de recursos			*******************************/
/******************************************************************************************************/
var link_resources = [];

var GetResources = function(gtw) {
    $.ajax({
        type: 'GET',
        url: '/gateways/' + gtw + '/resources',
        success: function(data) {
            link_resources.splice(0, link_resources.length);
            // Limpiar los elementos de la tabla.
            $('.tg  tr td').each(function() {
                $(this).children('a').remove();
            });
            $.each(data.result, function(index, value) {
                link_enlaces.push({ indice: index, valor: value });
                var slot = value.SlotPasarela + 1;
                var num = value.NumDispositivoSlot + 1;
                var tdItem = '#td' + slot + num;
                $(tdItem).append($('<a>', {
                    style: 'color:#bf2a36',
                    class: 'ButtonNucleo',
                    onclick: 'GetResource("' + value.IdRecurso + '","' + value.IdTifx + '")',
                    text: value.IdRecurso
                }));
            });
        }
    });
};

var GetResource = function(rsc, gtw) {
    $.ajax({
        type: 'GET',
        url: '/gateways/' + gtw + '/resources/' + rsc,
        success: function(data) {
            $('#propResource tr').remove();
            for (x in data.result) {
                var newRowContent = "<tr><td Id='Label" + x + "'></td><td Id='Value" + x + "'></td></tr>";
                $('#propResource').append(newRowContent);
                $('#Label' + x).append($('<div>', {
                    style: 'color:black',
                    text: x
                })
                );
                $('#Value' + x).append($('<input>', {
                    style: 'float: right',
                    class: 'textbox',
                    value: data.result[x]
                })
                );
            }
        }
    });
};


/*
var GetResourcesBelongsGateway = function(){
	var alto = $('#DivComponents').height();
	var gtw = $('#IdTifx').val();

	$('#DivComponents').height(alto);

	$('#DivComponents').attr('class','disabledDiv');
	$('#FormResources').show();

	$('#h3IdGtw').text('Resources of gateway: ' + gtw);
	GetResources(gtw);
}
*/
var GoBack = function() {
    $('#DivComponents').height('auto');

    $('#DivComponents').attr('class', 'fadeNucleo');

    $('#propResource tr').remove();
    $('#FormResources').hide();
};

