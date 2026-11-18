package trips

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"strings"
)

func (TripsChecks) TripShapeIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, "trips")
	if err != nil || !exists {
		return err == nil, nil, err
	}
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "trips", []string{"shape_id"}, func(row int, values map[string]string) error {
		value := values["shape_id"]
		if strings.TrimSpace(value) == "" {
			return nil
		}
		for _, table := range []string{"shapes"} {
			exists, err := sqlutils.TableExists(ctx, db, table)
			if err != nil {
				return err
			}
			if !exists {
				continue
			}
			exists, err = sqlutils.Exists(ctx, db, table, "shape_id", value)
			if err != nil {
				return err
			}
			if exists {
				return nil
			}
		}
		findings = append(findings, types.Finding{Description: "The shape_id references a missing shape_id.", Message: fmt.Sprintf("Unknown shape_id %q.", value), Severity: config.Severity, FileName: "trips.txt", Field: "shape_id", Rows: []int{row}})
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	return len(findings) == 0, findings, nil
}
