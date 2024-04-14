import type { CreateNodesContext, ProjectConfiguration } from '@nx/devkit';
import { DynamicTargetOptions } from './target/model';

export type CreateNodesOptions = DynamicTargetOptions;

export type NormalizedCreateNodesContext = CreateNodesContext & {
  projectJson: ProjectConfiguration;
} & {
  projectRoot: string;
} & {
  createOptions: CreateNodesOptions;
};
