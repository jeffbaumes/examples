var width = 1600;
var margin = 50;
var delta = 200;

var svg = d3.select("#chart")
  .append("svg:svg")
    .attr("width", "100%")
    .attr("height", 2*margin + 25*delta);

var chromosomes = [];

d3.csv("resources/data/wgEncodeGencodeCompV12-simple.csv", function(data) {
  var n = 400;
  var chrommap = {};
  for (var i = 0; i < data.length; ++i) {
    var d = data[i];
    if (!chrommap[d.chromosome]) {
      var chrom = d.chromosome.substring(3);
      if ((0+chrom) > 0 && (0+chrom) < 10) {
        chrom = '0' + chrom;
      }
      chrommap[d.chromosome] = {chromosome: d.chromosome, chrom: chrom, matrix: []};
      chromosomes.push(chrommap[d.chromosome]);
    }
    var matrix = chrommap[d.chromosome].matrix;
    var pos = matrix.length - 1;
    if (pos == -1 || matrix[pos].length == n) {
      matrix.push([]);
      ++pos;
    }
    matrix[pos].push({x: matrix[pos].length, y: pos, z: (0 + d.end - d.start), gene: d.gene, sign: d.sign});
  }

  chromosomes.sort(function(a, b) { return d3.ascending(a.chrom, b.chrom); });

  var x = d3.scale.ordinal().rangeBands([0, width], 0),
      z = d3.scale.linear().domain([0, 100000]).clamp(true),
      c = d3.scale.category10().domain(d3.range(10));
  var c0 = d3.interpolateHsl(d3.hsl(c(0)).brighter(2), c(0));
  var c1 = d3.interpolateHsl(d3.hsl(c(1)).brighter(2), c(1));

  x.domain(d3.range(n));

  var chromosome = svg.selectAll(".chromosome")
      //.data([chromosomes[0]])
      .data(chromosomes)
    .enter().append("g")
      .attr("class", "chromosome")
      .attr("transform", function(d, i) { return "translate(" + margin + "," + (margin + i*delta) + ")"; })
      .each(chromSetup);

  var chromosome = svg.selectAll("text")
      .data(chromosomes)
    .enter().append("text")
      .attr("x", 10)
      .attr("y", function(d, i) { return margin + 25 + i*delta; })
      .text(function(d) { return d.chromosome.substring(3); });

  function chromSetup(chrom) {

    var row = d3.select(this).selectAll(".row")
        .data(chrom.matrix)
      .enter().append("g")
        .attr("class", "row")
        .attr("transform", function(d, i) { return "translate(0," + x(i) + ")"; })
        .each(row);

    function row(row) {

      var cell = d3.select(this).selectAll(".cell")
          .data(row)
        .enter().append("rect")
          .attr("class", "cell")
          .attr("x", function(d) { return x(d.x); })
          .attr("width", x.rangeBand())
          .attr("height", x.rangeBand())
          .style("stroke-opacity", "0")
          //.style("fill-opacity", function(d) { return z(d.z); })
          .style("fill", function(d) { return d.sign === "+" ? c0(z(d.z)) : c1(z(d.z)); })
          .on("mouseover", mouseover)
          .on("mouseout", mouseout)
          //.append("title")
          //  .text(function(d) { return "" + d.x + "," + d.y; });

    }

  }

  function mouseover(d) {
    d3.select(this.parentElement.parentElement.parentElement)
      .select("text.detail").remove();
    d3.select(this.parentElement.parentElement.parentElement)
      .select("rect.detail").remove();

    d3.select(this.parentElement.parentElement).append("rect")
      .attr("class", "cell detail")
      .attr("x", x(d.x))
      .attr("y", x(d.y))
      .attr("width", 100)
      .attr("height", 100)
      .style("fill", d.sign === "+" ? c0(z(d.z)) : c1(z(d.z)))
      .on("click", function() { window.open("http://www.genecards.org/cgi-bin/carddisp.pl?gene="+d.gene, "_blank"); });

    d3.select(this.parentElement.parentElement).append("text")
      .attr("class", "detail")
      .attr("x", x(d.x) + 10)
      .attr("y", x(d.y) + 30)
      .text(d.gene)
      .on("click", function() { window.open("http://www.genecards.org/cgi-bin/carddisp.pl?gene="+d.gene, "_blank"); });

  }
  function mouseout(d) {
  }

});
