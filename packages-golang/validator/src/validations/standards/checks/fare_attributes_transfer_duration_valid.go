package standard

import (
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: transfer_duration
  - Presence: Optional
  - Type: Non-negative integer

# Description

Number of seconds before the right to transfer expires. With transfers=0, this can instead describe ticket validity
or be left empty.

Validation: Checks that the populated value is an integer greater than or equal to zero. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func TransferDurationValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "fare_attributes", []string{"transfer_duration"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "transfer_duration")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Convert the transfer_duration value to a number

		number, parseErr := strconv.Atoi(value)
		if parseErr != nil || number < 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 3. Return success

		return nil
	})
}
