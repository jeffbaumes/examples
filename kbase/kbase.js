var w = 800,
    h = 800;
var nodes = [];
var links = [];
var node;
var link;
var color = d3.scale.category20();
var species;
var groupBy = "phylum";


var s = d3.select("body").append("div").append("select")
    .on("change", function(d) { groupBy = this.value; update(); })
  .selectAll("option")
    .data(["phylum", "order", "family", "genus", "species"])
  .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });
var svis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

var vis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

d3.tsv("../resources/data/species.tsv", function(data) {
  species = data;
  update();
});

function update() {
  var force = d3.layout.force()
      .on("tick", tick)
      .charge(function(d) { return d._children ? -d.size / 100 : -30; })
      .linkDistance(function(d) { return d.target._children ? 80 : 30; })
      .size([w, h]);

  vis.selectAll("circle.node").remove();
  svis.selectAll("line.link").remove();
  nodes = [];
  links = [];
  var groups = {};
  species.forEach(function(d) {
    d.abundance = +d.abundance;
    var group = d[groupBy];
    if (!groups[group]) {
      var g = {species: d.species, family: d.family, order: d.order, phylum: d.phylum, genus: d.genus};
      groups[group] = g;
      nodes.push(g);
    }
    var c = groups[group];
    for (var i = 0; i < d.abundance/10000 + 1; ++i) {
      var n = {species: d.species, family: d.family, order: d.order, phylum: d.phylum, genus: d.genus};
      nodes.push(n);
      links.push({source: c, target: n});
    }
  });

  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .linkStrength(0.2)
      .linkDistance(5)
      .charge(-30)
      .start();

  // Update the links…
  link = vis.selectAll("line.link")
      .data(links);

  // Enter any new links.
  link.enter().insert("svg:line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  // Update the nodes…
  node = vis.selectAll("circle.node")
      .data(nodes);
  // Enter any new nodes.
  node.enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .attr("r", function(d) { return 20; })
      .style("fill-opacity", function(d) { return 0.8; })
      .style("fill", function(d) { return color(d[groupBy]); })
      .call(force.drag);
  node.append("title")
      .text(function(d) { return d[groupBy]; });

  // Update the nodes…
  snode = svis.selectAll("circle.node")
      .data(nodes);
  // Enter any new nodes.
  snode.enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return Math.random()*(w-40) + 20; })
      .attr("cy", function(d) { return Math.random()*(h-40) + 20; })
      .attr("r", function(d) { return 20; })
      .attr("title", "hi")
      .style("fill-opacity", function(d) { return 0.8; })
      .style("fill", function(d) { return color(d[groupBy]); });
  snode.append("title")
      .text(function(d) { return d[groupBy]; });
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}
