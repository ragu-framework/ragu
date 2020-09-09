import jQuery from 'jquery';

interface Props {
  query?: string;
}

export default {
  dependencies: [
    {
      nodeRequire: 'jquery',
      globalDependency: 'jQuery',
      dependency: 'https://code.jquery.com/jquery-3.5.1.min.js'
    }
  ],
  async render({query}: Props) {
    return {
      state: {},
      html: `<input value="${query || ''}"><button>Search</button>`
    }
  },
  hydrate(element: HTMLElement) {
    jQuery(element).find('button').on('click', () => {
      alert('searching...');
    });
  }
}
