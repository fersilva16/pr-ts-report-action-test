const ts = require('typescript');
const path = require('path');

const files = process.argv.slice(2);

console.log('files', files);

const projectPath = path.resolve(process.cwd(), 'tsconfig.json');

const json = ts.readConfigFile(projectPath, ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(
  {
    ...json.config,
    compilerOptions: {
      ...json.config.compilerOptions,
      skipLibCheck: true,
    },
    files,
    include: [],
  },
  ts.sys,
  path.dirname(projectPath),
  undefined,
  path.basename(projectPath)
);

console.log(config.fileNames);

const program = ts.createProgram({
  rootNames: config.fileNames,
  options: config.options,
  projectReferences: config.projectReferences,
  configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(config),
});

const diagnostics = program.getSemanticDiagnostics();

console.log(diagnostics.length);
