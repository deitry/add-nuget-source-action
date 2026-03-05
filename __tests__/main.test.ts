import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
import { expect, test, describe, jest } from '@jest/globals';
import { parsePackageSources } from '../src/dotnet';

describe('parsePackageSources', () => {
  test('returns empty list', async () => {
    const result = parsePackageSources([]);
    expect(result).toEqual([]);
  });

  test('parse single source', async () => {
    const result = parsePackageSources([
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
    const result = parsePackageSources([
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
});

// shows how the runner will run a javascript action with env / stdout protocol
test('run with a env/stdout protocol', () => {
  process.env['INPUT_URL'] = 'https://api.nuget.org/v3/index.json';
  const np = process.execPath;
  const main = path.join(__dirname, '..', 'dist', 'main.js');
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  };
  console.log(cp.execFileSync(np, [main], options).toString());

  // disable warning about missing assert
  expect(true).toBe(true);
});

describe('main run function', () => {
  let mockCore: {
    getInput: jest.Mock<(name: string) => string>;
    getBooleanInput: jest.Mock<(name: string) => boolean>;
    setOutput: jest.Mock;
    info: jest.Mock;
    setFailed: jest.Mock;
    debug: jest.Mock;
    saveState: jest.Mock;
  };
  let mockExecSync: jest.Mock;
  let mockGetPackageSourceList: jest.Mock;
  let mockUuidV4: jest.Mock;

  const runMain = async (options: {
    url?: string;
    name?: string;
    username?: string;
    password?: string;
    force?: boolean;
    existingSources?: { name: string; url: string }[];
  }) => {
    // Reset mocks
    mockCore = {
      getInput: jest.fn((inputName: string) => {
        switch (inputName) {
          case 'url':
            return options.url || '';
          case 'name':
            return options.name || '';
          case 'username':
            return options.username || '';
          case 'password':
            return options.password || '';
          default:
            return '';
        }
      }),
      getBooleanInput: jest.fn((inputName: string) => {
        if (inputName === 'force') return options.force || false;
        return false;
      }),
      setOutput: jest.fn(),
      info: jest.fn(),
      setFailed: jest.fn(),
      debug: jest.fn(),
      saveState: jest.fn()
    };

    mockExecSync = jest.fn();
    mockGetPackageSourceList = jest.fn().mockReturnValue(options.existingSources || []);
    mockUuidV4 = jest.fn().mockReturnValue('mock-uuid-1234');

    // Use isolateModules to get fresh module with our mocks
    await jest.isolateModulesAsync(async () => {
      jest.doMock('@actions/core', () => mockCore);
      jest.doMock('child_process', () => ({
        execSync: mockExecSync
      }));
      jest.doMock('../src/dotnet', () => ({
        getPackageSourceList: mockGetPackageSourceList
      }));
      jest.doMock('uuid', () => ({
        v4: mockUuidV4
      }));

      await import('../src/main');
    });

    return { mockCore, mockExecSync, mockGetPackageSourceList, mockUuidV4 };
  };

  describe('force input', () => {
    test('should skip adding source when it already exists and force=false', async () => {
      const { mockCore, mockExecSync } = await runMain({
        url: 'https://api.nuget.org/v3/index.json',
        force: false,
        existingSources: [{ name: 'nuget.org', url: 'https://api.nuget.org/v3/index.json' }]
      });

      expect(mockCore.info).toHaveBeenCalledWith(
        'Source https://api.nuget.org/v3/index.json already exists'
      );
      expect(mockExecSync).not.toHaveBeenCalled();
    });

    test('should remove and re-add source when it already exists and force=true', async () => {
      const { mockCore, mockExecSync } = await runMain({
        url: 'https://api.nuget.org/v3/index.json',
        force: true,
        existingSources: [{ name: 'nuget.org', url: 'https://api.nuget.org/v3/index.json' }]
      });

      expect(mockCore.info).toHaveBeenCalledWith(
        'Source https://api.nuget.org/v3/index.json already exists, removing it (force=true)'
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'dotnet nuget remove source "nuget.org"',
        { stdio: 'inherit' }
      );
      // Should also add the source after removing
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('dotnet nuget add source'),
        { stdio: 'inherit' }
      );
    });

    test('should add source normally when no existing source found', async () => {
      const { mockExecSync } = await runMain({
        url: 'https://api.nuget.org/v3/index.json',
        force: false,
        existingSources: []
      });

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('dotnet nuget add source'),
        { stdio: 'inherit' }
      );
    });
  });

  describe('name input', () => {
    test('should use provided name for package source', async () => {
      const { mockCore, mockExecSync } = await runMain({
        url: 'https://api.nuget.org/v3/index.json',
        name: 'my-custom-source',
        existingSources: []
      });

      expect(mockCore.setOutput).toHaveBeenCalledWith('source_name', 'my-custom-source');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--name "my-custom-source"'),
        { stdio: 'inherit' }
      );
    });

    test('should generate UUID when name is not provided', async () => {
      const { mockCore, mockExecSync } = await runMain({
        url: 'https://api.nuget.org/v3/index.json',
        name: '',
        existingSources: []
      });

      expect(mockCore.setOutput).toHaveBeenCalledWith('source_name', 'mock-uuid-1234');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('--name "mock-uuid-1234"'),
        { stdio: 'inherit' }
      );
    });

    test('should use custom name with private source (username provided)', async () => {
      const { mockCore, mockExecSync } = await runMain({
        url: 'https://nuget.pkg.github.com/org/index.json',
        name: 'github-packages',
        username: 'user',
        password: 'token',
        existingSources: []
      });

      expect(mockCore.setOutput).toHaveBeenCalledWith('source_name', 'github-packages');
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringMatching(/--name "github-packages".*--username user/),
        { stdio: 'inherit' }
      );
    });
  });
});
