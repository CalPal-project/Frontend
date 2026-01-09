// utils/auth.js (celotna datoteka)
export const auth = {
    getToken: () => localStorage.getItem("access_token"),
    
    getRefreshToken: () => localStorage.getItem("refresh_token"),
    
    setTokens: (newAccessToken, newRefreshToken = null) => {
        localStorage.setItem("access_token", newAccessToken);
        if (newRefreshToken) {
            localStorage.setItem("refresh_token", newRefreshToken);
        }
    },
    
    logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("currentUser");
        window.location.href = `${window.location.origin}/login`;
    },
    
    isAuthenticated: async () => {
        const accessToken = auth.getToken();
        const refreshToken = auth.getRefreshToken();
        
        if (!accessToken) {
            console.log("❌ No access token");
            return false;
        }
        
        try {
            const res = await fetch(`http://localhost:8081/api/auth/validate_token`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            
            console.log("✅ Validate response:", res.status);
            
            if (res.ok) {
                const data = await res.json();
                return data;
            } else {
                console.log("❌ Token invalid (status:", res.status, ")");
                return false;
            }
        } catch (error) {
            console.error("Network error:", error);
            return false;
        }
    },
    
    refreshAccessToken: async (refreshToken) => {
        console.log("🔄 Attempting refresh...");
        
        try {
            const res = await fetch(`http://localhost:8081/api/auth/refreshToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            });
            
            console.log("Refresh response:", res.status);
            
            if (res.ok) {
                const tokens = await res.json();
                auth.setTokens(tokens.access_token, tokens.refresh_token);
                return tokens;
            } else {
                console.log("❌ Refresh failed:", res.status);
                return null;
            }
        } catch (error) {
            console.error("Refresh error:", error);
            return null;
        }
    }
};