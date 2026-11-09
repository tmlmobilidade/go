package standard

import (
	"fmt"
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	ruleTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	i18n "github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables/i18n"
	"strings"
)

/*
* FileMissing is the callback for a configured <table>_file_missing control gate.
* Missing tables fail the gate even when their diagnostic severity is ignored.
* A forbidden gate accepts absence and reports a populated table instead.
 */
func FileMissing(ctx *context.ValidationContext) error {
	//
	// 1. Resolve the configured file gate and verify its database connection.

	if ctx == nil || ctx.DB == nil || ctx.MessageAdder == nil {
		return fmt.Errorf("file validation requires a context, database, and receiver")
	}
	table := strings.TrimSuffix(ctx.RuleID, "_file_missing")
	ctx.FileName, ctx.Field, ctx.Row = table+".txt", "N/A", -1
	exists, err := queries.TableExists(ctx.DB, table)
	if err != nil {
		return err
	}
	//
	// 2. A forbidden file gate accepts absence and reports presence.

	if ctx.Config.Severity == ruleTypes.SEVERITY_FORBIDDEN {
		if exists {
			context.AddMessage(ctx, i18n.AppTranslator.Get("file_validation_gtfs_feed_file_presence_and_integrity_rule.forbidden", ctx.FileName))
		}
		return nil
	}

	//
	// 3. Select one diagnostic, preserving conditional file requirements.

	missing := !exists
	message := i18n.AppTranslator.Get("file_missing.message", ctx.FileName)
	switch table {
	case "stops":
		if missing {
			locations, err := queries.TableExists(ctx.DB, "locations")
			if err != nil {
				return err
			}
			if !locations {
				message = i18n.AppTranslator.Get("stops_file_missing.stops_required_when_locations_missing")
			}
		}
	case "calendar", "calendar_dates":
		if missing {
			other := "calendar"
			if table == "calendar" {
				other = "calendar_dates"
			}
			available, err := queries.TableExists(ctx.DB, other)
			if err != nil {
				return err
			}
			if !available {
				message = context.GetTranslatedMessage(ctx, "calendar_files_required")
			}
		}
	case "levels":
		if missing {
			pathways, err := queries.TableExists(ctx.DB, "pathways")
			if err != nil {
				return err
			}
			if pathways {
				elevator, err := queries.Exists(&sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "pathways"}, "pathway_mode", "5")
				if err != nil {
					return err
				}
				if elevator {
					message = i18n.AppTranslator.Get("levels_file_missing.levels_required_when_elevator")
				}
			}
		}
	case "feed_info":
		translations, err := queries.TableExists(ctx.DB, "translations")
		if err != nil {
			return err
		}
		if translations {
			count, err := queries.CountRows(&sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "translations"})
			if err != nil {
				return err
			}
			if count > 0 {
				if exists {
					count, err = queries.CountRows(&sqliteTypes.SQLiteTable{DB: ctx.DB, Name: "feed_info"})
					if err != nil {
						return err
					}
					missing = count == 0
				}
				if missing {
					message = i18n.AppTranslator.Get("feed_info_file_missing.feed_info_required_when_translations")
				}
			}
		}
	}

	//
	// 4. Fail a missing gate even when its configured diagnostic is ignored.

	if missing {
		ctx.Failed = true
		context.AddMessage(ctx, message)
	}
	return nil
}
