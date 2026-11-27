package stoptimes

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

  - File: [stop_times.txt]
  - Field: location_group_id
  - Presence: Conditionally forbidden
  - Type: Foreign ID

# Description

A supplied location_group_id is forbidden when stop_id or location_id is
supplied on the same row. Missing and whitespace-only values count as absent.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesLocationGroupIDForbidden(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the stop_times table exists
	exists, err := sqlutils.TableExists(ctx, db, "stop_times")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Report location groups supplied alongside another stop location
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"location_group_id", "stop_id", "location_id"}, func(row int, values map[string]string) error {
		groupID, stopID, locationID := values["location_group_id"], values["stop_id"], values["location_id"]
		if strings.TrimSpace(groupID) != "" && (strings.TrimSpace(stopID) != "" || strings.TrimSpace(locationID) != "") {
			findings = append(findings, types.Finding{
				Description:            "The location_group_id is forbidden when stop_id or location_id is supplied.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("The location_group_id %q conflicts with stop_id %q or location_id %q.", groupID, stopID, locationID),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"group_id": groupID, "stop_id": stopID, "location_id": locationID}),
				Severity:               config.Severity,
				FileName:               "stop_times.txt",
				Field:                  "location_group_id",
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
