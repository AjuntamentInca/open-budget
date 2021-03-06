$(function() {

    OpenBudget.table = (function() {
        var $table = $('#table'),
            $tHead = $table.find('thead'),
            $tBody = $table.find('tbody'),
            $overviewHead = $tHead.find('.overview').detach(),
            $overviewTrTemplate = $tBody.find('tr.overview').detach(),
            $compareHead = $tHead.find('.compare').detach(),
            $compareTrTemplate = $tBody.find('tr.compare').detach(),
            $breadcrumb = $('.breadcrumb');

        var formatCHF = function(value){
                return d3.format(',.2f')(value).replace('.', ' ').replace(/,/g, '.').replace(' ', ',');
            },
            formatDiffPercent = d3.format('+.2'),
            formatProportionPercent = d3.format('.2f');

        var helpers = {
            cleanId: function(id) {
                return id.replace(/revenue-|gross_cost-/, '');
            },
            cleanIdFromTr: function(tr) {
                return $.trim($(tr).attr('id').replace(/^tr-/, ''));
            },
            removeCircleHighlight: function() {
                highlightedCircles.classed('hover', 0);
            }
        };

        var highlightedCircles = d3.select();
        $tBody.on('mouseover', 'tr', function() {
            helpers.removeCircleHighlight();

            var cleanId = helpers.cleanIdFromTr(this);
            highlightedCircles = d3.selectAll('svg circle#c-revenue-'+cleanId+', svg circle#c-gross_cost-'+cleanId).classed('hover', 1);
        }).on('mouseout', 'tr', helpers.removeCircleHighlight);

        var labelOfDepth = OpenBudget.data.meta.hierarchy;

        var fn = {
            highlight: function(id) {
                $tBody.find('tr').removeClass('hover');
                if(id) {
                    $tBody.find('#tr-'+helpers.cleanId(id)).addClass('hover');
                }
            },
            show: function(nodes) {
                $table.stop(true).animate({
                    opacity: 0
                }, {
                    complete: function() {
                        var dataSets = [],
                            idToIndex = {};

                        _.each(nodes, function(node) {
                            var id = helpers.cleanId(node.id);
                            if(id != 'surplus') {
                                var index = idToIndex[id];
                                if(index === undefined) {
                                    index = dataSets.length;
                                    dataSets.push({
                                        name: node.name,
                                        id: id,
                                        nodes: {}
                                    });
                                    idToIndex[id] = index;
                                }
                                var dataSet = dataSets[index];
                                dataSet.nodes[node.type] = node;
                        }
                        });

                        $tHead.empty();
                        $tBody.empty();

                        breadcrumbItems = [];
                        var createBreadcrumbItem = function(node) {
                            if(node) {
                                breadcrumbItems.unshift(node.name);
                                createBreadcrumbItem(node.parent);
                            }
                        };

                        var firstDataSet = dataSets[0];

                        /*if(nodes[0].depth === 0) {
                            $overviewHead.clone().appendTo($tHead);

                            _.each(dataSets, function(dataSet) {
                                var $tr = $overviewTrTemplate.clone(),
                                    gross_cost = dataSet.nodes.gross_cost;
                                    //revenue = dataSet.nodes.revenue;

                                $tr.attr('id', 'tr-'+dataSet.id);
                                $tr.find('td:eq(0)').text(dataSet.name);
                                $tr.find('td:eq(1)').text(formatCHF((gross_cost && gross_cost.value) || 0));
                                //$tr.find('td:eq(2)').text(formatCHF((revenue && revenue.value) || 0));
                                $tBody.append($tr);
                            });
                        }
                        else {*/
                            var type = firstDataSet.nodes.gross_cost === undefined ? 'revenue' : 'gross_cost';

                            $compareHead.clone().appendTo($tHead).find('th:eq(0)').text(labelOfDepth[firstDataSet.nodes[type].depth]);

                            var getNodeTitle = function(node, def){
                                if (!node || !node.info){
                                    return def;
                                }
                                var info = node.info;
                                var result = 'Partida: ';
                                if (info.codi_programa){
                                    result += info.codi_programa + ".";
                                }
                                if (info.codi_partida){
                                    result += info.codi_partida + " ";
                                }
                                if (info.partida){
                                    result += info.partida;
                                }
                                result += ' (';
                                if (info.organisme){
                                    result += info.organisme + " > ";
                                }
                                if (info.pol_despesa){
                                    result += info.pol_despesa + " > ";
                                }
                                if (info.programa){
                                    result += info.programa + " > ";
                                }
                                if (info.capitol){
                                    result += info.capitol;
                                }
                                result += ')';
                                return result;
                            };

                            _.each(dataSets, function(dataSet) {
                                var $tr = $compareTrTemplate.clone(),
                                    d = dataSet.nodes[type];

                                $tr.attr('id', 'tr-'+dataSet.id);
                                $tr.find('.name').text(dataSet.name).attr('title', getNodeTitle(d, dataSet.name));
                                $tr.find('.value').text(formatCHF(d.value));
                                $tr.find('.diff').text(formatDiffPercent(dataSet.nodes[type].diff)+'%').css('color', d.stroke).attr('data-toggle', 'tooltip').attr('data-container', 'body').attr('title', 'Percent Change between FY15 and FY16');
                                $tr.find('.value2').text(formatCHF(d.value2));
                                //$tr.find('.proportion').text(formatProportionPercent(dataSet.nodes[type].proportion)+'%').attr('data-toggle', 'tooltip').attr('data-container', 'body').attr('title', 'Percentage of whole');
                                $tBody.append($tr);
                            });

                            // Totals row
                            var $tr = $compareTrTemplate.clone();

                            $tr.attr('id', 'tr-total');
                            $tr.addClass('total');
                            $tr.find('.name').text('Total');
                            $tr.find('.value').text(formatCHF(_.reduce(dataSets, function(memo, num) { return memo + num.nodes[type].value; }, 0)));
                            //$tr.find('.diff').text(formatDiffPercent(dataSet.nodes[type].diff)+'%').css('color', d.stroke);
                            $tr.find('.value2').text(formatCHF(_.reduce(dataSets, function(memo, num) { return memo + num.nodes[type].value2; }, 0)));
                            $tBody.append($tr);

                            if(firstDataSet.nodes[type].depth < 3) {
                                $tBody.find('tr').click(function() {
                                    d3.select('#c-'+type+'-'+helpers.cleanIdFromTr(this)).each(function(d, i) {
                                        helpers.removeCircleHighlight();
                                        OpenBudget.visualisation.zoomIn.apply(this, [d, i]);
                                    });
                                }).css('cursor', 'pointer');
                            }
                            
                            // Hide proportion on initial view
                            /*if(firstDataSet.nodes[type].depth === 0) {
                                 $table.find('.proportion').attr('style', 'display: none !important');
                            }*/

                            createBreadcrumbItem(firstDataSet.nodes[type].parent);

                            //breadcrumbItems.unshift(OpenBudget.data.meta[type + '_label']);
                            breadcrumbItems.unshift(OpenBudget.data.meta.base_headline);
                        //}

                        //breadcrumbItems.unshift(OpenBudget.data.meta.overview_label);

                        var breadcrumbLength = breadcrumbItems.length;
                        $breadcrumb.empty();
                        _.each(breadcrumbItems, function(item, index) {
                            var $item = $('<li></li>');
                            $item.text(item);
                            if(index + 1 < breadcrumbLength) {
                                //$item.append('<span class="divider">/</span>');
                                $item.click(function() {
                                    OpenBudget.visualisation.zoomOut();
                                }).css('cursor', 'pointer');
                            }
                            $item.appendTo($breadcrumb);
                        });

                        $table.animate({opacity:1});
                    }
                });
            }
        };

        return fn;
    })();

});
