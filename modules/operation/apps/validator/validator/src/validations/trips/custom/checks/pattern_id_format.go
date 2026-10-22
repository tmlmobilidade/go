package trips_custom

import (
	"main/lib"
	"main/services"
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
	const ruleID = "trips_pattern_id_matches_feed_pattern_id_syntax"
	ctx := lib.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Trips.Field("pattern_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if ctx.ShouldSkip() {
		return nil
	}
	// 3. Validate pattern_id is valid
	expectedFormat := defaultPatternIDFormat
	allowedRegexes := []*regexp.Regexp{regexp.MustCompile(defaultPatternIDRegex)}

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

	// 4. Validate pattern_id is valid
	isValidFormat := false
	for _, allowedRegex := range allowedRegexes {
		if allowedRegex.MatchString(value) {
			isValidFormat = true
			break
		}
	}

	// 5. Validate pattern_id is invalid
	if !isValidFormat {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", expectedFormat, value))
		return nil
	}
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
