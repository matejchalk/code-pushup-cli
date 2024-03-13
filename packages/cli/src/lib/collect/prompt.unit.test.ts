import { render } from '@inquirer/testing';
import { describe, expect, it, vi } from 'vitest';
import { collectAndPersistReports, readRcByPath } from '@code-pushup/core';
import { yargsCli } from '../yargs-cli';
import { yargsCollectCommandObject } from './collect-command';
import { historyPrompt } from './prompts';

vi.mock('simple-git', async () => {
  const { CORE_CONFIG_MOCK }: typeof import('@code-pushup/test-utils') =
    await vi.importActual('@code-pushup/test-utils');
  const core: object = await vi.importActual('@code-pushup/core');
  return {
    ...core,
    collectAndPersistReports: vi.fn().mockResolvedValue({}),
    readRcByPath: vi.fn().mockResolvedValue(CORE_CONFIG_MOCK),
  };
});

describe('historyPrompt-command', () => {
  it('should prompt the user all options', async () => {
    // It's hard to test the defaults for `config` so we skipped it as there are other integration tests already
    await render();
  });

  it('should call collect with correct parameters', async () => {
    await yargsCli(
      [
        'collect',
        '--verbose',
        '--config=/test/code-pushup.config.ts',
        '--persist.filename=my-report',
        '--persist.outputDir=/test',
      ],
      {
        ...DEFAULT_CLI_CONFIGURATION,
        commands: [yargsCollectCommandObject()],
      },
    ).parseAsync();

    expect(readRcByPath).toHaveBeenCalledWith(
      '/test/code-pushup.config.ts',
      undefined,
    );

    expect(collectAndPersistReports).toHaveBeenCalledWith(
      expect.objectContaining({
        verbose: true,
        config: '/test/code-pushup.config.ts',
        persist: expect.objectContaining({
          filename: 'my-report',
          outputDir: '/test',
        }),
      }),
    );
  });

  it('should call collect only for the specified plugin', async () => {
    await yargsCli(
      [
        'collect',
        '--config=/test/code-pushup.config.ts',
        '--onlyPlugins=cypress',
      ],
      {
        ...DEFAULT_CLI_CONFIGURATION,
        commands: [yargsCollectCommandObject()],
      },
    ).parseAsync();

    expect(readRcByPath).toHaveBeenCalledWith(
      '/test/code-pushup.config.ts',
      undefined,
    );

    expect(collectAndPersistReports).toHaveBeenCalledWith(
      expect.objectContaining({
        config: '/test/code-pushup.config.ts',
        plugins: [expect.objectContaining({ slug: 'cypress' })],
      }),
    );
  });
});
