export const componentLifecycleEvents = {
  stateLoading(element: HTMLElement) {
    element.dispatchEvent(new CustomEvent('ragu:state-loading'));
  },
  stateLoadingFail(element: HTMLElement, causedBy: Error) {
    element.dispatchEvent(new CustomEvent('ragu:state-loading-error', {detail: causedBy}));
  },
  stateLoaded(element: HTMLElement) {
    element.dispatchEvent(new CustomEvent('ragu:state-loaded'));
  },
  connected(element: HTMLElement) {
    element.dispatchEvent(new CustomEvent('ragu:connected'));
  },
  renderError(element: HTMLElement, causedBy: Error) {
    element.dispatchEvent(new CustomEvent('ragu:render-error', {detail: causedBy}));
  }
}
