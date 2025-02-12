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
  }),
  actions: {
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
      this.user = {} as User;
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
          this.error = "Session expirée. Veuillez vous reconnecter.";
        } else {
          this.error = error.message || "Une erreur s'est produite.";
        }
        this.user = {} as User;
        return null;
      } finally {
        this.loading = false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
