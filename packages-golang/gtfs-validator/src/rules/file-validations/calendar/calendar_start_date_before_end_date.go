package calendar

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
	sqlutils "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/sql"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/utils/validators"
)

/*
# Attributes

  - File: [calendar.txt]
  - Field: start_date, end_date
  - Presence: Required
  - Type: Date

# Description

The start date must be on or before the end date. Equal dates define a
single-day interval because the end date is inclusive. This check skips rows
with missing or invalid dates, which the presence and format rules handle.

[calendar.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar
*/
func (CalendarChecks) CalendarStartDateBeforeEndDate(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the calendar table exists
	exists, err := sqlutils.TableExists(ctx, db, "calendar")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Compare valid dates in chronological YYYYMMDD order
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "calendar", []string{"start_date", "end_date"}, func(row int, values map[string]string) error {
		start := strings.TrimSpace(values["start_date"])
		end := strings.TrimSpace(values["end_date"])
		if validators.ValidateDate(start) && validators.ValidateDate(end) && start > end {
			findings = append(findings, types.Finding{
				Description: "The start_date must be on or before the end_date.",
				Message:     fmt.Sprintf("The start_date %q is after the end_date %q.", start, end),
				Severity:    config.Severity,
				FileName:    "calendar.txt",
				Field:       "start_date",
				Rows:        []int{row},
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
