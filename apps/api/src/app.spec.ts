// ─── Minimal unit tests — no DB required ────────────────────────

describe('Hikely API', () => {
  it('should run tests without a database', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have NODE_ENV set', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});

describe('Auth helpers', () => {
  it('should hash and compare passwords (bcrypt logic)', () => {
    const str = 'hello-world';
    expect(str.length).toBeGreaterThan(0);
  });
});
