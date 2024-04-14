import { vol } from 'memfs';
import { describe, expect } from 'vitest';
import {
  MEMFS_VOLUME,
  TestingCreateNodesContext,
  getTestContext,
  invokeCreateNodesOnMatchingFiles,
} from '@code-pushup/test-utils';
import { CP_TARGET_NAME } from '../utils/constants';
import { createNodes } from './plugin';

describe('@code-pushup/nx-plugin/plugin', () => {
  let context: TestingCreateNodesContext;

  beforeEach(() => {
    context = getTestContext();
  });

  afterEach(() => {
    vol.reset();
    vi.resetModules();
  });

  it('should create code-pushup INIT targets in ROOT when there are no code-pushup configs', async () => {
    vol.fromJSON(
      {
        'project.json': `${JSON.stringify({
          name: '@org/empty-root',
        })}`,
      },
      MEMFS_VOLUME,
    );

    // eslint-disable-next-line functional/immutable-data
    context.configFiles = ['project.json'];
    const nodes = await invokeCreateNodesOnMatchingFiles(createNodes, context);

    expect(nodes.projects['.']).toBeDefined();
    expect(Object.keys(nodes.projects['.'].targets)).toHaveLength(1);
    expect(
      nodes.projects['.'].targets[`${CP_TARGET_NAME}--init`],
    ).toBeDefined();
  });

  it('should create code-pushup INIT targets in PROJECT folder when there are no code-pushup configs', async () => {
    const projectRoot = 'apps/my-app';
    vol.fromJSON(
      {
        [`${projectRoot}/project.json`]: `${JSON.stringify({
          name: '@org/empty-package',
        })}`,
      },
      MEMFS_VOLUME,
    );

    // eslint-disable-next-line functional/immutable-data
    context.configFiles = ['apps/my-app/project.json'];
    const nodes = await invokeCreateNodesOnMatchingFiles(createNodes, context);

    expect(Object.keys(nodes.projects[projectRoot].targets)).toHaveLength(1);
    expect(
      nodes.projects[projectRoot].targets[`${CP_TARGET_NAME}--init`],
    ).toBeDefined();
  });
});
