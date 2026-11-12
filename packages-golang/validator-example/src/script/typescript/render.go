package typescript

import (
	"bytes"
	"fmt"
	"os"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/discover"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/script/typescript/consts"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/utils/typescript"
)

// RenderTypeScript generates the rule-ID values, Zod schema, and inferred type.
// Discovery reads Go syntax, so validation packages do not need to compile yet.
func RenderTypeScript(sourceDir string) (map[string][]byte, error) {
	//

	//
	// 1. Discover the unique rule IDs in deterministic order

	ids, err := discover.DiscoverRuleIDs(os.DirFS(sourceDir))
	if err != nil {
		return nil, err
	}

	//
	// 2. Render the TypeScript exports

	var output bytes.Buffer
	output.WriteString("/* * */\n\nimport { z } from 'zod';\n\n/* * */\n\n")
	output.WriteString(consts.TypeScriptHeader)
	output.WriteString("\nexport const GtfsValidatorRuleIdValues = [\n")
	for _, id := range ids {
		fmt.Fprintf(&output, "\t%s,\n", utils.Quote(id))
	}
	output.WriteString(`] as const;

export const GtfsValidatorRuleIdSchema = z
	.string()
	.transform(value => String(value).toLowerCase())
	.pipe(z.enum(GtfsValidatorRuleIdValues));

export type GtfsValidatorRuleId = z.infer<typeof GtfsValidatorRuleIdSchema>;
`)
	//
	// 3. Return the generated file contents

	return map[string][]byte{"rule-ids.ts": output.Bytes()}, nil
}
