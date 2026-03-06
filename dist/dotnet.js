Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageSource = void 0;
exports.getPackageSourceList = getPackageSourceList;
exports.parsePackageSources = parsePackageSources;
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
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
    core.info(dotnetListSourceResult.toString());
    return parsePackageSources(dotnetListSourceResult.toString().split('\n'));
}
function parsePackageSources(input) {
    if (input.length === 0) {
        core.info('No package sources found');
        return [];
    }
    const result = [];
    let currentName = null;
    for (const line of input) {
        if (!line)
            continue;
        const trimmedLine = line.trim();
        core.debug(`line: ${trimmedLine}`);
        if (trimmedLine === 'Registered Sources:' ||
            trimmedLine === 'No sources found.')
            continue;
        if (currentName == null) {
            // expect first line to be in the form of "  1. PackageName [Enabled]"
            const splitByDot = trimmedLine.split('. ');
            if (splitByDot.length < 2) {
                core.info(`Unexpected line: ${trimmedLine}`);
                continue;
            }
            const dropNumber = splitByDot[1].trim();
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
