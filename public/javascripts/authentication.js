
var authentication = function() {

    $.get('/ajax', function(res) {
        $('none').text(res);
    });
};
