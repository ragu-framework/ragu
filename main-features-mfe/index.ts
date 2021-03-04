import Style from './style.css';

interface Props {
  env?: 'dev' | 'prod'
}

const renderDevWrapper = (props: Props, html: string) => {
  if (props.env === 'dev') {
    return `
      <style>
        body { margin: 0 }
      </style>
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@100;300&family=Poppins:wght@300;500&display=swap&family=Source+Code+Pro:wght@1;300" rel="stylesheet">

      <div class="${Style.devBackground}">${html}</div>
    `;
  }
  return html
}


interface Concept {
  title: string,
  text: string,
  icon: string
}


const concept = ({title, text, icon}: Concept) => `
  <section class="${Style.concept}">
    <div class="${Style.featureTitleBox}">
      <div class="${Style.featureTitleBoxIcon}">${icon}</div>
      <h2>${title}</h2>
    </div>
    
    <div class="${Style.conceptContent}">
      ${text}
    </div>
  </section>
`


const mainFeatures = () => {
  return `
    <div class="${Style.mainFeatures}">
      <h1 class="${Style.mainTitle}">Core Concepts</h1>
      
      <div>
        ${concept({
          icon: '🚀',
          title: 'Server Side Rendering',
          text: `
            <p>Ragu micro-frontends can be rendered at the server side improving the user experience and the load time.</p>

            <p>Every micro-frontend has its own endpoint witch can be used to pre-fetch micro-frontends.</p>
          `
        })}
        ${concept({
          icon: '📦',
          title: 'Build System',
          text: `
            <p>Ragu Server comes with a build system on top of webpack which you can extend though the ragu server configuration.</p>

            <p>There are adapters listed bellow witch makes the integration with your favorite framework more straightforward.</p>
          `
        })}
        ${concept({
          icon: '🤝',
          title: 'Coupleless Integration',
          text: `
            <p>To share code across projects using a npm package is hard to manage and requires a full project build to apply changes.</p>

            <p>Ragu enables independent deployment extending the concept of micro-services to the front-end.</p>
          `
        })}
      </div>
    </div>
  `
}

export default (el: HTMLElement, props: Props) =>
    el.innerHTML = renderDevWrapper(props, mainFeatures());
