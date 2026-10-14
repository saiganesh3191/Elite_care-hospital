import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

test('preview finds a free port when the requested port is occupied', {timeout: 15000}, async () => {
  const blocker = net.createServer();
  await new Promise(resolve => blocker.listen(0, '127.0.0.1', resolve));
  const occupiedPort = blocker.address().port;
  const child = spawn(process.execPath, ['scripts/serve.mjs'], {
    env: {...process.env, PORT: String(occupiedPort)},
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let errors = '';
  child.stderr.on('data', data => { errors += data; });
  try {
    const actualPort = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Preview did not start: ' + output + errors)), 10000);
      child.stdout.on('data', data => {
        output += data;
        const match = output.match(/Elite preview: http:\/\/localhost:(\d+)/);
        if (match) { clearTimeout(timeout); resolve(Number(match[1])); }
      });
      child.on('error', error => {clearTimeout(timeout); reject(error);});
      child.on('exit', code => {clearTimeout(timeout); reject(new Error('Preview exited: ' + code + errors));});
    });
    assert.notEqual(actualPort, occupiedPort);
    assert.match(output, /is in use; trying/);
    const response = await fetch('http://127.0.0.1:' + actualPort);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /ELITE HEALTH CARE/);
    assert.doesNotMatch(errors, /Unhandled|EADDRINUSE/);
  } finally {
    if (child.exitCode === null) {
      const stopped = once(child, 'exit');
      child.kill();
      await stopped;
    }
    await new Promise(resolve => blocker.close(resolve));
  }
});
