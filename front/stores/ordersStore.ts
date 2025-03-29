import { acceptHMRUpdate, defineStore } from "pinia";
import axios from "../assets/js/axios";

export const useOrderStore = defineStore("orders", {
  state: () => ({
    orders: [] as any[], // Order[]
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      this.orders = [] as any[];
      try {
        const response = await axios.get("/api/orders");
        this.orders = response.data;

        // Check for late orders locally in case backend check missed them
        this.checkLateOrders();

        return this.orders;
      } catch (error: any) {
        this.error = error.message || "Une erreur s'est produite.";
        throw error;
      } finally {
        setTimeout(async () => {
          this.loading = false;
        }, 2000);
      }
    },

    // Check if any orders are late based on the current time
    checkLateOrders() {
      const now = new Date();
      this.orders.forEach((order) => {
        if (order.status === "0") {
          // Only check pending orders
          const orderDate = new Date(order.orderDate);
          const limitDate = new Date(orderDate);
          limitDate.setDate(orderDate.getDate() + 4);

          if (now >= limitDate) {
            order.status = "2"; // Set to late status
          }
        }
      });
    },

    async updateOrderStatus(orderId: string, newStatus: string) {
      try {
        console.log(`Updating status for order ${orderId} to ${newStatus}`);

        const order = this.orders.find((order) => order.id === orderId);
        if (!order) {
          throw new Error("Commande introuvable.");
        }

        // Store the current status to revert if needed
        const previousStatus = order.status;

        // Update locally first for immediate UI feedback
        order.status = newStatus;

        // Check if status should be "late" due to date
        if (newStatus === "0") {
          const orderDate = new Date(order.orderDate);
          const limitDate = new Date(orderDate);
          limitDate.setDate(orderDate.getDate() + 4);

          if (new Date() >= limitDate) {
            // If past due date, update local UI to show as late
            order.status = "2";
            console.log(
              `Local order status set to late (2) because the order is past due date`
            );
          }
        }

        // Send the update to the server
        const response = await axios.put(`/api/orders/${orderId}/status`, {
          status: newStatus, // Send the requested status, server will handle late logic
        });

        // Update with server response to ensure consistency
        const updatedOrder = this.orders.find((o) => o.id === orderId);
        if (updatedOrder && response.data && response.data.status) {
          console.log(`Server returned status: ${response.data.status}`);
          updatedOrder.status = response.data.status;
        }

        console.log("Statut mis à jour:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("Erreur lors de la mise à jour du statut:", error);

        // Revert the local change if the server request fails
        const order = this.orders.find((order) => order.id === orderId);
        if (order) {
          // Revert to previous status instead of toggling
          order.status = previousStatus || (order.status === "1" ? "0" : "1");
        }

        throw error;
      }
    },

    async checkDocumentExists(orderId: string, documentType: string) {
      try {
        const order = this.orders.find((order) => order.id === orderId);
        if (!order) {
          return false;
        }

        // Check if the order has the document based on type
        if (documentType === "shippingLabel" && !order.shippingLabelId) {
          return false;
        }
        if (documentType === "returnForm" && !order.returnFormId) {
          return false;
        }

        const url = `/api/documents/sale/${orderId}/${documentType}`;
        const response = await axios.head(url);
        return response.status === 200;
      } catch (error) {
        console.error(`Error checking document availability: ${error}`);
        return false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useOrderStore, import.meta.hot));
}
