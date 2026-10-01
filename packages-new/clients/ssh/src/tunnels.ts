/* * */

import { createSshTunnelFactory } from './ssh.factory.js';

/* * */

export const goSshTunnel = createSshTunnelFactory('GO');
export const cpSshTunnel = createSshTunnelFactory('CP');
export const pcgiSshTunnel = createSshTunnelFactory('PCGI');
