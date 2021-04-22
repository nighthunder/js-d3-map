// https://observablehq.com/@d3/zoom-to-bounding-box@160
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["states-albers-10m.json",new URL("./files/outro.json",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
//   main.variable(observer()).define(["md"], function(md){return(
// md`# Zoom to Bounding Box

// Pan and zoom, or click to zoom into a particular state using [*zoom*.transform](https://github.com/d3/d3-zoom/blob/master/README.md#zoom_transform) transitions. The bounding box is computed using [*path*.bounds](https://github.com/d3/d3-geo/blob/master/README.md#path_bounds).`
// )});
  main.variable(observer("chart")).define("chart", ["d3","topojson","us","path"], function(d3,topojson,us,path)
{
  // console.log("d3,topojson,us,path", d3,"---------------------",topojson,"---------------------",us,"---------------------",path);
  const width = 875;
  const height = 500;

  const zoom = d3.zoom()
      // .scaleExtent([1, 3])
      .on("zoom", zoomed);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .on("click", reset);

  const g = svg.append("g");

  const states = g.append("g")
      .attr("fill", "#444")
      .attr("cursor", "pointer")
    .selectAll("path")
    .data(function(){
      // console.log("topojson.feature(us, us.objects.states).features", topojson.feature(us, us.objects.UFEBRASIL).features);
      return topojson.feature(us, us.objects.UFEBRASIL).features;
    })
    .join("path")
      .on("click", clicked)
      .attr("d", path);
  
  states.append("title")
      .text(function(d){
        console.log("d.properties.NM_MUN", d.properties.NM_ESTADO);
        return d.properties.NM_ESTADO;

      })

  g.append("path")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path(topojson.mesh(us, us.objects.UFEBRASIL, (a, b) => a !== b)));

  svg.call(zoom);

  function reset() {
    states.transition().style("fill", null);
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
    );
  }

  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();
    states.transition().style("fill", null);
    d3.select(this).transition().style("fill", "red");
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.pointer(event, svg.node())
    );
  }

  function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }

  return svg.node();
}
);
//   main.variable(observer()).define(["md"], function(md){return(
// md`## Annex

// Thanks to [John Guerra](/@john-guerra) for suggestions.`
// )});
  main.variable().define("path", ["d3"], function(d3){
    var projection = d3.geoIdentity()
      .reflectY(true)

    return(d3.geoPath().projection(projection)
)});
  main.variable().define("us", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("states-albers-10m.json").json()
)});
  main.variable().define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable().define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
