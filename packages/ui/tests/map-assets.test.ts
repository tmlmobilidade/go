import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { loadMapAssets } from '../src/components/map/assets/load';

/* * */

describe('map asset loading', () => {
	it('resolves only after every image is registered on the map', async () => {
		let resolveImage: ((value: { data: object }) => void) | undefined;
		const loadedImages = new Set<string>();
		const image = {};
		const map = {
			addImage: (name: string) => loadedImages.add(name),
			hasImage: (name: string) => loadedImages.has(name),
			loadImage: () => new Promise<{ data: object }>((resolve) => {
				resolveImage = resolve;
			}),
		};

		const completion: unknown = loadMapAssets(map as never, [{
			name: 'test-image',
			sdf: false,
			url: '/test-image.png',
		}]);

		assert.ok(completion instanceof Promise);
		assert.equal(loadedImages.has('test-image'), false);

		resolveImage?.({ data: image });
		await completion;

		assert.equal(loadedImages.has('test-image'), true);
	});
});
