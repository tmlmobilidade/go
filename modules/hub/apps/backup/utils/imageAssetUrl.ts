import type { StaticImageData } from 'next/image';

/* * */

export function imageAssetUrl(mod: StaticImageData | string) {
	return typeof mod === 'string' ? mod : mod.src;
}
