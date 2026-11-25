package stoptimes

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
)

/*
# Attributes

  - File: [stop_times.txt]
  - Field: stop_sequence
  - Presence: Required
  - Type: Non-negative integer

# Description

Stop sequence values must be distinct within each trip. Numeric sequence
defines stop order, so CSV row order and gaps in the sequence are allowed.
The check skips rows with blank trip IDs or missing or invalid sequences.

[stop_times.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stop-times
*/
func (StopTimesChecks) StopTimesIncreasingStopSequence(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the stop_times table exists
	exists, err := sqlutils.TableExists(ctx, db, "stop_times")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Group source rows by trip ID and numeric sequence
	type tripSequence struct {
		id       string
		sequence int64
	}
	rowsByStop := make(map[tripSequence][]int)
	var stops []tripSequence
	err = sqlutils.ForEachRow(ctx, db, "stop_times", []string{"trip_id", "stop_sequence"}, func(row int, values map[string]string) error {
		id := values["trip_id"]
		sequence, err := strconv.ParseInt(strings.TrimSpace(values["stop_sequence"]), 10, 64)
		if strings.TrimSpace(id) == "" || err != nil || sequence < 0 {
			return nil
		}
		stop := tripSequence{id: id, sequence: sequence}
		if len(rowsByStop[stop]) == 0 {
			stops = append(stops, stop)
		}
		rowsByStop[stop] = append(rowsByStop[stop], row)
		return nil
	})
	if err != nil {
		return false, nil, err
	}

	// 3. Report duplicate sequences with all corresponding source rows
	var findings []types.Finding
	for _, stop := range stops {
		rows := rowsByStop[stop]
		if len(rows) > 1 {
			findings = append(findings, types.Finding{
				Description:            "The stop_sequence must increase strictly within each trip.",
				DescriptionTranslation: types.NewTranslation("default", nil),
				Message:                fmt.Sprintf("Trip %q uses stop_sequence %d more than once.", stop.id, stop.sequence),
				MessageTranslation:     types.NewTranslation("default", map[string]any{"trip_id": stop.id, "sequence": stop.sequence}),
				Severity:               config.Severity,
				FileName:               "stop_times.txt",
				Field:                  "stop_sequence",
				Rows:                   rows,
			})
		}
	}

	// 4. Return the findings
	return len(findings) == 0, findings, nil
}
