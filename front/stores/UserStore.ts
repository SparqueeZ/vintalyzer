import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";
import type { User, Role, Subscription } from "../assets/types/usersTypes";

export const useUserStore = defineStore("users", {
  state: () => ({
    user: {} as User,
    users: [] as User[],
    loading: false,
    error: null as string | null,
    sessionError: null as string | null,

    loginPage: "" as "login" | "register" | "forgotPassword" | "",
    loginPageEmail: "" as string,

    selectedRange: {
      start: getFirstLoadedDate(),
      end: new Date(),
    } as { start: Date; end: Date },
  }),
  actions: {
    async register(
      email: string,
      password: string,
      lastname: string,
      firstname: string,
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
        console.log("[INFO] Sending registration request to the API");
        const response = await axios.post("/api/auth/register", {
          email,
          password,
          lastname,
          firstname,
          displayname: firstname,
          role: "CLIENT",
        });

        if (response.status === 201) {
          console.log("[SUCCESS] User registered successfully");
          // Store auth token if one is returned
          if (response.data.ext_token) {
            localStorage.setItem("ext_token", response.data.ext_token);
          }

          // Try to get the user data
          try {
            const userResponse = await axios.get("/api/auth/user");
            if (userResponse.data) {
              this.user = userResponse.data;
              return this.user;
            }
          } catch (userError) {
            console.error(
              "[ERROR] Failed to fetch user after registration:",
              userError
            );

            // If user data fetch fails, try to login with the credentials
            await this.login(email, password);
          }
        }
      } catch (error: any) {
        console.error("[ERROR] Registration error:", error);

        // Provide more detailed error messages
        if (error.code === "ERR_NETWORK") {
          this.error =
            "Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.";
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          this.error = error.response.data.error;
        } else {
          this.error =
            error.message || "Une erreur s'est produite lors de l'inscription.";
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async login(email: string, password: string) {
      this.user = {} as User;
      this.loading = true;
      this.error = null;

      try {
        console.log("[LOGIN] Attempting login with email:", email);
        const response = await axios.post("/api/auth/login", {
          email,
          password,
        });

        if (response.status === 200) {
          console.log("[LOGIN] Login successful, ext_token received");
          localStorage.setItem("ext_token", response.data.ext_token);

          try {
            console.log("[LOGIN] Fetching user data");
            const user = await axios.get("/api/auth/user");
            console.log("[LOGIN] User data received:", user.data);
            this.user = user.data;
          } catch (userError: any) {
            console.error("[LOGIN] Error fetching user data:", userError);
            if (userError.response) {
              console.error(
                "[LOGIN] Response status:",
                userError.response.status
              );
              console.error("[LOGIN] Response data:", userError.response.data);
            }
            throw userError;
          }
        }
      } catch (error: any) {
        console.error("[LOGIN ERROR]", error);
        if (error.response) {
          console.error("[LOGIN] Error status:", error.response.status);
          console.error("[LOGIN] Error data:", error.response.data);
          this.error =
            error.response.data.error ||
            "Une erreur s'est produite lors de la connexion.";
        } else {
          this.error =
            error.message || "Une erreur s'est produite lors de la connexion.";
        }
        throw error;
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
        console.log("USER FETCHED", user.data);
        return user.data;
      } catch (error: any) {
        console.error("FETCH ERROR", error);
        if (error.response && error.response.status === 403) {
          this.sessionError = "Session expirée. Veuillez vous reconnecter.";
        } else if (error.response && error.response.status === 401) {
          // this.sessionError = "Session invalide. Veuillez vous reconnecter.";
        } else {
          this.error = error.message || "Une erreur s'est produite.";
        }
        this.user = {} as User;
        throw error;
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
    setSubscription(subscription: Subscription) {
      this.user.Subscription = subscription;
    },
    setSelectedRange(range: { start: Date; end: Date }) {
      this.selectedRange = range;
    },
  },
});

const getFirstLoadedDate = () => {
  const startDate = new Date();
  startDate.setMonth(0);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
