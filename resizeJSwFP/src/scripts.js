// DOM load
document.addEventListener('DOMContentLoaded', (event) => {

	// Elements
	const imagesDiv = document.querySelector("#images");
	const imageResizedContainer = document.getElementById("imageResizedContainer");
	const imagePrevContainer = document.getElementById("imagePrevContainer");
	const downloadContainer = document.getElementById("downloadContainer");
	const inputSlider = document.getElementById("range");
	const inputWidth = document.getElementById("width");
	const inputHeight = document.getElementById("height");
	const updateButton = document.getElementById("updateButton");
	const updateCheckbox = document.getElementById("updateCheckbox");


	// Variables
	var imageList = [];
	var inputType = "s";
	var resizingFactor = 0.5;
	var resizingWidth = 0;
	var resizingHeight = 0;
	var autoUpdate = false;

	// Image Class Constructor
	class imageData {
		constructor(name, url, size_old, id_img_old, ext_old, id_img_new, id_btn, id_file) {
			this.valid = true;
			this.name = name;
			this.url = url;
			this.id_img_old = id_img_old;
			this.id_img_new = id_img_new;
			this.ext_old = ext_old;
			this.id_btn = id_btn;
			this.id_file = id_file;
			this.size_old = size_old;
		}
	}
	saveImageData = function (name, url, size, ext, id_file) {
		// Save image data into the list, 
		// saveImageData("Name", "Url");

		// Get current ID
		id = imageList.length;

		// Assign data
		var new_image = new imageData();
		new_image.name = name;
		new_image.url = url;
		new_image.id_file = id_file;
		new_image.ext_old = ext;
		new_image.id_img_old = "img_prev_" + id;
		new_image.id_img_new = "img_res_" + id;
		new_image.id_btn = "download_" + id;
		new_image.size_old = size;

		// Push data
		imageList.push(new_image);
		//console.log("New image added to list", id);

		return id;
	}
	removeImageData = function (id_file) {
		for (var id in imageList) {
			if (imageList[id].id_file == id_file) {
				imageList[id].valid = false;
				document.getElementById(imageList[id].id_img_old).remove();
				document.getElementById(imageList[id].id_img_new).remove();
				document.getElementById(imageList[id].id_btn).remove();
				return;
			}
		}
		console.error("Trying to remove a not found image.");
	}

	// Listeners and global functions
	addDownloadButton = function (id) {
		// Add button variable
		let new_button = document.createElement("button");
		new_button.id = imageList[id].id_btn;
		new_button.innerHTML = "Download image " + imageList[id].id_img + " - " + imageList[id].name;

		// Add listener
		new_button.onclick = function () {
			//filename = "freeimageresizer_" + resizingWidth + "x" + resizingHeight + "_" + imageList[id].name;
			filename = "freeimageresizer_" + imageList[id].name;
			let url = imageList[id].url;
			var element = document.createElement('a');
			element.setAttribute('href', url);
			element.setAttribute('download', filename);
			document.body.appendChild(element);
			element.click();
			//console.log("Downloaded: ", new_button.id);
		}

		// Append element to DOM
		downloadContainer.appendChild(new_button);
	}
	addResizedImageToDOM = function (fileItem, id) {
		// Add image to DOM
		var new_img = document.createElement("img");
		new_img.id = "img_res_" + id;
		new_img.src = URL.createObjectURL(fileItem.file);
		imageResizedContainer.appendChild(new_img);
	}
	addPrevImageToDOM = function (fileItem, id) {
		// Add image to DOM
		var new_img = document.createElement("img");
		new_img.id = "img_prev_" + id;
		new_img.src = URL.createObjectURL(fileItem.file);
		imagePrevContainer.appendChild(new_img);
	}
	clearValues = function () {
		// Clear fixed width and height input and slider input
		resizingFactor = 0.5;
		resizingWidth = 0;
		resizingHeight = 0;
		inputSlider.value = 50;
		inputWidth.value = "";
		inputHeight.value = "";
		inputType = "s";
	}
	displayState = function (show) {
		if (show) {
			// Show image
			imagesDiv.style.visibility = "visible";
			downloadContainer.style.visibility = "visible";
		}
		else {
			// Go to original state
			imagesDiv.style.visibility = "hidden";
			downloadContainer.style.visibility = "hidden";
			clearValues();
		}
	}
	displayState(false);
	updateCheckbox.onclick = function () {
		if (this.checked) {
			autoUpdate = true;
			updateButton.disabled = true;
			updateImagesResize();
		}
		else {
			autoUpdate = false;
			updateButton.disabled = false;
		}
	}
	updateButton.onclick = function () {
		// Resize all images when update button is clicked
		updateImagesResize();
	}
	inputSlider.oninput = function () {
		// Update values
		let i = this.value;
		clearValues();
		this.value = i;
		resizingFactor = i / 100;
		inputType = "s";

		// Resize images update
		if (updateCheckbox.checked) { updateImagesResize() };
	};
	inputWidth.onchange = function () {
		// Update values
		let i = this.value;
		clearValues();
		this.value = i;
		resizingWidth = parseInt(i);
		inputType = "w";

		// Resize images update
		if (updateCheckbox.checked) { updateImagesResize() };
	};
	inputHeight.onchange = function () {
		// Update values
		let i = this.value;
		clearValues();
		this.value = i;
		resizingHeight = parseInt(i);
		inputType = "h";

		// Resize images update
		if (updateCheckbox.checked) { updateImagesResize() };
	};


	// --------------------------------------------------- //
	// Resizer caller
	resizeImage = function (id) {
		console.log("Resize call--", id, resizingFactor);
		// Assign img to variable
		let img_old = document.getElementById(imageList[id].id_img_old);
		let img_new = document.getElementById(imageList[id].id_img_new);
		let canvas;

		// Select resizing method and Call the resizer
		if (inputType == "s") {
			canvas = downScaleImage(img_old, resizingFactor);
		}
		else if (inputType == "w") {
			canvas = downScaleImage(img_old, undefined, resizingWidth);
		}
		else if (inputType == "h") {
			let scale = resizingHeight / img_old.height;
			resizingWidth = Math.ceil(img_old.width * scale);
			canvas = downScaleImage(img_old, undefined, resizingWidth);
		}

		// Assign the image
		let type = "image/" + imageList[id].ext_old;
		img_new.src = canvas.toDataURL(type);
		imageList[id].url = img_new.src;

		// Ensure new resizer call when is loaded
		img_old.onload = function () { updateImagesResize(); };
	};
	updateImagesResize = function () {
		for (let i in imageList) {
			if (imageList[i].valid == true) {
				let id = parseInt(i);
				resizeImage(id);
			}
		}
	}


	// --------------------------------------------------- //
	// FilePond caller

	// Register the plugin
	FilePond.registerPlugin(FilePondPluginImageResize, FilePondPluginImagePreview);

	// Get a file input reference
	const input = document.querySelector('input[type="file"]');

	// const pond = FilePond.create(input);
	const pond = FilePond.create(input, {
		// CONFIG ------------
		// Only accept images
		acceptedFileTypes: ['image/*'],

		// FUNCTIONS ------------
		// Call back when image is added
		onaddfile: (err, fileItem) => {
			console.log("FP Add File Function called");

			// Assign image to list
			id = saveImageData(fileItem.file.name, URL.createObjectURL(fileItem.file), fileItem.fileSize, fileItem.fileExtension, fileItem.id);

			// Add previous images to DOM
			addPrevImageToDOM(fileItem, id);
			addResizedImageToDOM(fileItem, id);

			// Resize image and add to the list
			if (autoUpdate) { resizeImage(id); }

			// Add download button
			addDownloadButton(id);

			// Update show status
			displayState(true);
		},
		// File has been removed
		onremovefile: function (error, fileItem) {
			console.log("FP Remove File Function called");

			// Remove item from list and remove download button
			removeImageData(fileItem.id);

			// Update show status
			let off = true;
			for (let i in imageList) { if (imageList[i].valid == true) { off = false; } }
			if (off) { displayState(false) }
		},
	});


	// DOM info
	console.log('DOM fully loaded and parsed');
});


