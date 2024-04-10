import { describe, expect, it } from 'vitest';
import { auditOutputSchema } from '@code-pushup/models';
import { JS_BENCHMARKING_PLUGIN_SLUG } from '../constants';
import { BenchmarkResult } from './types';
import { suiteResultToAuditOutput, toAuditSlug } from './utils';

describe('toAuditSlug', () => {
  it('should create slug string', () => {
    expect(toAuditSlug('glob')).toBe(`${JS_BENCHMARKING_PLUGIN_SLUG}-glob`);
  });
});

describe('suiteResultToAuditOutput', () => {
  it('should produce valid minimal AuditOutput for a single result', () => {
    const auditOutput = suiteResultToAuditOutput([
      {
        suiteName: 'sort',
        hz: 100,
        rme: 1,
        name: 'implementation-1',
        isFastest: true,
        isTarget: true,
        samples: 4,
      },
    ]);
    expect(auditOutput).toEqual(
      expect.objectContaining({
        slug: toAuditSlug('sort'),
        score: 1,
        value: 100,
        displayValue: '100.00 ops/sec',
      }),
    );
    expect(() => auditOutputSchema.parse(auditOutput)).not.toThrow();
  });

  it('should have hz as value and converted to integer', () => {
    expect(
      suiteResultToAuditOutput([
        {
          hz: 100.1111,
          isFastest: true,
          isTarget: true,
          suiteName: 'sort',
          rme: 1,
        } as BenchmarkResult,
      ]),
    ).toEqual(expect.objectContaining({ value: 100 }));
  });

  it('should score based on maxHz', () => {
    expect(
      suiteResultToAuditOutput([
        {
          suiteName: 'glob',
          hz: 100,
          rme: 2.5,
          name: 'globby',
          isFastest: true,
          isTarget: false,
          samples: 4,
        },
        {
          suiteName: 'glob',
          hz: 10,
          rme: 2.5,
          name: 'globby2',
          isFastest: false,
          isTarget: true,
          samples: 4,
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        score: 0.1,
      }),
    );
  });

  it('should score a maximum of 1', () => {
    expect(
      suiteResultToAuditOutput([
        {
          suiteName: 'glob',
          hz: 0.1,
          rme: 2.5,
          name: 'target',
          isFastest: false,
          isTarget: true,
          samples: 4,
        },
        {
          suiteName: 'glob',
          hz: 1,
          rme: 2.5,
          name: 'other',
          isFastest: true,
          isTarget: false,
          samples: 4,
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        score: 0.1,
      }),
    );
  });

  it('should format value to 2 floating positions', () => {
    expect(
      suiteResultToAuditOutput([
        {
          suiteName: 'glob',
          hz: 1.111_111,
          rme: 2.5,
          name: 'globby',
          isFastest: true,
          isTarget: true,
          samples: 4,
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        displayValue: '1.11 ops/sec',
      }),
    );
  });

  it('should pick fastest test result as scoring base', () => {
    expect(
      suiteResultToAuditOutput([
        {
          suiteName: 'sort',
          hz: 100,
          rme: 1,
          name: 'implementation-1',
          isFastest: true,
          isTarget: false,
          samples: 4,
        },
        {
          suiteName: 'sort',
          hz: 10,
          rme: 1,
          name: 'implementation-2',
          isFastest: false,
          isTarget: true,
          samples: 4,
        },
      ]),
    ).toEqual(expect.objectContaining({ score: 0.1 }));
  });

  it('should pick target test result for AuditOutput data', () => {
    expect(
      suiteResultToAuditOutput([
        {
          suiteName: 'sort',
          hz: 99,
          rme: 1,
          name: 'implementation-1',
          isFastest: true,
          isTarget: true,
          samples: 4,
        },
        {
          suiteName: 'sort',
          hz: 10,
          rme: 1,
          name: 'implementation-2',
          isFastest: false,
          isTarget: false,
          samples: 4,
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        slug: toAuditSlug('sort'),
        value: 99,
        displayValue: '99.00 ops/sec',
      }),
    );
  });

  it('should have correct details for a suit with score 100', () => {
    expect(
      suiteResultToAuditOutput([
        {
          suiteName: 'sort',
          hz: 100,
          rme: 1,
          name: 'implementation-1',
          isFastest: true,
          isTarget: true,
          samples: 5,
        },
        {
          suiteName: 'sort',
          hz: 60,
          rme: 1.12,
          name: 'implementation-2',
          isFastest: false,
          isTarget: false,
          samples: 4,
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        details: {
          issues: expect.arrayContaining([
            {
              message: `🎯implementation-1 x 100.00 ops/sec ±1.00; 5 samples (fastest 🔥)`,
              severity: 'info',
            },
            {
              message: `implementation-2 x 60.00 ops/sec ±1.12; 4 samples (40.0% slower)`,
              severity: 'info',
            },
          ]),
        },
      }),
    );
  });

  it('should have correct details for a suit with score long floating number', () => {
    expect(
      suiteResultToAuditOutput([
        {
          suiteName: 'sort',
          hz: 100.0001,
          rme: 1,
          name: 'implementation-1',
          isFastest: true,
          isTarget: false,
          samples: 5,
        },
        {
          suiteName: 'sort',
          hz: 60.123,
          rme: 1.12,
          name: 'implementation-2',
          isFastest: false,
          isTarget: true,
          samples: 4,
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        details: {
          issues: expect.arrayContaining([
            {
              message: `implementation-1 x 100.00 ops/sec ±1.00; 5 samples (fastest 🔥)`,
              severity: 'info',
            },
            {
              message: `🎯implementation-2 x 60.12 ops/sec ±1.12; 4 samples (39.9% slower)`,
              severity: 'error',
            },
          ]),
        },
      }),
    );
  });
});