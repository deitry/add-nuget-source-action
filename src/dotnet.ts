import * as core from '@actions/core';
import { execSync } from 'child_process';

export class PackageSource {
  url: string;
  name: string;

  constructor(url: string, name: string) {
    this.url = url;
    this.name = name;
  }
}

export function getPackageSourceList(): PackageSource[] {
  const dotnetListSourceCmd = 'dotnet nuget list source --format Detailed';
  core.info(dotnetListSourceCmd);

  const dotnetListSourceResult = execSync(dotnetListSourceCmd);
  core.info(dotnetListSourceResult.toString());

  return parsePackageSources(dotnetListSourceResult.toString().split('\n'));
}

export function parsePackageSources(input: string[]): PackageSource[] {
  if (input.length === 0) {
    core.info('No package sources found');
    return [];
  }

  const result: PackageSource[] = [];
  let currentName: string | null = null;

  for (const line of input) {
    if (!line) continue;

    const trimmedLine = line.trim();
    core.debug(`line: ${trimmedLine}`);

    if (
      trimmedLine === 'Registered Sources:' ||
      trimmedLine === 'No sources found.'
    )
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
    } else {
      // and second line to be in the form of "     https://api.nuget.org/v3/index.json"
      const url = trimmedLine;
      const packageSource = new PackageSource(url, currentName);

      result.push(packageSource);
      currentName = null;
    }
  }

  return result;
}
