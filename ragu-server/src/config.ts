export interface RaguServerConfig {
  components: {
    namePrefix: string;
    sourceRoot: string;
    output: string;
  };
  server: {
    assetsEndpoint: string
  };
  assetsPrefix: string;
  port: number
}
