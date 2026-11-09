package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"slices"
	"strconv"
)

/*
# Attributes
  - File: [calendar_dates.txt]
  - Field: exception_type
  - Presence: Required
  - Type: Enum

# Description

Indicates whether service is available on the date specified in the date field.
*/
func ExceptionTypeValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "calendar_dates", []string{"exception_type"}, func(rowCtx *context.ValidationContext) error {
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
