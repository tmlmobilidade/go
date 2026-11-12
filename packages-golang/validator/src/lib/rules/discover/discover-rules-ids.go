package discover

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"sort"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

// DiscoverRuleIDs collects validation and runtime IDs without executing checks.
// Both rules.json validation and TypeScript generation call this entry point.
// The source may be an embedded filesystem or an on-disk directory via os.DirFS.
// Repeated references produce one ID; test files are excluded from discovery.
func DiscoverRuleIDs(source fs.FS) ([]string, error) {
	//

	//
	// 1. Include IDs supplied by runtime notices and missing-file checks

	found := make(map[string]bool)
	for _, id := range []string{"file_validation", "file_not_found_in_rules"} {
		found[id] = true
	}

	for _, file := range variables.GtfsRuleFiles {
		found[file+"_file_missing"] = true
	}

	//
	// 2. Parse Go validation files and inspect their rule references

	err := fs.WalkDir(source, ".", func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if entry.IsDir() || !strings.HasSuffix(path, ".go") {
			return nil
		}

		data, err := fs.ReadFile(source, path)
		if err != nil {
			return err
		}

		file, err := parser.ParseFile(token.NewFileSet(), path, data, 0)
		if err != nil {
			return err
		}

		ast.Inspect(file, func(node ast.Node) bool {
			batch, ok := node.(*ast.CompositeLit)
			if !ok {
				return true
			}

			selector, ok := batch.Type.(*ast.SelectorExpr)
			if !ok || selector.Sel.Name != "RuleChecks" {
				return true
			}

			for _, element := range batch.Elts {
				pair, ok := element.(*ast.KeyValueExpr)
				if !ok {
					continue
				}
				if id := stringLiteral(pair.Key); id != "" {
					found[id] = true
				}
			}
			return true
		})
		return nil
	})
	if err != nil {
		return nil, err
	}

	//
	// 3. Sort the unique IDs for stable generated output

	ids := make([]string, 0, len(found))
	for id := range found {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	//
	// 4. Return the discovered rule IDs

	return ids, nil
}
