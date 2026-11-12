export interface GoBinaryResult<T = unknown> {
	/** Parsed JSON output */
	data: T
	/** Execution time in milliseconds */
	executionTime: number
	/** Exit code */
	exitCode: number
	/** Raw stderr content */
	stderr: string
	/** Raw stdout content */
	stdout: string
}
