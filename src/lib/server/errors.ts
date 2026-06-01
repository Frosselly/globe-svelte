export class AppError extends Error {
	constructor(
		public readonly userMessage: string,
		public readonly status: number = 400,
		cause?: unknown
	) {
		super(userMessage);
		if (cause instanceof Error) this.cause = cause;
	}
}

/** Maps any thrown value → { error: string } + appropriate HTTP status */
export function toErrorResponse(err: unknown): { message: string; status: number } {
	if (err instanceof AppError) {
		return { message: err.userMessage, status: err.status };
	}
	// Log the real error server-side, never expose it
	console.error('[unhandled]', err);
	return {
		message: 'Something went wrong. Please try again.',
		status: 500
	};
}
