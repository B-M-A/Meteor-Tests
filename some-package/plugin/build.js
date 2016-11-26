Plugin.registerCompiler({
  archMatching: 'web',
  extensions: [],
  filenames: ['package.json']
}, () => new Compiler);

/*
 * Check for packages under local testing.
 * @see {@link https://github.com/meteor/meteor/blob/be986fd70926c9dd8eff6d8866205f236c8562c4/tools/isobuild/package-source.js#L28}
 */
const AUTO_TEST_PREFIX = "local-test:",
      isTestName = (name) => name.slice(0, AUTO_TEST_PREFIX.length) === AUTO_TEST_PREFIX;

class Compiler extends MultiFileCachingCompiler {

  constructor() {
    super({
      compilerName: 'zodiase-some-package',
      defaultCacheSize: 1024*1024*10,
    });
  }

  getCacheKey(inputFile) {
    return inputFile.getSourceHash();
  }

  /**
   * `compileResult` returned by `compileOneFile` is a string.
   * @param {String} compileResult
   * @returns {Number}
   */
  compileResultSize(compileResult) {
    return compileResult.length;
  }

  /**
   * Returning `null` will skip `addCompileResult` as of Meteor 1.3.1.
   * @param {InputFile} inputFile
   * @param {Map.<AbsPath, InputFile>} allFiles
   * @returns {Object|null}
   */
  compileOneFile(inputFile, allFiles) {

    log('config file detected.');

    /*
     * If the settings file is loaded from the app, the package name should be `null`.
     * If the settings file is loaded from package tests, `isTestName` should return true.
     */
    const pkgName = inputFile.getPackageName();
    const fileContents = inputFile.getContentsAsString().trim();

    log('package name:', pkgName);
    log('file content:', fileContents);

    if (!(pkgName === null || isTestName(pkgName))) {
      // Settings files loaded from packages are ignored.
      log(`file is loaded from: {${pkgName}}/${inputFile.getPathInPackage()}`);
    }

    return null;
  }
}

const logLabel = 'zodiase:some-package';
const log = function () {
  let args = sliceArguments(arguments);
  args.unshift('*', logLabel, '>');
  console.log.apply(console, args);
};

const sliceArguments = function (_arguments) {
  let args = new Array(_arguments.length);
  for (let i = 0, n = _arguments.length; i < n; i++) {
    args[i] = _arguments[i];
  }
  return args;
};
