# Riso Instant Proofer

This is a basic web tool for previewing grayscale artwork in different Riso ink colors.

Upload a grayscale image (JPG or PNG) for each layer and set the ink color. It will render a rough preview of the result in the browser (using `<canvas>` and JavaScript)

You can customize the choices of Riso ink colors, following instructions below.

## License

* 100% FREE for **non-commercial** use & modification, including by not-for-profit print shops.
* Any use for commercial/business or institutional projects **requires written permission!**

## How to use this

This "application" is a small collection of JavaScript, HTML, and CSS files.

To host this to the public, you need a regular ol' web host — where you can upload custom code and files right onto the server.

This is easy with a traditional web hosting account from GoDaddy, etc, but might be difficult if you are using a software-as-a-service site builder like Squarespace. If you are not sure how to upload these files, please ask your website hosting company.

You can also run this on your local computer, by downloading a software like [MAMP](https://www.mamp.info/en/downloads/) (Mac). Download these files and place them in the MAMP folder on your computer. Start the MAMP server and go to the directory in your web browser. This might be useful for print studio computers.

## Customization
### Change Riso ink colors
Open file `js/main.js`. At the top you will see a JavaScript object titled `inkColorsObj`. You will see a series of keyed values - each looks like this:
`'#0078bf': 'Blue'`

Replace the first value of each with your [ink color's hex value](https://stencil.wiki/colors) equivalent, and the second value with it's plain text name. *Do not use any spaces!!* Repeat for all your inks.

### Change the style
Open file `css/style.css`. Towards the top you will see a series of variables defining key colors of the interface. Change these values to whatever you want.

Ink colors are listed in `style.css`; when you add an ink color make sure to add a corresponding style.

### Edit message shown in explainer section
Open file `index.html`. You will see this text in the HTML and can edit it.

### Misc.
To allow preview of a different number than 4 layers, edit file `index.html`. Find the line `<template x-for="qty in 4">` and change 4 to your desired number of inks which can be previewed at one time. (Note, you also need to change `initializeCanvases()` function in `main.js` to create extra canvases)

To change the default orientation of the canvas, set variable `orientationLandscape` to `false` (in file `js/main.js`).

## Support and future improvements

I can't offer support for installing this software on your website.

If you find a bug or glitch, you can report it in the issues tab here. If you have the ability to make improvements and contributions to this, please do.

Future possibilities for improvement include:

* Set paper color
* Set paper size dimensions
* ~~Higher-resolution preview~~ done!
* Edit all ink colors/settings from one config js file

Known problems:

* Certain images don't display in Safari or iOS Safari.
* Procreate images with transparent backgrounds sometimes don't render well. Users are encouraged to use Firefox.
