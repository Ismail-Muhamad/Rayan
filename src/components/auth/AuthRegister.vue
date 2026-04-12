<template>
  <div class="register">
    <div class="register__wrapper">
      <h3 class="register__title">{{ t("auth.register.title") }}</h3>
      <p class="register__message">
        {{ t("auth.register.message") }}
      </p>
      <form class="register__form" @submit.prevent="handleSubmit">
        <div class="register__control">
          <BaseInput
            v-model="registerForm.name"
            :label="t('auth.register.form.labels.full_name')"
            :placeholder="t('auth.register.form.placeholders.full_name')"
            :error="isFieldHasError(v$.registerForm.name)"
            :error-text="getFieldErrorMessage(v$.registerForm.name)"
            required
          />
        </div>
        <div class="register__control">
          <BaseInput
            v-model="registerForm.email"
            :label="t('auth.register.form.labels.email')"
            :placeholder="t('auth.register.form.placeholders.email')"
            :error="isFieldHasError(v$.registerForm.email)"
            :error-text="getFieldErrorMessage(v$.registerForm.email)"
            required
          />
        </div>
        <div class="register__control">
          <BaseInput
            v-model="registerForm.whatsapp_number"
            :label="t('auth.register.form.labels.whatsapp_number')"
            :placeholder="t('auth.register.form.placeholders.whatsapp_number')"
            :error="isFieldHasError(v$.registerForm.whatsapp_number)"
            :error-text="getFieldErrorMessage(v$.registerForm.whatsapp_number)"
            required
            type="number"
          />
        </div>
        <div class="register__control">
          <BaseInput
            v-model="registerForm.password"
            :label="t('auth.register.form.labels.password')"
            :placeholder="t('auth.register.form.placeholders.password')"
            :error="isFieldHasError(v$.registerForm.password)"
            :error-text="getFieldErrorMessage(v$.registerForm.password)"
            required
          />
        </div>
        <div class="register__control">
          <BaseStyledSection :label="t('auth.register.form.labels.farms')">
            <!-- Farms -->
            <ValidateEach
              v-for="(farm, farmIndex) in registerForm.farms"
              :key="farmIndex"
              :state="farm"
              :rules="farmRules"
            >
              <template #default="{ v: farmV }">
                <div class="register__farm">
                  <BaseAccordion variant="splitted">
                    <BaseAccordionItem
                      :key="farmIndex"
                      :title="`${t('auth.register.form.labels.farm_info', { number: farmIndex + 1 })}`"
                    >
                      <div class="register__info">
                        <div class="register__control">
                          <BaseInput
                            v-model="farmV.name.$model"
                            :label="t('auth.register.form.labels.farm_name')"
                            :placeholder="
                              t('auth.register.form.placeholders.farm_name')
                            "
                            :error="isFieldHasError(farmV.name)"
                            :error-text="getFieldErrorMessage(farmV.name)"
                            required
                          />
                        </div>
                        <div class="register__control">
                          <BaseInput
                            v-model="farmV.location.$model"
                            :label="
                              t('auth.register.form.labels.farm_location')
                            "
                            :placeholder="
                              t('auth.register.form.placeholders.farm_location')
                            "
                            :error="isFieldHasError(farmV.location)"
                            :error-text="getFieldErrorMessage(farmV.location)"
                            required
                          />
                        </div>
                      </div>

                      <!-- Palms -->
                      <div class="register__palms">
                        <ValidateEach
                          v-for="(palm, palmIndex) in farm.palm_types"
                          :key="palmIndex"
                          :state="palm"
                          :rules="palmTypeRules"
                        >
                          <template #default="{ v: palmV }">
                            <BaseAccordion variant="splitted">
                              <BaseAccordionItem
                                :key="palmIndex"
                                :title="`${t('auth.register.form.labels.palm_type_info', { number: palmIndex + 1 })}`"
                              >
                                <div class="register__palm">
                                  <div class="register__control">
                                    <BaseInput
                                      v-model="palmV.name.$model"
                                      :label="
                                        t(
                                          'auth.register.form.labels.palm_type_name',
                                        )
                                      "
                                      :placeholder="
                                        t(
                                          'auth.register.form.placeholders.palm_type_name',
                                        )
                                      "
                                      :error="isFieldHasError(palmV.name)"
                                      :error-text="
                                        getFieldErrorMessage(palmV.name)
                                      "
                                      required
                                    />
                                  </div>
                                  <div class="register__control">
                                    <BaseInput
                                      v-model="palmV.number_of_trees.$model"
                                      :label="
                                        t(
                                          'auth.register.form.labels.palm_type_number_of_trees',
                                        )
                                      "
                                      :placeholder="
                                        t(
                                          'auth.register.form.placeholders.palm_type_number_of_trees',
                                        )
                                      "
                                      :error="
                                        isFieldHasError(palmV.number_of_trees)
                                      "
                                      :error-text="
                                        getFieldErrorMessage(
                                          palmV.number_of_trees,
                                        )
                                      "
                                      required
                                    />
                                  </div>
                                  <div class="register__control">
                                    <BaseInput
                                      v-model="palmV.palm_age.$model"
                                      :label="
                                        t('auth.register.form.labels.palm_age')
                                      "
                                      :placeholder="
                                        t(
                                          'auth.register.form.placeholders.palm_age',
                                        )
                                      "
                                      :error="isFieldHasError(palmV.palm_age)"
                                      :error-text="
                                        getFieldErrorMessage(palmV.palm_age)
                                      "
                                      required
                                    />
                                  </div>
                                  <div
                                    v-if="
                                      registerForm.farms[farmIndex].palm_types
                                        .length > 1
                                    "
                                    class="register__btns"
                                  >
                                    <div class="register__btn">
                                      <BaseButton
                                        color="red"
                                        variant="outline"
                                        size="sm"
                                        @click="
                                          removePalmType(farmIndex, palmIndex)
                                        "
                                      >
                                        <BaseIcon
                                          name="mdi:minus"
                                          :width="16"
                                          :height="16"
                                        />
                                        {{
                                          t(
                                            "auth.register.actions.remove_palm_type",
                                          )
                                        }}
                                      </BaseButton>
                                    </div>
                                  </div>
                                </div>
                              </BaseAccordionItem>
                            </BaseAccordion>
                          </template>
                        </ValidateEach>
                      </div>
                      <div class="register__btns">
                        <div class="register__btn">
                          <BaseButton
                            variant="outline"
                            size="sm"
                            @click="addPalmType(farmIndex)"
                          >
                            <BaseIcon
                              name="mdi:plus"
                              :width="16"
                              :height="16"
                            />
                            {{ t("auth.register.actions.add_palm_type") }}
                          </BaseButton>
                        </div>
                        <div
                          v-if="registerForm.farms.length > 1"
                          class="register__btn"
                        >
                          <BaseButton
                            color="red"
                            variant="outline"
                            size="sm"
                            @click="removeFarm(farmIndex)"
                          >
                            <BaseIcon
                              name="mdi:minus"
                              :width="16"
                              :height="16"
                            />
                            {{ t("auth.register.actions.remove_farm") }}
                          </BaseButton>
                        </div>
                      </div>
                    </BaseAccordionItem>
                  </BaseAccordion>
                </div>
              </template>
            </ValidateEach>
            <div class="register__btns">
              <div class="register__btn">
                <BaseButton variant="outline" size="sm" @click="addFarm">
                  <BaseIcon name="mdi:plus" :width="16" :height="16" />
                  {{ t("auth.register.actions.add_farm") }}
                </BaseButton>
              </div>
            </div>
          </BaseStyledSection>
        </div>
        <div class="register__control">
          <BaseButton
            :loading="uiFlags.isCreating"
            size="md"
            :disabled="uiFlags.isCreating"
            full-width
            @click="handleSubmit"
          >
            {{ t("auth.register.actions.submit") }}
          </BaseButton>
        </div>
      </form>
      <div class="register__control register__control--link">
        <BaseButton
          color="gray"
          variant="outline"
          size="md"
          full-width
          @click="handleNavigateToLogin"
        >
          {{ t("auth.register.actions.already_have_an_account") }}
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
import {
  required,
  email,
  minLength,
  maxLength,
  numeric,
  integer,
  minValue,
  maxValue,
  helpers,
} from "@vuelidate/validators";
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
const registerForm = ref({
  name: null,
  email: null,
  password: null,
  whatsapp_number: null,
  farms: [
    {
      name: null,
      location: null,
      palm_types: [
        {
          name: null,
          number_of_trees: null,
          palm_age: null,
        },
      ],
    },
  ],
});
// ===== VALIDATION RULES =====
// Rules for individual Palm Type
const palmTypeRules = {
  name: { required, minLength: minLength(2) },
  number_of_trees: { required, integer, minValue: minValue(1) },
  palm_age: { required, integer, minValue: minValue(1) },
};

// Rules for individual Farm
const farmRules = {
  name: { required, minLength: minLength(2) },
  location: { required, minLength: minLength(2) },
  palm_types: {
    required,
    minLength: minLength(1),
    $each: helpers.forEach(palmTypeRules),
  },
};
const rules = {
  registerForm: {
    name: {
      required,
      minLength: minLength(10),
    },
    email: {
      required,
      email,
    },
    whatsapp_number: {
      required,
      numeric,
      minLength: minLength(10),
      maxLength: maxLength(12),
    },
    password: {
      required,
      minLength: minLength(10),
      password_contains_at_least_1_special_character: (value) =>
        /[!@#$%^&*(),.?":{}|<>]/.test(value),
      password_contains_at_least_1_lowercase: (value) => /[a-z]/.test(value),
      password_contains_at_least_1_uppercase: (value) => /[A-Z]/.test(value),
      password_contains_at_least_1_number: (value) => /[0-9]/.test(value),
    },
    farms: {
      required,
      minLength: minLength(1),
      $each: helpers.forEach(farmRules),
    },
  },
};
const v$ = useVuelidate(rules, { registerForm });
// ===== COMPUTED PROPERTIES =====
const { uiFlags, isAuthenticated } = storeToRefs(authStore);
// ===== LIFECYCLE HOOKS =====
// ===== METHODS =====
const handleSubmit = async () => {
  v$.value.$touch();
  if (v$.value.$invalid || uiFlags.isCreating) return;
  const response = await authStore.register(registerForm.value);
};
const handleNavigateToLogin = () => {
  router.push({
    name: "login",
  });
};
const addFarm = () => {
  registerForm.value.farms.push({
    name: null,
    location: null,
    palm_types: [
      {
        name: null,
        number_of_trees: null,
        palm_age: null,
      },
    ],
  });
};
const removeFarm = (farmIndex) => {
  registerForm.value.farms.splice(farmIndex, 1);
};
const addPalmType = (farmIndex) => {
  registerForm.value.farms[farmIndex].palm_types.push({
    name: null,
    number_of_trees: null,
    palm_age: null,
  });
};
const removePalmType = (farmIndex, palmTypeIndex) => {
  registerForm.value.farms[farmIndex].palm_types.splice(palmTypeIndex, 1);
};

// ===== WATCHERS =====
// ===== EXPOSE PUBLIC METHODS =====
</script>

<style scoped lang="scss">
.register {
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
    max-height: 90vh;
    overflow-y: auto;
    @media screen and (max-width: 576px) {
      width: 100%;
      margin-inline: 16px;
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
  &__info,
  &__farm,
  &__palm {
    margin-block: 12px;
  }
  &__palms {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-block-end: 12px;
  }

  &__btns {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
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
