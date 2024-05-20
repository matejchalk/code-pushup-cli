import { bold, code, italic } from './font-style';

describe('bold', () => {
  it('should return bold text', () => {
    expect(bold('Hello World')).toBe('<b>Hello World</b>');
  });
});

describe('italic', () => {
  it('should return italic text', () => {
    expect(italic('Hello World')).toBe('<i>Hello World</i>');
  });
});

describe('code', () => {
  it('should return code text', () => {
    expect(code('Hello World')).toBe('<code>Hello World</code>');
  });
});
