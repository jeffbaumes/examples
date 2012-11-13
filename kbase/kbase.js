var w = 600,
    h = 600;
var nodes = [];
var links = [];
var node;
var link;
var snode;
var color = d3.scale.category20();
var modelColor = d3.scale.linear().domain([0, 0.5, 1]).range(['red', 'grey', 'green']);
var species;
var groupBy = "phylum";
var colorBy = "group";
var pcent = d3.format("2%");

d3.select("body").append("p").text("Group by ").append("select")
    .on("change", function(d) { groupBy = this.value; update(); })
  .selectAll("option")
    .data(["phylum", "order", "family", "genus", "species"])
  .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });

d3.select("body").append("p").text("Color by ").append("select")
    .on("change", function(d) { colorBy = this.value; updateColor(); })
  .selectAll("option")
    .data(["group", "model completeness"])
  .enter().append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });

var row = d3.select("body").append("p").append("table").append("tr");
row.append("td").append("h2").text("Spatial Map");
row.append("td").append("h2").text("Pseudo-spatial Map");
row2 = d3.select("table").append("tr");
var svis = row2.append("td").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

var vis = row2.append("td").append("svg:svg")
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
  vis.selectAll("line.link").remove();
  svis.selectAll("circle.node").remove();

  nodes = [];
  links = [];
  var groups = {};
  var groupIndex = {};
  var groupCount = 0;
  species.forEach(function(d) {
    d.abundance = +d.abundance;
    var group = d[groupBy];
    if (!groups[group]) {
      var g = {species: d.species, family: d.family, order: d.order, phylum: d.phylum, genus: d.genus, model: Math.random()};
      groups[group] = g;
      nodes.push(g);
      groupIndex[group] = groupCount;
      ++groupCount;
    }
    var c = groups[group];
    for (var i = 0; i < d.abundance/10000; ++i) {
      var n = {species: d.species, family: d.family, order: d.order, phylum: d.phylum, genus: d.genus, model: c.model};
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
      .style("fill", function(d) { return colorBy == "group" ? color(d[groupBy]) : modelColor(d.model); })
      .on("mouseover", updateHover)
      .on("mouseout", resetHover)
      .call(force.drag);
  node.append("title")
      .text(function(d) { return d[groupBy] + "\n" + pcent(d.model) + " modeled"; });

  // Update the nodes…
  snode = svis.selectAll("circle.node")
      .data(nodes);
  // Enter any new nodes.
  snode.enter().append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return Math.random()*(w-40) + 20; })
      .attr("cy", function(d) { return (groupIndex[d[groupBy]]/groupCount)*(h-200) + Math.random()*100 + 100; })
      .attr("r", function(d) { return 20; })
      .attr("title", "hi")
      .style("fill-opacity", function(d) { return 0.8; })
      .style("fill", function(d) { return colorBy == "group" ? color(d[groupBy]) : modelColor(d.model); })
      .on("mouseover", updateHover)
      .on("mouseout", resetHover);
  snode.append("title")
      .text(function(d) { return d[groupBy] + "\n" + pcent(d.model) + " modeled"; });
}

function updateHover(d) {
  node.transition().style("fill-opacity", function(dd) { return d[groupBy] === dd[groupBy] ? 0.9 : 0.2; });
  snode.transition().style("fill-opacity", function(dd) { return d[groupBy] === dd[groupBy] ? 0.9 : 0.2; });
}

function resetHover(d) {
  node.transition().style("fill-opacity", 0.9);
  snode.transition().style("fill-opacity", 0.9);
}

function updateColor() {
  node.style("fill", function(d) { return colorBy == "group" ? color(d[groupBy]) : modelColor(d.model); })
  snode.style("fill", function(d) { return colorBy == "group" ? color(d[groupBy]) : modelColor(d.model); })
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}
