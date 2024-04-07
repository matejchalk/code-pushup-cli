import {
  CreateNodesContext,
  PluginConfiguration,
  ProjectConfiguration,
} from '@nx/devkit';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { CreateNodesOptions, NormalizedCreateNodesContext } from './model';

export type NormalizedPluginConfiguration = {
  plugin: string;
  options?: unknown;
};

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
    projectJson,
    projectRoot,
    createOptions: {
      ...options,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      plugins: normalizePluginsConfiguration(plugins),
    },
  };
}
