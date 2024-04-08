import {
  CreateNodesContext,
  PluginConfiguration,
  ProjectConfiguration,
} from '@nx/devkit';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import {
  CreateNodesOptions,
  NormalizedCreateNodesContext,
  NormalizedPluginConfiguration,
} from './model';

export function normalizePluginsConfiguration(
  configs: PluginConfiguration[],
): NormalizedPluginConfiguration[] {
  return configs.map(config => {
    if (typeof config === 'string') {
      return {
        plugin: config,
      } satisfies NormalizedPluginConfiguration;
    }
    return config;
  });
}

export async function normalizedCreateNodesContext(
  context: CreateNodesContext,
  projectConfigurationFile: string,
  createOptions: CreateNodesOptions = {},
): Promise<NormalizedCreateNodesContext> {
  const projectRoot = dirname(projectConfigurationFile);
  const { plugins = [], ...options } = createOptions;
  const projectJson: ProjectConfiguration = JSON.parse(
    (await readFile(projectConfigurationFile)).toString(),
  ) as ProjectConfiguration;
  return {
    ...context,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    projectJson: projectJson ?? {},
    projectRoot,
    createOptions: {
      ...options,
      plugins: normalizePluginsConfiguration(plugins),
    },
  };
}
