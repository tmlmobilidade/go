package trips

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
  - Presence: optional (Required for "Transportes Metropolitanos de Lisboa")
  - Type: Foreigh Key referencing patterns.pattern_id

# Description

Validates if the pattern_id is in the correct format. Must be in the defalut format "X at XXXX_X_X" or the formats specified in the rules.
*/

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

func PatternIdFormatValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("pattern_id", "trips.txt", "pattern_id_matches_feed_pattern_id_syntax", row, services.AppMessageService)
	if rules != nil && rules.PatternIdFormat.Severity != "" {
		ctx.WithSeverity(rules.PatternIdFormat.Severity)
	}

	if trip.PatternId == nil {
		return
	}

	expectedFormat := defaultPatternIDFormat
	allowedRegexes := []*regexp.Regexp{regexp.MustCompile(defaultPatternIDRegex)}

	if rules != nil && rules.PatternIdFormat.Options != nil && len(*rules.PatternIdFormat.Options) > 0 {
		expectedFormats := make([]string, 0)
		allowedRegexes = make([]*regexp.Regexp, 0)

		for _, configuredFormatRegex := range *rules.PatternIdFormat.Options {
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

	isValidFormat := false
	for _, allowedRegex := range allowedRegexes {
		if allowedRegex.MatchString(*trip.PatternId) {
			isValidFormat = true
			break
		}
	}

	if !isValidFormat {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("pattern_id_format_validation.invalid", expectedFormat, *trip.PatternId))
		return
	}
}
