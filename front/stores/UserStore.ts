import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";
import type { User, Role } from "../assets/types/usersTypes";

type Product = {
  id: string;
  name: string;
  price: number;
  author: string;
  category: string;
  visible: boolean;
  authorId: string;
};

export const useUserStore = defineStore("users", {
  state: () => ({
    user: {} as User,
    users: [] as User[],
    loading: false,
    error: null as string | null,
    sessionError: null as string | null,

    loginPage: "" as "login" | "register" | "forgotPassword" | "",
    loginPageEmail: "" as string,
  }),
  actions: {
    async register(
      email: string,
      password: string,
      lastname: string,
      firstname: string,
      role: Role,
      acceptConditions: boolean
    ) {
      this.loading = true;
      this.error = null;

      if (!acceptConditions) {
        this.error = "Vous devez accepter les conditions d'utilisation.";
        this.loading = false;
        return;
      }

      try {
        const response = await axios.post("/api/auth/register", {
          email,
          password,
          lastname,
          firstname,
          role,
        });
        if (response.status === 200) {
          const user = await axios.get("/api/auth/user");
          this.user = user.data;
        }
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
      } finally {
        this.loading = false;
      }
    },
    async login(email: string, password: string) {
      this.user = {} as User;
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/auth/login", {
          email,
          password,
        });
        if (response.status === 200) {
          const user = await axios.get("/api/auth/user");
          this.user = user.data;
        }
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
      } finally {
        this.loading = false;
      }
    },
    async logout() {
      this.loading = true;
      this.error = null;
      this.user = {} as User;

      try {
        const response = await axios.get("/api/auth/logout");
        this.user = {} as User;
        return response;
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async fetchUser() {
      this.loading = true;
      this.error = null;
      try {
        const user = await axios.get("/api/auth/user");
        this.user = user.data;
        return user.data;
      } catch (error: any) {
        if (error.response && error.response.status === 403) {
          this.sessionError = "Session expirée. Veuillez vous reconnecter.";
        } else {
          this.error = error.message || "Une erreur s'est produite.";
        }
        this.user = {} as User;
        return null;
      } finally {
        this.loading = false;
      }
    },
    async requestPasswordReset(email: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/auth/password/reset", {
          email,
        });
        return response;
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          "Une erreur s'est produite lors de l'envoi.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async resetPassword(token: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post("/api/auth/password/reset/confirm", {
          token,
          newPassword: password,
        });
        return response;
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          "Une erreur s'est produite lors de la réinitialisation.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    changeLoginPage(page: "login" | "register" | "forgotPassword") {
      this.loginPage = page;
    },
    updateLoginPageEmail(email: string) {
      this.loginPageEmail = email;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
