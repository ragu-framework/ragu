import * as path from 'path';
import {StateComponentResolver, StateComponentSingleComponentResolver} from "./state-component-resolver";
import {RaguServerConfig} from "../../config";

export class CustomComponentResolver extends StateComponentResolver {
  clientSideResolverTemplate: string = path.join(__dirname, 'custom-template', 'hydrate-resolver');
  stateResolverTemplate: string = path.join(__dirname, 'custom-template', 'state-resolver');
  serverSideResolverTemplate: string = path.join(__dirname, 'custom-template', 'view-resolver');

  stateFileFor(componentName: string): string {
    return path.join(this.serverSideFileFor(componentName), 'state');
  }

  serverSideFileFor(componentName: string): string {
    return path.join(this.config.components.sourceRoot, componentName);
  }

  clientSideFileFor(componentName: string): string {
    return this.serverSideFileFor(componentName);
  }
}

export class CustomSingleComponentResolver extends StateComponentSingleComponentResolver {
  clientSideResolverTemplate: string = path.join(__dirname, 'custom-template', 'hydrate-resolver');
  stateResolverTemplate: string = path.join(__dirname, 'custom-template', 'state-resolver');
  serverSideResolverTemplate: string = path.join(__dirname, 'custom-template', 'view-resolver');

  constructor(config: RaguServerConfig, componentFile: string, stateFile?: string) {
    super(config, componentFile, componentFile, stateFile);
  }
}
