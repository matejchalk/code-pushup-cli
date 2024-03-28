import { IssueSeverity } from '@code-pushup/models';
import { PackageManager } from '../../config';
import { OutdatedResult, VersionType } from './types';
import {
  npmToOutdatedResult,
  pnpmToOutdatedResult,
  yarnv1ToOutdatedResult,
  yarnv2ToOutdatedResult,
} from './unify-type';

export const outdatedSeverity: Record<VersionType, IssueSeverity> = {
  major: 'error',
  minor: 'warning',
  patch: 'info',
};

export const normalizeOutdatedMapper: Record<
  PackageManager,
  (output: string) => OutdatedResult
> = {
  npm: npmToOutdatedResult,
  'yarn-classic': yarnv1ToOutdatedResult,
  'yarn-modern': yarnv2ToOutdatedResult,
  pnpm: pnpmToOutdatedResult,
};

export const outdatedArgs: Record<PackageManager, string[]> = {
  npm: ['--long'],
  'yarn-classic': [],
  'yarn-modern': [],
  pnpm: [],
};
