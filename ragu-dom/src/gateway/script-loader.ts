export class ScriptLoader {
  load(src: string) {
    const script = document.createElement('script');
    script.src = src;

    const promise = new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = reject;
    });

    document.head.appendChild(script);
    return promise;
  }
}
