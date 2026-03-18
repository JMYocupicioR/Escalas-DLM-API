"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplateFunction = exports.TEMPLATE_MAP = exports.renderHtmlForScale = exports.renderMMSEHtml = exports.renderMocaHtml = exports.renderSixMWTHtml = exports.renderBergHtml = exports.renderOgsHtml = exports.renderLequesneHtml = exports.renderBarthelHtml = exports.renderFimHtml = exports.renderBotulinumHtml = exports.renderGenericHtml = void 0;
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
var ogs_1 = require("./ogs");
Object.defineProperty(exports, "renderOgsHtml", { enumerable: true, get: function () { return ogs_1.generateHtml; } });
var berg_1 = require("./berg");
Object.defineProperty(exports, "renderBergHtml", { enumerable: true, get: function () { return berg_1.generateHtml; } });
var _6mwt_1 = require("./6mwt");
Object.defineProperty(exports, "renderSixMWTHtml", { enumerable: true, get: function () { return _6mwt_1.generateHtml; } });
var moca_1 = require("./moca");
Object.defineProperty(exports, "renderMocaHtml", { enumerable: true, get: function () { return moca_1.generateHtml; } });
var mmse_1 = require("./mmse");
Object.defineProperty(exports, "renderMMSEHtml", { enumerable: true, get: function () { return mmse_1.generateHtml; } });
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
    if (id === 'ogs') {
        return require('./ogs').generateHtml(payload);
    }
    if (id === 'berg') {
        return require('./berg').generateHtml(payload);
    }
    if (id === '6mwt') {
        return require('./6mwt').generateHtml(payload);
    }
    if (id === 'moca') {
        return require('./moca').generateHtml(payload);
    }
    if (id === 'mmse') {
        return require('./mmse').generateHtml(payload);
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
    ogs: (payload) => require('./ogs').generateHtml(payload),
    berg: (payload) => require('./berg').generateHtml(payload),
    '6mwt': (payload) => require('./6mwt').generateHtml(payload),
    moca: (payload) => require('./moca').generateHtml(payload),
    mmse: (payload) => require('./mmse').generateHtml(payload),
    generic: (payload) => require('./generic').generateHtml(payload),
};
const getTemplateFunction = (scaleId) => {
    return exports.TEMPLATE_MAP[scaleId] || exports.TEMPLATE_MAP.generic;
};
exports.getTemplateFunction = getTemplateFunction;
