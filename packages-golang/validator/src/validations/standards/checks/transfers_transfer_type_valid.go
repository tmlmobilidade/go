package standard

import (
	"slices"
	"strconv"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

/*
# Attributes

  - File: [transfers.txt]
  - Field: transfer_type
  - Presence: Required
  - Type: Enum

# Description

Connection policy: 0 or empty for a recommended transfer, 1 a timed transfer, 2 a transfer requiring
min_transfer_time, 3 no transfer, 4 an in-seat transfer or 5 an in-seat transfer that is not allowed.

Validation: Checks that the populated value represents an integer in 0, 1, 2, 3, 4, 5. Matching uses the parsed
integer rather than its original spelling. Configured options can further restrict this set; all_options bypasses
that restriction, while an empty list rejects all populated values. Empty values are skipped; required-field checks
handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[transfers.txt]: https://gtfs.org/documentation/schedule/reference/#transferstxt
*/
func TransferTypeValid(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "transfers", []string{"transfer_type"}, func(rowCtx *contextTypes.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}
		config := &rowCtx.Config

		value, err := queries.Field(rowCtx.Source, "transfer_type")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty transfer_type values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the transfer_type to an integer

		kind, err := strconv.Atoi(value)

		//
		// 4. Check if the transfer_type is valid

		if err != nil || kind < 0 || kind > 5 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 5. Check the configured transfer_type options

		if config.Options != nil && !slices.Contains(*config.Options, variables.AllRuleOptions) && !slices.Contains(*config.Options, strconv.Itoa(kind)) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "not_allowed", strconv.Itoa(kind)))
		}

		//
		// 6. Return success

		return nil
	})
}
