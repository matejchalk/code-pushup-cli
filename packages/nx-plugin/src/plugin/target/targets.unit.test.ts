import { join } from 'node:path';
import { expect } from 'vitest';
import { NormalizedCreateNodesContext } from '../model';
import { codePushupTarget, initTarget } from './targets';

describe('initTarget', () => {
  it('should create code-pushup--init target when called', () => {
    const projectName = 'plugin-my-plugin';
    expect(initTarget(projectName)).toEqual({
      command: `nx g nx-plugin:init --project=${projectName}`,
    });
  });
});

describe('codePushupTarget', () => {
  it('should process arguments and provide default options', async () => {
    const target = await codePushupTarget({} as NormalizedCreateNodesContext);

    expect(target.options?.persist?.format).toStrictEqual(['md', 'json']);
    expect(target.options?.progress).toBe(false);
  });

  it('should process projectJson.name and provide project option', async () => {
    const projectName = 'plugin-my-plugin';
    const target = await codePushupTarget({
      projectJson: { name: projectName },
    } as NormalizedCreateNodesContext);

    expect(target.options?.upload?.project).toBe(projectName);
  });

  it('should process projectJson.projectRoot and provide project option cwd when projectRoot IS given', async () => {
    const projectRoot = join('packages', 'plugin-my-plugin');
    const target = await codePushupTarget({
      projectRoot,
    } as NormalizedCreateNodesContext);

    expect(target.options?.cwd).toBe(projectRoot);
  });

  it('should process opt.projectPrefix and DO prefix project name when projectJson.name & projectJson.sourceRoot IS given', async () => {
    const projectName = 'plugin-my-plugin';
    const projectPrefix = 'cp';
    const target = await codePushupTarget({
      projectJson: { name: projectName, sourceRoot: '.' },
      createOptions: { projectPrefix },
    } as NormalizedCreateNodesContext);

    expect(target.options?.upload?.project).toMatch(
      new RegExp(`^(${projectPrefix})-${projectName}`),
    );
  });

  it('should process opt.projectPrefix and NOT prefix project name when projectJson.sourceRoot is NOT given', async () => {
    const projectName = 'plugin-my-plugin';
    const target = await codePushupTarget({
      projectJson: { name: projectName },
    } as NormalizedCreateNodesContext);

    expect(target.options?.upload?.project).toBe(projectName);
  });

  it('should process opt.plugins and load plugins when given as file path', async () => {
    const target = await codePushupTarget({
      createOptions: {
        plugins: ['node_modules/@code-pushup/eslint-plugin/index.js'],
      },
    } as NormalizedCreateNodesContext);

    expect(target.options?.plugins).toHaveLength(1);
    expect(target.options?.plugins?.[0]?.slug).toBe('eslint-plugin');
  });

  it('should process opt.plugins and load plugins when given as js package', async () => {
    const target = await codePushupTarget({
      createOptions: {
        plugins: ['@code-pushup/eslint-plugin'],
      },
    } as NormalizedCreateNodesContext);

    expect(target.options?.plugins).toHaveLength(1);
    expect(target.options?.plugins?.[0]?.slug).toBe('eslint-plugin');
  });

  it('should process opt.plugins and load plugins when given as js object', async () => {
    const target = await codePushupTarget({
      createOptions: {
        plugins: [
          {
            plugin: '@code-pushup/eslint-plugin',
          },
        ],
      },
    } as NormalizedCreateNodesContext);

    expect(target.options?.plugins).toHaveLength(1);
    expect(target.options?.plugins?.[0]?.slug).toBe('eslint-plugin');
  });

  it('should process opt.plugins and load plugins from js object and consider options', async () => {
    const target = await codePushupTarget({
      createOptions: {
        plugins: [
          {
            plugin: '@code-pushup/eslint-plugin',
            options: {
              eslintrc: '.eslintrc.(json|ts)',
              patterns: ['src', 'test/*.spec.js'],
            },
          },
        ],
      },
    } as NormalizedCreateNodesContext);

    expect(target.options?.plugins).toHaveLength(1);
    expect(target.options?.plugins?.[0]?.slug).toBe('eslint-plugin');
    expect(target.options?.plugins?.[0]?.description).toBe(
      JSON.stringify({
        eslintrc: '.eslintrc.(json|ts)',
        patterns: ['src', 'test/*.spec.js'],
      }),
    );
  });

  it('should process context.workspaceRoot and provide command if workspaceRoot IS given', async () => {
    const target = await codePushupTarget({
      workspaceRoot: 'root',
    } as NormalizedCreateNodesContext);

    expect(target.command).toBe('node root/dist/packages/cli/index.js');
  });
});
