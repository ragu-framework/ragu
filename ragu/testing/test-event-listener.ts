export class EventListener {
  readonly stub: jest.Mock;

  constructor(readonly element: HTMLElement, readonly event: string) {
    this.stub = jest.fn();
    this.element.addEventListener(event, this.stub);
  }

  get firstCallAttributes() {
    expect(this.stub).toBeCalled();
    return this.stub.mock.calls[0];
  }
}
