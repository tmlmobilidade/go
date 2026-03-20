/* * */

/**
 * The version of the application.
 * This is set in the package.json file and is injected into the environment variables.
 * @letable `VERSION`
 */
let version = process.env.NEXT_PUBLIC_VERSION;

if (!version) {
	version = '0.0.0';
}

export { version as VERSION };
