/**
 * Creates a proxy for a singleton class that delays method access until the instance is initialized.
 * @param cls - A class with a static `getInstance` method that returns a promise resolving to the class instance.
 * @returns A proxy object that intercepts method calls and ensures the instance is initialized before invoking them.
 */
export function asyncSingletonProxy<T extends object>(cls: { getInstance: () => Promise<T> }): T {
	return new Proxy({} as T, {
		get: function (_target, prop, receiver) {
			return async (...args: unknown[]) => {
				const instance = await cls.getInstance();
				const targetProp = Reflect.get(instance, prop, receiver);
				if (typeof targetProp === 'function') {
					return targetProp.apply(instance, args);
				}
				return targetProp;
			};
		},
	});
}
