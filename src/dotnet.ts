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

  return parsePackageSources(dotnetListSourceResult.toString().split('\n'));
}

export function parsePackageSources(input: string[]): PackageSource[] {
  const result: PackageSource[] = [];
  let currentName: string | null = null;

  for (const line of input) {
    if (line === 'Registered Sources:') continue;

    if (currentName == null) {
      // expect first line to be in the form of "  1. PackageName [Enabled]"
      const dropNumber = line.split('. ')[1].trim();
      const dropStatus = dropNumber.split('[')[0].trim();

      currentName = dropStatus;
    } else {
      // and second line to be in the form of "     https://api.nuget.org/v3/index.json"
      const url = line.trim();
      const packageSource = new PackageSource(url, currentName);

      result.push(packageSource);
      currentName = null;
    }
  }

  return result;
}
