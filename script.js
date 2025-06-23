const colorInput = document.getElementById('colorInput');
const colorDisplay = document.getElementById('colorDisplay');
const colorInfo = document.getElementById('colorInfo');
const errorMsg = document.getElementById('errorMsg');

colorInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') checkColor();
});

colorInput.addEventListener('input', function () {
    if (colorInput.value.trim()) {
        setTimeout(checkColor, 300);
    }
});

function checkColor() {
    const colorValue = colorInput.value.trim();
    if (!colorValue) return showError('Please enter a color code');

    if (isValidColor(colorValue)) {
        displayColor(colorValue);
        hideError();
    } else {
        showError('Invalid color code. Please check the format and try again.');
        hideColorInfo();
    }
}

function isValidColor(color) {
    const testDiv = document.createElement('div');
    testDiv.style.color = color;
    return testDiv.style.color !== '' || CSS.supports('color', color);
}

function displayColor(color) {
    const testDiv = document.createElement('div');
    testDiv.style.backgroundColor = color;
    document.body.appendChild(testDiv);
    const computedColor = window.getComputedStyle(testDiv).backgroundColor;
    document.body.removeChild(testDiv);

    if (computedColor) {
        colorDisplay.style.backgroundColor = color;
        colorDisplay.classList.remove('empty');
        document.getElementById('colorCodeDisplay').textContent = color.toUpperCase();

        const rgb = parseRGB(computedColor);
        if (rgb) {
            updateColorInfo(rgb, color);
            showColorInfo();
        }

        const brightness = getBrightness(rgb.r, rgb.g, rgb.b);
        colorDisplay.style.color = brightness > 128 ? '#333' : '#fff';
    }
}

function parseRGB(rgbString) {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3])
        };
    }
    return null;
}

function updateColorInfo(rgb, originalColor) {
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colorName = getColorName(rgb.r, rgb.g, rgb.b);

    document.getElementById('hexValue').textContent = hex;
    document.getElementById('rgbValue').textContent = 'rgb(${rgb.r}, ${rgb.g}, ${rgb.b})';
    document.getElementById('hslValue').textContent = 'hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)';
    document.getElementById('colorName').textContent = colorName;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function getBrightness(r, g, b) {
    return (r * 299 + g * 587 + b * 114) / 1000;
}

function getColorName(r, g, b) {
    const colors = {
        red: [255, 0, 0],
        green: [0, 255, 0],
        blue: [0, 0, 255],
        yellow: [255, 255, 0],
        cyan: [0, 255, 255],
        magenta: [255, 0, 255],
        black: [0, 0, 0],
        white: [255, 255, 255],
        orange: [255, 165, 0],
        purple: [128, 0, 128],
        pink: [255, 192, 203],
        brown: [165, 42, 42],
        gray: [128, 128, 128],
        lime: [0, 255, 0],
        navy: [0, 0, 128],
        olive: [128, 128, 0],
        silver: [192, 192, 192],
        teal: [0, 128, 128]
    };

    let closest = 'Custom Color';
    let min = Infinity;

    for (const [name, [cr, cg, cb]] of Object.entries(colors)) {
        const dist = Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2);
        if (dist < min && dist < 50) {
            min = dist;
            closest = name.charAt(0).toUpperCase() + name.slice(1);
        }
    }
    return closest;
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
}

function hideError() {
    errorMsg.style.display = 'none';
}

function showColorInfo() {
    colorInfo.style.display = 'grid';
}

function hideColorInfo() {
    colorInfo.style.display = 'none';
}

function resetColor() {
    colorInput.value = '#ff0000';
    colorDisplay.style.backgroundColor = '';
    colorDisplay.classList.add('empty');
    colorDisplay.style.color = '#888';
    document.getElementById('colorCodeDisplay').textContent = '';
    hideColorInfo();
    hideError();
}

function saveColor() {
    const color = colorInput.value.trim();
    if (!isValidColor(color)) return showError("Cannot save invalid color");

    let saved = JSON.parse(localStorage.getItem('savedColors')) || [];
    if (!saved.includes(color)) {
        saved.push(color);
        localStorage.setItem('savedColors', JSON.stringify(saved));
        displaySavedColors();
    }
}

function displaySavedColors() {
    const saved = JSON.parse(localStorage.getItem('savedColors')) || [];
    const savedDiv = document.getElementById('savedColors');
    savedDiv.innerHTML = '';
    saved.forEach(color => {
        const box = document.createElement('div');
        box.style.background = color;
        box.title = color;
        box.onclick = () => {
            colorInput.value = color;
            checkColor();
        };
        savedDiv.appendChild(box);
    });
}

function clearSavedColors() {
    localStorage.removeItem('savedColors');
    displaySavedColors();
}

window.addEventListener('load', function () {
    checkColor();
    displaySavedColors();
});