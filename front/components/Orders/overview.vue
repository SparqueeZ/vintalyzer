<template>
  <section class="summaries-wrapper">
    <OverviewCards
      :content="summary"
      splitFour
      v-for="summary in summaries.filter(
        (summary) => summary.title !== 'Rafraichir les commandes'
      )"
    />
    <OverviewCards
      splitFour
      :content="
        summaries.find(
          (summary) => summary.title === 'Rafraichir les commandes'
        ) || {
          title: '',
          value: '',
          icon: '',
          positive: '',
          negative: '',
          func: () => {},
        }
      "
    >
      <defaultButton
        text="Recharger"
        iconLeft="refresh01"
        transparent
        :loading="orderStore.loading"
        :disabled="orderStore.loading"
        @click="fetchOrders"
      />
    </OverviewCards>
  </section>
</template>

<script setup lang="ts">
const orderStore = useOrderStore();
import DefaultButton from "../Form/Buttons/defaultButton.vue";

const props = defineProps<{
  selectedRange: { start: Date; end: Date };
}>();

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

const ordersInSelectedDates = computed(() => {
  let filteredOrders = orderStore.orders.filter((order) => {
    const orderDate = new Date(order.orderDate);
    return (
      orderDate >= props.selectedRange.start &&
      orderDate <= props.selectedRange.end
    );
  });
  console.log("FILTRE: ", filteredOrders);
  return filteredOrders;
});

const summaries = computed(() => {
  return [
    {
      title: "Toutes les commandes",
      value: orderStore.loading
        ? "0"
        : ordersInSelectedDates.value.length.toString(),
      icon: "cardboard",
      positive: "0",
      negative: "0",
    },
    {
      title: "Commandes à traiter",
      value: orderStore.loading
        ? "0"
        : ordersInSelectedDates.value
            .filter((order) => order.status === "0")
            .length.toString(),
      icon: "warningCircle",
      positive: "0",
      negative: "0",
    },
    {
      title: "Commandes expédiées",
      value: orderStore.loading
        ? "0"
        : ordersInSelectedDates.value
            .filter((order) => order.status === "1")
            .length.toString(),
      icon: "deliveryTruck",
      positive: "0",
      negative: "0",
    },
    {
      title: "Rafraichir les commandes",
      value: "1",
      icon: "refresh01",
      positive: "0",
      negative: "0",
      func: () => orderStore.fetchOrders(),
    },
  ];
});
</script>

<style scoped lang="scss">
.summaries-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  width: 100%;
  justify-content: space-between;
}
</style>
