package custom

import (
	"sort"
	"strconv"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

func DirectionIdPatternConsistent(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "pattern_id", []string{"direction_id", "pattern_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the direction_id is consistent for all patterns in trips

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the pattern_id value

		pattern, err := queries.Field(rowCtx.Source, "pattern_id")
		if err != nil {
			return err
		}

		//
		// 4. Check if the direction_id is consistent for all patterns in trips

		values := map[string]bool{}
		err = validationutils.ForGroupFields(rowCtx, "pattern_id", []string{"direction_id"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["direction_id"]
			parsed, err := strconv.Atoi(value)
			if err != nil {
				return nil
			}
			value = strconv.Itoa(parsed)
			if value != "" {
				values[value] = true
			}
			return nil
		})

		if err != nil {
			return err
		}

		//
		// 5. Check if the direction_id is consistent for all patterns in trips

		if len(values) > 1 {
			keys := make([]string, 0, len(values))
			for value := range values {
				keys = append(keys, value)
			}
			sort.Slice(keys, func(i, j int) bool { a, _ := strconv.Atoi(keys[i]); b, _ := strconv.Atoi(keys[j]); return a < b })
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "different_direction_ids_in_pattern", pattern, strings.Join(keys, ", ")))
		}

		//
		// 6. Return success

		return nil
	})
}
