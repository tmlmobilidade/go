package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: transfers
  - Presence: Required
  - Type: Enum

# Description

Number of transfers included in the fare: 0 for none, 1 for one, 2 for two or an empty value for unlimited
transfers.

Validation: Checks that the populated value represents an integer in 0, 1, 2. Matching uses the parsed integer
rather than its original spelling. Configured value lists are not applied. Empty values are skipped; required-field
checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func TransfersValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "fare_attributes", []string{"transfers"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "transfers")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Convert the transfers value to a number

		number, parseErr := strconv.Atoi(value)
		if parseErr != nil || number < 0 || number > 2 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 3. Return success

		return nil
	})
}
