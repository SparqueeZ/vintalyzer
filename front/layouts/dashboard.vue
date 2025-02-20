<template>
  <transition name="fade" mode="out-in">
    <div v-if="loading" key="loading" class="loading-container">
      <Spinner />
    </div>
    <div v-else key="content">
      <main>
        <SidebarContainer>
          <Sidebar buttonOpen>
            <SidebarInsideHeader>
              <Logo />
            </SidebarInsideHeader>
            <SidebarInsideContent :menus="sidebarMenu" />
            <SidebarInsideFooter>
              <ProfileCard :menu="profileMenu" rounded small
            /></SidebarInsideFooter>
          </Sidebar>
          <SidebarInset>
            <div
              class="flex flex-col w-full page-content-wrapper"
              @contextmenu="handleContextMenu"
            >
              <!-- <header class="bg-white shadow-sm">
                <nav
                  class="container mx-auto p-4 flex justify-between items-center"
                >
                  <p class="font-bold">Vintalyze</p>
                  <ul class="flex gap-4">
                    <li>
                      <NuxtLink to="/">
                        <DefaultButton
                          text="Retourner à l'accueil"
                          small
                          smallText
                        />
                      </NuxtLink>
                    </li>
                    <li>
                      <ChangeTheme bordered />
                    </li>
                  </ul>
                </nav>
              </header> -->

              <div class="py-4 w-full page-content">
                <slot />
              </div>
              <ContextMenu
                :menu="profileMenu"
                :x="contextMenuX"
                :y="contextMenuY"
                :visible="showContextMenu"
                @item-click="handleItemClick"
              />
            </div>
          </SidebarInset>
        </SidebarContainer>
      </main>
    </div>
  </transition>
</template>

<script setup>
import { ref } from "vue";
import { useTheme } from "~/composables/useTheme";
import { hasPermission } from "~/assets/js/auth";
import ProfileCard from "~/components/ProfileCard/ProfileCard.vue";
import ContextMenu from "~/components/ContextMenu.vue";
import ChangeTheme from "~/components/Buttons/ChangeTheme.vue";
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
import Spinner from "~/components/Spinner.vue";
const { currentTheme, toggleTheme } = useTheme();
const userStore = useUserStore();
const orderStore = useOrderStore();
// await userStore.fetchUser();
const router = useRouter();

const loading = ref(true);

const loadUser = async () => {
  loading.value = true;
  try {
    const response = await userStore.fetchUser();
    console.log(response);
    if (!response) {
      router.push("/app/connexion");
    }
  } catch (error) {
    router.push("/app/connexion");
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  }
};

const profileMenu = ref([
  {
    title: "Profile",
    items: [
      {
        title: "Account",
        icon: "userCircle",
        to: "/app/account",
        access: true,
      },
      {
        title: "Settings",
        icon: "settings",
        to: "/app/settings",
        access: true,
      },
    ],
  },
  {
    title: "Logout",
    items: [
      {
        title: "Logout",
        icon: "logout",
        to: "/app/login",
        access: true,
        func: () => {
          userStore.logout();
        },
      },
    ],
  },
]);

// sidebarMenu
const sidebarMenu = ref([
  {
    title: "Général",
    items: [
      { title: "Tableau de bord", icon: "home", to: "/app", access: true },
      {
        title: "Analyse Concurrence",
        icon: "aiSettings",
        to: "/app/analyse-concurrence",
        access: true,
      },
      {
        title: "Commandes Vinted",
        icon: "shoppingBag",
        to: "/app/commandes",
        access: true,
      },
      {
        title: "Gestion du stock",
        icon: "cardboard",
        to: "/app/inventaire",
        access: true,
      },
    ],
  },

  {
    title: "Vintalyze",
    items: [
      {
        title: "Configuration Email",
        icon: "mail01",
        to: "/app/configuration-email",
        access: true,
      },
      {
        title: "Mon abonnement",
        icon: "award",
        to: "/app/mon-abonnement",
        access: true,
      },
      {
        title: "Parser",
        icon: "settings",
        to: "/app/test-parser",
        access: true,
      },
    ],
  },
  {
    position: "bottom",
    items: [
      {
        title: "Mon compte",
        icon: "userCircle",
        to: "/app/compte",
        access: true,
      },
      {
        title: "Paramètres",
        icon: "settings",
        to: "/app/parametres",
        access: true,
      },
      {
        title: "Se déconnecter",
        icon: "logout",
        to: "/app/connexion",
        access: true,
        func: () => {
          userStore.logout();
        },
      },
    ],
  },
]);

const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

const handleContextMenu = (event) => {
  event.preventDefault();
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  showContextMenu.value = true;
};

const handleItemClick = (item) => {
  showContextMenu.value = false;
  if (item.func) {
    item.func();
  }
};

const saleStore = useSaleStore();

onMounted(async () => {
  await loadUser();
  await saleStore.fetchUserData();
  const orders = await orderStore.fetchOrders();
});
</script>

<style lang="scss" scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

ul {
  li {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

main {
  display: flex;
}
.router-link-exact-active {
  font-weight: bold;
}
.page-content-wrapper {
  background-color: var(--color-bg);
  min-height: 100svh;
  color: var(--color-text);
  header {
    background-color: var(--color-bg);
    border-bottom: 2px solid var(--color-border);
    color: var(--color-text);
  }
  .page-content {
    min-height: 100%;
  }
}

.loading-container {
  background-color: var(--color-bg);
  min-height: 100vh;
  width: 100%;
}
</style>
