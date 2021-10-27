/* ADDITIONAL FUNCTIONS FOR CHART */

// Function to position labels without overlap
function position(d) {
    const t = d3.select(this);
    switch (d.side) {
        case "top":
            t.attr("text-anchor", "middle").attr("dy", "-0.7em");
            break;
        case "right":
            t.attr("dx", "0.5em")
            .attr("dy", "0.32em")
            .attr("text-anchor", "start");
            break;
        case "bottom":
            t.attr("text-anchor", "middle").attr("dy", "1.4em");
            break;
        case "left":
            t.attr("dx", "-0.5em")
            .attr("dy", "0.32em")
            .attr("text-anchor", "end");
            break;
    }
}

// Function to add white glows to labels
function halo(text) {
    text
      .select(function() {
        return this.parentNode.insertBefore(this.cloneNode(true), this);
      })
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 4)
      .attr("stroke-linejoin", "round");
}

/* CREATING THE SCATTERPLOT */

// Apply the margin convention
const margin = {top:50, left:50, right:50, bottom:50};
const width = 850 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

d3.csv('driving.csv', d3.autoType).then(data => {

    // Creat an SVG element
    let svg = d3.selectAll('.chart')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create x and y scales
    // Use nice() to have paddings at the ends of a domain
    let xScale = d3.scaleLinear()
		.domain(d3.extent(data, d => d.miles))
		.nice()
		.range([0, width])
	
	let yScale = d3.scaleLinear()
		.domain(d3.extent(data, d => d.gas))
		.nice()
		.range([height, 0])

    // Generate axes
    // Create proper formating for ticks on the y-axis
    let xAxis = d3.axisBottom()
		.scale(xScale)

    svg.append('g')
		.attr('class', 'axis x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(xAxis)
        // remove the domain line
		.call(g => g.select('.domain').remove())
        // add grid lines
		.selectAll('.tick line')
		.clone()
		.attr('y1', -height)
		.attr('y2', 0)
		.attr('stroke-opacity', 0.1)

	let yAxis = d3.axisLeft()
		.scale(yScale)
		.ticks(null, '$.2f')

    svg.append('g')
		.attr('class', 'axis y-axis')
		.call(yAxis)
        // remove the domain line
		.call(g => g.select('.domain').remove())
        // add grid lines
		.selectAll('.tick line')
		.clone()
		.attr('x2', width)
		.attr('stroke-opacity', 0.1)

    // Add labels for axes
    //x axis
    svg.append('text')
		.attr('x', width + 8)
		.attr('y', height + 37)
		.attr('text-anchor', 'end')
		.attr('font-size', 14)
        .attr('font-weight', 700)
		.text('Miles driven per person')
        .call(halo)

    // y axis
    svg.append('text')
		.attr('x', -36)
		.attr('y', -18)
		.attr('text-anchor', 'start')
		.attr('font-size', 14)
        .attr('font-weight', 700)
		.text('Cost per gallon')
        .call(halo)

    // Connecting the dots
    // Generate a line
    const line = d3.line()
		.curve(d3.curveCatmullRom)
		.x(d => xScale(d.miles))
		.y(d => yScale(d.gas))

    function length(path) {
        return d3.create('svg:path').attr('d', path).node().getTotalLength()
    }
            
    let l = length(line(data))

    // Create a path
    const path = svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .attr("d", line)
        .attr("stroke-dasharray", `0,${l}`)

    // Add circles for the data points
    svg.selectAll('circle')
		.data(data)
		.join('circle')
		.attr('class', 'circles')
		.attr('cx', d => xScale(d.miles))
		.attr('cy', d => yScale(d.gas))
		.attr('r', 4)
		.attr('stroke', 'black')
		.attr('fill', 'white')
        
    // Generate labels for data points
    let labels = svg.append("g")
        //.attr("class", "labels")
        .selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr('x', d => xScale(d.miles))
        .attr('y', d => yScale(d.gas))
        .text(d => d.year)
        .attr('font-size', 10)
        .attr('font-family', 'sans-serif')
        .each(position)
        .attr('fill', 'none')
        .call(halo);
    
    // Animate function
    function animate() {
        path.attr("stroke-dasharray", `0,${l}`);
        
        path.transition()
            .duration(5000)
            .ease(d3.easeLinear)
            .attr("stroke-dasharray", `${l},${l}`);
        
        labels.attr("fill", "none");

        labels.transition()
            .delay((d, i) => length(line(data.slice(0, i + 1))) / l * (5000))
            .attr("fill", 'black'); 
    }

    animate();
})
