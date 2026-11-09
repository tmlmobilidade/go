package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	variables "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [transfers.txt]
  - Field: transfer_type
  - Presence: Required
  - Type: Enum

# Description

Indicates the type of connection for the specified (from_stop_id, to_stop_id) pair. Valid options are:

0 or empty - Recommended transfer point between routes.
1 - Timed transfer point between two routes. The departing vehicle is expected to wait for the arriving one and leave sufficient time for a rider to transfer between routes.
2 - Transfer requires a minimum amount of time between arrival and departure to ensure a connection. The time required to transfer is specified by min_transfer_time.
3 - Transfers are not possible between routes at the location.
4 - Passengers can transfer from one trip to another by staying onboard the same vehicle (an "in-seat transfer"). More details about this type of transfer below.
5 - In-seat transfers are not allowed between sequential trips. The passenger must alight from the vehicle and re-board. More details about this type of transfer below.

[transfers.txt]: https://gtfs.org/schedule/reference/#transfertstxt
*/
func TransferTypeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "transfers", []string{"transfer_type"}, func(rowCtx *context.ValidationContext) error {
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
