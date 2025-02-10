<template>
  <div class="account-page">
    <h1 class="account-page__title">Mon compte</h1>
    <div class="account-info">
      <div class="account-info__avatar">
        <span class="avatar">
          <p>{{ userStore.user.lastname?.[0] }}</p>
        </span>
      </div>
      <div class="account-info__details">
        <div class="info-group">
          <h3>Informations personnelles</h3>
          <p><strong>Prénom:</strong> {{ userStore.user.firstname }}</p>
          <p><strong>Nom:</strong> {{ userStore.user.lastname }}</p>
          <p><strong>Email:</strong> {{ userStore.user.email }}</p>
          <p><strong>Rôle:</strong> {{ userStore.user.role }}</p>
        </div>
      </div>
    </div>
    <div class="account-input">
      <textarea
        v-model="inputText"
        class="w-full h-64 p-2 border rounded mb-4"
        placeholder="Collez votre texte Vinted ici..."
      ></textarea>
      <button
        @click="parseText(inputText)"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Analyser le texte
      </button>
      <p>{{ result }}</p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/UserStore";
import { VintedAnalyzer } from "~/utils/vintedAnalyzer";
import { useDataStore } from "#imports";
const store = useDataStore();

const userStore = useUserStore();
const result = ref("");
const inputText = ref("");

async function analyzeText() {
  // logs.value = [];
  const analyzer = new VintedAnalyzer(inputText.value);
  result.value = analyzer.analyze();
  console.log(result.value);
  store.setAnalyzedData(result.value);
}

const parseText = (text) => {
  // Enlever les footers
  const unwantedSection = `Vinted\nÀ propos de Vinted\nCarrière\nLe développement durable\nPresse\nPublicités\nDécouvrir\nComment ça marche ?\nVérification de l'article\nApplications mobiles\nTableau de bord\nVinted Pro\nGuide Vinted Pro\nAide\nCentre d'aide\nVendre\nAcheter\nConfiance et sécurité\nPolitique de Confidentialité\nPolitique de cookies\nParamètres des cookies\nTermes et Conditions\nNotre plateforme\nTermes et conditions de Vinted Pro`;
  const regexUnwanted = new RegExp(
    unwantedSection.replace(/([.*+?^${}()|[\]\/])/g, "\\$1"),
    "g"
  );
  text = text.replace(regexUnwanted, "\n=== FIN DE PAGE ===").trim();

  // Enlever les navigations de page
  const regexTransactions =
    /Vends tes articles\nFR\nFemmes\nHommes[\s\S]*?Factures\nRevenu/g;
  result.value = text.replace(regexTransactions, "Revenu");

  result.value = extractSellerInfo(text);
};

function extractSellerInfo(text) {
  const regexSellerInfo =
    /^(?<name>.+?)(?<status>Pro)?@(?<username>\S+)\s+(?<ratings>\d+)\s+évaluations.*?Montbonnot-Saint-Martin,\s+(?<country>\S+)\s+(?<email>\S+)\s+(?<phone>\S+).*?Abonnés,(?<subscribers>\d+).*?Numéro d'entreprise\s+(?<companyNumber>\d+).*?R\.C\.S\s+(?<rcsCity>\S+)\s+(?<rcsNumber>\d+)/s;

  const match = text.match(regexSellerInfo);
  // if (!match || !match.groups) {
  //   console.log("No match found");
  //   return {} ;
  // }

  const response = {
    name: match.groups.name.trim(),
    status: match.groups.status ? "Pro" : "",
    username: match.groups.username,
    ratings: parseInt(match.groups.ratings, 10),
    about: {
      localisation: {
        city: "Montbonnot-Saint-Martin",
        country: match.groups.country,
      },
      contact: {
        email: match.groups.email,
        phone: match.groups.phone,
      },
      subscribers: parseInt(match.groups.subscribers, 10),
      company: {
        number: match.groups.companyNumber,
        rcs: {
          number: match.groups.rcsNumber,
          city: match.groups.rcsCity,
        },
      },
    },
  };
  console.log(response);
  return response;
}

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});
</script>

<style lang="scss" scoped>
.account-page {
  padding: 2rem;

  &__title {
    margin-bottom: 2rem;
    font-size: 2rem;
    font-weight: bold;
  }
}

.account-info {
  display: flex;
  gap: 2rem;

  &__avatar {
    .avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 120px;
      border-radius: 10px;
      background-color: var(--color-primary);

      p {
        font-size: 3rem;
        color: white;
        font-weight: 700;
      }
    }
  }

  &__details {
    .info-group {
      background-color: var(--color-bg);
      padding: 2rem;
      border-radius: 10px;

      h3 {
        margin-bottom: 1rem;
        font-size: 1.2rem;
        font-weight: bold;
      }

      p {
        margin-bottom: 0.5rem;

        strong {
          font-weight: 600;
          margin-right: 0.5rem;
        }
      }
    }
  }
}

.account-input {
  textarea {
    font-size: 1rem;
    color: var(--color-text);
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 1rem;
    resize: none;
    outline: none;
  }
}
</style>
