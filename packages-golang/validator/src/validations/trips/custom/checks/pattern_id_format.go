package trips_custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"regexp"
	"strings"
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
func PatternIdFormat(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_pattern_id_format"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pattern_id value

	value, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty pattern_id values

	if value == "" {
		return nil
	}

	//
	// 5. Check if the pattern_id validation should run

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 6. Get the default pattern_id format

	expectedFormat := defaultPatternIDFormat

	//
	// 7. Get the default pattern_id expression

	allowedRegexes := []*regexp.Regexp{regexp.MustCompile(defaultPatternIDRegex)}

	//
	// 8. Check the configured pattern_id options

	if rules != nil && rules.Options != nil && len(*rules.Options) > 0 {
		expectedFormats := make([]string, 0)
		allowedRegexes = make([]*regexp.Regexp, 0)

		for _, configuredFormatRegex := range *rules.Options {
			configuredRegex, err := regexp.Compile(configuredFormatRegex)
			if err == nil {
				expectedFormats = append(expectedFormats, toPatternIDDisplayFormat(configuredFormatRegex))
				allowedRegexes = append(allowedRegexes, configuredRegex)
			}
		}

		// Fallback to default when options are present but none are recognized.
		if len(allowedRegexes) == 0 {
			allowedRegexes = []*regexp.Regexp{regexp.MustCompile(defaultPatternIDRegex)}
		} else {
			expectedFormat = strings.Join(expectedFormats, " | ")
		}
	}

	//
	// 9. Initialize the pattern_id format result

	isValidFormat := false

	//
	// 10. Check the pattern_id against the allowed expressions

	for _, allowedRegex := range allowedRegexes {
		if allowedRegex.MatchString(value) {
			isValidFormat = true
			break
		}
	}

	//
	// 11. Report an invalid pattern_id format

	if !isValidFormat {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", expectedFormat, value))
		return nil
	}

	//
	// 12. Return success

	return nil
}

const defaultPatternIDFormat = "XXXX_X_X"
const defaultPatternIDRegex = `^[^_]{1,4}_[^_]_[^_]$`

var patternIDDisplayReplacer = strings.NewReplacer(
	`[^_]{1,4}`, "XXXX",
	`[^_]`, "X",
	`^`, "",
	`$`, "",
	`\`, "",
	`(`, "",
	`)`, "",
)

func toPatternIDDisplayFormat(formatRegex string) string {
	formatted := patternIDDisplayReplacer.Replace(formatRegex)
	if strings.TrimSpace(formatted) == "" {
		return formatRegex
	}

	return formatted
}
