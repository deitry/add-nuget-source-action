"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePackageSources = exports.getPackageSourceList = exports.PackageSource = void 0;
const { execSync } = require('child_process');
class PackageSource {
    constructor(url, name) {
        this.url = url;
        this.name = name;
    }
}
exports.PackageSource = PackageSource;
function getPackageSourceList() {
    const dotnetListSourceCmd = 'dotnet nuget list source --format Detailed';
    console.log(dotnetListSourceCmd);
    const dotnetListSourceResult = execSync(dotnetListSourceCmd).stdout;
    return parsePackageSources(dotnetListSourceResult.toString().split('\n'));
}
exports.getPackageSourceList = getPackageSourceList;
function parsePackageSources(input) {
    const result = [];
    let currentName = null;
    for (let line of input) {
        if (line == 'Registered Sources:')
            continue;
        if (currentName == null) {
            // expect first line to be in the form of "  1. PackageName [Enabled]"
            const dropNumber = line.split('. ')[1].trim();
            const dropStatus = dropNumber.split('[')[0].trim();
            currentName = dropStatus;
        }
        else {
            // and second line to be in the form of "     https://api.nuget.org/v3/index.json"
            const url = line.trim();
            const packageSource = new PackageSource(url, currentName);
            result.push(packageSource);
            currentName = null;
        }
    }
    return result;
}
exports.parsePackageSources = parsePackageSources;
