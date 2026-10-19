/* * */

import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { randomInt } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { SshConfig, SshTunnel, type SshTunnelOptions } from './client.js';

/* * */

export type SshTunnelType = 'CP' | 'GO' | 'PCGI';

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
	//

	//
	// Setup a helper function to get the environment variable

	const env = (name: string) => process.env[`${type}_${name}`];

	//
	// Check if tunnel is enabled

	if (env('TUNNEL_ENABLED') !== 'true') {
		return null;
	}

	//
	// Check if required SSH options are set

	if (!options.dstAddr) throw new Error(`Missing dstAddr in options.`);

	if (!options.dstPort) throw new Error(`Missing dstPort in options.`);

	//
	// Setup SHH Host and Username. Both are required for tunneling.

	const tunnelSshHost = env('TUNNEL_SSH_HOST');
	const tunnelSshUsername = env('TUNNEL_SSH_USERNAME');

	if (!tunnelSshHost) throw new Error(`Missing ${type}_TUNNEL_SSH_HOST environment variable.`);

	if (!tunnelSshUsername) throw new Error(`Missing ${type}_TUNNEL_SSH_USERNAME environment variable.`);

	//
	// Setup the SSH agent and private key.
	// SSH agent is used when no private key or key path is provided,
	// and a value is set for the SSH_AUTH_SOCK environment variable.

	const tunnelSshKeyPath = env('TUNNEL_SSH_KEY_PATH');
	const tunnelSshKey = env('TUNNEL_SSH_KEY');

	let shouldUseSshAgent: boolean;
	let privateKeyValue: Buffer | string | undefined;

	if (tunnelSshKeyPath) {
		shouldUseSshAgent = false;
		privateKeyValue = readFileSync(tunnelSshKeyPath);
		Logger.info(`Using ${type}_TUNNEL_SSH_KEY_PATH to connect to ${type}_TUNNEL.`);
	} else if (tunnelSshKey) {
		shouldUseSshAgent = false;
		privateKeyValue = tunnelSshKey;
		Logger.info(`Using ${type}_TUNNEL_SSH_KEY to connect to ${type}_TUNNEL.`);
	} else if (process.env.SSH_AUTH_SOCK) {
		shouldUseSshAgent = true;
		privateKeyValue = undefined;
		Logger.info(`Using SSH agent on ${process.env.SSH_AUTH_SOCK} to connect to ${type}_TUNNEL.`);
	} else {
		throw new Error(`Missing authentication configuration. Please provide ${type}_TUNNEL_SSH_KEY_PATH, ${type}_TUNNEL_SSH_KEY, or ensure SSH_AUTH_SOCK is set.`);
	}

	//
	// Assign a random source port

	const srcPort = randomInt(8_000, 8_999);

	//
	// Build SSH config

	const sshConfig: SshConfig = {
		forwardOptions: {
			dstAddr: options.dstAddr,
			dstPort: options.dstPort,
			srcAddr: 'localhost',
			srcPort: srcPort,
		},
		serverOptions: {
			port: srcPort,
		},
		sshOptions: {
			agent: shouldUseSshAgent ? process.env.SSH_AUTH_SOCK : undefined,
			host: tunnelSshHost,
			keepaliveCountMax: 3,
			keepaliveInterval: 10_000,
			port: 22,
			privateKey: privateKeyValue,
			username: tunnelSshUsername,
		},
		tunnelOptions: {
			autoClose: false,
			reconnectOnError: true,
		},
	};

	const sshOptions: SshTunnelOptions = {
		maxRetries: options.maxRetries ?? 3,
	};

	const cacheKey = `${type}:${options.dstAddr}:${options.dstPort}`;
	const cached = tunnelCache.get(cacheKey);

	if (cached) {
		return cached;
	}

	const tunnel = new SshTunnel(sshConfig, sshOptions, () => tunnelCache.delete(cacheKey));
	tunnelCache.set(cacheKey, tunnel);

	return tunnel;
}
