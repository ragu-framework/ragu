export class FetchGateway {
  async fetch<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error on Fetch: ${await response.text()}`)
    }

    return await response.json();
  }
}
