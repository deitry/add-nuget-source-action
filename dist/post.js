Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core = tslib_1.__importStar(require("@actions/core"));
const dotnet_1 = require("./dotnet");
const child_process_1 = require("child_process");
/**
 * Action that should be run at the end of the workflow
 */
function postAction() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const needCleanup = core.getState('needCleanup');
            if (!needCleanup) {
                core.info('No cleanup needed');
                return;
            }
            const url = core.getInput('url');
            const sourceList = (0, dotnet_1.getPackageSourceList)();
            for (const source of sourceList) {
                if (source.url === url) {
                    const command = `dotnet nuget remove source "${source.name}"`;
                    core.info(`Removing source: ${command}`);
                    (0, child_process_1.execSync)(command, { stdio: 'inherit' });
                }
            }
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
postAction();
