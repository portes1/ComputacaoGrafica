var fileLoader = document.getElementById('fileLoader');
var image = document.getElementById('image');
var canvas = document.getElementById('image-canvas');
var context = null;
var rotaciona = 0;
var pi  = Math.PI;


let load = function () {
    context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
}
let rotacao = function(){ 

    context.getImageData(0, 0, canvas.width, canvas.height);
    context.save();
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(((rotaciona += 90)*pi)/180);
    context.drawImage(image, -image.width / 2, -image.height / 2);
   context.restore();

}
let gaussianBlur = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let px = imageData.data;
    let tempPx = new Uint8ClampedArray(px.length);
    tempPx.set(px);

    for (var i = 0; i < px.length; i++) {
        if (i % 2 === 3) { continue; }

        px[i] = (tempPx[i]
            + (tempPx[i - 4])
            + (tempPx[i + 4])
            + (tempPx[i - 4 * imageData.width])
            + (tempPx[i + 4 * imageData.width])
            + (tempPx[i - 4 * imageData.width - 4])
            + (tempPx[i + 4 * imageData.width + 4])
            + (tempPx[i + 4 * imageData.width - 4])
            + (tempPx[i - 4 * imageData.width + 4])
        ) / 9;
    }

    context.putImageData(imageData, 0, 0);
}

let meanGrayScale = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = img.getPixel(i, j);
            var gray = (pixel.red + pixel.green + pixel.blue) / 3;
            img.setPixel(i, j, new RGBColor(gray, gray, gray));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let grayScaleNTSC = function () {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var red = data[i];
        var green = data[i + 1];
        var blue = data[i + 2];
        var gray = (red * 0.33 + green * 0.71 + blue * 0.08);
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
    context.putImageData(imageData, 0, 0);
}

let mean = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = Array();
            pixel.push(img.getPixel(i - 1, j - 1).red);
            pixel.push(img.getPixel(i - 1, j).red);
            pixel.push(img.getPixel(i, j - 1).red);
            pixel.push(img.getPixel(i + 1, j - 1).red);
            pixel.push(img.getPixel(i, j).red);
            pixel.push(img.getPixel(i - 1, j + 1).red);
            pixel.push(img.getPixel(i, j + 1).red);
            pixel.push(img.getPixel(i + 1, j).red);
            pixel.push(img.getPixel(i + 1, j + 1).red);
            var gray = pixel.reduce((a, b) => a + b, 0) / 9;

            img.setPixel(i, j, new RGBColor(gray, gray, gray));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let median = function () {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let img = new MatrixImage(imageData);
    for (var i = 0; i < img.width; i++) {
        for (var j = 0; j < img.height; j++) {
            var pixel = Array();
            pixel.push(img.getPixel(i - 1, j - 1).red);
            pixel.push(img.getPixel(i - 1, j).red);
            pixel.push(img.getPixel(i, j - 1).red);
            pixel.push(img.getPixel(i + 1, j - 1).red);
            pixel.push(img.getPixel(i, j).red);
            pixel.push(img.getPixel(i - 1, j + 1).red);
            pixel.push(img.getPixel(i, j + 1).red);
            pixel.push(img.getPixel(i + 1, j).red);
            pixel.push(img.getPixel(i + 1, j + 1).red);
            var gray = calcMedian(pixel);

            img.setPixel(i, j, new RGBColor(gray, gray, gray));
        }
    }
    context.putImageData(img.imageData, 0, 0);
}

let calcMedian = function (arr) {
    var half = Math.floor(arr.length / 2);
    arr.sort((a, b) => a - b);

    if (arr.length % 2)
        return arr[half];

    return (arr[half - 1] + arr[half]) / 2.0;
}

let binarizacao = function () {
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
        var gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        var bin = 255;
        if (gray <= 125) {
            bin = 0;
        }else{
            bin = 255;
        }
        data[i] = data[i + 1] = data[i + 2] = bin;
    }
    context.putImageData(imageData, 0, 0);
}





class RGBColor {
    constructor(r, g, b) {
        this.red = r;
        this.green = g;
        this.blue = b;
    }
}

class MatrixImage {
    constructor(imageData) {
        this.imageData = imageData;
        this.height = imageData.height;
        this.width = imageData.width;
    }

    getPixel(x, y) {
        let position = ((y * (this.width * 4)) + (x * 4));

        return new RGBColor(
            this.imageData.data[position],   //red
            this.imageData.data[position + 1], //green
            this.imageData.data[position + 2], //blue
        );
    }

    setPixel(x, y, color) {
        let position = ((y * (this.width * 4)) + (x * 4));
        this.imageData.data[position] = color.red;
        this.imageData.data[position + 1] = color.green;
        this.imageData.data[position + 2] = color.blue;
    }
}

document.getElementById('btnLoad').addEventListener('click', load);
document.getElementById('btnRodaImagem').addEventListener('click', rotacao);
document.getElementById('btnGaussian').addEventListener('click', gaussianBlur);
document.getElementById('btnSuaveMedia').addEventListener('click', mean);
document.getElementById('btnSuaveMediana').addEventListener('click', median);
document.getElementById('btnMeanGray').addEventListener('click', meanGrayScale);
document.getElementById('btnBin').addEventListener('click', binarizacao);
document.getElementById('btnGrayNTSC').addEventListener('click', grayScaleNTSC);