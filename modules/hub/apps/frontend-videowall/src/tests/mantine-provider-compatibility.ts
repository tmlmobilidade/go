/* * */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/* * */

interface PackageJson {
	dependencies: Record<string, string>
}

const appPackage = JSON.parse(readFileSync(
	new URL('../../package.json', import.meta.url),
	'utf8',
)) as PackageJson;
const uiPackage = JSON.parse(readFileSync(
	new URL('../../../../../../packages/ui/package.json', import.meta.url),
	'utf8',
)) as PackageJson;
const passwordCheck = readFileSync(
	new URL('../components/common/PasswordCheck/index.tsx', import.meta.url),
	'utf8',
);

/* * */

assert.equal(
	appPackage.dependencies['@mantine/core'],
	undefined,
	'Videowall components must consume Mantine through @tmlmobilidade/ui to share its provider context',
);
assert.equal(
	appPackage.dependencies['@mantine/hooks'],
	uiPackage.dependencies['@mantine/hooks'],
	'Videowall Mantine hooks must stay aligned with @tmlmobilidade/ui',
);
assert.doesNotMatch(
	passwordCheck,
	/from '@mantine\/core'/u,
	'PasswordCheck must not create an app-local Mantine context dependency',
);
