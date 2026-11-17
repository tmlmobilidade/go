package shapes

import (
	"context"
	"database/sql"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

func ShapesShapePtSequenceNonNegative(context.Context, *sql.DB, types.Rule) (bool, []types.Finding, error) {
	return true, nil, nil
}
