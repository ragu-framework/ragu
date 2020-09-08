import {ScriptLoader} from "./gateway/script-loader";


interface ComponentDependency {
  globalVariable?: string;
  dependency: string;
}

class Dependency {
  private readonly resolvePromise;

  constructor(
      private readonly scriptLoader: ScriptLoader,
      private readonly dependency: string,
      private readonly globalVariable?: string
  ) {
    if (this.globalVariable && (window as any)[this.globalVariable] !== undefined) {
      this.resolvePromise = Promise.resolve();
      return;
    }

    this.resolvePromise = this.scriptLoader.load(this.dependency)
  }

  resolve() {
    return this.resolvePromise;
  }

  resolves(componentDependency: ComponentDependency) {
    return (componentDependency.globalVariable && componentDependency.globalVariable === this.globalVariable)
        || componentDependency.dependency === this.dependency;
  }
}


export class DependencyContext {
  private readonly dependencies: Dependency[] = [];
  constructor(private readonly scriptLoader: ScriptLoader) {
  }

  load(dependency: ComponentDependency): Promise<void> {
    return this.getOrCreateDependency(dependency).resolve();
  }

  private getOrCreateDependency(componentDependency: ComponentDependency) {
    const foundDependency = this.dependencies.find((dependency) => dependency.resolves(componentDependency));

    if (foundDependency) {
      return foundDependency;
    }

    const dependency = new Dependency(
        this.scriptLoader,
        componentDependency.dependency,
        componentDependency.globalVariable
    );

    this.dependencies.push(dependency);

    return dependency;
  }
}
