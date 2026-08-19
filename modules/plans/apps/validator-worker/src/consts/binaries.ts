/** Binary produced for each Node.js platform and architecture supported by the worker. */
export const BINARY_NAMES: Partial<Record<`${NodeJS.Platform}-${string}`, string>> = {
	'darwin-arm64': 'validator-darwin-arm64',
	'darwin-x64': 'validator-darwin-amd64',
	'linux-arm64': 'validator-linux-arm64',
	'linux-x64': 'validator-linux-amd64',
};
