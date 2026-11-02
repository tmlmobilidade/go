package sqlite

import (
	sqlite_types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/types"
)

// SQLiteContext exposes the current validation row and access to other tables.
// Its definition lives with SQLiteRow to avoid a circular package dependency.
type SQLiteContext = sqlite_types.SQLiteContext
