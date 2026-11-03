package discover

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"sort"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

// DiscoverRuleIDs collects validation and runtime IDs without executing checks.
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
		if entry.IsDir() || !strings.HasSuffix(path, ".go") || strings.HasSuffix(path, "_test.go") {
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
			switch node := node.(type) {
			case *ast.CallExpr:
				if selector, ok := node.Fun.(*ast.SelectorExpr); ok {
					index := -1
					switch selector.Sel.Name {
					case "Rule":
						index = 0
					case "NewValidationContext":
						index = 2
					}
					if index >= 0 && len(node.Args) > index {
						if id := stringLiteral(node.Args[index]); id != "" {
							found[id] = true
						}
					}
				}
			case *ast.CompositeLit:
				if selector, ok := node.Type.(*ast.SelectorExpr); ok && selector.Sel.Name == "RuleChecks" {
					for _, element := range node.Elts {
						if pair, ok := element.(*ast.KeyValueExpr); ok {
							if id := stringLiteral(pair.Key); id != "" {
								found[id] = true
							}
						}
					}
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
