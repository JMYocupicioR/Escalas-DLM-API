"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateFunction = exports.TEMPLATE_MAP = exports.renderHtmlForScale = exports.renderLequesneHtml = exports.renderBarthelHtml = exports.renderFimHtml = exports.renderBotulinumHtml = exports.renderGenericHtml = void 0;
var generic_1 = require("./generic");
Object.defineProperty(exports, "renderGenericHtml", { enumerable: true, get: function () { return generic_1.generateHtml; } });
// Simple dispatcher for now; extend with per-scale templates over time
var botulinum_1 = require("./botulinum");
Object.defineProperty(exports, "renderBotulinumHtml", { enumerable: true, get: function () { return botulinum_1.generateHtml; } });
var fim_1 = require("./fim");
Object.defineProperty(exports, "renderFimHtml", { enumerable: true, get: function () { return fim_1.generateHtml; } });
var barthel_1 = require("./barthel");
Object.defineProperty(exports, "renderBarthelHtml", { enumerable: true, get: function () { return barthel_1.generateHtml; } });
var lequesne_1 = require("./lequesne");
Object.defineProperty(exports, "renderLequesneHtml", { enumerable: true, get: function () { return lequesne_1.generateHtml; } });
const renderHtmlForScale = (payload) => {
    const id = payload?.scale?.id || '';
    if (id === 'botulinum') {
        // Dynamic import via direct file to keep tree-shaking predictable
        return require('./botulinum').generateHtml(payload);
    }
    if (id === 'fim' || id === 'weefim') {
        return require('./fim').generateHtml(payload);
    }
    if (id === 'barthel') {
        return require('./barthel').generateHtml(payload);
    }
    if (id === 'lequesne' || id === 'lequesne-rodilla-es-v1') {
        return require('./lequesne').generateHtml(payload);
    }
    return require('./generic').generateHtml(payload);
};
exports.renderHtmlForScale = renderHtmlForScale;
// Provide a map + selector for compatibility with existing server code
exports.TEMPLATE_MAP = {
    botulinum: (payload) => require('./botulinum').generateHtml(payload),
    fim: (payload) => require('./fim').generateHtml(payload),
    weefim: (payload) => require('./fim').generateHtml(payload),
    barthel: (payload) => require('./barthel').generateHtml(payload),
    lequesne: (payload) => require('./lequesne').generateHtml(payload),
    'lequesne-rodilla-es-v1': (payload) => require('./lequesne').generateHtml(payload),
    generic: (payload) => require('./generic').generateHtml(payload),
};
const getTemplateFunction = (scaleId) => {
    return exports.TEMPLATE_MAP[scaleId] || exports.TEMPLATE_MAP.generic;
};
exports.getTemplateFunction = getTemplateFunction;
