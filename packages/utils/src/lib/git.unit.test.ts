import {describe, expect} from 'vitest';
import {guardAgainstLocalChanges} from "@code-pushup/utils";
import {SimpleGit, StatusResult} from "simple-git";
import {GitStatusError} from "./git";

describe('guardAgainstLocalChanges', () => {
  it('should throw if no files are present', async () => {
    await expect(
      guardAgainstLocalChanges({status: () => Promise.resolve({files: ['']})} as unknown as SimpleGit),
    ).rejects.toThrow(new GitStatusError({files: ['']} as unknown as StatusResult));
  });
});
