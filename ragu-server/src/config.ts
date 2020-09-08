export interface RaguServerConfig {
  components: {
    namePrefix: string;
    sourceRoot: string;
    output: string;
  };
  assetsPrefix: string;
  port: number
}
