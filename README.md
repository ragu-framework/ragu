<p align="center" style="color: #343a40">
  <p align="center" >
    <img src="repository-assets/logo.png" alt="Ragu" align="center">
  </p>
  <h1 align="center">Ragu: A micro-frontend framework</h1>
</p>

Ragu is a micro-frontend framework designed to enable multiple teams to
work at the same product but in different codebase.

![Ragu](https://github.com/carlosmaniero/ragu/workflows/Ragu/badge.svg) 
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg) 
![npm version](https://badge.fury.io/js/ragu-server.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## Articles:

- [Micro-frontends with React, Vue and Ragu](https://medium.com/@carlosmaniero/micro-frontends-with-react-vue-and-ragu-c5a2e3ecc2ab)

## Core principles:

### No artefact integration
The most common pattern when organization want to share code between teams 
is to create a private npm package and use this package across products. 
One of the main issues of this approach is that every time the shared package 
is updated a new build is required for each application that used the shared package.

Read more at
[Front-end integration via artifact - ThoughtWorks Tech Radar](https://www.thoughtworks.com/en/radar/techniques/front-end-integration-via-artifact)


### Build system included
Ragu Server comes with a build system on top of webpack which you can extend
though the ragu server configuration.


### Server side rendering
Ragu server enables SSR by default and exposes an API where you can get
the HTML result from any component. You can write your own Ragu client 
for any language.

Read more about [Ragu Server](https://github.com/carlosmaniero/ragu/tree/main/ragu-server)

### Framework agnostic
You can write a Ragu Component using any framework you want since they enable you to have the render result as HTML
string (such as [ReactDOMServer.renderToString](https://reactjs.org/docs/react-dom-server.html#rendertostring)) 
and have a hydration mechanism such as [ReactDOM.hydrate](https://reactjs.org/docs/react-dom.html#hydrate).


![Ragu Repository](./repository-assets/ragu-architecture.png)
