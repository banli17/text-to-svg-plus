'use strict';

const fs = require('fs');
const path = require('path');
const TextToSVG = require('text-to-svg');

const DEFAULT_FONT = '江城圆体';
const DEFAULT_FONT_ID = '5f2a22c385f55bf7a9649972';

const textToSVG = {
    [DEFAULT_FONT_ID]: TextToSVG.loadSync(path.resolve(__dirname, `./_fonts/${DEFAULT_FONT}.ttf`)),
};

class Svg {
    constructor(options) {
        const defaultOptions = {
            fontSize: 20,
            lineHeight: 0,
            width: 0, // 0 表示一行显示
            height: 0,
            direction: 'ltr', // ltr 从左到右边， ttb 从上到下  ttb_rtl  从上到下，从右到左
            columnWidth: options.fontSize,
            color: '#000000',
            textAlign: 'left',
            fontFamily: DEFAULT_FONT_ID,
            letterSpacing: 0,
            wordWrap: 'nowrap', // nowrap 则会自动缩放， auto 根据width height来换行
        };
        Object.keys(defaultOptions)
            .forEach(key => {
                options[key] = options[key] || defaultOptions[key];
            });
        this.options = options;
        this.textToSVG = textToSVG[this.options.fontFamily] || textToSVG[DEFAULT_FONT_ID];

        this.svg = ''; // 要输出的 svg

        this.width = this.options.width; // svg 的宽高
        this.height = this.options.height;

        if ((this.options.direction === 'ltr' && !this.width)
            || (this.options.direction === 'ttb' || this.options.direction === 'ttb_rtl') && !this.height) {
            this.options.wordWrap = 'nowrap';
        }
        // console.log('this.options', this.options);

        if (this.options.background && !this.options.text.trim()) {
            return this.createSharp();
        }

        if (this.options.direction === 'ltr') {
            return this.createLTR();
        }

        if (this.options.direction === 'ttb') {
            return this.createTTB();
        }

        if (this.options.direction === 'ttb_rtl') {
            return this.createTTB_RTL();
        }
    }

    // fonts: {字体id: 字体路径}
    static updateTextToSVG(fonts) {
        Object.keys(fonts)
            .forEach(key => {
                try {
                    textToSVG[key] = TextToSVG.loadSync(fonts[key]);
                } catch (e) {
                    console.log(e);
                }
            });
    }

    getStandardOneTextMetrics(text_options) {
        const metrics = this.textToSVG.getMetrics('我', text_options);
        return metrics;
    }

    createLTR() {
        let { width, height, lineHeight = 1, fontSize, text, color, fontWeight, borderWidth, borderColor, textAlign, opacity, letterSpacing = 0, strictSize = 0 } = this.options;
        if (lineHeight === 0) lineHeight = 1;
        const colors = /,/.test(color) ? color.split(',') : [];
        const text_options = {
            x: 0,
            y: 0,
            fontSize,
            anchor: 'top',
            letterSpacing,
            attributes: { fill: color, opacity, },
        };
        const row_options = {
            ...text_options,
            x: 0,
            y: 0,
        };
        // 文字加粗
        if (fontWeight && fontWeight === 'bold') {
            text_options.attributes.stroke = color;
        }
        if (borderWidth && borderColor) {
            text_options.attributes.stroke = borderColor;
            text_options.attributes['stroke-width'] = borderWidth;
        }
        let index = 0;
        const textLength = this.options.text.length;
        let svg = '';
        let rowIndex = 0;
        let maxWidth = [];
        let maxHeight = [];
        let rowWidth = 0;
        let curRowWidth = 0;
        const allText = [];
        const allRows = [];
        let start = 0;
        let textIndex = 0;
        const oneMetrics = this.textToSVG.getMetrics('我', text_options);
        // 有些字体会下降
        const rowHeight = lineHeight * oneMetrics.height;//this.options.fontSize;

        while (index < textLength) {
            // 每个文字一个颜色
            try {
                if (colors && colors.length) {
                    text_options.attributes.fill = colors[index % colors.length].trim();
                }
            } catch (e) {
            }

            const currentText = text.substring(index, index + 1);
            const currentMetrics = this.textToSVG.getMetrics(currentText, text_options);
            rowWidth += currentMetrics.width;

            if ((this.options.wordWrap === 'auto' && ((this.width && rowWidth > this.width))) || currentText === '\n' || index === textLength - 1) {
                if (index === textLength - 1) {
                    textIndex = index + 1;
                } else {
                    textIndex = index;
                }
                // 最后一个字符
                if (rowWidth <= this.width && currentText !== '\n' && (this.options.addY || this.options.addX || colors.length)) {
                    allText.push({
                        text: text.substring(index, index + 1),
                        rowIndex,
                        // width: currentMetrics.width,
                        // height: currentMetrics.height,
                        text_options: { ...text_options, attributes: { ...text_options.attributes } }
                    });
                    text_options.x += currentMetrics.width;
                    text_options.y += this.options.addY || 0;
                }

                row_options.x = 0;
                text_options.x = 0;
                curRowWidth = index === textLength - 1 ? rowWidth : (rowWidth - currentMetrics.width);
                console.log(start, textIndex, text.substring(start, textIndex), curRowWidth);
                if (this.options.wordWrap === 'auto' && this.width && curRowWidth > this.width) {
                    allRows.push({
                        width: curRowWidth - currentMetrics.width,
                        text: text.substring(start, textIndex - 1)
                            .replace('\n', ''),
                        text_options: { ...text_options, attributes: { ...text_options.attributes } }
                    });
                } else {
                    allRows.push({
                        width: curRowWidth,
                        text: text.substring(start, textIndex)
                            .replace('\n', ''),
                        text_options: { ...text_options, attributes: { ...text_options.attributes } }
                    });
                }

                row_options.y += rowHeight;
                text_options.y = row_options.y;
                maxWidth.push(curRowWidth);
                maxHeight = row_options.y;
                start = index;

                if (rowWidth > this.width && currentText !== '\n' && (this.options.addY || this.options.addX || colors.length)) {
                    allText.push({
                        text: text.substring(index, index + 1),
                        rowIndex: rowIndex + 1,
                        // width: currentMetrics.width,
                        // height: currentMetrics.height,
                        text_options: { ...text_options, attributes: { ...text_options.attributes } }
                    });
                    text_options.x += currentMetrics.width;
                    text_options.y += this.options.addY || 0;
                }

                if (rowWidth > this.width && currentText !== '\n') {
                    rowWidth = currentMetrics.width;
                } else {
                    rowWidth = 0;
                }

                rowIndex++;
            } else if ((this.options.addY || this.options.addX || colors.length) && currentText !== '\n') {
                allText.push({
                    text: text.substring(index, index + 1),
                    rowIndex,
                    // width: currentMetrics.width,
                    // height: currentMetrics.height,
                    text_options: { ...text_options, attributes: { ...text_options.attributes } }
                });
                text_options.x += currentMetrics.width;
                text_options.y += this.options.addY || 0;
            }
            index++;
        }

        console.log(index, textLength);
        // 最后如果
        if (this.options.wordWrap === 'auto' && (curRowWidth > this.width || index < textLength - 1)) {
            allRows.push({
                width: curRowWidth,
                text: text.substring(start, textIndex)
                    .replace('\n', ''),
                text_options: { ...text_options, attributes: { ...text_options.attributes } }
            });
        }

        if (this.options.wordWrap === 'nowrap') {
            this.width = Math.max(...maxWidth);
            this.height = maxHeight;
        }

        const l = letterSpacing * this.options.fontSize;
        if (this.options.addY || this.options.addX || colors.length) {
            allText.forEach(t => {
                if (this.options.textAlign === 'center') {
                    t.text_options.x += (this.width - allRows[t.rowIndex].width + l) / 2;
                }
                if (this.options.verticalAlign === 'middle') {
                    t.text_options.y += (this.height - maxHeight) / 2;
                }
                svg += this.textToSVG.getPath(t.text, t.text_options);
            });
        } else {
            allRows.forEach(t => {
                if (this.options.textAlign === 'center') {
                    t.text_options.x = (this.width - t.width + l) / 2;
                }
                if (this.options.verticalAlign === 'middle') {
                    t.text_options.y += (this.height - maxHeight) / 2;
                }
                svg += this.textToSVG.getPath(t.text, t.text_options);
            });
        }

        this.svg = this.buildSvg({ width: this.width, height: this.height, svg });
        return this;
    }

    createTTB(newText) {
        let { width, height, fontWeight, borderColor, borderWidth, lineHeight = 1, fontSize, text, color, columnWidth, letterSpacing = 0, opacity, background } = this.options;
        if (newText) {
            text = newText;
        }
        if (!letterSpacing) {
            letterSpacing = 0;
        }
        const attributes = { fill: color, opacity: opacity };
        // 文字加粗
        if (fontWeight === 'bold') {
            attributes.stroke = color;
        }
        // 边框
        if (borderWidth && borderColor) {
            attributes.stroke = borderColor;
            attributes['stroke-width'] = borderWidth;
        }
        const text_options = {
            x: 0,
            y: 0,
            fontSize,
            anchor: 'top',
            letterSpacing,
            attributes,
        };
        const one_metrics = this.textToSVG.getMetrics('我', text_options);
        let start = 0;
        let index = 0;
        let widths = [];
        let heights = [];
        let svg = '';
        let currentText;
        let colIndex = 0;
        let maxWidth = 0;
        let maxHeight = 0;
        let currentMetrics;
        const allText = [];
        lineHeight = lineHeight * one_metrics.height || one_metrics.height;
        text = text.replace(/\n*$/, '');
        let columnHeight = [];
        while (index < text.length) {
            currentText = text.substring(index, index + 1);
            currentMetrics = this.textToSVG.getMetrics(currentText, text_options);
            if (currentText === '\n') {
                columnHeight[colIndex] = Math.max(columnHeight[colIndex] || 0, text_options.y);
                text_options.x += one_metrics.width;
                text_options.y = 0;
                index++;
                colIndex++;

                continue;
            } else if (this.options.wordWrap === 'auto' && this.height && text_options.y + one_metrics.height > this.height) {
                columnHeight[colIndex] = Math.max(columnHeight[colIndex] || 0, text_options.y);
                text_options.x += one_metrics.width;
                text_options.y = 0;
                allText.push({
                    colIndex,
                    text: currentText,
                    width: currentMetrics.width,
                    height: currentMetrics.height,
                    text_options: { ...text_options },
                });
                svg += this.textToSVG.getPath(currentText, text_options);
                text_options.y += lineHeight;
                colIndex++;
            } else {
                allText.push({
                    colIndex,
                    text: currentText,
                    width: currentMetrics.width,
                    height: currentMetrics.height,
                    text_options: { ...text_options },
                });
                svg += this.textToSVG.getPath(currentText, text_options);
                text_options.y += lineHeight;
                columnHeight[colIndex] = Math.max(columnHeight[colIndex] || 0, text_options.y);
            }
            widths.push(text_options.x);
            index++;
        }

        maxWidth = Math.max(...widths) + one_metrics.width;
        console.log('maxWidth', maxWidth, one_metrics.width);
        maxHeight = Math.max(...columnHeight);
        if (this.options.wordWrap === 'nowrap') {
            this.width = maxWidth;
            this.height = maxHeight;
        }

        console.log(this.width, maxWidth, fontSize);
        if (this.options.textAlign === 'center' || this.options.verticalAlign === 'middle') {
            svg = '';
            allText.forEach(t => {
                if (this.options.textAlign === 'center') {
                    t.text_options.x += Math.max(0, (this.width - maxWidth + letterSpacing * fontSize) / 2);
                }
                if (this.options.verticalAlign === 'middle') {
                    t.text_options.y += Math.max((this.height - columnHeight[t.colIndex]) / 2, 0);
                }
                svg += this.textToSVG.getPath(t.text, t.text_options);
            });
        }


        this.svg = this.buildSvg({ width: this.width, height: this.height, svg, background });
        return this;
    }

    createTTB_RTL() {
        let { text } = this.options;
        text = text.replace(/\n*$/, '');
        text = text.split(/\n/)
            .reverse()
            .join('\n');
        return this.createTTB(text);
    }

    toRgba() {
        const { background = '#ffffff', opacity = 1 } = this.options;
        const r = parseInt(background.substring(1, 3), 16);
        const g = parseInt(background.substring(3, 5), 16);
        const b = parseInt(background.substring(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    createSharp() {
        this.svg = this.buildSvg({
            width: this.width,
            height: this.height,
            background: this.toRgba(),
            borderRadius: this.options.borderRadius,
        });
        return this;
    }

    buildSvg({ width, height, svg = '', background, borderRadius }) {
        return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">`
            + (background ? `<rect width="${width}" height="${height}" style="fill:${background};" rx="${borderRadius}" ry="${borderRadius}" />` : '') +
            `${svg}</svg>`;
    }

    toBuffer() {
        return Buffer.from(this.svg);
    }

    toFile(output) {
        return new Promise(resolve => {
            fs.writeFile(output, this.svg, err => {
                if (err) {
                    console.log('writeFile:', err);
                    return;
                }
                resolve({
                    width: Math.ceil(this.width),
                    height: Math.ceil(this.height),
                });
            });
        });
    }
}

module.exports = Svg;
