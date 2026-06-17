import { create } from "zustand";

/**
 * Global Authentication Store using Zustand.
 * In Phase 4, this will integrate with the actual backend JWT logic.
 * For Phase 2, we mock the responses.
 */
export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (email === "test@example.com" && password === "password123") {
        const dummyToken = "mock_jwt_token_12345";
        const dummyUser = { id: 1, name: "Test User", email };
        
        localStorage.setItem("token", dummyToken);
        set({
          user: dummyUser,
          token: dummyToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true };
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const dummyToken = "mock_jwt_token_67890";
      const dummyUser = { id: 2, name, email };

      localStorage.setItem("token", dummyToken);
      set({
        user: dummyUser,
        token: dummyToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      set({ error: "Registration failed", isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
}));
