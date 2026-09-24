/**
 * Options for creating a Prometheus metrics registry.
 * Framework-agnostic — usable from Fastify APIs, workers, CLI, etc.
 */
export type CreateMetricsRegistryOptions = {
	/**
	 * Prefix for default + HTTP metric names (e.g. `core_api` → `core_api_process_cpu_…`).
	 * Trailing `_` added automatically when missing.
	 */
	name?: string
	/** Collect Node process default metrics. Default true. */
	collectDefaults?: boolean
};

/**
 * Options for attaching Prometheus scrape + HTTP metrics to Fastify.
 */
export type RegisterPrometheusMetricsOptions = CreateMetricsRegistryOptions & {
	/** Scrape path. Default `/metrics`. */
	endpoint?: string
	/** Collect per-route HTTP duration/count. Default true. */
	httpMetrics?: boolean
};
