<template>
  <section class="auth-page">
    <div class="auth-shell auth-shell--login">
      <div class="auth-shell__form-side">
        <div class="auth-card">
          <div class="auth-card__logo">
            <img :src="logoImage" alt="Rayan Logo" />
          </div>

          <div class="auth-card__head">
            <h1 class="auth-card__title">{{ t("auth.login.title") }}</h1>
            <p class="auth-card__message">{{ t("auth.login.message") }}</p>
          </div>


          
          <form class="auth-card__form" @submit.prevent="handleSubmit">
            <div class="auth-card__control">
              <BaseInput
                v-model="loginForm.email"
                :label="t('auth.login.form.labels.email')"
                :placeholder="t('auth.login.form.placeholders.email')"
                :error="isFieldHasError(v$.loginForm.email)"
                :error-text="getFieldErrorMessage(v$.loginForm.email)"
                required
              />
            </div>

            <div class="auth-card__control">
              <BaseInput
                v-model="loginForm.password"
                :label="t('auth.login.form.labels.password')"
                :placeholder="t('auth.login.form.placeholders.password')"
                type="password"
                :error="isFieldHasError(v$.loginForm.password)"
                :error-text="getFieldErrorMessage(v$.loginForm.password)"
                required
              />
            </div>

            <div class="auth-card__actions">
              <BaseButton
                class="auth-card__submit"
                :loading="uiFlags.isSubmitting"
                size="md"
                :disabled="uiFlags.isSubmitting"
                full-width
                @click="handleSubmit"
              >
                {{ t("auth.login.actions.submit") }}
              </BaseButton>

              <BaseButton
                class="auth-card__secondary"
                color="gray"
                variant="outline"
                size="md"
                full-width
                @click="navigateToRegister"
              >
                {{ t("auth.login.actions.create_new_account") }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>

      <div class="auth-shell__visual" :style="heroStyle">
        <div class="auth-shell__overlay"></div>

        <div class="auth-shell__content">
          <div class="auth-shell__hero-logo">
            <img :src="logoImage" alt="Rayan Logo" />
          </div>

          <p class="auth-shell__subtitle">
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useValidation } from "@/composables/useValidation";
import authBg from "@/assets/auth-bg.png";
import logoImage from "@/assets/22.png";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { getFieldErrorMessage, isFieldHasError } = useValidation();

const loginForm = ref({
  email: null,
  password: null,
});

const rules = {
  loginForm: {
    email: { required, email },
    password: { required },
  },
};

const v$ = useVuelidate(rules, { loginForm });
const { uiFlags, isAuthenticated } = storeToRefs(authStore);

const heroStyle = computed(() => ({
  backgroundImage: `url(${authBg})`,
}));

const handleSubmit = async () => {
  v$.value.$touch();
  if (v$.value.$invalid || uiFlags.value.isCreating) return;

  await authStore.login(loginForm.value);

  if (isAuthenticated.value) {
    let defaultRedirect = "/dashboard";

    if (authStore.userData?.role === "farm_owner") {
      defaultRedirect = "/farms";
    }

    const redirect = route.query.redirect || defaultRedirect;
    router.push(redirect);
  }
};

const navigateToRegister = () => {
  router.push({ name: "register" });
};
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 28%),
    radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.1), transparent 24%),
    #eef4ff;
  padding: 24px;
}

.auth-shell {
  min-height: calc(100vh - 48px);
  border-radius: 28px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.14);

  &__form-side {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 255, 0.95));
  }

  &__visual {
    position: relative;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    min-height: 720px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(7, 18, 43, 0.12) 0%, rgba(7, 18, 43, 0.32) 100%),
      linear-gradient(135deg, rgba(17, 24, 39, 0.08), rgba(29, 78, 216, 0.12));
  }

  &__content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 520px;
    padding: 36px;
    text-align: center;
    color: #fff;
  }

  &__hero-logo {
    width: 100%;
    max-width: 340px;
    margin: 0 auto 18px;

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
      filter:
        drop-shadow(0 20px 40px rgba(0, 0, 0, 0.418))
        drop-shadow(0 10px 22px rgba(0, 0, 0, 0.308));
    }
  }

  &__subtitle {
    font-size: 1.7rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
  }
}

.auth-card {
  width: 100%;
  max-width: 520px;

  &__logo {
    width: 96px;
    height: 96px;
    margin: 0 auto 18px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #ffffff, #eef4ff);
    box-shadow:
      0 20px 40px rgba(15, 23, 42, 0.12),
      0 10px 24px rgba(37, 99, 235, 0.12),
      inset 0 0 0 1px rgba(37, 99, 235, 0.08);

    img {
      width: 72px;
      height: 72px;
      object-fit: contain;
      display: block;
      filter:
        drop-shadow(0 10px 20px rgba(0, 0, 0, 0.18))
        drop-shadow(0 4px 10px rgba(37, 99, 235, 0.14));
    }
  }

  &__head {
    text-align: center;
    margin-bottom: 28px;
  }

  &__title {
    font-size: 3rem;
    font-weight: 800;
    color: #16306d;
    margin-bottom: 8px;
  }

  &__message {
    font-size: 1.55rem;
    line-height: 1.8;
    color: #5a6b91;
  }

  &__control {
    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__actions {
    display: grid;
    gap: 14px;
    margin-top: 28px;
  }
}

.auth-card :deep(.form__label) {
  color: #2551c7;
  background: #fff;
}

.auth-card :deep(.form__input) {
  height: 56px;
  border-radius: 16px;
  border: 1px solid #d7e3ff;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.05);
}

.auth-card :deep(.form__input:focus-visible) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.auth-card :deep(.auth-card__submit.button) {
  min-height: 56px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow:
    0 18px 30px rgba(37, 99, 235, 0.24),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    filter 220ms ease;
  position: relative;
  overflow: hidden;
}

.auth-card :deep(.auth-card__submit.button::after) {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 20%,
    rgba(255, 255, 255, 0.32) 50%,
    transparent 80%
  );
  transform: translateX(-140%);
  transition: transform 420ms ease;
}

.auth-card :deep(.auth-card__submit.button:hover) {
  transform: translateY(-3px) scale(1.01);
  box-shadow:
    0 24px 42px rgba(37, 99, 235, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  filter: saturate(1.08);
}

.auth-card :deep(.auth-card__submit.button:hover::after) {
  transform: translateX(140%);
}

.auth-card :deep(.auth-card__secondary.button) {
  min-height: 56px;
  border-radius: 16px;
  border: 1px solid #d6e3ff;
  background: rgba(255, 255, 255, 0.92);
  transition: transform 220ms ease, border-color 220ms ease, background-color 220ms ease;
}

.auth-card :deep(.auth-card__secondary.button:hover) {
  transform: translateY(-2px);
  border-color: #2563eb;
  background: #ffffff;
}

@media screen and (max-width: 992px) {
  .auth-page {
    padding: 0;
    background: #071226;
  }

  .auth-shell {
    min-height: 100vh;
    grid-template-columns: 1fr;
    border-radius: 0;
    background: transparent;
    box-shadow: none;

    &__form-side {
      position: absolute;
      inset: 0;
      z-index: 2;
      padding: 24px 18px;
      background: transparent;
      align-items: center;
    }

    &__visual {
      min-height: 100vh;
      align-items: center;
      justify-content: center;
    }

    &__overlay {
      background:
        linear-gradient(180deg, rgba(4, 12, 32, 0.34), rgba(4, 12, 32, 0.62)),
        linear-gradient(135deg, rgba(29, 78, 216, 0.18), rgba(16, 185, 129, 0.1));
    }

    &__content {
      display: none;
    }
  }

  .auth-card {
    max-width: 100%;
    padding: 22px 18px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(22px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.22);

    &__logo {
      width: 84px;
      height: 84px;
      background: rgba(255, 255, 255, 0.16);
      box-shadow:
        0 18px 30px rgba(0, 0, 0, 0.22),
        0 8px 18px rgba(37, 99, 235, 0.16),
        inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    }

    &__logo img {
      filter:
        drop-shadow(0 10px 18px rgba(0, 0, 0, 0.24))
        drop-shadow(0 4px 10px rgba(37, 99, 235, 0.12));
    }

    &__title,
    &__message {
      color: #ffffff;
    }
  }

  .auth-card :deep(.form__label) {
    background: rgba(8, 20, 47, 0.72);
    color: #ffffff;
  }

  .auth-card :deep(.form__input) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    backdrop-filter: blur(12px);
  }

  .auth-card :deep(.form__input::placeholder) {
    color: rgba(255, 255, 255, 0.72);
  }

  .auth-card :deep(.auth-card__secondary.button) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.16);
    color: #ffffff;
  }
}
</style>