import {Report} from "../../src/reports/report";
import {createTestConfig} from "../test-config-factory";

describe('report', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('reports the build location', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const config = await createTestConfig();
    config.showReports = true;

    await new Report(config).reportBuildLocation();

    expect(console.log).toBeCalledWith(expect.stringContaining("📦 your build is ready!"));
    expect(console.log).toBeCalledWith(expect.stringContaining(config.compiler.output.directory));
    expect(console.log).toBeCalledWith(expect.stringContaining(config.baseurl));
    expect(console.log).toBeCalledWith(expect.stringContaining("Routes"));
    expect(console.log).toBeCalledWith(expect.stringContaining(`${config.baseurl}/components/hello-world`));
  });

  it('reports previews routes', async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const config = await createTestConfig();
    config.showReports = true;

    await new Report(config).reportPreview();

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Preview"));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`${config.baseurl}/preview/hello-world`));
  })

  describe('when static build', () => {
    it('shows deployment information', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const config = await createTestConfig();
      config.static = true;
      config.showReports = true;

      await new Report(config).reportBuildLocation();

      expect(console.log)
          .toHaveBeenCalledWith(expect.stringContaining("Deploy the"));
    });
  });

  describe('when reports are disabled', () => {
    it('shows nothing', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const config = await createTestConfig();
      config.showReports = false;

      await new Report(config).reportBuildLocation();
      await new Report(config).reportPreview();

      expect(console.log).not.toBeCalled();
    });
  });
});
