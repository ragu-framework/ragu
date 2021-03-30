module.exports = (component, wrapper) => ({
  hydrate: function (element, params, state) {
    var props = {element, params, state, isServer: false};

    element.raguSimpleAdapterData = wrapper(component(props), props);

    if (element.raguSimpleAdapterData && element.raguSimpleAdapterData.connectedCallback) {
      element.raguSimpleAdapterData.connectedCallback();
    }
  },
  render: function (element, params, state) {
    element.raguSimpleAdapterData = wrapper(component({element, params, state, isServer: false}));

    if (!element.raguSimpleAdapterData) {
      return;
    }

    if (element.raguSimpleAdapterData.html) {
      element.innerHTML = element.raguSimpleAdapterData.html;
    }

    if (element.raguSimpleAdapterData.connectedCallback) {
      element.raguSimpleAdapterData.connectedCallback();
    }
  },
  disconnect: function (el) {
    el.raguSimpleAdapterData &&
    el.raguSimpleAdapterData.disconnectedCallback &&
    el.raguSimpleAdapterData.disconnectedCallback();

    delete el.raguSimpleAdapterData;
  }
});