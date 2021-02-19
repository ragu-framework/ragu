import {ComponentResolver, Dependency} from "./component-resolver";
import {RaguServerConfig} from "../../config";

export class SimpleComponentResolver extends ComponentResolver{
  constructor(
      config: RaguServerConfig,
      private readonly componentPath: string) {
    super(config);
  }

  componentClientSidePath(_componentName: string): Promise<string> {
    return Promise.resolve(this.componentPath);
  }

  componentList(): Promise<string[]> {
    return Promise.resolve([this.componentPath]);
  }

  componentServerSidePath(_componentName: string): Promise<string> {
    return Promise.resolve(this.componentPath);
  }

  componentsOnlyDependencies(_componentName: string): Promise<Dependency[]> {
    return Promise.resolve([]);
  }

}
