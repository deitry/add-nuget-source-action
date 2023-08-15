"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePackageSources = exports.getPackageSourceList = exports.PackageSource = void 0;
const core = __importStar(require("@actions/core"));
const child_process_1 = require("child_process");
class PackageSource {
    constructor(url, name) {
        this.url = url;
        this.name = name;
    }
}
exports.PackageSource = PackageSource;
function getPackageSourceList() {
    const dotnetListSourceCmd = 'dotnet nuget list source --format Detailed';
    core.info(dotnetListSourceCmd);
    const dotnetListSourceResult = (0, child_process_1.execSync)(dotnetListSourceCmd);
    return parsePackageSources(dotnetListSourceResult.toString().split('\n'));
}
exports.getPackageSourceList = getPackageSourceList;
function parsePackageSources(input) {
    if (input.length === 0) {
        core.info('No package sources found');
        return [];
    }
    const result = [];
    let currentName = null;
    for (const line of input) {
        const trimmedLine = line.trim();
        core.debug(`line: ${trimmedLine}`);
        if (!trimmedLine)
            continue;
        if (trimmedLine === 'Registered Sources:')
            continue;
        if (currentName == null) {
            // expect first line to be in the form of "  1. PackageName [Enabled]"
            const dropNumber = trimmedLine.split('. ')[1].trim();
            const dropStatus = dropNumber.split('[')[0].trim();
            currentName = dropStatus;
        }
        else {
            // and second line to be in the form of "     https://api.nuget.org/v3/index.json"
            const url = trimmedLine;
            const packageSource = new PackageSource(url, currentName);
            result.push(packageSource);
            currentName = null;
        }
    }
    return result;
}
exports.parsePackageSources = parsePackageSources;
