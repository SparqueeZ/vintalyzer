<template>
  <NuxtLink class="text-center" :to="`/products/${product?.id}`" v-if="product">
    <div class="product-image"></div>
    <p>
      {{ product?.title }}
    </p>
    <p>{{ product?.description }}</p>
    <p class="font-bold text-xl">{{ product?.price }}€</p>
    <p>{{ product.author }}</p>
    <button
      v-if="hasPermission(userStore.user, 'products', 'delete', product)"
      class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
    >
      Supprimer
    </button>
    <button
      v-if="hasPermission(userStore.user, 'products', 'update', product)"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
    >
      Mettre à jour
    </button>
  </NuxtLink>
</template>

<script setup>
const { product } = defineProps(["product"]);
const userStore = useUserStore();
import { hasPermission } from "~/assets/js/auth";

console.log(userStore.user.id);

console.log(hasPermission(userStore.user, "products", "update", product));
</script>

<style lang="scss" scoped></style>
