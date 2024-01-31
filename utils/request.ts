import { useRequest } from 'ahooks'
import type { Options as UseRequestOptions } from 'ahooks/lib/useRequest/src/types'

import { toast } from '@/app/providers'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export async function request(
  path: string,
  options?: {
    method?: HttpMethod
    payload?: Dict
  }
) {
  options = options ?? {}
  const method = options.method ?? 'GET'

  let baseUrl = `${process.env.NEXT_PUBLIC_API}/`
  if (path.startsWith('http')) {
    baseUrl = ''
  }

  const headers:Dict = {}
  if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json'
  }
  
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: method,
      headers: headers,
      body: JSON.stringify(options.payload),
      mode: 'cors',
      cache: 'no-cache',
    })

    const result = await response.json()
    
    if (!response.ok) {
      result.status = response.status
      throw result
    }
    return result
  } catch (error: any) {
    console.error(error)
    if (error.status === 400 || error.status === 500) {
      toast({
        title: error.message,
        status: 'error',
        position: 'top-right',
        isClosable: true
      })
    }
  }
}

/**
 * Determine whether the params is valid.
 */
export function isValidParams(obj?: Dict) {
  return (
    typeof obj === 'object' && obj !== null && Object.entries(obj).length > 0
  )
}

/**
 * Api fetch hook.
 */
export function useEndpoint(
  endpoint: string,
  options: UseRequestOptions<Dict, any> & {
    method?: HttpMethod
    payload?: Dict
    params?: Dict
  } = {}
) {
  return useRequest(
    function (payload = options.payload, params = options.params) {
      // Concat url parameters
      if (isValidParams(params)) {
        // URL path parameters
        const names = endpoint.match(/:\w+/g)
        if (names !== null) {
          for (let name of names) {
            name = name.slice(1)
            endpoint = endpoint.replace(`:${name}`, params[name])
            delete params[name]
          }
        }

        // URL search parameters
        endpoint = `${endpoint}?${new URLSearchParams(params).toString()}`
      }

      return request(endpoint, {
        method: options.method ?? 'GET',
        payload: payload,
      })
    },
    {
      retryCount: 0,
      refreshDeps: [
        ...Object.values(options.payload ?? {}),
        ...Object.values(options.params ?? {}),
        ...(options.refreshDeps ?? []),
      ],
      manual: options.manual ?? true,
      ready: options.ready,
      cacheKey: options.cacheKey,
      cacheTime: options.cacheTime,
      staleTime: options.staleTime,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onFinally: options.onFinally,
    }
  )
}
