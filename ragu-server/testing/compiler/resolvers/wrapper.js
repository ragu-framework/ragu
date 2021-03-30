module.exports = function(component, props) {
  console.log('called with: ', props);

  if (!props.isServer) {
    props.element.innerHTML = component.html + ' from custom from ' + (props.isServer ? 'server' : 'browser');
    return {...component, html: undefined};
  }

  return {
    ...component,
    html: component.html + ' from custom from ' + (props.isServer ? 'server' : 'browser')
  }
}
