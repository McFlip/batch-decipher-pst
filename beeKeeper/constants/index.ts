// global constants

const apiExternal = process.env.NEXT_PUBLIC_API_EXTERNAL || 'http://localhost'
const apiInternal = process.env.API_INTERNAL || 'http://localhost'

export { apiExternal, apiInternal }