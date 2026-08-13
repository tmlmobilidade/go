export interface RunGoBinaryOptions {
	/** Arguments to pass to the binary */
	args?: string[]
	/** Working directory for the process */
	cwd?: string
	/** Environment variables to pass to the process */
	env?: Record<string, string>
	/** Forward stdout/stderr to parent process while capturing (default: true) */
	forwardOutput?: boolean
	/** Maximum stderr buffer size in bytes (default: 1MB) */
	maxStderrSize?: number
	/** Maximum stdout buffer size in bytes (default: 10MB) */
	maxStdoutSize?: number
	/** Timeout in milliseconds (default: 5 minutes) */
	timeout?: number
}
