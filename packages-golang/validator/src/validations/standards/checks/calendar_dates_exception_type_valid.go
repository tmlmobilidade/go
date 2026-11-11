package standard

import (
	"slices"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [calendar_dates.txt]
  - Field: exception_type
  - Presence: Required
  - Type: Enum

# Description

Specifies the change for the given service_id and date: 1 adds service and 2 removes service.

Validation: Checks that the populated value represents an integer in 1, 2. Matching uses the parsed integer rather
than its original spelling. Configured value lists are not applied. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[calendar_dates.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/calendar-dates
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#calendar_datestxt
*/
func ExceptionTypeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar_dates", []string{"exception_type"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		exceptionType, err := queries.Field(rowCtx.Source, "exception_type")
		if err != nil {
			return err
		}
		if exceptionType == "" {
			return nil
		}

		//
		// 2. Validate exception_type is a valid exception type

		validExceptionTypes := []int{1, 2}
		exceptionTypeInt, err := strconv.Atoi(exceptionType)
		if err != nil || !slices.Contains(validExceptionTypes, exceptionTypeInt) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", exceptionType))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
