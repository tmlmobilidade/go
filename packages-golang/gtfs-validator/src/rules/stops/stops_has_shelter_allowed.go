package rules

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func stopsHasShelterAllowed(context.Context, *sql.DB, types.Rule) (bool, []Finding, error) {
	return true, nil, nil
}
