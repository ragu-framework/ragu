import {
  clientSideComponentFactory,
  clientSideConnect, ComponentRenderError,
  PropsToStateError,
  RaguComponent,
  Renderable,
  serverRawHtml,
  triggerLifecycle
} from "./index";
import {EventListener} from "../testing/test-event-listener";
import {TestPromiseController} from "../testing/test-promise-controller";

interface ComponentRequestProps {
  prop: string
}

type ComponentProps = ComponentRequestProps & {
  extraProps: boolean
}

describe('Ragu components', (): void => {
  let propsToStatePromise: TestPromiseController<void>;
  let renderPromise: TestPromiseController<void>;

  class MyVeryFirstComponent extends RaguComponent<ComponentRequestProps, ComponentProps>  {
    static async propsToState (props: ComponentRequestProps): Promise<ComponentProps> {
      await propsToStatePromise.promise;

      return {
        ...props,
        extraProps: true,
      }
    };

    async updateProps(newProps: ComponentRequestProps) {
      this.state = await MyVeryFirstComponent.propsToState(newProps);
    }

    renderable(): Renderable {
      return {
        clientSide: async (element: HTMLElement): Promise<void> => {
          await renderPromise.promise;
          element.innerHTML = `browser: ${this.props.prop} == ${this.state.prop} is ${this.state.extraProps}`;
        },
        serverSide: async (): Promise<string> => {
          await renderPromise.promise;
          return `server: ${this.props.prop} == ${this.state.prop} is ${this.state.extraProps}`;
        }
      }
    }
  }

  beforeEach(() => {
    propsToStatePromise = new TestPromiseController();
    renderPromise = new TestPromiseController();
  });

  describe('server side', () => {
    describe('happy path', () => {
      beforeEach(() => {
        propsToStatePromise.resolve();
      });
      it('it renders the content', async () => {
        renderPromise.resolve();
        const html = await serverRawHtml(MyVeryFirstComponent, {prop: 'hi'});
        expect(html).toBe('server: hi == hi is true');
      });
    });
    describe('error handling', () => {
      it('throws an exception when propsToState fails', async () => {
        const originalError = new Error('Not today!');
        propsToStatePromise.reject(originalError);

        await expect(serverRawHtml(MyVeryFirstComponent, {prop: 'hi'}))
            .rejects.toEqual(new PropsToStateError(originalError));
      });

      it('throws an exception when render fails', async () => {
        const originalError = new Error('Not today!');
        propsToStatePromise.resolve();
        renderPromise.reject(originalError);

        await expect(serverRawHtml(MyVeryFirstComponent, {prop: 'hi'}))
            .rejects.toEqual(new ComponentRenderError(originalError));
      });
    });
  });

  describe('client side', () => {
    describe('happy path', () => {
      it('it renders the content', async () => {
        propsToStatePromise.resolve();
        renderPromise.resolve();

        const element = document.createElement('div');
        await triggerLifecycle(MyVeryFirstComponent, {prop: 'hi'}, element);

        expect(element.innerHTML).toBe('browser: hi == hi is true');
      });

      describe('lifecycle events', () => {
        it('dispatches an event when state starts to load ', async () => {
          const element = document.createElement('div');
          const event = new EventListener(element, 'ragu:state-loading');

          clientSideComponentFactory(MyVeryFirstComponent, {prop: 'hi'}, element);

          expect(event.stub).toHaveBeenCalled();
        });

        it('dispatches an event after state loaded ', async () => {
          const element = document.createElement('div');
          const event = new EventListener(element, 'ragu:state-loaded');

          const component = clientSideComponentFactory(MyVeryFirstComponent, {prop: 'hi'}, element);

          expect(event.stub).not.toHaveBeenCalled();

          propsToStatePromise.resolve();
          await component;

          expect(event.stub).toHaveBeenCalled();
        });

        it('dispatches an event after component is connected', async () => {
          const element = document.createElement('div');
          const event = new EventListener(element, 'ragu:connected');

          propsToStatePromise.resolve();
          renderPromise.resolve();
          const component = await clientSideComponentFactory(MyVeryFirstComponent, {prop: 'hi'}, element);

          const mountPromise = clientSideConnect(component, element);

          expect(event.stub).not.toHaveBeenCalled();

          await mountPromise;

          expect(event.stub).toHaveBeenCalled();
        });
      });
    });

    describe('error handling', () => {
      describe('lifecycle events', () => {
        it('throws an exception when propsToState fails', async () => {
          const originalError = new Error('Not today!');
          propsToStatePromise.reject(originalError);

          const element = document.createElement('div');
          const event = new EventListener(element, 'ragu:state-loading-error');

          await expect(triggerLifecycle(MyVeryFirstComponent, {prop: 'hi'}, element))
              .rejects.toEqual(new PropsToStateError(originalError));

          expect(event.firstCallAttributes[0].detail).toEqual(originalError);
        });

        it('throws an exception when render fails', async () => {
          const originalError = new Error('Not today!');
          propsToStatePromise.resolve();
          renderPromise.reject(originalError);

          const element = document.createElement('div');
          const event = new EventListener(element, 'ragu:render-error');

          await expect(triggerLifecycle(MyVeryFirstComponent, {prop: 'hi'}, element))
              .rejects.toEqual(new ComponentRenderError(originalError));

          expect(event.firstCallAttributes[0].detail).toEqual(originalError);
        });
      });
    });
  });
});
