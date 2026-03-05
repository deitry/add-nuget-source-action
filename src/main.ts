import * as core from '@actions/core';
import { v4 as uuidv4 } from 'uuid';
import { getPackageSourceList } from './dotnet';
import { execSync } from 'child_process';

async function run(): Promise<void> {
  try {
    // core.setOutput('time', new Date().toTimeString())

    const url: string = core.getInput('url');
    if (!url) throw new Error('url input parameter is required');

    const username: string = core.getInput('username');
    const pwd: string = core.getInput('password');
    const force: boolean = core.getBooleanInput('force');

    const packageSourceList = getPackageSourceList();

    const existingSource = packageSourceList.find(
      element => element.url === url
    );
    if (existingSource) {
      if (!force) {
        core.info(`Source ${url} already exists`);
        return;
      }

      core.info(`Source ${url} already exists, removing it (force=true)`);
      const removeCommand = `dotnet nuget remove source "${existingSource.name}"`;
      core.info(`Removing source: ${removeCommand}`);
      execSync(removeCommand, { stdio: 'inherit' });
    }

    const packageSourceName = core.getInput('name') || uuidv4();
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

      execSync(command, { stdio: 'inherit' });
    } else {
      // public package source

      const command = [
        'dotnet nuget add source',
        `"${url}"`,
        `--name "${packageSourceName}"`
      ].join(' ');

      core.info(`Adding source: ${command}`);

      execSync(command, { stdio: 'inherit' });
    }

    core.saveState('needCleanup', true);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
      if (error.stack) core.debug(error.stack);
    }
  }
}

run();
