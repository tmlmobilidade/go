package lib

import (
	"main/types"
)

// TODO: Move to validator-v2 if is really needed
// KeyExists checks if a given key exists in a map.
func GtfsIdMapKeyExists(gtfs *types.Gtfs, fileName string, key string) bool {
	if gtfs.IdMap == nil {
		return false
	}

	rows, ok := gtfs.IdMap[fileName]
	if !ok || rows == nil {
		return false
	}

	_, ok = rows[key]
	return ok && len(rows[key]) > 0
}
