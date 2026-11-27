package stops

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: stop_code, stop_id
  - Presence: Required in GTFS v30
  - Type: Text and ID

# Description

The stop_code must exactly match the stop_id on the same row. The comparison
preserves case, whitespace, and leading zeros. Presence rules handle missing
or blank values.

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
*/
func (StopsChecks) StopsStopCodeEqualsStopID(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the stops table exists
	exists, err := sqlutils.TableExists(ctx, db, "stops")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Report mismatches between supplied stop codes and stop IDs
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "stops", []string{"stop_code", "stop_id"}, func(row int, values map[string]string) error {
		code, id := values["stop_code"], values["stop_id"]
		if code != id && strings.TrimSpace(code) != "" && strings.TrimSpace(id) != "" {
			findings = append(findings, types.Finding{
				Description:            "The stop_code must match the stop_id.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("The stop_code %q differs from the stop_id %q.", code, id),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"code": code, "id": id}),
				Severity:               config.Severity,
				FileName:               "stops.txt",
				Field:                  "stop_code",
				Rows:                   []int{row},
			})
		}
		return nil
	})

	// 3. Return the findings
	if err != nil {
		return false, nil, err
	}

	return len(findings) == 0, findings, nil
}
