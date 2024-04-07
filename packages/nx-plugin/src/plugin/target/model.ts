import { GlobalOptions } from '@code-pushup/core';
import type { CoreConfig } from '@code-pushup/models';

export type CoreConfigOptions = Partial<
  Pick<CoreConfig, 'persist' | 'plugins'> & {
    upload?: { project?: string };
  }
>;
export type CodePushupTargetOptions = {
  cwd?: string;
} & Partial<GlobalOptions> &
  CoreConfigOptions;
