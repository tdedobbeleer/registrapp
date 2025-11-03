import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js'

export interface Auth0Config {
    domain: string
    clientId: string
    redirectUri: string,
    audience: string,
}

const config: Auth0Config = {
    domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    redirectUri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
}

let auth0Client: Auth0Client | null = null

export const getAuth0Client = async (): Promise<Auth0Client> => {
    if (!auth0Client) {
        auth0Client = await createAuth0Client({
            domain: config.domain,
            clientId: config.clientId,
            authorizationParams: {
                redirect_uri: config.redirectUri,
                audience: config.audience
            }
        })
    }
    return auth0Client
}

export const login = async (redirectPath?: string): Promise<void> => {
    const client = await getAuth0Client()
    await client.loginWithRedirect({
        appState: {
            returnTo: redirectPath || '/'
        }
    })
}

export const logout = async (): Promise<void> => {
    const client = await getAuth0Client()
    await client.logout({
        logoutParams: {
            returnTo: `${window.location.origin}/logout`
        }
    })
}

export const getUser = async () => {
    const client = await getAuth0Client()
    const user = await client.getUser()
    return user
}

export const getIdTokenClaims = async () => {
    const client = await getAuth0Client()
    return await client.getIdTokenClaims()
}

export const getAccessTokenClaims = async () => {
    const client = await getAuth0Client()
    const token = await client.getTokenSilently()
    if (!token) return null
    // Decode the JWT token to get claims
    const payload = JSON.parse(atob(token.split('.')[1]!))
    return payload
}

export const isAuthenticated = async (): Promise<boolean> => {
    const client = await getAuth0Client()
    return await client.isAuthenticated()
}

export const getTokenSilently = async (): Promise<string> => {
    const client = await getAuth0Client()
    return await client.getTokenSilently()
}

export const handleRedirectCallback = async (): Promise<{ appState?: { returnTo?: string } }> => {
    const client = await getAuth0Client()
    const result = await client.handleRedirectCallback()
    return result
}

export const isVolunteer = async (): Promise<boolean> => {
    const claims = await getAccessTokenClaims()
    return claims?.permissions?.includes('is:volunteer') || false
}