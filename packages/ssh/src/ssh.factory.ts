/* * */

import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { SshConfig, SshTunnelService, SshTunnelServiceOptions } from './client.js';

/* * */

/** Prefix for SSH tunnel environment variables (`{prefix}_TUNNEL_*`). */
export type SshTunnelPrefix = 'GO' | 'PCGI';

/** Call-time options for creating an SSH tunnel. */
export interface SshTunnelOptions {
	/** Remote endpoint to forward traffic to. */
	forwardOptions: { dstAddr: string, dstPort: number }
	/** Maximum connection retries. Defaults to 3. */
	maxRetries?: number
}

/** A factory bound to a prefix; accepts only call-time options. */
export type SshTunnelFactory = (options: SshTunnelOptions) => null | SshTunnelService;

/**
 * Creates an SSH tunnel factory for the given prefix.
 *
 * The returned function reads `{prefix}_TUNNEL_*` environment variables
 * and builds an `SshTunnelService` when tunneling is enabled.
 *
 * Expected environment variables:
 *   `{prefix}_TUNNEL_ENABLED` — `"true"` or `"false"`; `"false"` returns `null`
 *   `{prefix}_TUNNEL_SSH_HOST`
 *   `{prefix}_TUNNEL_SSH_USERNAME`
 *   `{prefix}_TUNNEL_SSH_KEY_PATH` (optional)
 *   `{prefix}_TUNNEL_SSH_KEY` (optional)
 *   `SSH_AUTH_SOCK` (optional fallback agent)
 *
 * Auth priority: `TUNNEL_SSH_KEY_PATH` > `TUNNEL_SSH_KEY` > `SSH_AUTH_SOCK`.
 */
export function createSshTunnelFactory(prefix: SshTunnelPrefix): SshTunnelFactory {
	return (options: SshTunnelOptions) => buildSshTunnel(prefix, options);
}

function buildSshTunnel(prefix: SshTunnelPrefix, options: SshTunnelOptions): null | SshTunnelService {
	const { forwardOptions, maxRetries } = options;
	const env = (name: string) => process.env[`${prefix}_${name}`];

	if (env('TUNNEL_ENABLED') !== 'true' && env('TUNNEL_ENABLED') !== 'false') {
		throw new Error(`Missing ${prefix}_TUNNEL_ENABLED. Please indicate whether SSH tunneling is required by setting ${prefix}_TUNNEL_ENABLED to "true" or "false".`);
	}

	if (env('TUNNEL_ENABLED') === 'false') {
		return null;
	}

	if (!env('TUNNEL_SSH_HOST')) {
		throw new Error(`Missing ${prefix}_TUNNEL_SSH_HOST environment variable.`);
	}
	if (!env('TUNNEL_SSH_USERNAME')) {
		throw new Error(`Missing ${prefix}_TUNNEL_SSH_USERNAME environment variable.`);
	}
	if (!env('TUNNEL_SSH_KEY_PATH') && !env('TUNNEL_SSH_KEY') && !process.env.SSH_AUTH_SOCK) {
		throw new Error(`Missing authentication configuration. Please provide ${prefix}_TUNNEL_SSH_KEY_PATH, ${prefix}_TUNNEL_SSH_KEY, or ensure SSH_AUTH_SOCK is set.`);
	}

	const srcPort = randomInt(8_000, 8_999);

	const sshConfig: SshConfig = {
		forwardOptions: {
			dstAddr: forwardOptions.dstAddr,
			dstPort: forwardOptions.dstPort,
			srcAddr: 'localhost',
			srcPort: srcPort,
		},
		serverOptions: {
			port: srcPort,
		},
		sshOptions: {
			agent: (env('TUNNEL_SSH_KEY_PATH') || env('TUNNEL_SSH_KEY')) ? undefined : process.env.SSH_AUTH_SOCK,
			host: env('TUNNEL_SSH_HOST'),
			keepaliveCountMax: 3,
			keepaliveInterval: 10_000,
			port: 22,
			privateKey: env('TUNNEL_SSH_KEY_PATH')
				? readFileSync(env('TUNNEL_SSH_KEY_PATH'))
				: env('TUNNEL_SSH_KEY')
					? env('TUNNEL_SSH_KEY')
					: undefined,
			username: env('TUNNEL_SSH_USERNAME'),
		},
		tunnelOptions: {
			autoClose: false,
			reconnectOnError: true,
		},
	};

	const sshOptions: SshTunnelServiceOptions = {
		maxRetries: maxRetries ?? 3,
	};

	return new SshTunnelService(sshConfig, sshOptions);
}
