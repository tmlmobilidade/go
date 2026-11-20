package feedinfo

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

  - File: [feed_info.txt]
  - Field: feed_start_date, feed_end_date
  - Presence: Required in GTFS v30
  - Type: Date

# Description

The start date must be on or before the end date. Equal dates define a
single-day feed validity interval because the end date is inclusive. This check skips rows
with missing or invalid dates, which the presence and format rules handle.

[feed_info.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/feed-info
*/
func (FeedInfoChecks) FeedInfoStartDateBeforeEndDate(ctx context.Context, db *sql.DB, config types.Rule) (bool, []types.Finding, error) {

	//
	// 1. Check if the feed_info table exists
	exists, err := sqlutils.TableExists(ctx, db, "feed_info")
	if err != nil || !exists {
		return err == nil, nil, err
	}

	// 2. Compare valid dates in chronological YYYYMMDD order
	var findings []types.Finding
	err = sqlutils.ForEachRow(ctx, db, "feed_info", []string{"feed_start_date", "feed_end_date"}, func(row int, values map[string]string) error {
		start := strings.TrimSpace(values["feed_start_date"])
		end := strings.TrimSpace(values["feed_end_date"])
		if validators.ValidateDate(start) && validators.ValidateDate(end) && start > end {
			findings = append(findings, types.Finding{
				Description: "The feed_start_date must be on or before the feed_end_date.",
				Message:     fmt.Sprintf("The feed_start_date %q is after the feed_end_date %q.", start, end),
				Severity:    config.Severity,
				FileName:    "feed_info.txt",
				Field:       "feed_start_date",
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
