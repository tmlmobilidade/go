import { createSshTunnelFactory } from './ssh.factory.js';

export * from './client.js';
export { createSshTunnelFactory, type SshTunnelFactory, type SshTunnelOptions, type SshTunnelPrefix } from './ssh.factory.js';

export const goSshTunnel = createSshTunnelFactory('GO');
export const pcgiSshTunnel = createSshTunnelFactory('PCGI');
