"use strict";
/**
 * Index exports for the health module.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadinessStatus = exports.getLivenessStatus = exports.HealthServer = void 0;
var HealthServer_1 = require("./HealthServer");
Object.defineProperty(exports, "HealthServer", { enumerable: true, get: function () { return HealthServer_1.HealthServer; } });
var HealthChecks_1 = require("./HealthChecks");
Object.defineProperty(exports, "getLivenessStatus", { enumerable: true, get: function () { return HealthChecks_1.getLivenessStatus; } });
Object.defineProperty(exports, "getReadinessStatus", { enumerable: true, get: function () { return HealthChecks_1.getReadinessStatus; } });
//# sourceMappingURL=index.js.map