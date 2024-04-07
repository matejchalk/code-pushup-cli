import { vol } from 'memfs';
import { expect } from 'vitest';
import { MEMFS_VOLUME } from '@code-pushup/test-utils';
import { CP_TARGET_NAME } from '../../utils/constants';
import { NormalizedCreateNodesContext } from '../model';
import { codePushupTargets } from './targets';

describe('target/code-pushup-helper#codePushupTargets', () => {
  it('should return CLI target when code-pushup config IS given', async () => {
    vol.fromJSON(
      {
        'project.json': `${JSON.stringify({ name: 'my-app' })}))`,
        'code-pushup.config.ts': `export default {};`,
      },
      MEMFS_VOLUME,
    );
    const targets = await codePushupTargets({
      projectRoot: '.',
      createOptions: {},
      projectJson: { name: 'my-app' },
      workspaceRoot: '.',
    } as NormalizedCreateNodesContext);
    expect(targets[CP_TARGET_NAME]).toBeDefined();
    expect(targets[CP_TARGET_NAME]?.command).toBe(
      'node ./dist/packages/cli/index.js',
    );
  });

  it('should return INIT target when code-pushup config is NOT given', async () => {
    vol.fromJSON(
      {
        'project.json': `${JSON.stringify({ name: 'my-app' })}))`,
      },
      MEMFS_VOLUME,
    );
    const targets = await codePushupTargets({
      projectRoot: '.',
      createOptions: {},
      projectJson: { name: 'my-app' },
      workspaceRoot: '.',
    } as NormalizedCreateNodesContext);
    expect(targets[`${CP_TARGET_NAME}--init`]).toBeDefined();
    expect(targets[`${CP_TARGET_NAME}--init`]?.command).toBe(
      'nx g nx-plugin:init --project=my-app',
    );
  });

  it('should respect target name in CLI target when targetName is given', async () => {
    vol.fromJSON(
      {
        'project.json': `${JSON.stringify({ name: 'my-app' })}))`,
        'code-pushup.config.ts': `export default {};`,
      },
      MEMFS_VOLUME,
    );
    const targetName = 'cp';
    const targets = await codePushupTargets({
      projectRoot: '.',
      createOptions: { targetName },
      projectJson: { name: 'my-app' },
      workspaceRoot: '.',
    } as NormalizedCreateNodesContext);
    expect(targets[targetName]).toBeDefined();
    expect(targets[targetName]?.command).toBe(
      'node ./dist/packages/cli/index.js',
    );
  });

  it('respect target name in INIT target when targetName is given', async () => {
    vol.fromJSON(
      {
        'project.json': `${JSON.stringify({ name: 'my-app' })}))`,
      },
      MEMFS_VOLUME,
    );
    const targetName = 'cp';
    const targets = await codePushupTargets({
      projectRoot: '.',
      createOptions: { targetName },
      projectJson: { name: 'my-app' },
      workspaceRoot: '.',
    } as NormalizedCreateNodesContext);

    expect(targets[`${targetName}--init`]).toBeDefined();
    expect(targets[`${targetName}--init`]?.command).toBe(
      'nx g nx-plugin:init --project=my-app',
    );
  });
});
