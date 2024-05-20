import { bold, code, italic, strikeThrough } from './font-style';

describe('bold', () => {
  it('should return bold text', () => {
    expect(bold('Hello World')).toBe('**Hello World**');
  });
});

describe('italic', () => {
  it('should return italic text', () => {
    expect(italic('Hello World')).toBe('_Hello World_');
  });
});

describe('strike-through', () => {
  it('should return strike-through text', () => {
    expect(strikeThrough('Hello World')).toBe('~Hello World~');
  });
});

describe('code', () => {
  it('should return code text', () => {
    expect(code('Hello World')).toBe('`Hello World`');
  });
});
