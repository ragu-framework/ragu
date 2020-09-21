import * as fs from "fs";
import * as path from "path";

const expectExposesAllFilesOfDirectory = (directoryName: string) => {
  const compilerFiles = fs.readdirSync(path.join(__dirname, '..', 'src', directoryName), { withFileTypes: true })
      .filter(directoryEntry => directoryEntry.isFile())
      .map(directoryEntry => directoryEntry.name);

  const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.ts')).toString();

  for (let fileName of compilerFiles) {
    const baseDirectory = directoryName === '.' ? '' : `${directoryName}/`;

    expect(indexContent).toContain(`export * from './src/${baseDirectory}${fileName.replace('.ts', '')}';`);
  }
}

describe('Architecture tests', () => {
  it('exposes all files of root module into index.ts', () => {
    expectExposesAllFilesOfDirectory('.');
  });

  it('exposes all files of compiler module into index.ts', () => {
    expectExposesAllFilesOfDirectory('compiler');
  });

  it('exposes all files of logging module into index.ts', () => {
    expectExposesAllFilesOfDirectory('logging');
  });

  it('exposes all files of preview module into index.ts', () => {
    expectExposesAllFilesOfDirectory('preview');
  });

  it('exposes all files of ssr module into index.ts', () => {
    expectExposesAllFilesOfDirectory('ssr');
  });

  it('all projects has the same version', () => {
    expect(new Set([
        require('../package.json').version,
        require('../../ragu-dom/package.json').version,
        require('../../ragu-vue-server-adapter/package.json').version,
    ]).size).toBe(1);
  });
});
