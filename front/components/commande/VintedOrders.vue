<template>
  <div class="p-6 space-y-6">
    <!-- En-tête avec statistiques -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex-1">
        <div class="bg-gradient-to-br from-violet-600/20 to-pink-500/20 rounded-2xl p-8 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <h3 class="text-lg font-medium text-gray-200 mb-3 flex items-center">
              <svg class="w-5 h-5 mr-2 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Commandes à traiter
            </h3>
            <div class="flex items-center">
              <span class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">{{ pendingOrdersCount }}</span>
              <span class="ml-2 text-sm text-gray-400">en attente</span>
            </div>
          </div>
        </div>
      </div>
      <button @click="refreshOrders" class="ml-6 px-5 py-3 bg-gradient-to-r from-violet-600 to-pink-500 text-white rounded-xl hover:from-violet-700 hover:to-pink-600 flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5" :disabled="isRefreshing">
        <svg class="w-5 h-5 mr-2" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Actualiser
      </button>
    </div>

    <!-- Filtres -->
    <div class="flex space-x-4 mb-6">
      <button 
        v-for="(label, status) in statusFilters" 
        :key="status"
        @click="currentFilter = status"
        class="filter-btn px-4 py-2 rounded-lg"
        :class="getFilterButtonClasses(status)">
        {{ label }}
      </button>
    </div>

    <!-- Liste des commandes -->
    <div class="space-y-4">
      <template v-if="filteredOrders.length">
        <div v-for="order in filteredOrders" :key="order.id" class="bg-gray-800 text-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">{{ order.item_name }}</h3>
                <span :class="getStatusBadgeClasses(order.status)">
                  {{ order.status === 'pending' ? 'À traiter' : 'Terminé' }}
                </span>
              </div>
              <p v-if="order.vinted_order_id" class="text-gray-400">Commande Vinted #{{ order.vinted_order_id }}</p>
              <p v-if="order.buyer_name" class="text-sm text-gray-300">{{ order.buyer_name }}</p>
              <p v-if="order.buyer_address" class="text-sm text-gray-300">{{ order.buyer_address }}</p>
              <p v-if="order.buyer_email" class="text-sm text-gray-300">📧 {{ order.buyer_email }}</p>
            </div>
            <div class="text-right space-y-2">
              <div class="space-y-1 text-sm">
                <p v-if="order.price" class="flex justify-between">
                  <span class="text-gray-400">Prix article:</span>
                  <span>{{ formatPrice(order.price) }} €</span>
                </p>
                <p v-if="order.buyer_protection_cost" class="flex justify-between">
                  <span class="text-gray-400">Protection acheteur:</span>
                  <span>{{ formatPrice(order.buyer_protection_cost) }} €</span>
                </p>
                <div class="border-t border-gray-700 pt-1 mt-1">
                  <p class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{{ formatPrice(order.total_amount) }} €</span>
                  </p>
                </div>
              </div>
              <p :class="getDeadlineClasses(order.shipping_deadline)">
                {{ getDeadlineText(order.shipping_deadline) }}
              </p>
            </div>
          </div>
          <div class="flex justify-between items-center mt-4">
            <div class="space-x-2">
              <button 
                v-for="(label, type) in documentTypes" 
                :key="type"
                @click="downloadFile(order.id, type)"
                class="px-4 py-2 rounded-lg"
                :class="getDocumentButtonClasses(type)">
                {{ label }}
              </button>
            </div>
            <button 
              @click="handleStatusChange(order.id, order.status === 'pending' ? 'shipped' : 'pending')"
              class="px-4 py-2 rounded-lg"
              :class="getStatusChangeButtonClasses(order.status)">
              {{ order.status === 'pending' ? 'Marquer comme expédié' : 'Restaurer' }}
            </button>
          </div>
        </div>
      </template>
      <div v-else class="text-center text-gray-400 py-8">
        Aucune commande à afficher
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDataStore } from '~/stores/dataStore'
import { API_URL } from '~/config'

const store = useDataStore()

// État local
const isRefreshing = ref(false)
const currentFilter = ref('pending')
const refreshInterval = ref(null)

// Constantes
const statusFilters = {
  pending: 'À traiter',
  shipped: 'Expédié'
}

const documentTypes = {
  label: 'Étiquette',
  return: 'Formulaire retour',
  invoice: 'Facture'
}

// Computed properties
const filteredOrders = computed(() => {
  return (store.vintedOrders || []).filter(order => order.status === currentFilter.value)
})

const pendingOrdersCount = computed(() => {
  return (store.vintedOrders || []).filter(order => order.status === 'pending').length
})

// Méthodes
const refreshOrders = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  try {
    const oldOrders = store.vintedOrders || []
    const token = store.token
    const user = store.user

    if (!token || !user) {
      console.log('❌ Utilisateur non connecté')
      return
    }

    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const allOrders = await response.json()
    
    const userOrders = allOrders.filter(order => order.user_id === user.id)
    const newCount = userOrders.filter(n => !oldOrders.some(o => o.id === n.id)).length
    
    if (newCount) {
      console.log(`✅ ${newCount} nouvelle(s) commande(s) trouvée(s)`)
    } else {
      console.log('ℹ️ Pas de nouvelles commandes')
    }
    
    store.setOrders(userOrders)
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error)
  } finally {
    isRefreshing.value = false
  }
}

const handleStatusChange = async (orderId, status) => {
  try {
    const token = store.token
    const user = store.user

    if (!token || !user) {
      console.log('❌ Utilisateur non connecté')
      return
    }

    const orders = store.vintedOrders || []
    const order = orders.find(o => o.id === orderId)
    
    if (!order || order.user_id !== user.id) {
      console.error('❌ Cette commande n\'appartient pas à l\'utilisateur')
      return
    }
    
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour du statut')
    }

    store.updateOrderStatus(orderId, status)
    currentFilter.value = status
    console.log(`✅ Commande ${status === 'shipped' ? 'marquée comme expédiée' : 'restaurée'}`)

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error)
  }
}

const downloadFile = async (orderId, type) => {
  try {
    const token = store.token
    const response = await fetch(`${API_URL}/documents/${orderId}/${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    const filename = `${type === 'label' ? 'etiquette' : type === 'return' ? 'formulaire_retour' : 'facture'}_${orderId}.pdf`
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error(`❌ Erreur lors du téléchargement du fichier ${type}:`, error)
  }
}

// Utilitaires
const formatPrice = (price) => parseFloat(price).toFixed(2)

const getDeadlineText = (deadline) => {
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return daysLeft > 0 ? `⏳ ${daysLeft}j restants` : '⚠️ Délai dépassé'
}

const getFilterButtonClasses = (status) => ({
  'active': currentFilter.value === status,
  'border-2': true,
  'border-orange-500 text-orange-500': status === 'pending' && currentFilter.value === status,
  'border-green-500 text-green-500': status === 'shipped' && currentFilter.value === status,
  'hover:bg-orange-500 hover:text-white': status === 'pending',
  'hover:bg-green-500 hover:text-white': status === 'shipped'
})

const getStatusBadgeClasses = (status) => ({
  'px-3 py-1 rounded-lg': true,
  'border-2 border-orange-500 text-orange-500': status === 'pending',
  'bg-green-500 text-white': status === 'shipped'
})

const getDeadlineClasses = (deadline) => {
  const daysLeft = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  return `text-sm font-medium ${daysLeft > 0 ? 'text-green-600' : 'text-red-600'}`
}

const getDocumentButtonClasses = (type) => ({
  'bg-blue-600 text-white hover:bg-blue-700': type === 'label',
  'bg-green-600 text-white hover:bg-green-700': type === 'return',
  'bg-purple-600 text-white hover:bg-purple-700': type === 'invoice'
})

const getStatusChangeButtonClasses = (status) => ({
  'border-2': true,
  'border-green-500 text-green-500 hover:bg-green-500 hover:text-white': status === 'pending',
  'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white': status === 'shipped'
})

// Cycle de vie
onMounted(() => {
  refreshOrders()
  refreshInterval.value = setInterval(refreshOrders, 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.filter-btn {
  transition: all 0.2s;
  background-color: rgb(243 244 246);
}

.filter-btn:hover {
  background-color: rgb(229 231 235);
}

.filter-btn.active {
  background-color: transparent;
}
</style>
