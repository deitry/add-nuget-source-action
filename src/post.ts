import * as core from '@actions/core';
import { getPackageSourceList } from './dotnet';
import { execSync } from 'child_process';

/**
 * Action that should be run at the end of the workflow
 */
async function postAction(): Promise<void> {
  try {
    const url: string = core.getInput('url');
    const sourceList = getPackageSourceList();

    for (const source of sourceList) {
      if (source.url === url) {
        const command = `dotnet nuget remove source "${source.name}"`;
        core.info(`Removing source: ${command}`);

        execSync(command, { stdio: 'inherit' });
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

postAction();
