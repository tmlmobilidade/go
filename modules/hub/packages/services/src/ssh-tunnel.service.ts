import type { AddressInfo, Server } from 'net';
import type { ForwardOptions, ServerOptions, SshOptions, TunnelOptions } from 'tunnel-ssh';

import { createTunnel } from 'tunnel-ssh';

export interface SshConfig {
	forwardOptions: ForwardOptions
	serverOptions: ServerOptions
	sshOptions: SshOptions
	tunnelOptions: TunnelOptions
}

export interface SshTunnelServiceOptions {
	maxRetries?: number
}

export class SshTunnelService {
	private static _instance: SshTunnelService;

	private _server: Server;
	private config: SshConfig;
	private options: SshTunnelServiceOptions;
	private retries = 0;

	constructor(config: SshConfig, options?: SshTunnelServiceOptions) {
		this.config = config;
		if (options) this.options = options;
	}

	get server(): Server | undefined {
		return this._server;
	}

	/**
     * Get the singleton instance of SshTunnelService.
     */
	public static getInstance(config?: SshConfig, options?: SshTunnelServiceOptions): SshTunnelService {
		if (!SshTunnelService._instance) {
			if (!config) {
				throw new Error('SSH Config is required');
			}

			SshTunnelService._instance = new SshTunnelService(config, options);
		}

		return SshTunnelService._instance;
	}

	/**
     * Establishes an SSH tunnel connection using the provided configuration options.
     *
     * @throws {Error} Throws an error if the connection fails after the maximum number of retries.
     *
     * @remarks
     * - The method attempts to create an SSH tunnel using the `createTunnel` function with the specified options.
     * - If the connection is successful, it logs the connected host port and sets up an error listener on the server.
     * - If the connection fails, it retries the connection up to a maximum number of retries specified in the options.
     *
     * @example
     * ```typescript
     * const sshTunnelService = new SshTunnelService(config);
     * sshTunnelService.connect();
     * ```
     */
	async connect() {
		try {
			const [server] = await createTunnel(this.config.tunnelOptions, this.config.serverOptions, this.config.sshOptions, this.config.forwardOptions);
			console.log(`⤷ SSH Tunnel connected to host port ${(server.address() as AddressInfo).port}`);

			this.retries = 0;
			this._server = server;

			server.on('error', (error) => {
				console.log(`⤷ SSH Tunnel Error:`, error);
			});

			server.on('close', () => {
				console.log(`⤷ SSH Tunnel closed.`);
			});
		} catch (error: unknown) {
			const code = error !== null && typeof error === 'object' && 'code' in error
				? (error as NodeJS.ErrnoException).code
				: undefined;
			if (code === 'EADDRINUSE') {
				console.log(`⤷ ERROR: Port "${this.config.serverOptions.port}" already in use. Retrying with a different port...`);
				if (this.config.serverOptions.port) this.config.serverOptions.port++;
				return await this.connect();
			}

			console.log(`⤷ ERROR: Failed to connect to SSH Tunnel.`, error);
			if (this.retries < (this.options?.maxRetries || 3)) {
				this.retries++;
				console.log(`⤷ Retrying SSH connection...`);
				return await this.connect();
			}
			throw new Error('Error connecting to SSH tunnel', { cause: error });
		}
	}

	/**
     * Disconnects the SSH tunnel by closing the server.
     *
     * @returns {Promise<void>} A promise that resolves when the server is successfully closed.
     * @throws Will log an error message if the server fails to close.
     */
	async disconnect() {
		try {
			this._server.close();
			console.log(`⤷ SSH Tunnel disconnected.`);
		} catch (error) {
			console.log(`⤷ ERROR: Failed to disconnect from SSH Tunnel.`, error);
		}
	}

	/**
     * Reconnects the SSH tunnel by first disconnecting and then connecting again.
     * This method ensures that the connection is reset.
     *
     * @returns {Promise<void>} A promise that resolves when the reconnection process is complete.
     */
	async reconnect() {
		await this.disconnect();
		await this.connect();
	}
}
