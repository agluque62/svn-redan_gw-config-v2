/******************************************************************************************************/
/****** Module: resources.js											*******************************/
/****** Description: Módulo de soporte a la gestion de recursos			*******************************/
/******************************************************************************************************/
var link_resources = [];
/**
 * GetResources
 * @param {any} gtw
 */
var GetResources = function (gtw) {

    Trace("resources.js:GetResources. gtw ", gwt);

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
                    style: 'color:var(--main-color)',
                    class: 'ButtonNucleo',
                    onclick: 'GetResource("' + value.IdRecurso + '","' + value.IdTifx + '")',
                    text: value.IdRecurso
                }));
            });
        }
    });
};
/**
 * 
 * @param {any} rsc
 * @param {any} gtw
 */
var GetResource = function (rsc, gtw) {

    Trace("resources.js:GetResource. rsc %s, gtw ", rsc, gtw);

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
/**
 * GoBack
 * */
var GoBack = function () {

    Trace("resources.js:GoBack");

    $('#DivComponents').height('auto');

    $('#DivComponents').attr('class', 'fadeNucleo');

    $('#propResource tr').remove();
    $('#FormResources').hide();
};

