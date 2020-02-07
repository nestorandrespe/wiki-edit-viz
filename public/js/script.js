// $.ajax({
//     dataType: "json",
//     url: '/json',
//     success: function (data) {
//         plotearDatos(data);
//     }
// });

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const slug = urlParams.get('slug');

const user_url = 'https://es.wikipedia.org/wiki/Usuario:';

d3.json('../data/' + slug + ".json").then(data => {
    plotearDatos(data);
});

function plotearDatos(data) {
$("#msg").html(
    "Existen " +
    data.length +
    " revisiones al artículo de Wikipedia sobre <i>" + slug.replace(/_/g, ' ') + "</i>."
);

let min = data[0].size,
    max = 0;

for (var i = 0; i < data.length; i++) {
    if (data[i].size < min) min = data[i].size;
    if (data[i].size > max) max = data[i].size;
}

const svg = d3.select("#canvas");

var date = new Date(data[0].timestamp);

let minTime = Math.round(date.getTime() / 1000);
date = new Date(data[data.length - 1].timestamp);
let maxTime = Math.round(date.getTime() / 1000);

let difTime = maxTime - minTime;

var locale = d3.timeFormatLocale({
    dateTime: "%A, %e %B %Y г. %X",
    date: "%d.%m.%Y",
    time: "%H:%M:%S",
    periods: ["AM", "PM"],
    days: [
    "воскресенье",
    "понедельник",
    "вторник",
    "среда",
    "четверг",
    "пятница",
    "суббота"
    ],
    shortDays: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
    months: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
    ],
    shortMonths: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic"
    ]
});

var formatMillisecond = locale.format(".%L"),
    formatSecond = locale.format(":%S"),
    formatMinute = locale.format("%I:%M"),
    formatHour = locale.format("%I %p"),
    formatDay = locale.format("%a %d"),
    formatWeek = locale.format("%b %d"),
    formatMonth = locale.format("%B"),
    formatYear = locale.format("%Y");

function multiFormat(date) {
    return (d3.timeSecond(date) < date
    ? formatMillisecond
    : d3.timeMinute(date) < date
    ? formatSecond
    : d3.timeHour(date) < date
    ? formatMinute
    : d3.timeDay(date) < date
    ? formatHour
    : d3.timeMonth(date) < date
    ? d3.timeWeek(date) < date
        ? formatDay
        : formatWeek
    : d3.timeYear(date) < date
    ? formatMonth
    : formatYear)(date);
}

let xScale = d3
    .scaleTime()
    .domain([
    new Date(data[0].timestamp),
    new Date(data[data.length - 1].timestamp)
    ])
    .range([0, 1900]);

let yScale = d3
    .scaleTime()
    .domain([min, max])
    .range([1000, 0]);

let colorScale = d3
    .scaleQuantize()
    .domain([-100, 100])
    .range(["#ee5555", "#dddddd", "#32bb32"]);

var x_axis = d3
    .axisBottom(xScale)
    .ticks(20)
    .tickSize(-1000)
    .tickFormat(multiFormat);

var zoom = d3
    .zoom()
    .scaleExtent([1, 5])
    .translateExtent([[0, 0], [1900 + 90, 1000 + 100]])
    .on("zoom", zoomed);

var xline = svg
    .append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0,1000)")
    .call(x_axis);

var simulation;

var rev;
var time = 0;

function ticked() {
    for (let i = 0; i < 300; i++) {
    simulation.tick();
    }

    rev.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
    });
}

simulation = d3
    .forceSimulation(data)
    .force("collide", d3.forceCollide(4))
    .force(
    "y",
    d3.forceY(d => {
        return yScale(d.size);
    })
    )
    .force(
    "x",
    d3.forceX(d => {
        var date = new Date(d.timestamp);

        return xScale(date);
    })
    )
    .on("tick", ticked)
    .velocityDecay(0.3);

var nodos = svg.append("g").attr("class", "nodos");

rev = nodos
    .selectAll(".nodo")
    .data(data)
    .join("g")
    .attr("class", "nodo");

var prevSize = data[0].size;
var prevSize_2 = data[0].size;

var meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Aril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

rev
    .append("circle")
    .attr("r", 3)
    .attr("fill", d => {
    var size = d.size;
    var dif = size - prevSize;

    var por = (dif * 100) / prevSize;
    prevSize = size;

    return colorScale(por);
    })
    .attr("id", d => {
    return d.revid;
    })
    .attr("mydata:usuario", d => {
    var resp = d.user;
    return resp;
    })
    .attr("mydata:date", d => {
    var date = new Date(d.timestamp);
    var resp =
        date.getDay() +
        1 +
        " " +
        meses[date.getMonth()] +
        " de " +
        date.getFullYear();
    return resp;
    })
    .attr("mydata:por", d => {
    var size = d.size;
    var dif = size - prevSize_2;

    var por = (dif * 100) / prevSize_2;
    prevSize_2 = size;

    return parseFloat(por).toFixed(2);
    })
    .attr("mydata:anterior", (d, i) => {
    var resp = null;
    if (i > 0) resp = data[i - 1].revid;
    return resp;
    })
    .attr("mydata:siguiente", (d, i) => {
    var resp = null;
    if (i < data.length - 1) resp = data[i + 1].revid;
    return resp;
    });

svg.call(zoom);

function zoomed() {
    nodos.attr("transform", d3.event.transform);
    xline.call(x_axis.scale(d3.event.transform.rescaleX(xScale)));
}

$(".nodo circle").on("click", e => {
    $item = $(e.target);
    $(".nodo circle.active").removeClass("active");
    $item.addClass("active");
    usuario = $item.attr("usuario");
    $userlink = $('<a></a>');
    $userlink.attr('href', user_url + usuario);
    $userlink.html(usuario);
    fecha = $item.attr("date");
    por = $item.attr("por");

    $por = $("<div style='color:" + colorScale(por) + "' ></div>");
    $por.html(por + "%");

    anterior = $item.attr("anterior");
    siguiente = $item.attr("siguiente");
    $(".info .usuario span").empty().append($userlink);
    $(".info .fecha span").html(fecha);
    $(".info .por span").html($por);
    $(".info .anterior a").html(anterior);
    $(".info .siguiente a").html(siguiente);
});

$(".info .siguiente a, .info .anterior a").on("click", e => {
    $item = $(e.target);
    var id = $item.text();
    $("#" + id).click();
});
}