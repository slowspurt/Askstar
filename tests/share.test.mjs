import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/utils/shareUtils.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
});
const { createShareUrl, readShareUrl } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const now = Date.now();
const profile = { name: '별 ✨ <친구>', sunSign: 'aries', moonSign: 'pisces', risingSign: 'leo' };
const hash = new URL(createShareUrl(profile, 'https://portfolio.example', now)).hash;
const encode = payload => '#' + Buffer.from(JSON.stringify(payload)).toString('base64url');

test('a Unicode share link opens without storage or a server and excludes original birth inputs', () => {
  const result = createShareUrl({ ...profile, birthYear: '1990', birthHour: '12', city: 'Seoul', gender: 'other' }, 'https://portfolio.example', now);
  const url = new URL(result);
  assert.equal(url.pathname, '/share');
  assert.equal(url.search, '');
  const payload = JSON.parse(Buffer.from(url.hash.slice(1), 'base64url').toString());
  assert.deepEqual(Object.keys(payload).sort(), ['n', 's', 't', 'v']);
  assert.deepEqual(readShareUrl(url.hash, now), { userData: profile });
});

test('links expire exactly after 24 hours', () => {
  assert.ok(readShareUrl(hash, now + 86_399_999));
  assert.equal(readShareUrl(hash, now + 86_400_000), null);
});

test('invalid, oversized, unsupported and malformed payloads cannot render results', () => {
  for (const invalid of ['', '#bad!token', '#abc', '#' + 'a'.repeat(1025),
    encode(null), encode({}), encode({ v: 2, n: 'Name', s: [0, 1, 2], t: now }),
    encode({ v: 1, n: 'Name', s: [0, 12, 2], t: now }),
    encode({ v: 1, n: 'Name', s: [0, '1', 2], t: now }),
    encode({ v: 1, n: 'Name', s: [0, 1], t: now }),
    encode({ v: 1, n: ' ', s: [0, 1, 2], t: now }),
    encode({ v: 1, n: 'Name', s: [0, 1, 2], t: now + 3600000 })]) {
    assert.equal(readShareUrl(invalid, now), null);
  }
});
