<template>
  <section class="email-config-wrapper">
    <div class="welcomeMessage-module-wrapper">
      <div class="welcomeMessage-wrapper">
        <h1 class="title">Configuration des Emails Vinted</h1>
        <p class="subtitle">
          Configurez le transfert de vos emails de vente vers VintedPro.
        </p>
      </div>
    </div>

    <div class="content">
      <section class="how-to">
        <h2>Comment ça marche ?</h2>

        <div class="methods">
          <div class="method-card">
            <h3>1. Transfert manuel</h3>
            <ul>
              <li>
                Quand vous recevez un email "Ton article s'est vendu !" de
                Vinted
              </li>
              <li>
                Transférez-le simplement à :
                <span class="highlight">vintalyze@gmail.com</span>
              </li>
              <li>
                Le système détectera automatiquement que l'email vient de votre
                compte
              </li>
              <li>
                Les informations de vente seront ajoutées à votre tableau de
                bord
              </li>
            </ul>
          </div>

          <div class="method-card">
            <h3>2. Transfert automatique (Optionnel)</h3>
            <ul>
              <li>Dans Gmail, allez dans Paramètres > Transfert et POP/IMAP</li>
              <li>Cliquez sur "Ajouter une adresse de transfert"</li>
              <li>
                Entrez : <span class="highlight">vintalyze@gmail.com</span>
              </li>
              <li>Gmail vous enverra un code de confirmation</li>
              <li>
                Une fois confirmé, créez un filtre pour :
                <ul class="sub-list">
                  <li>De : vinted.fr</li>
                  <li>Objet : "Ton article s'est vendu !"</li>
                  <li>Action : Transférer à vintalyze@gmail.com</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="status">
        <h2>Statut de vos transferts</h2>
        <div class="stats-grid">
          <OverviewCards
            :content="{
              title: 'Emails traités aujourd\'hui',
              value: '0',
              icon: 'mailBox',
              positive: '0',
              negative: '0',
            }"
            splitFour
          />
          <OverviewCards
            :content="{
              title: 'Total des emails traités',
              value: '0',
              icon: 'mailStack',
              positive: '0',
              negative: '0',
            }"
            splitFour
          />
        </div>
      </section>

      <section class="test-system">
        <h2>Tester le système</h2>
        <p>
          Envoyez un email test pour vérifier que tout fonctionne correctement.
        </p>
        <DefaultButton
          text="Envoyer un email test"
          iconRight="mail01"
          :onClick="sendTestEmail"
          fit
        />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import DefaultButton from "~/components/Form/Buttons/defaultButton.vue";
import OverviewCards from "~/components/OverviewCards.vue";

definePageMeta({
  layout: "dashboard",
  middleware: ["auth"],
});

const sendTestEmail = () => {
  // Implement test email functionality
};
</script>

<style scoped lang="scss">
.email-config-wrapper {
  width: 85%;
  padding: 2rem 2rem;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 64px;

  .welcomeMessage-module-wrapper {
    display: flex;
    justify-content: space-between;
    .welcomeMessage-wrapper {
      .title {
        font-size: 2.1rem;
        font-weight: bold;
      }
      .subtitle {
        color: var(--color-text-subtitle);
        font-size: 1.1rem;
      }
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 64px;

    h2 {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 24px;
    }

    .methods {
      display: flex;
      gap: 32px;
      flex-wrap: wrap;

      .method-card {
        flex: 1;
        min-width: 300px;
        padding: 24px;
        border: 1px solid var(--color-border);
        border-radius: 8px;

        h3 {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 16px;
        }

        ul {
          list-style: none;
          li {
            margin-bottom: 12px;
            position: relative;
            padding-left: 20px;

            &:before {
              content: "•";
              position: absolute;
              left: 0;
              color: var(--color-primary);
            }
          }

          &.sub-list {
            margin-left: 20px;
            margin-top: 8px;
          }
        }

        .highlight {
          color: var(--color-primary);
          font-weight: bold;
        }
      }
    }

    .stats-grid {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .test-system {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;

      p {
        color: var(--color-text-subtitle);
      }
    }
  }
}
</style>
