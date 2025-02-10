<template></template>

<script setup>
import { useUserStore } from "../stores/UserStore";
import { hasPermission } from "~/assets/js/auth";
const userStore = useUserStore();

definePageMeta({
  layout: "dashboard",
  middleware: "auth",
});
</script>

<style lang="scss" scoped></style>
