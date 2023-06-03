"use strict";

/* ===== VARIABLES ========================================= */

/* User settings */
var orientationLandscape = true;
var inkColorsObj = { '#0078bf': 'Blue', '#00838a': 'Teal', '#765ba7': 'Purple', '#f15060': 'BrightRed', '#ffb511': 'Sunflower', '#000': 'Black' };

/* Don't mess with these */
var screens = {}; // ink screened canvases are stored here
var secrets = {}; // original file canvases are stored here
var orientationLandscape = true;
var proofInitialized = false;
var activeFiles = 0;
var activeLayers = 1;
var inkSelections = {};
var fileDimensions = []

/* Auto-generated */
var availableInks = Object.keys(inkColorsObj).length;
var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent &&
               navigator.userAgent.indexOf('CriOS') == -1 &&
               navigator.userAgent.indexOf('FxiOS') == -1;

/* ===== INIT ========================================= */
initializeCanvases();

const canvas = document.getElementById("proof-canvas");
const ctx = canvas.getContext("2d");

renderProof();

/* ========= BASIC FUNCTIONS =================== */
function referenceOriginal(layerId) {
  let refrerenceCanvas = secrets[layerId];
  let referenceCtx = refrerenceCanvas.getContext("2d");
  let targetCanvas = screens[layerId];
  let targetCtx = targetCanvas.getContext("2d");
  targetCtx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetCtx.globalCompositeOperation = "source-over";
  targetCtx.drawImage(refrerenceCanvas, 0,0);
}

function screenToInkColor(layerId, color) {
  if (secrets[layerId]) {
    let activeCanvas = screens[layerId];
    let activeCtx = activeCanvas.getContext("2d");
    // refresh canvas with original image data
    referenceOriginal(layerId);
    // set composite mode
    activeCtx.globalCompositeOperation = "screen";
    // create a full canvas rectangle to screen the image
    activeCtx.fillStyle = color;
    activeCtx.fillRect(0, 0, activeCanvas.width, activeCanvas.height);
    // Reset composite mode
    activeCtx.globalCompositeOperation = "source-over";
    screens[layerId] = activeCanvas;
  } else {
    console.log("Err: Cannot screen - No file initialized for layer " + layerId +" yet.")
  }
}

function loadImage() {
    var input, file, fr, img, fileName, layerId;

    if (typeof window.FileReader !== 'function') {
        new Toast({message: "The file API isn't supported on this browser yet.",
        type: 'danger'});
        return;
    }
    fileName = this.id;
    layerId = fileName.replace('file_id-','');
    if (!this) {
        new Toast({message: "Oops, couldn't find the imgfile element. Refresh page and try again.",
        type: 'danger'});
    }
    else if (!this.files) {
      new Toast({message: "This browser doesn't seem to support the 'files' property of file inputs.",
      type: 'danger'});
    }
    else if (this.files[0].type === 'application/pdf') {
      new Toast({message: "PDF files are not supported yet. Please upload a JPG or PNG.",
      type: 'danger'});
    }
    else {
        file = this.files[0];

        // Check file size - reject if too large
        if(this.files[0].size > 15000000){
          new Toast({message: "Failed to preview layer. That file is too large! Keep each image 15 MB or less.",
          type: 'danger'});
        }
        else {
          fr = new FileReader();
          fr.onload = createImage;
          fr.readAsDataURL(file);
        }
    }

    function createImage() {
        img = new Image();
        img.onload = imageLoaded;
        img.src = fr.result;
    }

    function imageLoaded() {
        /* Render to invisible canvas in "Screens" which will be screened */
        let activeCanvas = document.createElement('canvas');
        let activeCtx = activeCanvas.getContext("2d");
        activeCanvas.width = img.width;
        activeCanvas.height = img.height;
        screens[layerId] = activeCanvas;

        /* Render to invisible canvas in "Secrets", to back-up the image data */
        let secretCanvas = document.createElement('canvas');
        let ctxSecret = secretCanvas.getContext("2d");
        secretCanvas.width = img.width;
        secretCanvas.height = img.height;
        ctxSecret.filter = 'grayscale(1)';
        ctxSecret.drawImage(img,0,0);
        secrets[layerId] = secretCanvas;
        // alert(activeCanvas.toDataURL("image/png"));

        /* Update the file count based on number of secret canvases */
        activeFiles = Object.keys(secrets).length

        // Run re-renderings
        actionLayerQtyChange(); // checks the layer quantity
        actionFileProcessed();

        // Set dimensions to first layer's size & check against
        if (layerId === '1') {
          fileDimensions = [img.width, img.height]
        } else {
          if (img.width !== fileDimensions[0] && typeof secrets[1] != 'undefined') {
            // FIXME - This is not a perfectly accurate test.
            new Toast({message: "Some files appear to be different dimensions. Make sure they are the same size for accurate printing.",
            type: 'danger'});
          }
        }
    }

}

/* Initialize each screen canvas as blank */
function initializeCanvases() {
  for (let i = 1; i < 5; i++) {
    let blankCanvas = document.createElement('canvas');
    let blankCtx = blankCanvas.getContext("2d");
    blankCtx.fillStyle = '#fff';
    blankCtx.fillRect(0, 0, blankCanvas.width, blankCanvas.height);
    screens[i] = blankCanvas;
  }
}

/* Renders screen canvases to the proof canvas */
function canvasToProof(layerName) {
  var canvas = document.getElementById('proof-canvas'); // get the main canvas -- should be a global var
  var hRatio = canvas.width / layerName.width;
  var vRatio = canvas.height / layerName.height;
  console.log("Layer height: " + layerName.height + " x " + layerName.width);
  var ratio  = Math.min (hRatio, vRatio);
  var centerShift_x = ( canvas.width - layerName.width*ratio ) / 2;
  var centerShift_y = ( canvas.height - layerName.height*ratio ) / 2;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(layerName, 0,0, layerName.width, layerName.height,
                centerShift_x,centerShift_y,layerName.width*ratio, layerName.height*ratio);
}

/* ===== GENERIC OPERATIONS ========================================= */
function renderScreens() {
  for (let i = 1; i <= activeLayers; i++) {
    let colorName = inkSelections[i];
    let colorHex = Object.keys(inkColorsObj).find(key => inkColorsObj[key] === colorName);
    screenToInkColor(i, colorHex);
  }
}

function renderProof() {
  // Check if proof can be initialized
  if (Object.keys(secrets).length > 0) {
    if (proofInitialized == false) {
      proofInitialized = true;
    }
  }
  // Set orientation
  if (orientationLandscape) {
    var width = canvas.width = 1400;
    var height = canvas.height = 875;
  } else {
    var width = canvas.width = 875;
    var height = canvas.height = 1400;
  }
  ctx.clearRect(0,0,canvas.width, canvas.height);
  ctx.globalCompositeOperation = "multiply";
  for (let i = 1; i <= activeLayers; i++) {
    canvasToProof(screens[i]);
  }
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function toggleOrientation() {
  orientationLandscape = !orientationLandscape;
}

/* ========= ALPINE JS TIE-INS & SIMPLE ACTIONS =================== */
function writeInkChoiceArray() {
  for (let i = 1; i <= activeLayers; i++) {
    let selectId = "ink_select-" + i
    let selectElement = document.getElementById(selectId);
    let inkValue = "";
    if (selectElement != null) {
      inkValue = document.getElementById(selectId).value;
    } else {
      inkValue = ""
    }
    inkSelections[i] = inkValue;
  }
}

function actionInkChange() {
  writeInkChoiceArray();
  if (proofInitialized != false) {
    renderScreens();
    renderProof();
  }
}

function actionOrientationChange() {
  toggleOrientation();
  renderProof();
}

/* This says what to do AFTER new file is processed */
function actionFileProcessed() {
  renderScreens();
  renderProof();
}

function actionLayerQtyChange() {
  let activeValue = document.getElementById('layer-qty').value;
  if (activeValue) {
    activeLayers = activeValue;
  } else {
    activeLayers = 1;
  }
  if (proofInitialized != false) {
    renderProof();
  }
}

function watchFileInputs() {
  let inputs = document.getElementsByName("file_input");
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("change", loadImage);
  }
}

function testLoad() {
  alert('The id of the element you clicked: ' + this.id);
  layerName = this.id;
}

window.onload = function(){
  document.getElementById("preloader").style.display = 'none';
  watchFileInputs();
  if (isSafari) {
    new Toast({message: "Your browser is not fully supported. If you encounter any issues, please try using desktop Firefox browser.",
    type: 'warning'});
  }
}
