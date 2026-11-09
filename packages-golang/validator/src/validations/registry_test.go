package validations_test

import (
	"go/ast"
	"go/parser"
	"go/token"
	"io/fs"
	"maps"
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strconv"
	"strings"
	"testing"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/discover"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules/registry"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/validations"
	standard "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/standards/checks"
)

// A check can compile and still never execute if its registry entry is omitted.
// Compare the callbacks themselves so distinct checks cannot hide behind one ID.
func TestEveryValidationCallbackIsRegistered(t *testing.T) {
	file, err := parser.ParseFile(token.NewFileSet(), "registry-rules.go", nil, 0)
	if err != nil {
		t.Fatal(err)
	}
	packages := map[string]string{}
	for _, spec := range file.Imports {
		path, err := strconv.Unquote(spec.Path.Value)
		if err != nil {
			t.Fatal(err)
		}
		directory, local := strings.CutPrefix(path, "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/")
		if local && spec.Name != nil {
			packages[spec.Name.Name] = directory
		}
	}
	registered := map[string]string{}
	ast.Inspect(file, func(node ast.Node) bool {
		batch, ok := node.(*ast.CompositeLit)
		if !ok {
			return true
		}
		kind, ok := batch.Type.(*ast.SelectorExpr)
		if !ok || kind.Sel.Name != "RuleChecks" {
			return true
		}
		for _, element := range batch.Elts {
			pair, ok := element.(*ast.KeyValueExpr)
			if !ok {
				t.Fatal("registry entries must map IDs to callbacks")
			}
			literal, ok := pair.Key.(*ast.BasicLit)
			if !ok {
				t.Fatal("registry IDs must be string literals")
			}
			id, err := strconv.Unquote(literal.Value)
			if err != nil {
				t.Fatal(err)
			}
			callback, ok := pair.Value.(*ast.SelectorExpr)
			if !ok {
				t.Fatalf("%s has no imported callback", id)
			}
			alias, ok := callback.X.(*ast.Ident)
			if !ok || packages[alias.Name] == "" {
				t.Fatalf("cannot resolve callback for %s", id)
			}
			name := filepath.Join(packages[alias.Name], callback.Sel.Name)
			if previous := registered[name]; previous != "" {
				t.Errorf("callback %s is registered by both %s and %s", name, previous, id)
			}
			registered[name] = id
		}
		return true
	})

	for _, directory := range []string{"customs/checks", "fields/checks", "standards/checks"} {
		files, err := parser.ParseDir(token.NewFileSet(), directory, func(entry fs.FileInfo) bool {
			return !strings.HasSuffix(entry.Name(), "_test.go")
		}, 0)
		if err != nil {
			t.Fatal(err)
		}
		for _, pkg := range files {
			for _, source := range pkg.Files {
				for _, declaration := range source.Decls {
					callback, ok := declaration.(*ast.FuncDecl)
					if !ok || callback.Recv != nil || !callback.Name.IsExported() {
						continue
					}
					name := filepath.Join(directory, callback.Name.Name)
					if name == filepath.Join("standards/checks", "FileMissing") {
						continue // Bound to every supported table by TablesFilePresence.
					}
					if registered[name] == "" {
						t.Errorf("validation callback %s is not registered", name)
					}
				}
			}
		}
	}
}

func TestEmbeddedAndDiskRuleIDsMatchExecutableRegistry(t *testing.T) {
	validations.RegisterRules()
	checks := registry.Checks()
	validations.TablesFilePresence(checks)
	for _, table := range variables.GtfsRuleFiles {
		check := checks[table+"_file_missing"]
		if check == nil || reflect.ValueOf(check).Pointer() != reflect.ValueOf(standard.FileMissing).Pointer() {
			t.Errorf("%s is not bound to the standard missing-file callback", table)
		}
	}
	checks["file_validation"] = nil
	checks["file_not_found_in_rules"] = nil
	want := slices.Sorted(maps.Keys(checks))
	for name, source := range map[string]fs.FS{"embedded": validations.RuleSources, "disk": os.DirFS(".")} {
		t.Run(name, func(t *testing.T) {
			ids, err := discover.DiscoverRuleIDs(source)
			if err != nil {
				t.Fatal(err)
			}
			if !slices.Equal(ids, want) {
				t.Errorf("catalog IDs differ from runtime registrations:\n got %v\nwant %v", ids, want)
			}
		})
	}
}
