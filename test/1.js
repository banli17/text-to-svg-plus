'use strict';
const Svg = require('../src/index.js');
const path = require('path');

new Svg(
    {
        type: 'text',
        name: '标题',
        placeholder: '',
        text: '窗前明月光,\n疑似地上霜。\n举头忘明月，\n低头思故乡。',
        width: 500,
        height: 600,
        fontSize: 75,
        fontFamily: '5f2a231d85f55bf7a9649997',
        color: '#000000',
        direction: 'ltr',
        maxLength: 0,
        textAlign: 'left',
        id: 'text_138617.904999991880.4920142093229334',
        _defaultColor: '#000000',
        letterSpacing: 0,
        lineHeight: 1,
        opacity: 1,
        zIndex: 20,
        // wordWarp: 'auto',
    })
    .toFile(path.resolve(__dirname, './3.svg'));


new Svg(
    {
        type: 'text',
        name: '标题',
        placeholder: '',
        text: '窗前明月光,\n疑似地上霜。\n举头忘明月，\n低头思故乡。',
        width: 800,
        height: 600,
        // left: 734,
        // top: 612,
        fontSize: 75,
        fontFamily: '5f2a231d85f55bf7a9649997',
        color: '#000000',
        direction: 'ttb',
        maxLength: 0,
        // textAlign: 'left',
        id: 'text_138617.904999991880.4920142093229334',
        _defaultColor: '#000000',
        letterSpacing: 0,
        lineHeight: 1,
        opacity: 1,
        zIndex: 20,
        wordWrap: 'auto',
        verticalAlign: 'middle',
    })
    .toFile(path.resolve(__dirname, './4.svg'));


new Svg(
    {
        type: 'text',
        name: '标题',
        placeholder: '',
        text: '窗前明月光,\n疑似地上霜。\n举头忘明月，\n低头思故乡。',
        width: 800,
        height: 800,
        fontSize: 75,
        fontFamily: '5f2a231d85f55bf7a9649997',
        color: '#000000',
        direction: 'ttb_rtl',
        maxLength: 0,
        id: 'text_138617.904999991880.4920142093229334',
        _defaultColor: '#000000',
        letterSpacing: 0,
        lineHeight: 1,
        opacity: 1,
        zIndex: 20,
        wordWrap: 'auto',
        verticalAlign: 'middle',
        // textAlign: 'center',
    })
    .toFile(path.resolve(__dirname, './5.svg'));


new Svg(
    {
        type: 'text',
        name: '标题',
        placeholder: '',
        text: '窗前明月光,疑似地上霜。举头忘明月，低头思故乡。',
        width: 500,
        height: 530,
        fontSize: 75,
        fontFamily: '5f2a231d85f55bf7a9649997',
        color: '#000000',
        direction: 'ttb',
        maxLength: 0,
        id: 'text_138617.904999991880.4920142093229334',
        _defaultColor: '#000000',
        letterSpacing: 0,
        lineHeight: 1,
        opacity: 1,
        zIndex: 20,
        wordWrap: 'auto',
        verticalAlign: 'middle',
        // textAlign: 'center',
    })
    .toFile(path.resolve(__dirname, './6.svg'));
