import { vol } from 'memfs';
import { rm } from 'node:fs/promises';
import { beforeEach, expect } from 'vitest';
import { MEMFS_VOLUME } from '@code-pushup/test-utils';
import { CP_TARGET_NAME } from '../../utils/constants';
import { NormalizedCreateNodesContext } from '../model';
import { createTargets } from './targets';

describe('createTargets', () => {
  beforeEach(async () => {
    // needed to have the folder present. readdir otherwise it fails
    vol.fromJSON(
      {
        x: '',
      },
      MEMFS_VOLUME,
    );
    await rm('x');
  });
  it('should create dynamic targets when called', async () => {
    const projectName = 'plugin-my-plugin';
    await expect(
      createTargets({
        projectRoot: '.',
        projectJson: {
          name: projectName,
        },
        createOptions: {},
      } as NormalizedCreateNodesContext),
    ).resolves.toStrictEqual({
      [`${CP_TARGET_NAME}--init`]: {
        command: `nx g nx-plugin:init --project=${projectName}`,
      },
    });
  });

  it('should consider targetName for dynamic target names', async () => {
    const projectName = 'plugin-my-plugin';
    const targetName = 'cp';
    await expect(
      createTargets({
        projectRoot: '.',
        projectJson: {
          name: projectName,
        },
        createOptions: {
          targetName,
        },
      } as NormalizedCreateNodesContext),
    ).resolves.toStrictEqual({
      [`${targetName}--init`]: {
        command: `nx g nx-plugin:init --project=${projectName}`,
      },
    });
  });

  it('should return NO dynamic target if code-pushup config is given', async () => {
    const projectName = 'plugin-my-plugin';
    vol.fromJSON(
      {
        [`code-pushup.config.ts`]: `{}`,
      },
      MEMFS_VOLUME,
    );
    const targetName = 'cp';
    await expect(
      createTargets({
        projectRoot: '.',
        projectJson: {
          name: projectName,
        },
        createOptions: {
          targetName,
        },
      } as NormalizedCreateNodesContext),
    ).resolves.toStrictEqual({});
  });
});
