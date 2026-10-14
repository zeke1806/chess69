import fs from 'node:fs';
import path from 'node:path';
import * as prettier from 'prettier';
import ts from 'typescript';

let changed = 0;
const write = process.argv.includes('--write');
const files = ['src', 'tests', '.storybook', 'scripts']
  .filter((directory) => fs.existsSync(directory))
  .flatMap(listFiles)
  .filter((file) => /\.(?:tsx?|mjs)$/.test(file));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const formatted = await spaceFunctionBlocks(content, file);
  if (formatted === content) {
    continue;
  }
  changed += 1;
  if (write) {
    fs.writeFileSync(file, formatted);
  } else {
    console.error(`${file} : blocs de fonctions à séparer par une ligne vide.`);
  }
}

if (changed && !write) {
  process.exitCode = 1;
} else {
  console.log(`Espacement des fonctions : ${changed} fichier(s) ajusté(s).`);
}

async function spaceFunctionBlocks(content, file) {
  const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const insertions = new Map();
  visit(source);
  const spaced = [...insertions]
    .sort(([left], [right]) => right - left)
    .reduce(
      (result, [position, spacing]) =>
        `${result.slice(0, position)}${spacing}${result.slice(position)}`,
      content,
    );
  if (spaced === content) {
    return content;
  }
  return prettier.format(spaced, { ...(await prettier.resolveConfig(file)), filepath: file });

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      separateBlocks(node.properties, definesFunction);
    }
    if (
      ts.isSourceFile(node) ||
      ts.isBlock(node) ||
      ts.isModuleBlock(node) ||
      ts.isCaseClause(node) ||
      ts.isDefaultClause(node)
    ) {
      separateBlocks(node.statements, declaresFunction);
    }
    ts.forEachChild(node, visit);
  }

  function separateBlocks(nodes, isFunction) {
    for (let index = 1; index < nodes.length; index += 1) {
      const previous = nodes[index - 1];
      const current = nodes[index];
      if (!isFunction(previous) && !isFunction(current)) {
        continue;
      }
      const between = content.slice(previous.end, current.getStart(source));
      if (/\n[\t ]*\r?\n/.test(between)) {
        continue;
      }
      const newline = content.indexOf('\n', previous.end);
      if (newline !== -1 && newline < current.getStart(source)) {
        insertions.set(newline + 1, '\n');
      } else {
        const position = previous.end + (content[previous.end] === ',' ? 1 : 0);
        insertions.set(position, '\n\n');
      }
    }
  }
}

function declaresFunction(statement) {
  if (ts.isFunctionDeclaration(statement)) {
    return Boolean(statement.body);
  }
  return (
    ts.isVariableStatement(statement) &&
    statement.declarationList.declarations.some((declaration) => {
      return (
        declaration.initializer &&
        (ts.isArrowFunction(declaration.initializer) ||
          ts.isFunctionExpression(declaration.initializer))
      );
    })
  );
}

function definesFunction(property) {
  if (
    ts.isMethodDeclaration(property) ||
    ts.isGetAccessor(property) ||
    ts.isSetAccessor(property)
  ) {
    return Boolean(property.body);
  }
  return (
    ts.isPropertyAssignment(property) &&
    (ts.isArrowFunction(property.initializer) || ts.isFunctionExpression(property.initializer))
  );
}

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(target) : [target];
  });
}
