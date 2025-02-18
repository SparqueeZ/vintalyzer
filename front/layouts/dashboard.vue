<template>
  <transition name="fade" mode="out-in">
    <div v-if="loading" key="loading">
      <main>loading...</main>
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
              class="flex flex-col w-full h-full hello"
              @contextmenu="handleContextMenu"
            >
              <header class="bg-white shadow-sm">
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
                      <!-- <CustomButton small>
                        <p>Retourner à l'acceuil</p>
                      </CustomButton> -->
                    </li>
                    <li>
                      <ChangeTheme bordered />
                    </li>
                  </ul>
                </nav>
              </header>

              <div class="py-4 h-full w-full">
                <slot />
              </div>
              <footer class="mw-auto py-4 border-t">
                <p>Footer</p>
              </footer>
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
const { currentTheme, toggleTheme } = useTheme();
const userStore = useUserStore();
const saleStore = useSaleStore();
await userStore.fetchUser();

const loading = ref(true);

setTimeout(() => {
  loading.value = false;
}, 1000);

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

onMounted(async () => {
  const sales = await saleStore.fetchSales();
  console.log(sales);
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
  height: 100vh;
}
.router-link-exact-active {
  font-weight: bold;
}
.hello {
  background-color: var(--color-bg);
  height: 120svh;
  color: var(--color-text);
  header {
    background-color: var(--color-bg);
    border-bottom: 2px solid var(--color-border);
    color: var(--color-text);
  }
}
</style>
