TPOpenBudget.tooltip = (function() {
    var $body = $('body');
    var formatCHF = d3.format(',f');
    var formatDiffPercent = d3.format('+.2');
    var $tip = $('<div id="tooltip"></div>').html('<div></div>').hide().appendTo($body);
    var $tipInner = $tip.find('div');
    $(document).mousemove(function(e){
        $tip.css({
            'top': e.pageY + 0,
            'left': e.pageX + 10
        });
    });
    
    $(document).on('mouseover', 'svg circle', function(){
        var d = this.__data__, valueLabel = '';
        if(d.type == 'revenue') {
            valueLabel = 'Erlöse: ';
        }
        else if(d.type == 'gross_cost') {
            valueLabel = 'Bruttokosten: ';
        }

        $tipInner.html(
            '<strong>'+d.name+'</strong><br />'+
            valueLabel+'CHF '+formatCHF(d.value)+' <span>'+formatDiffPercent(d.diff)+'%</span>'/*+'<br />'+
            valueLabel+'CHF '+formatCHF(d.value2)+' '+formatDiffPercent(d.diff)+'%'*/
        );
        $tipInner.find('span').css('color', d.stroke);
        $tip.show();
    });
    $(document).on('mouseout', 'svg circle', function(){
        $tip.hide();
    });
})()
