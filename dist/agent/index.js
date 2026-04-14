"use strict";
/**
 * Index exports for the agent module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_CHROME_FLAGS = exports.isChromeLive = exports.launchChrome = exports.AgentState = exports.TranslatorAgent = void 0;
var TranslatorAgent_1 = require("./TranslatorAgent");
Object.defineProperty(exports, "TranslatorAgent", { enumerable: true, get: function () { return TranslatorAgent_1.TranslatorAgent; } });
Object.defineProperty(exports, "AgentState", { enumerable: true, get: function () { return TranslatorAgent_1.AgentState; } });
var ChromeLauncher_1 = require("./ChromeLauncher");
Object.defineProperty(exports, "launchChrome", { enumerable: true, get: function () { return ChromeLauncher_1.launchChrome; } });
Object.defineProperty(exports, "isChromeLive", { enumerable: true, get: function () { return ChromeLauncher_1.isChromeLive; } });
Object.defineProperty(exports, "REQUIRED_CHROME_FLAGS", { enumerable: true, get: function () { return ChromeLauncher_1.REQUIRED_CHROME_FLAGS; } });
//# sourceMappingURL=index.js.map