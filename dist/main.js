Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const uuid_1 = require("uuid");
const dotnet_1 = require("./dotnet");
const child_process_1 = require("child_process");
function run() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            // core.setOutput('time', new Date().toTimeString())
            const url = core.getInput('url');
            if (!url)
                throw new Error('url input parameter is required');
            const username = core.getInput('username');
            const pwd = core.getInput('password');
            const force = core.getBooleanInput('force');
            const packageSourceList = (0, dotnet_1.getPackageSourceList)();
            const existingSource = packageSourceList.find(element => element.url === url);
            if (existingSource) {
                if (!force) {
                    core.info(`Source ${url} already exists`);
                    return;
                }
                core.info(`Source ${url} already exists, removing it (force=true)`);
                const removeCommand = `dotnet nuget remove source "${existingSource.name}"`;
                core.info(`Removing source: ${removeCommand}`);
                (0, child_process_1.execSync)(removeCommand, { stdio: 'inherit' });
            }
            const packageSourceName = core.getInput('name') || (0, uuid_1.v4)();
            core.setOutput('source_name', packageSourceName);
            if (username) {
                // private package source
                const command = [
                    'dotnet nuget add source',
                    `"${url}"`,
                    `--name "${packageSourceName}"`,
                    `--username ${username}`,
                    `--password ${pwd}`,
                    // --store-password-in-clear-text is mandatory for non-Windows machines
                    '--store-password-in-clear-text'
                ].join(' ');
                core.info(`Adding source: ${command}`);
                (0, child_process_1.execSync)(command, { stdio: 'inherit' });
            }
            else {
                // public package source
                const command = [
                    'dotnet nuget add source',
                    `"${url}"`,
                    `--name "${packageSourceName}"`
                ].join(' ');
                core.info(`Adding source: ${command}`);
                (0, child_process_1.execSync)(command, { stdio: 'inherit' });
            }
            core.saveState('needCleanup', true);
        }
        catch (error) {
            if (error instanceof Error) {
                core.setFailed(error.message);
                if (error.stack)
                    core.debug(error.stack);
            }
        }
    });
}
run();
