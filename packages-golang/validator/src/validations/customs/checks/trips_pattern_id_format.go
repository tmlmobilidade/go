package custom

import (
	"regexp"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: pattern_id
  - Presence: optional
  - Type: Foreigh Key referencing patterns.pattern_id

# Description

Validates if the pattern_id is in the correct format. Must be in the defalut format "X at XXXX_X_X" or the formats specified in the rules.
*/
func PatternIdFormat(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"pattern_id"}, func(rowCtx *context.ValidationContext) error {
		config := &rowCtx.Config

		//
		// 2. Get the pattern_id value

		value, err := queries.Field(rowCtx.Source, "pattern_id")
		if err != nil {
			return err
		}

		//
		// 3. Skip empty pattern_id values

		if value == "" {
			return nil
		}

		//
		// 4. Check if the pattern_id validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 5. Get the default pattern_id format

		expectedFormat := variables.DefaultPatternIDFormat

		//
		// 6. Get the default pattern_id expression

		allowedRegexes := []*regexp.Regexp{variables.DefaultPatternIDRegex}

		//
		// 7. Check the configured pattern_id options

		if config.Options != nil && len(*config.Options) > 0 {
			expectedFormats := make([]string, 0)
			allowedRegexes = make([]*regexp.Regexp, 0)

			for _, configuredFormatRegex := range *config.Options {
				configuredRegex, err := regexp.Compile(configuredFormatRegex)
				if err == nil {
					expectedFormats = append(expectedFormats, toPatternIDDisplayFormat(configuredFormatRegex))
					allowedRegexes = append(allowedRegexes, configuredRegex)
				}
			}

			// Fallback to default when options are present but none are recognized.
			if len(allowedRegexes) == 0 {
				allowedRegexes = []*regexp.Regexp{variables.DefaultPatternIDRegex}
			} else {
				expectedFormat = strings.Join(expectedFormats, " | ")
			}
		}

		//
		// 8. Initialize the pattern_id format result

		isValidFormat := false

		//
		// 9. Check the pattern_id against the allowed expressions

		for _, allowedRegex := range allowedRegexes {
			if allowedRegex.MatchString(value) {
				isValidFormat = true
				break
			}
		}

		//
		// 10. Report an invalid pattern_id format

		if !isValidFormat {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", expectedFormat, value))
			return nil
		}

		//
		// 11. Return success

		return nil
	})
}

func toPatternIDDisplayFormat(formatRegex string) string {
	formatted := variables.PatternIDDisplayReplacer.Replace(formatRegex)
	if strings.TrimSpace(formatted) == "" {
		return formatRegex
	}

	return formatted
}
