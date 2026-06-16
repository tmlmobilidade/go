export function getDefaultService(): string {
	return process.env.SERVICE_NAME ?? process.env.npm_package_name ?? 'unknown-service';
}
