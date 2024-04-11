import { type LogOptions } from 'simple-git';
import { HistoryOnlyOptions } from '@code-pushup/core';

export type HistoryCliOnlyOptions = {
  targetBranch?: string;
  semverTag?: boolean;
};
export type HistoryCliOptions = HistoryCliOnlyOptions &
  Pick<LogOptions, 'maxCount' | 'from' | 'to'> &
  HistoryOnlyOptions;
