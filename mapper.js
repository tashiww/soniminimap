const MapNames = {
	kronos: 'w1r03',
	ares: 'w2r01',
	chaos: 'w3r01',
	rhea: 'w1r05',
	ouranos: 'w1r04',
};

const origins = {
	w1r03: {
		origin: [1105, 2861],
		scale_factor: 1.433
	},
	w2r01: {
		origin: [2223, 2122],
		scale_factor: 1.2573
	},
	w3r01: {
		origin: [2040, 2045],
		scale_factor: 1.007
	},
	w1r05: {
		origin: [2029, 1661],
		scale_factor: 1.0796
	},
	w1r04: {
		origin: [2040, 706],
		scale_factor: 0.9761
	},
};

const searchParams = new URLSearchParams(window.location.search);
const selected_map = MapNames[searchParams.get('map')] ?? 'w1r03';


function loadMap(stage_name) {

	const searchParams = new URLSearchParams(window.location.search);
	searchParams.set('map', Object.keys(MapNames).find(key => MapNames[key] === stage_name));
	var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
	history.pushState(null, '', newRelativePathQuery);
	document.getElementById('map').style.backgroundImage = 'url(./base_img/' + stage_name + '.webp)';
	updateOrigins(stage_name);
}

function updateOrigins(stage_name) {
	myChart.config.options.scales.x.min = -origins[stage_name].origin[0];
	myChart.config.options.scales.x.max = 4096 - origins[stage_name].origin[0];
	myChart.config.options.scales.y.min = -origins[stage_name].origin[1];
	myChart.config.options.scales.y.max = 4096 - origins[stage_name].origin[1];
	myChart.update('quiet');

}
const data = {
	datasets: [{
		label: 'Scatter Dataset',
		data: [],
		backgroundColor: function (context) {
			var index = context.dataIndex;
			var value = context.dataset.data[index];
			const intensity = value?.z / 1500 * 255
			return 'rgba(' + 1 * intensity + ', 100, 100, 1)';
		}
	}],
};

const config = {
	type: 'scatter',
	data: data,
	options: {
		responsive: false,
		showLine: true,
		backgroundColor: 'rgba(0, 0, 0, .5)',
		borderColor: 'rgba(255, 255, 255, 0.5)',
		plugins: {
			tooltip: {
				callbacks: {
					label: function(tooltipItem) {
						const {x, y, z} = tooltipItem.raw;
						return 'X: ' + x + ', Y:' + y + ', Z:' + z;
					}
				 }			
				},
			legend: {
				display: false,
			},
		},
		animation: false,
		scales: {
			x: {
				type: 'linear',
				position: 'bottom',
				min: -origins[selected_map].origin[0],
				max: 4096 - origins[selected_map].origin[0],

				display: false,
			},
			y: {
				display: false,
				min: -origins[selected_map].origin[1],
				max: 4096 - origins[selected_map].origin[1],
			}
		}
	}
};
const ctx = document.getElementById('map');
myChart = new Chart(ctx, config);

const coordinate_form = document.querySelector(".coordinate_input form");
coordinate_form.addEventListener("submit", coordinate_form_submit, false);

const clear_button = document.getElementById('clear_button');
clear_button.addEventListener("click", clearPoints, false);

function clearPoints() {
	myChart.data.datasets[0].data = [];
	myChart.update('quiet');
}
function coordinate_form_submit(event) {
	event.preventDefault();

	coordinates_string = document.getElementById('coordinates').value
	coordinates = coordinates_string.split('\n');
	coordinates.forEach((row) => {
		const values = row.split(',');
		// sonic frontiers treats y as height dimension, 
		//but for chart.js i'm swapping y and z (using z as height dimension)
		const [x, y, z] = [values[0], values[2], values[1]]
		myChart.data.datasets[0].data.push({ x: x, y: -1 * y, z: z });
	});
	myChart.update('quiet');
}

loadMap(selected_map);