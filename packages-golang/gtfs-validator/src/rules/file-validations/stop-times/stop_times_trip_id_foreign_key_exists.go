package stoptimes

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"strings"
)

func (StopTimesChecks) StopTimesTripIDForeignKeyExists(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {
	exists, err := sqlutils.TableExists(ctx, db, "stop_times")
	if err != nil || !exists {
		return err == nil, nil, err
	}
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id"}, func(row int, values map[string]string) error {
		value := values["trip_id"]
		if strings.TrimSpace(value) == "" {
			return nil
		}
		exists, err := sqlutils.TableExists(ctx, db, "trips")
		if err != nil {
			return err
		}
		if exists {
			exists, err = sqlutils.Exists(ctx, db, "trips", "trip_id", value)
			if err != nil {
				return err
			}
		}
		if !exists {
			findings = append(findings, types.Finding{
				Description:            "The trip_id references a missing trip_id.",
				DescriptionTranslation: types.NewTranslation("missing_reference_value", map[string]any{"field": "trip_id", "target_field": "trip_id"}),
				Message:                fmt.Sprintf("Unknown trip_id %q.", value),
				MessageTranslation:     types.NewTranslation("missing_reference_value", map[string]any{"target_field": "trip_id", "value": value}),
				Severity:               config.Severity,
				FileName:               "stop_times.txt",
				Field:                  "trip_id",
				Rows:                   []int{row},
			})
		}
		return nil
	})
	if err != nil {
		return false, nil, err
	}
	return len(findings) == 0, findings, nil
}
