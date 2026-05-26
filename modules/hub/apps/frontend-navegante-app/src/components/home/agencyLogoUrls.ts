import { imageAssetUrl } from '@/utils/imageAssetUrl';
import alsa from '@assets/global/logos/alsa.png';
import carris from '@assets/global/logos/carris.png';
import cp from '@assets/global/logos/cp.png';
import fertagus from '@assets/global/logos/fertagus.png';
import ml from '@assets/global/logos/ml.png';
import mobicascais from '@assets/global/logos/mobicascais.png';
import mts from '@assets/global/logos/MTS.png';
import rl from '@assets/global/logos/rl.png';
import tcb from '@assets/global/logos/tcb.png';
import tmp from '@assets/global/logos/tmp.png';
import tst from '@assets/global/logos/tst.png';
import ttsl from '@assets/global/logos/ttsl.png';
import va from '@assets/global/logos/va.png';

/* * */

const u = imageAssetUrl;

/** Bundled logo URL per agency id (`MultiSelect` values are strings). */
export const AGENCY_LOGO_BY_ID: Record<string, string> = {
	1: u(carris),
	15: u(fertagus),
	16: u(mts),
	2: u(ml),
	21: u(mobicascais),
	3: u(cp),
	4: u(ttsl),
	41: u(va),
	42: u(rl),
	43: u(tst),
	44: u(alsa),
	51: u(tmp),
	52: u(tmp),
	53: u(tmp),
	54: u(tmp),
	55: u(tmp),
	8: u(tcb),
};

export const AGENCY_LOGO_FALLBACK = u(tmp);
