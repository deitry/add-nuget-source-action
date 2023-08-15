import { PackageSource, parsePackageSources } from '../src/dotnet';
import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import { expect, test } from '@jest/globals';

test('returns empty list', async () => {
  const result = await parsePackageSources([]);
  expect(result).toEqual([]);
});

test('parse single source', async () => {
  const result = await parsePackageSources([
    '  1.  nuget.org [Enabled]',
    '      https://api.nuget.org/v3/index.json'
  ]);

  expect(result).toEqual([
    {
      name: 'nuget.org',
      url: 'https://api.nuget.org/v3/index.json'
    }
  ]);
});

test('parse multiple sources', async () => {
  const result = await parsePackageSources([
    '  1.  nuget.org [Enabled]',
    '      https://api.nuget.org/v3/index.json',
    '  2.  github-private [Enabled]',
    '      https://nuget.pkg.github.com/my-org/index.json',
    '  3.  Microsoft Visual Studio Offline Packages [Enabled]',
    '      C:\\Program Files (x86)\\Microsoft SDKs\\NuGetPackages\\'
  ]);

  expect(result).toEqual([
    {
      name: 'nuget.org',
      url: 'https://api.nuget.org/v3/index.json'
    },
    {
      name: 'github-private',
      url: 'https://nuget.pkg.github.com/my-org/index.json'
    },
    {
      name: 'Microsoft Visual Studio Offline Packages',
      url: 'C:\\Program Files (x86)\\Microsoft SDKs\\NuGetPackages\\'
    }
  ]);
});

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_URL'] = 'https://api.nuget.org/v3/index.json';
  const np = process.execPath;
  const ip = path.join(__dirname, '..', 'dist', 'main.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  };
  console.log(cp.execFileSync(np, [ip], options).toString());
});
