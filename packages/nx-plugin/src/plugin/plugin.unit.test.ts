import { CreateNodesContext } from '@nx/devkit';
import { vol } from 'memfs';
import { describe, expect } from 'vitest';
import { MEMFS_VOLUME } from '@code-pushup/test-utils';
import { CP_TARGET_NAME } from '../utils/constants';
import { createNodes } from './plugin';

type TestingCreateNodesContext = CreateNodesContext & { configFiles: string[] };

describe('@code-pushup/nx-plugin/plugin', () => {
  let context: TestingCreateNodesContext;

  beforeEach(() => {
    context = {
      nxJsonConfiguration: {
        // These defaults should be overridden by the plugin
        targetDefaults: {
          'code-pushup': {
            cache: false,
            inputs: ['foo', '^foo'],
          },
        },
        namedInputs: {
          default: ['{projectRoot}/**/*'],
          production: ['!{projectRoot}/**/*.spec.ts'],
        },
      },
      workspaceRoot: '',
      configFiles: [],
    } as TestingCreateNodesContext;
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
    const nodes = await invokeCreateNodesOnMatchingFiles(context);

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
    const nodes = await invokeCreateNodesOnMatchingFiles(context);

    expect(Object.keys(nodes.projects[projectRoot].targets)).toHaveLength(1);
    expect(
      nodes.projects[projectRoot].targets[`${CP_TARGET_NAME}--init`],
    ).toBeDefined();
  });

  it('should create code-pushup CLI targets in PROJECT when there are no code-pushup configs', async () => {
    const projectRoot = 'apps/my-app';
    vol.fromJSON(
      {
        [`${projectRoot}/code-pushup.config.ts`]: `{}`,
        [`${projectRoot}/project.json`]: `${JSON.stringify({
          name: 'org/cp-package',
        })}`,
      },
      MEMFS_VOLUME,
    );

    // eslint-disable-next-line functional/immutable-data
    context.configFiles = [`${projectRoot}/project.json`];
    const nodes = await invokeCreateNodesOnMatchingFiles(context);

    expect(nodes.projects[projectRoot]).toBeDefined();
    expect(Object.keys(nodes.projects[projectRoot].targets)).toHaveLength(1);
    expect(nodes.projects[projectRoot].targets[CP_TARGET_NAME]).toBeDefined();
  });

  it('should create code-pushup CLI targets in PROJECT folder when code-pushup config is present', async () => {
    const projectRoot = 'apps/my-app';
    vol.fromJSON(
      {
        'apps/my-app/code-pushup.config.ts': `{}`,
        'apps/my-app/project.json': `${JSON.stringify({
          name: 'org/cp-package',
        })}`,
      },
      MEMFS_VOLUME,
    );
    // eslint-disable-next-line functional/immutable-data
    context.configFiles = ['apps/my-app/project.json'];
    const nodes = await invokeCreateNodesOnMatchingFiles(context);

    expect(
      nodes.projects[projectRoot].targets[`${CP_TARGET_NAME}`],
    ).toBeDefined();
  });
});

async function invokeCreateNodesOnMatchingFiles(
  context: TestingCreateNodesContext,
  targetName: string = CP_TARGET_NAME,
) {
  const aggregateProjects: Record<string, any> = {};
  // eslint-disable-next-line functional/no-loop-statements
  for (const file of context.configFiles) {
    const nodes = await createNodes[1](file, { targetName }, context);
    // eslint-disable-next-line functional/immutable-data
    Object.assign(aggregateProjects, nodes.projects);
  }
  return {
    projects: aggregateProjects,
  };
}
