package routes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func RoutesAgencyIDField(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {
	return true, nil, nil
}
