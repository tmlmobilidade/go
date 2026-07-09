/* * */

import { readFileSync } from 'node:fs';
import { ForwardOptions } from 'tunnel-ssh';

import { SshConfig, SshTunnelService, SshTunnelServiceOptions } from './client.js';

/* * */

interface GetSshTunnelConfigOptions {
	forwardOptions: ForwardOptions & { srcAddr: 'localhost' }
	maxRetries?: number
	prefix: string
}

/**
 * Utility for building a strongly-typed SSH tunnel configuration for SshTunnelService.
 *
 * This function reads SSH tunnel connection options using environment variables,
 * with variable names constructed from the provided `prefix` and the option suffixes.
 *
 * Example usage:
 *   getSshTunnelConfig({
 *     forwardOptions: {
 *       srcAddr: 'localhost',
 *       srcPort: 12345,
 *       dstAddr: 'db.remote',
 *       dstPort: 27017,
 *     },
 *     maxRetries: 5,
 *     prefix: 'MYDB',
 *   });
 *
 * Expects environment variables for:
 *   <prefix>_TUNNEL_SSH_HOST,
 *   <prefix>_TUNNEL_SSH_USERNAME,
 *   <prefix>_TUNNEL_SSH_KEY_PATH (optional, path to a private key file),
 *   <prefix>_TUNNEL_SSH_KEY (optional, raw private key content),
 *   <prefix>_SSH_AUTH_SOCK (optional, agent socket).
 *
 * Priority for authentication: TUNNEL_SSH_KEY_PATH > TUNNEL_SSH_KEY > SSH_AUTH_SOCK.
 *
 * @param options - SSH tunnel config options
 * @returns SshTunnelService instance ready to connect using the provided configuration
 */
export function getSshTunnelConfig(options: GetSshTunnelConfigOptions): SshTunnelService {
	const { forwardOptions, maxRetries, prefix } = options;
	const env = (name: string) => process.env[`${prefix}_${name}`];

	// Compose SshConfig object with all parameter sections
	const sshConfig: SshConfig = {
		forwardOptions: {
			dstAddr: forwardOptions.dstAddr,
			dstPort: forwardOptions.dstPort,
			srcAddr: forwardOptions.srcAddr,
			srcPort: forwardOptions.srcPort,
		},
		serverOptions: {
			port: forwardOptions.srcPort,
		},
		sshOptions: {
			/**
			 * Auth agent will only be set if KEY_PATH and KEY are both unset.
			 */
			agent: (env('TUNNEL_SSH_KEY_PATH') || env('TUNNEL_SSH_KEY')) ? undefined : env('SSH_AUTH_SOCK'),
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
		maxRetries: maxRetries || 3,
	};

	return new SshTunnelService(sshConfig, sshOptions);
}
