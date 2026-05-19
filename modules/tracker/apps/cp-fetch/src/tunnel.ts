/* * */

import type { AddressInfo } from 'node:net';

import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { readFileSync } from 'node:fs';

/* * */

const CP_AUTH_HOST = 'login-qua2.cp.pt';
const TUNNEL_HOST = '127.0.0.1';
const TUNNEL_PORT = 6666;

/* * */

const getTunnelPort = (tunnel: SshTunnelService, localPort: number) => {
	const addr = tunnel.server?.address();
	if (addr && typeof addr === 'object') return (addr as AddressInfo).port;
	return localPort;
};

export const openTunnel = async () => {
	const sshConfig: SshConfig = {
		forwardOptions: {
			dstAddr: CP_AUTH_HOST,
			dstPort: 443,
			srcAddr: TUNNEL_HOST,
			srcPort: TUNNEL_PORT,
		},
		serverOptions: {
			host: TUNNEL_HOST,
			port: TUNNEL_PORT,
		},
		sshOptions: {
			agent: process.env.GO_TUNNEL_SSH_KEY_PATH || process.env.GO_TUNNEL_SSH_KEY ? undefined : process.env.SSH_AUTH_SOCK,
			host: process.env.GO_TUNNEL_SSH_HOST,
			keepaliveCountMax: 3,
			keepaliveInterval: 10_000,
			port: 22,
			privateKey: process.env.GO_TUNNEL_SSH_KEY_PATH ? readFileSync(process.env.GO_TUNNEL_SSH_KEY_PATH) : process.env.GO_TUNNEL_SSH_KEY,
			username: process.env.GO_TUNNEL_SSH_USERNAME,
		},
		tunnelOptions: {
			autoClose: false,
			reconnectOnError: true,
		},
	};
	const sshOptions: SshTunnelServiceOptions = {
		maxRetries: 3,
	};

	const sshTunnelService = new SshTunnelService(sshConfig, sshOptions);
	await sshTunnelService.connect();
	return getTunnelPort(sshTunnelService, TUNNEL_PORT);
};
