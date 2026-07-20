/* * */

import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { SshConfig, SshTunnel, type SshTunnelOptions } from './client.js';

/* * */

export type SshTunnelType = 'GO' | 'PCGI';

const tunnelCache = new Map<string, SshTunnel>();

interface SshTunnelFactoryOptions {
	dstAddr: string
	dstPort: number
	maxRetries?: number
}

export type SshTunnelFactory = (options: SshTunnelFactoryOptions) => null | SshTunnel;

/**
 * Creates an SSH tunnel factory for the given type.
 *
 * The returned function reads `{type}_TUNNEL_*` environment variables
 * and builds an `SshTunnel` when tunneling is enabled.
 *
 * Expected environment variables:
 *   `{type}_TUNNEL_ENABLED` — `"true"` or `"false"`; `"false"` returns `null`
 *   `{type}_TUNNEL_SSH_HOST`
 *   `{type}_TUNNEL_SSH_USERNAME`
 *   `{type}_TUNNEL_SSH_KEY_PATH` (optional)
 *   `{type}_TUNNEL_SSH_KEY` (optional)
 *   `SSH_AUTH_SOCK` (optional fallback agent)
 *
 * Auth priority: `TUNNEL_SSH_KEY_PATH` > `TUNNEL_SSH_KEY` > `SSH_AUTH_SOCK`.
 */
export function createSshTunnelFactory(type: SshTunnelType): SshTunnelFactory {
	return (options: SshTunnelFactoryOptions) => buildSshTunnel(type, options);
}

function buildSshTunnel(type: SshTunnelType, options: SshTunnelFactoryOptions): null | SshTunnel {
	const { dstAddr, dstPort, maxRetries } = options;
	const env = (name: string) => process.env[`${type}_${name}`];

	if (env('TUNNEL_ENABLED') !== 'true') {
		return null;
	}

	if (!env('TUNNEL_SSH_HOST')) {
		throw new Error(`Missing ${type}_TUNNEL_SSH_HOST environment variable.`);
	}
	if (!env('TUNNEL_SSH_USERNAME')) {
		throw new Error(`Missing ${type}_TUNNEL_SSH_USERNAME environment variable.`);
	}
	if (!env('TUNNEL_SSH_KEY_PATH') && !env('TUNNEL_SSH_KEY') && !process.env.SSH_AUTH_SOCK) {
		throw new Error(`Missing authentication configuration. Please provide ${type}_TUNNEL_SSH_KEY_PATH, ${type}_TUNNEL_SSH_KEY, or ensure SSH_AUTH_SOCK is set.`);
	}

	const srcPort = randomInt(8_000, 8_999);

	const sshConfig: SshConfig = {
		forwardOptions: {
			dstAddr: dstAddr,
			dstPort: dstPort,
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
				? readFileSync(env('TUNNEL_SSH_KEY_PATH')!)
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

	const sshOptions: SshTunnelOptions = {
		maxRetries: maxRetries ?? 3,
	};

	const cacheKey = `${type}:${dstAddr}:${dstPort}`;
	const cached = tunnelCache.get(cacheKey);

	if (cached) {
		return cached;
	}

	const tunnel = new SshTunnel(sshConfig, sshOptions, () => tunnelCache.delete(cacheKey));
	tunnelCache.set(cacheKey, tunnel);

	return tunnel;
}
