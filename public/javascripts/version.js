/**
 * version.js
 * 
 */
/**
 * GetVersion.
 * @param {any} isFirstLoad
 */
var GetVersion = function (isFirstLoad) {

    Trace("users.js:GetVersion. isFirstLoad ", isFirstLoad);

    $('#DivVersion').animate({ width: '760px' });
    if (!isFirstLoad) {
        $("#AddFormVersion").show();
        $("#FormVersion").show();
    }
    $.ajax({
        type: 'GET',
        url: '/version'
    })
        .done(function(data) {
            // $("#IdVersion").text(data.version);
            console.log('GetVersion: ', data.version, data.subversion, data.R16Mode);
            var strSubversion = data.subversion == '' ? ',  ' : ('.' + data.subversion + ',  ');
            $("#IdVersion").text(data.version + strSubversion + data.date);
            $("#IdSubVersion").text(data.subversion);
            $("#IdVersionDate").text(data.date);
            $("#IdNodeJSVersion").text(data.nodejsversion);
            $("#IdMySQLVersion").text(data.mysqlversion);
            $("#listVersions").empty();
            $("#hVersion").text(data.version + ' ' + data.subversion);

            $.each(data.file, function(index, value) {
                // var item = $("<br>Fichero: <b>"+value.Name+"</b><ul><li>MD5: "+value.md5.toUpperCase()+"</li>" +
                // "<li>Tamaño: "+value.fileSizeInBytes+" bytes</li><li>Fecha: "+value.date+"</li></ul>");
                var item = $("<p style='color:black';>" +
                    "<b>" + value.Name + "</b>" +
                    ", " + value.date +
                    ", " + value.fileSizeInBytes + ' bytes' +
                    ", " + value.md5.toUpperCase() +
                    "</p>"
                );
                item.appendTo($("#listVersions"));
            });
        /** 202005. Modo 16R*/
            force_rdaudio_normal = data.R16Mode;
            $("#hVersion").text(data.version + '.' + data.subversion + (force_rdaudio_normal==true? " R16" : ""));

        });
};
