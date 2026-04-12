<template>
  <div class="login">
    <div class="login__wrapper">
      <h3 class="login__title">{{ t("auth.login.title") }}</h3>
      <p class="login__message">{{ t("auth.login.message") }}</p>
      <form class="login__form" @submit.prevent="handleSubmit">
        <div class="login__control">
          <BaseInput
            v-model="loginForm.email"
            :label="t('auth.login.form.labels.email')"
            :placeholder="t('auth.login.form.placeholders.email')"
            :error="isFieldHasError(v$.loginForm.email)"
            :error-text="getFieldErrorMessage(v$.loginForm.email)"
            required
          />
        </div>
        <div class="login__control">
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
        <div class="login__control">
          <BaseButton
            :loading="uiFlags.isSubmitting"
            size="md"
            :disabled="uiFlags.isSubmitting"
            full-width
            @click="handleSubmit"
          >
            {{ t("auth.login.actions.submit") }}
          </BaseButton>
        </div>
      </form>
      <div class="login__control login__control--link">
        <BaseButton
          color="gray"
          variant="outline"
          size="md"
          full-width
          @click="navigateToRegister"
        >
          {{ t("auth.login.actions.create_new_account") }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
<script setup>
// ===== IMPORTS =====
// Vue and Libraries
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import { ValidateEach } from "@vuelidate/components";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { mapActions, mapState } from "pinia";
// Stores
import { useAuthStore } from "@/stores/auth.store";
// Composables
import { useValidation } from "@/composables/useValidation";
// Components
// Constants
// Helpers
// ===== PROPS & EMITS =====
// ===== STORE INSTANCES =====
const authStore = useAuthStore();
// ===== COMPOSABLES =====
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const { getFieldErrorMessage, isFieldHasError } = useValidation();
// ===== CONSTANTS =====
// ===== REACTIVE STATE & TEMPLATE REFS =====
const loginForm = ref({
  email: null,
  password: null,
});
// ===== VALIDATION RULES =====
const rules = {
  loginForm: {
    email: {
      required,
      email,
    },
    password: {
      required,
    },
  },
};
const v$ = useVuelidate(rules, { loginForm });
// ===== COMPUTED PROPERTIES =====
const { uiFlags, isAuthenticated } = storeToRefs(authStore);
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const handleSubmit = async () => {
  v$.value.$touch();
  if (v$.value.$invalid || uiFlags.isCreating) return;
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
  router.push({
    name: "register",
  });
};

// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>

<style scoped lang="scss">
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--slate-50);
  background-image: radial-gradient(var(--slate-200) 1px, transparent 0);
  background-size: 25px 25px;
  background-position: -19px -19px;

  &__wrapper {
    max-width: 560px;
    width: 540px;
    background-color: var(--white);
    box-shadow: var(--shadow-xl);
    padding: 24px;
    border-radius: var(--border-radius-xl);
    border: 1px solid var(--slate-100);

    @media screen and (max-width: 576px) {
      width: 100%;
      margin-inline: 24px;
      padding: 24px;
    }
  }

  &__title {
    font-size: 2.4rem;
    font-weight: 700;
    text-align: center;
    color: var(--slate-900);
    margin-block-end: 8px;
  }

  &__message {
    font-size: 1.6rem;
    text-align: center;
    color: var(--slate-500);
    margin-block-end: 32px;
    line-height: 1.5;
  }

  &__control {
    &:not(:last-child) {
      margin-block-end: 20px;
    }

    &--link {
      margin-block-start: 32px;
      padding-block-start: 32px;
      border-top: 1px solid var(--gray-300);
    }
  }

  &__conditions {
    margin-block-start: 12px;
  }

  &__condition {
    display: flex;
    align-items: center;
    gap: 8px;

    &:not(:last-child) {
      margin-block-end: 8px;
    }
  }

  &__text {
    color: var(--red-500);
    font-size: 1.2rem;

    &--checked {
      color: var(--emerald-500);
    }
  }
}
</style>
