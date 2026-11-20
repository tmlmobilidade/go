/**
 * Options for creating a Prometheus metrics registry.
 * Framework-agnostic — usable from Fastify APIs, workers, CLI, etc.
 */
export interface CreateMetricsRegistryOptions {
	/** Collect Node process default metrics plus CPU and RAM usage ratios. Default true. */
	collectDefaults?: boolean

	/**
	 * Prefix for default + HTTP metric names (e.g. `core_api` → `core_api_process_cpu_…`).
	 * Trailing `_` added automatically when missing.
	 */
	name?: string
}

/**
 * Options for attaching Prometheus scrape + HTTP metrics to Fastify.
 */
export type RegisterPrometheusMetricsOptions = CreateMetricsRegistryOptions & {
	/** Scrape path. Default `/metrics`. */
	endpoint?: string
	/** Collect per-route HTTP duration/count. Default true. */
	httpMetrics?: boolean
};

/**
 * Options for a standalone Prometheus scrape HTTP server (workers / CLI).
 */
export type ListenPrometheusMetricsOptions = CreateMetricsRegistryOptions & {
	/** Scrape path. Default `/metrics`. */
	endpoint?: string
	/** Host to bind. Default `::`. */
	host?: string
	/** Port to listen on. Default `METRICS_PORT` env or `9090`. */
	port?: number
};
