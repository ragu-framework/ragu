
      var component = require('/home/runner/work/ragu/ragu/main-features-mfe/main-features-mfe');
      var resolver = require('/home/runner/work/ragu/ragu/main-features-mfe/node_modules/ragu-simple-adapter/resolvers/hydrate-resolver');

      module.exports.default = (resolver.default || resolver)(component.default || component);
    