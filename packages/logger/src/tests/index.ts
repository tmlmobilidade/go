/* * */

import assert from 'node:assert/strict';

/* * */

process.env.SENTRY_NODE_DSN = 'https://public@example.com/1';

const { initSentryNode, Logger } = await import('../index.js');

const listenerCountsBefore = {
	uncaughtException: process.listenerCount('uncaughtException'),
	unhandledRejection: process.listenerCount('unhandledRejection'),
};

for (let index = 0; index < 12; index++) await initSentryNode();

assert.ok(
	process.listenerCount('uncaughtException') <= listenerCountsBefore.uncaughtException + 1,
	'initSentryNode must not register new listeners after its first call',
);
assert.ok(
	process.listenerCount('unhandledRejection') <= listenerCountsBefore.unhandledRejection + 1,
	'initSentryNode must not register new listeners after its first call',
);

const originalConsoleError = console.error;
let LOGGED_ERROR: Error | undefined;

try {
	console.error = (...args: unknown[]) => {
		LOGGED_ERROR = args.find(argument => argument instanceof Error);
	};
	const expectedError = new Error('sentinel-cause');
	Logger.error({ error: expectedError, message: 'publish failed' });
	assert.equal(LOGGED_ERROR, expectedError);
} finally {
	console.error = originalConsoleError;
}

console.log('Logger tests passed.');
