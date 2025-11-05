/**
 * Checks if the current platform is macOS.
 * @returns True if the platform is macOS, false otherwise.
 */
export function isPlatformMac() {
	return navigator.userAgent.toUpperCase().includes('MAC');
}
