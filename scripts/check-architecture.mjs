import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const files = ['src', '.storybook']
  .filter((directory) => fs.existsSync(directory))
  .flatMap(listFiles)
  .filter((file) => /\.tsx?$/.test(file));
const graph = new Map();
const problems = [];
let assignedFunctions = 0;
let components = 0;

for (const file of files) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const imports = [];
  const isStory = file.includes('.stories.');
  const isComponent = file.startsWith('src/ui/components/') && !isStory;
  const isBusiness = file.startsWith('src/services-business/');
  const isPresentation = file.startsWith('src/services/');
  const isComposition = /\/di\.ts$/.test(file);
  const isAdapter = file.includes('/adapters/');
  if (isComponent && file.endsWith('.tsx')) {
    components += 1;
  }
  if (/-type\.ts$/.test(file) || file.includes('/adapter/') || file.includes('/services-front/')) {
    report(source, file, source, 'Ancien chemin de module.');
  }
  if (isComponent && !/^src\/ui\/components\/(common|business)\//.test(file)) {
    report(source, file, source, 'Composant hors common/business.');
  }
  function visit(node) {
    if (
      ts.isArrowFunction(node) &&
      (ts.isVariableDeclaration(node.parent) || ts.isPropertyAssignment(node.parent))
    ) {
      assignedFunctions += 1;
      if (!ts.isBlock(node.body)) {
        report(source, file, node, 'Fonction affectée sans bloc/return explicite.');
      }
    }
    if (ts.isClassDeclaration(node)) {
      const heritage = node.heritageClauses?.find(
        (clause) => clause.token === ts.SyntaxKind.ExtendsKeyword,
      );
      if (!heritage?.types.some((type) => type.expression.getText(source).endsWith('Error'))) {
        report(
          source,
          file,
          node,
          'Classe applicative sans besoin Error : vérifier le modèle fonctionnel.',
        );
      }
    }
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const imported = node.moduleSpecifier.text;
      if (isComponent && imported === 'react') {
        const bindings = node.importClause?.namedBindings;
        if (
          bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.some((element) =>
            /^use[A-Z]/.test((element.propertyName ?? element.name).text),
          )
        ) {
          report(source, file, node, 'Hook React dans une vue stateless.');
        }
      }
      if (isComponent && imported === 'react-native') {
        const bindings = node.importClause?.namedBindings;
        if (
          bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.some((element) =>
            /^use[A-Z]/.test((element.propertyName ?? element.name).text),
          )
        ) {
          report(source, file, node, 'Hook natif dans une vue stateless.');
        }
      }
      if (
        (isBusiness || isPresentation) &&
        !isAdapter &&
        !isComposition &&
        /^(react(?:-native)?|expo(?:-|\/|$)|chess\.js$)/.test(imported)
      ) {
        report(source, file, node, `Infrastructure importée par un service : ${imported}.`);
      }
      if (imported.startsWith('.')) {
        const target = resolveLocal(file, imported);
        if (target) {
          imports.push(target);
          if (isBusiness && (target.startsWith('src/services/') || target.startsWith('src/ui/'))) {
            report(source, file, node, 'Dépendance métier vers présentation.');
          }
          const match = target.match(/^(.*\/[a-z-]+-service)\/(?!index\.ts$).+/);
          if ((isBusiness || isPresentation) && match && !file.startsWith(`${match[1]}/`)) {
            const moduleRoot = path.dirname(match[1]);
            if (!file.startsWith(`${moduleRoot}/`)) {
              report(source, file, node, 'Import externe traversant une implémentation privée.');
            }
          }
        } else if (!/\.(json|png|svg)(?:\?|$)/.test(imported)) {
          report(source, file, node, `Import local introuvable : ${imported}.`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  graph.set(file, imports);
}

const seen = new Set();
const active = new Set();
function detectCycles(file, trail = []) {
  if (active.has(file)) {
    problems.push(`Cycle : ${[...trail, file].join(' → ')}`);
    return;
  }
  if (seen.has(file)) {
    return;
  }
  active.add(file);
  for (const imported of graph.get(file) ?? []) {
    detectCycles(imported, [...trail, file]);
  }
  active.delete(file);
  seen.add(file);
}
for (const file of files) {
  detectCycles(file);
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Architecture : ${files.length} sources, ${components} vues stateless, ${assignedFunctions} fonctions affectées avec blocs ; frontières et imports sans cycle.`,
  );
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

function resolveLocal(file, imported) {
  const target = path.normalize(path.join(path.dirname(file), imported));
  return [
    target,
    `${target}.ts`,
    `${target}.tsx`,
    path.join(target, 'index.ts'),
    path.join(target, 'index.tsx'),
  ].find((candidate) => files.includes(candidate));
}

function report(source, file, node, message) {
  const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  problems.push(`${file}:${line} ${message}`);
}
