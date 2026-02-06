type FetchOptions = {
  headers?: Record<string, string>
  query?: Record<string, string | number>
  body?: Record<string, unknown>
  formData?: FormData
}

const FetchRequest = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options?: FetchOptions
): Promise<T> => {
  try {
    const { headers = {}, query, body, formData } = options || {}

    const queryString = query
      ? '?' +
        Object.entries(query)
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : ''

    const fetchAddress =
      process.env.NODE_ENV === 'development'
        ? process.env.NEXT_PUBLIC_API_ADDRESS_DEV
        : process.env.NEXT_PUBLIC_API_ADDRESS_PROD
    const fullUrl = `${fetchAddress}/api${url}${queryString}`

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include',
      mode: 'cors',
      headers: {
        ...headers
      }
    }

    if (formData) {
      fetchOptions.body = formData
    } else if (body) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        'Content-Type': 'application/json'
      }
      fetchOptions.body = JSON.stringify(body)
    }

    const response = await fetch(fullUrl, fetchOptions)

    if (!response.ok) {
      throw new Error(`Fetch error! Status: ${response.status}`)
    }

    const res = await response.json()

    return res
  } catch (error) {
    console.error(`Fetch error: ${error}`)
    throw error
  }
}

export const FetchGet = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return FetchRequest<T>(url, 'GET', { query })
}

export const FetchPost = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return FetchRequest<T>(url, 'POST', { body })
}

export const FetchPut = async <T>(
  url: string,
  body?: Record<string, unknown>
): Promise<T> => {
  return FetchRequest<T>(url, 'PUT', { body })
}

export const FetchDelete = async <T>(
  url: string,
  query?: Record<string, string | number>
): Promise<T> => {
  return FetchRequest<T>(url, 'DELETE', { query })
}

export const FetchFormData = async <T>(
  url: string,
  formData?: FormData
): Promise<T> => {
  if (!formData) {
    throw new Error('formData is required for FetchFormData')
  }

  return FetchRequest<T>(url, 'POST', { formData })
}
