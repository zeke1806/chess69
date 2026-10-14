import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

let assignedFunctions = 0;
let components = 0;
const files = ['src', 'tests', '.storybook']
  .filter((directory) => fs.existsSync(directory))
  .flatMap(listFiles)
  .filter((file) => /\.tsx?$/.test(file));
const graph = new Map();
const problems = [];

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
    const story = file.replace(/\.tsx$/, '.stories.tsx');
    if (!files.includes(story)) {
      report(source, file, source, `Vue sans stories correspondantes : ${story}.`);
    }
  }
  if (/-type\.ts$/.test(file) || file.includes('/adapter/') || file.includes('/services-front/')) {
    report(source, file, source, 'Ancien chemin de module.');
  }
  if (isComponent && !/^src\/ui\/components\/(common|business)\//.test(file)) {
    report(source, file, source, 'Composant hors common/business.');
  }
  const namespaces = isComponent ? findPresentationNamespaces(source) : new Set();

  function visit(node) {
    if (isComponent) {
      checkStateless(source, file, node, namespaces);
    }
    if (isComposition) {
      checkComposition(source, file, node);
    }
    if ((isBusiness || isPresentation) && !isAdapter && !isComposition) {
      checkServiceData(source, file, node);
    }
    if (
      ts.isArrowFunction(node) &&
      (ts.isVariableDeclaration(node.parent) ||
        ts.isPropertyAssignment(node.parent) ||
        ts.isPropertyDeclaration(node.parent) ||
        (ts.isBinaryExpression(node.parent) &&
          node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          node.parent.right === node))
    ) {
      assignedFunctions += 1;
      if (!ts.isBlock(node.body)) {
        report(source, file, node, 'Fonction affectée sans bloc/return explicite.');
      }
    }
    if (
      ts.isFunctionLike(node) &&
      node.body &&
      ts.isBlock(node.body) &&
      node.body.statements.length
    ) {
      const first = source.getLineAndCharacterOfPosition(node.body.getStart(source)).line;
      const last = source.getLineAndCharacterOfPosition(node.body.end).line;
      if (first === last) {
        report(source, file, node, 'Corps de fonction à répartir sur plusieurs lignes.');
      }
    }
    if (ts.isTypeAliasDeclaration(node) && /(?:Service|Repository)$/.test(node.name.text)) {
      report(source, file, node, 'Contrat de service à déclarer avec une interface readonly.');
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
for (const file of files) {
  detectCycles(file);
}
const spacing = spawnSync(process.execPath, ['scripts/format-function-blocks.mjs'], {
  encoding: 'utf8',
});
if (spacing.status !== 0) {
  problems.push(spacing.stderr || spacing.error?.message || 'Échec du contrôle des espacements.');
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Architecture : ${files.length} sources, ${components} vues stateless avec stories, ${assignedFunctions} fonctions affectées avec blocs ; frontières et imports sans cycle.`,
  );
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}

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

function hasRuntimeImport(clause) {
  if (!clause) {
    return true;
  }
  if (clause.isTypeOnly) {
    return false;
  }
  if (clause.name || !clause.namedBindings || ts.isNamespaceImport(clause.namedBindings)) {
    return true;
  }
  return (
    clause.namedBindings.elements.length === 0 ||
    clause.namedBindings.elements.some((element) => !element.isTypeOnly)
  );
}

function findPresentationNamespaces(source) {
  const namespaces = new Set();
  const aliases = [];

  function visit(node) {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      /^(react(?:-native(?:-web)?)?|react-native-safe-area-context)$/.test(
        node.moduleSpecifier.text,
      ) &&
      hasRuntimeImport(node.importClause)
    ) {
      const clause = node.importClause;
      if (clause?.name) {
        namespaces.add(clause.name.text);
      }
      if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        namespaces.add(clause.namedBindings.name.text);
      }
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isIdentifier(node.initializer)
    ) {
      aliases.push([node.name.text, node.initializer.text]);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  let size;
  do {
    size = namespaces.size;
    for (const [alias, original] of aliases) {
      if (namespaces.has(original)) {
        namespaces.add(alias);
      }
    }
  } while (size !== namespaces.size);
  return namespaces;
}

function checkStateless(source, file, node, namespaces) {
  if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
    if (!hasRuntimeImport(node.importClause)) {
      return;
    }
    checkStatelessDependency(source, file, node, node.moduleSpecifier.text);
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        if (!element.isTypeOnly) {
          checkStatelessMember(source, file, element, (element.propertyName ?? element.name).text);
        }
      }
    }
  }
  if (
    ts.isExportDeclaration(node) &&
    !node.isTypeOnly &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier) &&
    (!node.exportClause ||
      !ts.isNamedExports(node.exportClause) ||
      node.exportClause.elements.some((element) => !element.isTypeOnly))
  ) {
    checkStatelessDependency(source, file, node, node.moduleSpecifier.text);
  }
  if (
    ts.isImportEqualsDeclaration(node) &&
    !node.isTypeOnly &&
    ts.isExternalModuleReference(node.moduleReference) &&
    node.moduleReference.expression &&
    ts.isStringLiteral(node.moduleReference.expression)
  ) {
    checkStatelessDependency(source, file, node, node.moduleReference.expression.text);
  }
  if (
    ts.isCallExpression(node) &&
    (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
      (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
  ) {
    const imported = node.arguments[0];
    if (imported && ts.isStringLiteral(imported)) {
      checkStatelessDependency(source, file, node, imported.text);
    } else {
      report(source, file, node, 'Import dynamique non vérifiable dans une vue stateless.');
    }
  }
  if (
    (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
    ts.isIdentifier(node.expression) &&
    namespaces.has(node.expression.text)
  ) {
    const member = ts.isPropertyAccessExpression(node) ? node.name : node.argumentExpression;
    if (member && (ts.isIdentifier(member) || ts.isStringLiteral(member))) {
      checkStatelessMember(source, file, node, member.text);
    }
  }
  if (
    ts.isVariableDeclaration(node) &&
    ts.isObjectBindingPattern(node.name) &&
    node.initializer &&
    ts.isIdentifier(node.initializer) &&
    namespaces.has(node.initializer.text)
  ) {
    for (const element of node.name.elements) {
      const member = element.propertyName ?? element.name;
      if (ts.isIdentifier(member) || ts.isStringLiteral(member)) {
        checkStatelessMember(source, file, element, member.text);
      }
    }
  }
  if (
    ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    /^(fetch|XMLHttpRequest|WebSocket)$/.test(node.expression.text)
  ) {
    report(source, file, node, 'I/O réseau dans une vue stateless.');
  }
  if (
    ts.isNewExpression(node) &&
    ts.isIdentifier(node.expression) &&
    /^(XMLHttpRequest|WebSocket)$/.test(node.expression.text)
  ) {
    report(source, file, node, 'I/O réseau dans une vue stateless.');
  }
}

function checkStatelessMember(source, file, node, member) {
  if (/^use[A-Z]/.test(member) || member === 'use') {
    report(source, file, node, 'Hook dans une vue stateless.');
  }
  if (
    /^(Alert|Linking|AppState|BackHandler|NativeModules|NativeEventEmitter|TurboModuleRegistry|Vibration|PermissionsAndroid|DevSettings)$/.test(
      member,
    )
  ) {
    report(source, file, node, `I/O natif dans une vue stateless : ${member}.`);
  }
}

function checkStatelessDependency(source, file, node, imported) {
  const target = imported.startsWith('.')
    ? path.normalize(path.join(path.dirname(file), imported))
    : imported;
  if (
    /^(src\/services(?:-business)?\/|src\/ui\/features\/|src\/app\/)/.test(target) ||
    /\/(?:adapters|features)\//.test(target) ||
    /^(expo(?:-|\/|$)|node:|@react-native(?:-community|-async-storage)?\/|chess\.js$)/.test(
      imported,
    ) ||
    /^react-native\//.test(imported) ||
    /^react-native-(?!web(?:\/|$)|svg(?:\/|$)|safe-area-context(?:\/|$))/.test(imported)
  ) {
    report(
      source,
      file,
      node,
      `Dépendance exécutable interdite dans une vue stateless : ${imported}.`,
    );
  }
}

function checkComposition(source, file, node) {
  if (ts.isReturnStatement(node) && node.expression) {
    const expression = node.expression;
    const exposed =
      ts.isCallExpression(expression) && expression.expression.getText(source) === 'Object.freeze'
        ? expression.arguments[0]
        : expression;
    if (exposed && ts.isObjectLiteralExpression(exposed)) {
      for (const property of exposed.properties) {
        if (
          !ts.isShorthandPropertyAssignment(property) &&
          !(
            ts.isPropertyAssignment(property) &&
            (ts.isIdentifier(property.initializer) ||
              ts.isPropertyAccessExpression(property.initializer))
          )
        ) {
          report(source, file, property, 'DI : déclarer services et fabriques avant le return.');
        }
      }
    }
  }
  if (ts.isVariableDeclarationList(node) && !(node.flags & ts.NodeFlags.Const)) {
    report(source, file, node, 'DI : état mutable à déplacer dans un module.');
  }
  if (
    ts.isIfStatement(node) ||
    ts.isSwitchStatement(node) ||
    ts.isTryStatement(node) ||
    ts.isIterationStatement(node, false) ||
    ts.isAwaitExpression(node) ||
    ts.isThrowStatement(node)
  ) {
    report(source, file, node, 'DI : comportement opérationnel à déplacer dans un module.');
  }
  if (
    (ts.isBinaryExpression(node) &&
      node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment &&
      node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) ||
    ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) &&
      (node.operator === ts.SyntaxKind.PlusPlusToken ||
        node.operator === ts.SyntaxKind.MinusMinusToken))
  ) {
    report(source, file, node, 'DI : mutation à déplacer dans un module.');
  }
  if (ts.isCallExpression(node)) {
    const factory = ts.isIdentifier(node.expression)
      ? node.expression.text
      : ts.isPropertyAccessExpression(node.expression)
        ? node.expression.name.text
        : '';
    if (!/^create[A-Z]/.test(factory) && node.expression.getText(source) !== 'Object.freeze') {
      report(source, file, node, 'DI : appel autre qu’une fabrique de composition.');
    }
  }
}

function checkServiceData(source, file, node) {
  if (!ts.isVariableStatement(node)) {
    return;
  }
  if (ts.isSourceFile(node.parent) && !(node.declarationList.flags & ts.NodeFlags.Const)) {
    report(
      source,
      file,
      node,
      'Service : état global mutable à conserver dans un adaptateur injecté.',
    );
    return;
  }
  if (!ts.isBlock(node.parent)) {
    return;
  }
  const owner = node.parent.parent;
  if (!ts.isFunctionLike(owner)) {
    return;
  }
  const name = owner.name?.getText(source) ?? owner.parent?.name?.getText(source) ?? '';
  if (!/^create[A-Z]/.test(name) && name !== 'connect') {
    return;
  }
  if (!(node.declarationList.flags & ts.NodeFlags.Const)) {
    report(
      source,
      file,
      node,
      'Service : données entre appels à conserver dans un adaptateur injecté.',
    );
  }
  for (const declaration of node.declarationList.declarations) {
    if (
      declaration.initializer &&
      ts.isNewExpression(declaration.initializer) &&
      /^(Map|Set|WeakMap|WeakSet)$/.test(declaration.initializer.expression.getText(source))
    ) {
      report(
        source,
        file,
        declaration,
        'Service : collection conservée à déplacer vers un adaptateur de données.',
      );
    }
  }
}
