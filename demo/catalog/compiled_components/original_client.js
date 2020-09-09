
  window["catalogfeatured-products"] = {
    dependencies: undefined,
    resolve() {
      return import('/Users/carlosmaniero/Projects/ragu/demo/catalog/components/featured-products')
        .then((module) => module.default);
    }
  };
