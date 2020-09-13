import {ScriptLoader} from "./gateway/script-loader";


export interface ComponentDependency {
  order?: number;
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

  async loadAll(dependencies: ComponentDependency[]): Promise<void> {
    for (let group of this.groupDependencies(dependencies)) {
      await this.loadDependencyGroup(group);
    }
  }

  private loadDependencyGroup(dependencies: ComponentDependency[]) {
    return Promise.all(dependencies.map((dependency) => this.load(dependency)));
  }

  private groupDependencies(dependencies: ComponentDependency[]): ComponentDependency[][] {
    const dependenciesByOrder: Record<number, ComponentDependency[]> = {};

    for (let dependency of dependencies) {
      const dependencyOrder = dependency.order || 0;
      dependenciesByOrder[dependencyOrder] = dependenciesByOrder[dependencyOrder] || [];
      dependenciesByOrder[dependencyOrder].push(dependency);
    }

    const orderList: string[] = Object.keys(dependenciesByOrder).sort();

    const orderedDependencies = [];

    for (let order of orderList) {
      orderedDependencies.push(dependenciesByOrder[parseInt(order)]);
    }

    return Object.values(dependenciesByOrder);
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
