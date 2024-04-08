import type { CreateNodesContext, ProjectConfiguration } from '@nx/devkit';
import { ResolvePluginsOptions } from './target/code-pushup-helper';
import { CodePushupTargetOptions } from './target/model';
import { CreateTargetOptions } from './target/targets';

export type NormalizedPluginConfiguration = {
  plugin: string;
  options?: unknown;
};

export type CreateNodesOptions = CreateTargetOptions &
  Partial<ResolvePluginsOptions> &
  CodePushupTargetOptions;

export type NormalizedCreateNodesContext = CreateNodesContext & {
  projectJson: ProjectConfiguration;
} & { projectRoot: string } & {
  createOptions: Omit<CreateNodesOptions, 'plugins'> & {
    plugins: NormalizedPluginConfiguration[];
  };
};
