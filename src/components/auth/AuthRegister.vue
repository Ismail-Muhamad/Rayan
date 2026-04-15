<template>
  <section class="register-page">
    <div class="register-shell">
      <div class="register-shell__form-side">
        <div class="register-card">
          <div class="register-card__logo">
            <img :src="logoImage" alt="Rayan Logo" />
          </div>

          <div class="register-card__head">
            <h1 class="register-card__title">{{ t("auth.register.title") }}</h1>
            <p class="register-card__message">
              {{ t("auth.register.message") }}
            </p>
          </div>

          <form class="register-card__form" @submit.prevent="handleSubmit">
            <div class="register-card__control">
              <BaseInput v-model="registerForm.name" :label="t('auth.register.form.labels.full_name')"
                :placeholder="t('auth.register.form.placeholders.full_name')"
                :error="isFieldHasError(v$.registerForm.name)" :error-text="getFieldErrorMessage(v$.registerForm.name)"
                required />
            </div>

            <div class="register-card__grid">
              <div class="register-card__control">
                <BaseInput v-model="registerForm.email" :label="t('auth.register.form.labels.email')"
                  :placeholder="t('auth.register.form.placeholders.email')"
                  :error="isFieldHasError(v$.registerForm.email)"
                  :error-text="getFieldErrorMessage(v$.registerForm.email)" required />
              </div>

              <div class="register-card__control">
                <BaseInput v-model="registerForm.whatsapp_number"
                  :label="t('auth.register.form.labels.whatsapp_number')"
                  :placeholder="t('auth.register.form.placeholders.whatsapp_number')"
                  :error="isFieldHasError(v$.registerForm.whatsapp_number)"
                  :error-text="getFieldErrorMessage(v$.registerForm.whatsapp_number)" required type="number" />
              </div>
            </div>

            <div class="register-card__control">
              <BaseInput v-model="registerForm.password" :label="t('auth.register.form.labels.password')"
                :placeholder="t('auth.register.form.placeholders.password')"
                :error="isFieldHasError(v$.registerForm.password)"
                :error-text="getFieldErrorMessage(v$.registerForm.password)" required type="password" />
            </div>

            <div class="register-card__section">
              <BaseStyledSection :label="t('auth.register.form.labels.farms')">
                <ValidateEach v-for="(farm, farmIndex) in registerForm.farms" :key="farmIndex" :state="farm"
                  :rules="farmRules">
                  <template #default="{ v: farmV }">
                    <div class="register-card__farm">
                      <BaseAccordion variant="splitted">
                        <BaseAccordionItem
                          :title="`${t('auth.register.form.labels.farm_info', { number: farmIndex + 1 })}`">
                          <div class="register-card__control">
                            <BaseInput v-model="farmV.name.$model" :label="t('auth.register.form.labels.farm_name')"
                              :placeholder="t('auth.register.form.placeholders.farm_name')"
                              :error="isFieldHasError(farmV.name)" :error-text="getFieldErrorMessage(farmV.name)"
                              required />
                          </div>

                          <div class="register-card__control">
                            <BaseInput v-model="farmV.location.$model"
                              :label="t('auth.register.form.labels.farm_location')"
                              :placeholder="t('auth.register.form.placeholders.farm_location')"
                              :error="isFieldHasError(farmV.location)"
                              :error-text="getFieldErrorMessage(farmV.location)" required />
                          </div>

                          <div class="register-card__palms">
                            <ValidateEach v-for="(palm, palmIndex) in farm.palm_types" :key="palmIndex" :state="palm"
                              :rules="palmTypeRules">
                              <template #default="{ v: palmV }">
                                <BaseAccordion variant="splitted">
                                  <BaseAccordionItem
                                    :title="`${t('auth.register.form.labels.palm_type_info', { number: palmIndex + 1 })}`">
                                    <div class="register-card__control">
                                      <BaseInput v-model="palmV.name.$model"
                                        :label="t('auth.register.form.labels.palm_type_name')"
                                        :placeholder="t('auth.register.form.placeholders.palm_type_name')"
                                        :error="isFieldHasError(palmV.name)"
                                        :error-text="getFieldErrorMessage(palmV.name)" required />
                                    </div>

                                    <div class="register-card__grid">
                                      <div class="register-card__control">
                                        <BaseInput v-model="palmV.number_of_trees.$model"
                                          :label="t('auth.register.form.labels.palm_type_number_of_trees')"
                                          :placeholder="t('auth.register.form.placeholders.palm_type_number_of_trees')"
                                          :error="isFieldHasError(palmV.number_of_trees)"
                                          :error-text="getFieldErrorMessage(palmV.number_of_trees)" required />
                                      </div>

                                      <div class="register-card__control">
                                        <BaseInput v-model="palmV.palm_age.$model"
                                          :label="t('auth.register.form.labels.palm_age')"
                                          :placeholder="t('auth.register.form.placeholders.palm_age')"
                                          :error="isFieldHasError(palmV.palm_age)"
                                          :error-text="getFieldErrorMessage(palmV.palm_age)" required />
                                      </div>
                                    </div>

                                    <div v-if="registerForm.farms[farmIndex].palm_types.length > 1"
                                      class="register-card__btns">
                                      <BaseButton class="register-card__danger" color="red" variant="outline" size="sm"
                                        @click="removePalmType(farmIndex, palmIndex)">
                                        <BaseIcon name="mdi:minus" :width="16" :height="16" />
                                        {{ t("auth.register.actions.remove_palm_type") }}
                                      </BaseButton>
                                    </div>
                                  </BaseAccordionItem>
                                </BaseAccordion>
                              </template>
                            </ValidateEach>
                          </div>

                          <div class="register-card__btns">
                            <BaseButton class="register-card__ghost" variant="outline" size="sm"
                              @click="addPalmType(farmIndex)">
                              <BaseIcon name="mdi:plus" :width="16" :height="16" />
                              {{ t("auth.register.actions.add_palm_type") }}
                            </BaseButton>

                            <BaseButton v-if="registerForm.farms.length > 1" class="register-card__danger" color="red"
                              variant="outline" size="sm" @click="removeFarm(farmIndex)">
                              <BaseIcon name="mdi:minus" :width="16" :height="16" />
                              {{ t("auth.register.actions.remove_farm") }}
                            </BaseButton>
                          </div>
                        </BaseAccordionItem>
                      </BaseAccordion>
                    </div>
                  </template>
                </ValidateEach>

                <div class="register-card__btns">
                  <BaseButton class="register-card__ghost" variant="outline" size="sm" @click="addFarm">
                    <BaseIcon name="mdi:plus" :width="16" :height="16" />
                    {{ t("auth.register.actions.add_farm") }}
                  </BaseButton>
                </div>
              </BaseStyledSection>
            </div>

            <div class="register-card__actions">
              <BaseButton class="register-card__submit" :loading="uiFlags.isCreating" size="md"
                :disabled="uiFlags.isCreating" full-width @click="handleSubmit">
                {{ t("auth.register.actions.submit") }}
              </BaseButton>

              <BaseButton class="register-card__secondary" color="gray" variant="outline" size="md" full-width
                @click="handleNavigateToLogin">
                {{ t("auth.register.actions.already_have_an_account") }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>

      <div class="register-shell__visual" :style="heroStyle">
        <div class="register-shell__overlay"></div>

        <div class="register-shell__content">
          <div class="register-shell__hero-logo">
            <img :src="logoImage" alt="Rayan Logo" />
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
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
  helpers,
} from "@vuelidate/validators";
import { ValidateEach } from "@vuelidate/components";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth.store";
import { useValidation } from "@/composables/useValidation";
import authBg from "@/assets/auth-bg.png";
import logoImage from "@/assets/22.png";

const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();
const { getFieldErrorMessage, isFieldHasError } = useValidation();

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

const palmTypeRules = {
  name: { required, minLength: minLength(2) },
  number_of_trees: { required, integer, minValue: minValue(1) },
  palm_age: { required, integer, minValue: minValue(1) },
};

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
      minLength: minLength(4),
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
        !!value && /[!@#$%^&*(),.?":{}|<>]/.test(value),
      password_contains_at_least_1_lowercase: (value) =>
        !!value && /[a-z]/.test(value),
      password_contains_at_least_1_uppercase: (value) =>
        !!value && /[A-Z]/.test(value),
      password_contains_at_least_1_number: (value) =>
        !!value && /[0-9]/.test(value),
    },
    farms: {
      required,
      minLength: minLength(1),
      $each: helpers.forEach(farmRules),
    },
  },
};

const v$ = useVuelidate(rules, { registerForm });
const { uiFlags } = storeToRefs(authStore);

const heroStyle = computed(() => ({
  backgroundImage: `url(${authBg})`,
}));

const handleSubmit = async () => {
  v$.value.$touch();
  if (v$.value.$invalid || uiFlags.value.isCreating) return;
  await authStore.register(registerForm.value);
};

const handleNavigateToLogin = () => {
  router.push({ name: "login" });
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
</script>

<style scoped lang="scss">
.register-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 28%),
    radial-gradient(circle at bottom left, rgba(34, 197, 94, 0.1), transparent 24%),
    #eef4ff;
  padding: 24px;
}

.register-shell {
  min-height: calc(100vh - 48px);
  border-radius: 28px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.14);

  &__form-side {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 34px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.97), rgba(244, 248, 255, 0.95));
  }

  &__visual {
    position: relative;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    min-height: 780px;
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
        drop-shadow(0 20px 40px rgba(0, 0, 0, 0.34)) drop-shadow(0 10px 22px rgba(37, 99, 235, 0.18));
    }
  }

  &__subtitle {
    font-size: 1.7rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 6px 18px rgba(0, 0, 0, 0.24);
  }
}

.register-card {
  width: 100%;
  max-width: 680px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-inline-end: 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.24) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.24);
    border-radius: 999px;
  }

  &__logo {
    width: 96px;
    height: 96px;
    margin: 0 auto 24px;
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
        drop-shadow(0 10px 20px rgba(0, 0, 0, 0.18)) drop-shadow(0 4px 10px rgba(37, 99, 235, 0.14));
    }
  }

  &__head {
    text-align: center;
    margin-bottom: 32px;
  }

  &__title {
    font-size: 2.8rem;
    font-weight: 800;
    color: #16306d;
    margin-bottom: 10px;
  }

  &__message {
    font-size: 1.5rem;
    line-height: 1.8;
    color: #5a6b91;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  &__control {
    margin-bottom: 22px;
  }

  &__section,
  &__farm {
    margin-top: 24px;
  }

  &__palms {
    display: grid;
    gap: 14px;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  &__btns {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__actions {
    display: grid;
    gap: 14px;
    margin-top: 30px;
    padding-bottom: 4px;
  }
}

.register-card :deep(.form__label) {
  color: #2551c7;
  background: transparent;
  box-shadow: none;
  padding-inline: 4px;
}

.register-card :deep(.form__input) {
  height: 56px;
  border-radius: 16px;
  border: 1px solid #d7e3ff;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.05);
}

.register-card :deep(.form__input:focus-visible) {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.register-card :deep(.register-card__submit.button) {
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

.register-card :deep(.register-card__submit.button::after) {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg,
      transparent 20%,
      rgba(255, 255, 255, 0.32) 50%,
      transparent 80%);
  transform: translateX(-140%);
  transition: transform 420ms ease;
}

.register-card :deep(.register-card__submit.button:hover) {
  transform: translateY(-3px) scale(1.01);
  box-shadow:
    0 24px 42px rgba(37, 99, 235, 0.34),
    0 0 0 1px rgba(255, 255, 255, 0.08) inset;
  filter: saturate(1.08);
}

.register-card :deep(.register-card__submit.button:hover::after) {
  transform: translateX(140%);
}

.register-card :deep(.register-card__secondary.button),
.register-card :deep(.register-card__ghost.button),
.register-card :deep(.register-card__danger.button) {
  border-radius: 14px;
}

.register-card :deep(.base-styled-section),
.register-card :deep(.accordion),
.register-card :deep(.accordion-item) {
  border-radius: 18px;
}

@media screen and (max-width: 992px) {
  .register-page {
    padding: 0;
    background: #071226;
  }

  .register-shell {
    min-height: 100vh;
    grid-template-columns: 1fr;
    border-radius: 0;
    background: transparent;
    box-shadow: none;

    &__form-side {
      position: absolute;
      inset: 0;
      z-index: 2;
      padding: 18px 16px;
      background: transparent;
      align-items: flex-start;
      justify-content: center;
      overflow: hidden;
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

  .register-card {
    max-width: 100%;
    max-height: calc(100vh - 36px);
    overflow-y: auto;
    padding: 22px 16px 18px;
    border-radius: 28px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(22px);
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.22);

    &__logo {
      width: 84px;
      height: 84px;
      margin-bottom: 22px;
      background: rgba(255, 255, 255, 0.16);
      box-shadow:
        0 18px 30px rgba(0, 0, 0, 0.22),
        0 8px 18px rgba(37, 99, 235, 0.16),
        inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    }

    &__logo img {
      filter:
        drop-shadow(0 10px 18px rgba(0, 0, 0, 0.24)) drop-shadow(0 4px 10px rgba(37, 99, 235, 0.12));
    }

    &__head {
      margin-bottom: 24px;
    }

    &__title,
    &__message {
      color: #ffffff;
    }

    &__grid {
      grid-template-columns: 1fr;
      gap: 0;
    }

    &__control {
      margin-bottom: 18px;
    }

    &__actions {
      margin-top: 24px;
    }
  }

  .register-card :deep(.form__label) {
    background: transparent;
    color: #ffffff;
    box-shadow: none;
    padding-inline: 2px;
  }

  .register-card :deep(.form__input) {
    background: rgba(255, 255, 255, 0.14);
    border-color: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    backdrop-filter: blur(12px);
  }

  .register-card :deep(.form__input::placeholder) {
    color: rgba(255, 255, 255, 0.72);
  }

  .register-card :deep(.base-styled-section),
  .register-card :deep(.accordion),
  .register-card :deep(.accordion-item),
  .register-card :deep(.register-card__secondary.button),
  .register-card :deep(.register-card__ghost.button),
  .register-card :deep(.register-card__danger.button) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.16);
    color: #ffffff;
  }
}
</style>