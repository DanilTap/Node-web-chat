const socket = io.connect("https://object-node.herokuapp.com/");

socket.on("connect", () => {
    console.log("Connected!");
});


// Create matrix
function createMatrix(){
	for (var i = 0; i < 1024; i++){
		var div = document.getElementById("blocks_wrapper");
		var block = document.createElement('div');
		block.innerHTML = ".";
		block.className = "color_block";
		block.id = `block${i}`;
		block.setAttribute('onclick', `matrix.selectPixel('block${i}')`);
		block.setAttribute('onmousedown-mousemove', `matrix.selectPixel('block${i}')`);
		div.appendChild(block);

		if (i == 31 || i == 63 || i == 95 || i == 127 || i == 159 || i == 191 || i == 223 || i == 255 || i == 287 || i == 319 || i == 351 || i == 383 || i == 415 || i == 447 || i == 479 || i == 511 || i == 543 || i == 575 || i == 607 || i == 639 || i == 671 || i == 703 || i == 735 || i == 767 || i == 799 || i == 831 || i == 863 || i == 895 || i == 927 || i == 959 || i == 991){
			var br = document.createElement('br');
			div.appendChild(br);
		};
	};
}


var matrix = new Object();
var matrix = {
	fnc: 0,
	action_pixs: [],
	show_grid: false,
	show_border: false,

	selectPixel: function(pix){
		var elem_pix = document.getElementById(pix);
		pix_stats = this.action_pixs.includes(pix);
		if (pix_stats == false){
			this.action_pixs.push(pix);
			socket.emit("select_pix", {type: "select", list: this.action_pixs, id: elem_pix.id});

		} else if (pix_stats == true){
			var el_index = this.action_pixs.indexOf(pix);
			this.action_pixs.splice(el_index, 1);

			socket.emit("select_pix", {type: "unselect", list: this.action_pixs, id: elem_pix.id});
		};
	},

	clearAll: function(){
		clearInterval(this.fnc);
		var all_blocks = document.querySelectorAll(`.color_block`);
		for (var elem of all_blocks) {
			elem.style.background = 'white';
			elem.style.color = 'white';
			this.action_pixs.length = 0;
		}
	},

	selectAll: function(ms){
		clearInterval(this.fnc);
		var number = 0;
		this.fnc = setInterval(() => {
			if (number == 1024){
				clearInterval(fnc);
			}

			var pixel = document.getElementById(`block${number}`);
			pixel.style.background = 'orange';
			pixel.style.color = 'orange';
			number++;
			this.action_pixs.push(pixel.id);
		}, ms);
	},

	selectSnake: function(lenght, ms){
		var number = 0;
		this.fnc = setInterval(() => {
			if (number == 1024){
				this.clearAll();
				clearInterval(fnc);

			} else {

				if (number >= lenght) {
					var del_pixel = document.getElementById(`block${number - lenght}`);
					del_pixel.style.background = 'white';
					del_pixel.style.color = 'white';
				}

				var pixel = document.getElementById(`block${number}`);
				pixel.style.background = 'orange';
				pixel.style.color = 'orange';
				number++;
			}

		}, ms);
	}
};
createMatrix();

// Sockets
socket.on("matrix_new", (data) => {
	matrix.action_pixs = data.list;

	for (var i = 0; i <= matrix.action_pixs.length; i++){
		try{
			var pixel = document.getElementById(matrix.action_pixs[i]);
			pixel.style.background = 'orange';
			pixel.style.color = 'orange';
		} catch {
			break;
		};
	};
});

socket.on("back_select_pixel", (data) => {
	var elem_pix = document.getElementById(data.id);
	if (data.type == "select"){
		elem_pix.style.background = "orange";
		elem_pix.style.color = "orange";

		matrix.action_pixs = data.list;

	} else if (data.type == "unselect"){
		elem_pix.style.background = "white";
		elem_pix.style.color = "white";

		matrix.action_pixs = data.list;
	};
});


// Front
function selectSnake(){
	var lenght = document.getElementById('snake_input');
	var len = lenght.value;

	matrix.selectSnake(len, 50);
};

function selectGrid(){
	var all_blocks = document.querySelectorAll(`.color_block`);

	if (matrix.show_grid == false){
		for (var elem of all_blocks) {
			elem.style.border = '0';
			matrix.show_grid = true;
		};

	} else if (matrix.show_grid == true){
		for (var elem of all_blocks) {
			elem.style.border = '1px solid black';
			matrix.show_grid = false;
		};
	};	
}

function selectBorder(){
	var all_blocks = document.querySelectorAll(`.color_block`);

	if (matrix.show_border == false){
		for (var elem of all_blocks) {
			elem.style.borderRadius = '0';
			matrix.show_border = true;
		};

	} else if (matrix.show_border == true){
		for (var elem of all_blocks) {
			elem.style.borderRadius = '7px';
			matrix.show_border = false;
		};
	};	
}
