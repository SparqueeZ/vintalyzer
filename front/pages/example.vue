<template>
  <div @contextmenu.prevent="handleContextMenu" @click="handleClick">
    test
    <defaultContext
      v-if="contextMenuVisible"
      :options="menuOptions"
      :x="menuX"
      :y="menuY"
      @option-selected="handleOptionSelected"
      @close-menu="contextMenuVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import defaultContext from "~/components/ContextMenu/defaultContext.vue";
const contextMenuVisible = ref(false);
const menuX = ref(0);
const menuY = ref(0);

const menuOptions = [
  {
    icon: "fas fa-edit",
    label: "Éditer",
    action: () => console.log("Éditer"),
  },
  {
    icon: "fas fa-copy",
    label: "Copier",
    children: [
      {
        icon: "fas fa-clone",
        label: "Dupliquer",
        action: () => console.log("Dupliquer"),
      },
      {
        icon: "fas fa-paste",
        label: "Coller",
        action: () => console.log("Coller"),
      },
    ],
  },
  {
    icon: "fas fa-trash",
    label: "Supprimer",
    action: () => console.log("Supprimer"),
  },
];

const handleContextMenu = (event: MouseEvent) => {
  openContextMenu(event);
};

const handleClick = (event: MouseEvent) => {
  openContextMenu(event);
};

const openContextMenu = (event: MouseEvent) => {
  menuX.value = event.clientX;
  menuY.value = event.clientY;
  contextMenuVisible.value = true;
};

const handleOptionSelected = (option: any) => {
  contextMenuVisible.value = false;
};
</script>
