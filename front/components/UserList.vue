<template>
  <div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Roles</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userStore.users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.roles.join(", ") }}</td>
          <td>
            <button
              v-if="hasPermission(userStore.user, 'users', 'update', user)"
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded"
            >
              Mettre à jour
            </button>

            <button
              v-if="hasPermission(userStore.user, 'users', 'delete', user)"
              class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { hasPermission } from "~/assets/js/auth";
import { onMounted } from "vue";
import { useUserStore } from "@/stores/UserStore";
 
const userStore = useUserStore();

onMounted(async () => {
  await userStore.fetchUsers();
});
</script>

<style scoped></style>
