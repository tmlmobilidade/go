/**
 * Pushes a value into an array stored at the specified key in a Map.
 * - If the key does not exist in the map, initializes the value as a new array.
 * - Otherwise, appends the value to the existing array.
 *
 * @template K - The type of map keys.
 * @template V - The type of array values.
 * @param {Map<K, V[]>} map - The map that stores arrays as values.
 * @param {K} key - The key whose array will receive the new value.
 * @param {V} value - The value to push into the array at the specified key.
 */
export function pushArrayToMap<K, V>(map: Map<K, V[]>, key: K, value: V) {
	let arr = map.get(key);

	if (!arr) {
		arr = [];
		map.set(key, arr);
	}

	arr.push(value);
}
