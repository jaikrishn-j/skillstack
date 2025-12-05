import axios from "axios"
import { API_ENDPOINTS } from "@/config/api"

/**
 * Get tokens from localStorage
 */
export const getTokens = () => {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")
    return { accessToken, refreshToken }
}

/**
 * Save tokens to localStorage
 */
export const saveTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
}

/**
 * Clear tokens from localStorage
 */
export const clearTokens = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
}

/**
 * Refresh the access token using the refresh token
 */
export const refreshAccessToken = async (): Promise<boolean> => {
    const { refreshToken } = getTokens()

    if (!refreshToken) {
        return false
    }

    try {
        const response = await axios.post(API_ENDPOINTS.auth.refresh, {
            refresh_token: refreshToken,
        })

        const { access_token, refresh_token: new_refresh_token } = response.data
        saveTokens(access_token, new_refresh_token)
        return true
    } catch (error) {
        // Refresh token is invalid or expired
        clearTokens()
        return false
    }
}

/**
 * Check if user is authenticated
 * Attempts to verify access token, and refresh if needed
 */
export const checkAuth = async (): Promise<boolean> => {
    const { accessToken, refreshToken } = getTokens()

    // No tokens at all
    if (!accessToken && !refreshToken) {
        return false
    }

    // Try to verify access token
    if (accessToken) {
        try {
            await axios.get(API_ENDPOINTS.auth.getSession, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            return true
        } catch (error) {
            // Access token is invalid, try to refresh
            console.log("Access token invalid, attempting refresh...")
        }
    }

    // Access token failed or doesn't exist, try refresh token
    if (refreshToken) {
        const refreshed = await refreshAccessToken()
        return refreshed
    }

    return false
}

/**
 * Get user data if authenticated
 */
export const getUserData = async (): Promise<{ name: string; email: string } | null> => {
    const { accessToken } = getTokens()

    if (!accessToken) {
        return null
    }

    try {
        const response = await axios.get(API_ENDPOINTS.auth.getSession, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
        return response.data
    } catch (error) {
        // Try to refresh and retry
        const refreshed = await refreshAccessToken()
        if (refreshed) {
            const { accessToken: newToken } = getTokens()
            const response = await axios.get(API_ENDPOINTS.auth.getSession, {
                headers: {
                    Authorization: `Bearer ${newToken}`,
                },
            })
            return response.data
        }
        return null
    }
}

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
    const { refreshToken, accessToken } = getTokens()

    if (refreshToken && accessToken) {
        try {
            await axios.post(
                API_ENDPOINTS.auth.logout,
                { refresh_token: refreshToken },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            )
        } catch (error) {
            console.error("Logout API error:", error)
        }
    }

    clearTokens()
}
