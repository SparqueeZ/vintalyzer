<template>
  <section class="subscription-plans-module-wrapper">
    <transition name="load" mode="out-in">
      <div
        v-if="
          subscriptionStore.subscriptions.length > 0 &&
          !subscriptionStore.loading
        "
        class="plans"
      >
        <article
          v-for="(plan, index) in plans"
          :key="plan.name"
          class="plan-wrapper"
          :class="
            userStore.user.Subscription?.name === plan.name ? 'active' : ''
          "
        >
          <div class="header-wrapper">
            <p class="name">{{ plan.name }}</p>
            <div class="price-wrapper">
              <p class="price">
                {{ plan.price.toString() }},00€
                <span class="frequency">/mois</span>
              </p>
            </div>
          </div>
          <div class="button-wrapper">
            <defaultButton
              :text="
                userStore.user.Subscription?.name === plan.name
                  ? 'Déjà abonné'
                  : `S'abonner`
              "
              :disabled="
                userStore.user.Subscription?.name === plan.name ? true : false
              "
              :linkBlank="`${plan.link}?prefilled_email=${userStore.user.email}`"
              hover-primary
              transparent
            />
          </div>
          <div class="content-wrapper">
            <div v-for="advantage in plan.advantages" class="advantage-wrapper">
              <div class="icon-wrapper">
                <Icon name="checkCircle01" />
              </div>
              <p class="advantage">{{ advantage }}</p>
            </div>
          </div>
        </article>
      </div>
      <div v-else class="plans">
        <article v-for="index in 3" class="plan-wrapper">
          <div class="header-wrapper">
            <div class="name loading-text"></div>
            <div class="price-wrapper">
              <div class="price loading-text"></div>
            </div>
          </div>
          <div class="button-wrapper">
            <defaultButton
              text="Chargement..."
              disabled
              hover-primary
              transparent
            />
          </div>
          <div class="content-wrapper">
            <div v-for="index in 6" class="advantage-wrapper">
              <div class="advantage loading-text"></div>
            </div>
          </div>
        </article>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import Icon from "../Icon.vue";
import defaultButton from "../Form/Buttons/defaultButton.vue";
const userStore = useUserStore();
const subscriptionStore = useSubscriptionStore();

// Utiliser computed pour la réactivité
const plans = computed(() => {
  return subscriptionStore.subscriptions.map((plan) => {
    let advantages: string[] = [];
    if (plan.plan === "basic") {
      advantages = [
        "Accès à la plateforme",
        "Accès aux statistiques",
        "Accès aux commentaires",
        "Accès à la plateforme",
        "Accès aux statistiques",
        "Accès aux commentaires",
      ];
    } else if (plan.plan === "standard") {
      advantages = [
        "Accès à la plateforme",
        "Accès aux statistiques",
        "Accès aux commentaires",
        "Accès aux statistiques",
        "Accès aux commentaires",
        "Accès aux commentaires",
      ];
    } else if (plan.plan === "premium") {
      advantages = [
        "Accès à la plateforme",
        "Accès aux statistiques",
        "Accès aux commentaires",
        "Accès à la plateforme",
        "Accès aux statistiques",
        "Accès aux commentaires",
      ];
    }
    return {
      ...plan,
      advantages,
    };
  });
});

// Fetch les données au montage du composant
onMounted(async () => {
  if (subscriptionStore.subscriptions.length === 0) {
    try {
      await subscriptionStore.fetchAllSubscriptions();
    } catch (error) {}
  }
});
</script>

<style scoped lang="scss">
.load-enter-active,
.load-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.load-enter-from,
.load-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.subscription-plans-module-wrapper {
  display: flex;
  gap: 2rem;
  justify-content: center;

  .plans {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 2rem;
    width: 100%;
    .plan-wrapper {
      padding: 2rem;
      border-radius: 0.5rem;
      border: 1px solid var(--color-border);
      width: calc(33.333% - 2rem);

      .header-wrapper {
        margin-bottom: 1.5rem;

        .name {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .price-wrapper {
          .price {
            font-size: 2.5rem;
            font-weight: 700;

            .frequency {
              font-size: 1rem;
              color: var(--color-text-subtitle);
            }
          }
        }
      }

      .button-wrapper {
        margin: 1.5rem 0;
      }

      .content-wrapper {
        .advantage-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          min-height: 23px;
          width: 100%;

          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            .icon {
              width: 20px;
              height: 20px;
              stroke: var(--color-text-subtitle);
              fill: none;
            }
          }

          .advantage {
            color: var(--color-text-subtitle);
          }
        }
      }

      // &:nth-child(2) {
      //   background-color: var(--color-reverse-bg);
      //   .header-wrapper {
      //     .name {
      //       color: var(--color-reverse-text);
      //     }

      //     .price-wrapper {
      //       .price {
      //         color: var(--color-reverse-text);
      //         .frequency {
      //           color: var(--color-reverse-text);
      //         }
      //       }
      //     }
      //   }
      //   .content-wrapper {
      //     .advantage-wrapper {
      //       .icon-wrapper {
      //         .icon {
      //           stroke: var(--color-reverse-text);
      //         }
      //       }

      //       .advantage {
      //         color: var(--color-reverse-text);
      //       }
      //     }
      //   }
      // }

      &.active {
        background-color: var(--color-primary);
        .header-wrapper {
          .name {
            color: var(--color-text);
          }

          .price-wrapper {
            .price {
              color: var(--color-text);
              .frequency {
                color: var(--color-text);
              }
            }
          }
        }
        .content-wrapper {
          .advantage-wrapper {
            .icon-wrapper {
              .icon {
                stroke: var(--color-text);
              }
            }

            .advantage {
              color: var(--color-text);
            }
          }
        }
      }
    }
  }
}
</style>
