export type MockObject<T> = { T: T } & { readonly [key in keyof T]: jest.Mock }

export function createSpyObject<T>(): MockObject<T> {
  const obj = {}
  const handler: ProxyHandler<object> = {
    get: function(obj, prop) {
      if (prop === 'T') {
        return proxy
      }

      return prop in obj ? obj[prop] : (obj[prop] = jest.fn())
    }
  }
  const proxy = new Proxy(obj, handler)
  return proxy as MockObject<T>
}

export async function expectAsync<T>(promise: Promise<T>, matcher: (obj: jest.Matchers<T>) => void): Promise<void> {
  try {
    const ret = await promise
    matcher(expect(ret))
  } catch (err) {
    const fn = (() => {
      throw err
    }) as any
    matcher(expect(fn as T))
  }
}

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[cyclic reference]'
      }
      seen.add(value)
    }
    return value
  }
}

export const safeStringify = (obj: any, spaces?: number) => JSON.stringify(obj, getCircularReplacer(), spaces || 0)
