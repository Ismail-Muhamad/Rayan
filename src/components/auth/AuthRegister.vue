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
              <BaseInput
                v-model="registerForm.name"
                :label="t('auth.register.form.labels.full_name')"
                :placeholder="t('auth.register.form.placeholders.full_name')"
                :error="isFieldHasError(v$.registerForm.name)"
                :error-text="getFieldErrorMessage(v$.registerForm.name)"
                required
              />
            </div>

            <div class="register-card__grid">
              <div class="register-card__control">
                <BaseInput
                  v-model="registerForm.email"
                  :label="t('auth.register.form.labels.email')"
                  :placeholder="t('auth.register.form.placeholders.email')"
                  :error="isFieldHasError(v$.registerForm.email)"
                  :error-text="getFieldErrorMessage(v$.registerForm.email)"
                  required
                />
              </div>

              <div class="register-card__control">
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
            </div>

            <div class="register-card__control">
              <BaseInput
                v-model="registerForm.password"
                :label="t('auth.register.form.labels.password')"
                :placeholder="t('auth.register.form.placeholders.password')"
                :error="isFieldHasError(v$.registerForm.password)"
                :error-text="getFieldErrorMessage(v$.registerForm.password)"
                required
                type="password"
              />
            </div>

            <div class="register-card__farms-section">
              <div class="farms-section__header">
                <h3 class="farms-section__title">{{ t('auth.register.form.labels.farms') }}</h3>
                <BaseButton
                  class="farms-section__add-btn"
                  variant="outline"
                  size="sm"
                  @click="addFarm"
                >
                  <BaseIcon name="mdi:plus" :width="16" :height="16" />
                  {{ t("auth.register.actions.add_farm") }}
                </BaseButton>
              </div>

              <div class="farms-section__list">
                <ValidateEach
                  v-for="(farm, farmIndex) in registerForm.farms"
                  :key="farmIndex"
                  :state="farm"
                  :rules="farmRules"
                >
                  <template #default="{ v: farmV }">
                    <div class="farm-smart-card">
                      <div class="farm-smart-card__header">
                        <div class="farm-smart-card__title">
                          <span class="farm-smart-card__badge">{{ farmIndex + 1 }}</span>
                          <h4>{{ t('auth.register.form.labels.farm_info', { number: farmIndex + 1 }) }}</h4>
                        </div>
                        <button
                          v-if="registerForm.farms.length > 1"
                          type="button"
                          class="farm-smart-card__remove"
                          @click="removeFarm(farmIndex)"
                          :title="t('auth.register.actions.remove_farm')"
                        >
                          <BaseIcon name="solar:trash-bin-trash-bold" :width="18" :height="18" />
                        </button>
                      </div>

                      <div class="farm-smart-card__body">
                        <div class="register-card__grid">
                          <div class="register-card__control">
                            <BaseInput
                              v-model="farmV.name.$model"
                              :label="t('auth.register.form.labels.farm_name')"
                              :placeholder="t('auth.register.form.placeholders.farm_name')"
                              :error="isFieldHasError(farmV.name)"
                              :error-text="getFieldErrorMessage(farmV.name)"
                              required
                            />
                          </div>

                          <div class="register-card__control">
                            <BaseInput
                              v-model="farmV.location.$model"
                              :label="t('auth.register.form.labels.farm_location')"
                              :placeholder="t('auth.register.form.placeholders.farm_location')"
                              :error="isFieldHasError(farmV.location)"
                              :error-text="getFieldErrorMessage(farmV.location)"
                              required
                            />
                          </div>
                        </div>

                        <div class="palm-types-wrapper">
                          <h5 class="palm-types-wrapper__title">أنواع النخيل بالمزرعة</h5>
                          
                          <div class="palm-types-wrapper__list">
                            <ValidateEach
                              v-for="(palm, palmIndex) in farm.palm_types"
                              :key="palmIndex"
                              :state="palm"
                              :rules="palmTypeRules"
                            >
                              <template #default="{ v: palmV }">
                                <div class="palm-type-row">
                                  <div class="palm-type-row__inputs">
                                    <div class="palm-type-row__control">
                                      <BaseInput
                                        v-model="palmV.name.$model"
                                        :label="t('auth.register.form.labels.palm_type_name')"
                                        :placeholder="t('auth.register.form.placeholders.palm_type_name')"
                                        :error="isFieldHasError(palmV.name)"
                                        :error-text="getFieldErrorMessage(palmV.name)"
                                        required
                                      />
                                    </div>
                                    <div class="palm-type-row__control">
                                      <BaseInput
                                        v-model="palmV.number_of_trees.$model"
                                        :label="t('auth.register.form.labels.palm_type_number_of_trees')"
                                        :placeholder="t('auth.register.form.placeholders.palm_type_number_of_trees')"
                                        :error="isFieldHasError(palmV.number_of_trees)"
                                        :error-text="getFieldErrorMessage(palmV.number_of_trees)"
                                        required
                                      />
                                    </div>
                                    <div class="palm-type-row__control">
                                      <BaseInput
                                        v-model="palmV.palm_age.$model"
                                        :label="t('auth.register.form.labels.palm_age')"
                                        :placeholder="t('auth.register.form.placeholders.palm_age')"
                                        :error="isFieldHasError(palmV.palm_age)"
                                        :error-text="getFieldErrorMessage(palmV.palm_age)"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <button
                                    v-if="registerForm.farms[farmIndex].palm_types.length > 1"
                                    type="button"
                                    class="palm-type-row__remove"
                                    @click="removePalmType(farmIndex, palmIndex)"
                                    :title="t('auth.register.actions.remove_palm_type')"
                                  >
                                    <BaseIcon name="solar:close-circle-bold" :width="20" :height="20" />
                                  </button>
                                </div>
                              </template>
                            </ValidateEach>
                          </div>
                          
                          <button
                            type="button"
                            class="palm-types-wrapper__add-btn"
                            @click="addPalmType(farmIndex)"
                          >
                            <BaseIcon name="mdi:plus-circle" :width="18" :height="18" />
                            <span>إضافة نوع نخيل آخر</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </template>
                </ValidateEach>
              </div>
            </div>

            <div class="register-card__actions">
              <BaseButton
                class="register-card__submit"
                :loading="uiFlags.isCreating"
                size="md"
                :disabled="uiFlags.isCreating"
                full-width
                @click="handleSubmit"
              >
                {{ t("auth.register.actions.submit") }}
              </BaseButton>

              <BaseButton
                class="register-card__secondary"
                color="gray"
                variant="outline"
                size="md"
                full-width
                @click="handleNavigateToLogin"
              >
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
import logoImage from "@/assets/rayan-logo-transparent.png";

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
    max-width: 980px;
    padding: 36px;
    text-align: center;
    color: #fff;
  }

  &__hero-logo {
    width: 100%;
    max-width: 600px;
    margin: 0 auto 24px;

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
      filter:
        drop-shadow(0 32px 64px rgba(0, 0, 0, 0.52))
        drop-shadow(0 16px 34px rgba(0, 0, 0, 0.40))
        drop-shadow(0 6px 14px rgba(255, 255, 255, 0.18));
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
    width: 128px;
    height: 128px;
    margin: 0 auto 24px;
    padding: 0;
    border-radius: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    box-shadow:
      0 30px 60px rgba(37, 99, 235, 0.34),
      0 16px 34px rgba(15, 23, 42, 0.22),
      inset 0 0 0 1px rgba(255, 255, 255, 0.16);

    img {
      width: 128px;
      height: 128px;
      object-fit: cover;
      display: block;
      filter:
        drop-shadow(0 18px 34px rgba(0, 0, 0, 0.34))
        drop-shadow(0 6px 16px rgba(255, 255, 255, 0.18));
      transform: scale(1.08);
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
  background: linear-gradient(
    120deg,
    transparent 20%,
    rgba(255, 255, 255, 0.32) 50%,
    transparent 80%
  );
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

/* --- New Farms UI Styles --- */
.register-card__farms-section {
  margin-top: 36px;
}

.farms-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.farms-section__title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0;
}

.farms-section__add-btn {
  border-radius: 12px;
}

.farms-section__list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Farm Smart Card */
.farm-smart-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(12px);
  overflow: hidden;
  transition: transform 200ms ease, box-shadow 200ms ease;
  animation: slideDownFade 300ms ease-out forwards;
}

.farm-smart-card:hover {
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.farm-smart-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.9), rgba(255, 255, 255, 0.6));
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.farm-smart-card__title {
  display: flex;
  align-items: center;
  gap: 12px;

  h4 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1e40af;
  }
}

.farm-smart-card__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 800;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

.farm-smart-card__remove {
  background: none;
  border: none;
  color: #ef4444;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    transform: scale(1.1);
  }
}

.farm-smart-card__body {
  padding: 24px;
}

/* Palm Types Wrapper */
.palm-types-wrapper {
  margin-top: 16px;
  padding-top: 24px;
  border-top: 1px dashed rgba(203, 213, 225, 0.8);
}

.palm-types-wrapper__title {
  font-size: 1rem;
  font-weight: 700;
  color: #475569;
  margin: 0 0 16px 0;
}

.palm-types-wrapper__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Palm Type Row */
.palm-type-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(248, 250, 252, 0.6);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  animation: slideDownFade 300ms ease-out forwards;
}

.palm-type-row__inputs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  flex-grow: 1;
}

.palm-type-row__control {
  margin-bottom: 0 !important;
}

.palm-type-row__remove {
  background: none;
  border: none;
  color: #94a3b8;
  padding: 4px;
  margin-top: 36px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;

  &:hover {
    color: #ef4444;
    transform: scale(1.1);
  }
}

.palm-types-wrapper__add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 16px;
  margin-top: 12px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 200ms ease;

  &:hover {
    background: rgba(59, 130, 246, 0.08);
  }
}

@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
      width: 104px;
      height: 104px;
      margin-bottom: 22px;
      padding: 0;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.92), rgba(29, 78, 216, 0.92));
      box-shadow:
        0 20px 34px rgba(0, 0, 0, 0.24),
        0 10px 22px rgba(37, 99, 235, 0.20),
        inset 0 0 0 1px rgba(255, 255, 255, 0.16);
    }

    &__logo img {
      width: 104px;
      height: 104px;
      transform: scale(1.06);
      filter:
        drop-shadow(0 12px 22px rgba(0, 0, 0, 0.30))
        drop-shadow(0 4px 10px rgba(255, 255, 255, 0.16));
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

  /* --- Mobile Farms UI Overrides --- */
  .farms-section__title {
    color: #fff;
  }
  
  .farm-smart-card {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  }

  .farm-smart-card__header {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .farm-smart-card__title h4 {
    color: #fff;
  }
  
  .farm-smart-card__badge {
    background: #10b981;
  }

  .palm-types-wrapper__title {
    color: rgba(255, 255, 255, 0.85);
  }

  .palm-types-wrapper {
    border-top-color: rgba(255, 255, 255, 0.12);
  }

  .palm-type-row {
    background: rgba(0, 0, 0, 0.15);
    border-color: rgba(255, 255, 255, 0.1);
    flex-direction: column;
    padding: 20px;
    position: relative;
  }

  .palm-type-row__inputs {
    grid-template-columns: 1fr;
    width: 100%;
    gap: 18px;
  }
  
  .palm-type-row__remove {
    margin-top: 0;
    align-self: flex-end;
    position: absolute;
    top: 12px;
    left: 12px;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(0, 0, 0, 0.2);
    
    &:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #fff;
    }
  }

  .palm-types-wrapper__add-btn {
    color: #60a5fa;
    &:hover {
      background: rgba(96, 165, 250, 0.15);
    }
  }

  .register-card :deep(.base-styled-section),
  .register-card :deep(.base-styled-section__body),
  .register-card :deep(.base-styled-section__content),
  .register-card :deep(.base-styled-section__wrapper),
  .register-card :deep(.accordion),
  .register-card :deep(.accordion-item),
  .register-card :deep(.accordion__body),
  .register-card :deep(.accordion__content),
  .register-card :deep(.accordion-item__body),
  .register-card :deep(.accordion-item__content) {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: rgba(255, 255, 255, 0.18) !important;
    color: #ffffff !important;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.04),
      0 14px 30px rgba(0, 0, 0, 0.08) !important;
    backdrop-filter: blur(18px);
  }

  .register-card :deep(.base-styled-section) {
    border-radius: 22px !important;
    overflow: hidden;
  }

  .register-card :deep(.base-styled-section::before),
  .register-card :deep(.base-styled-section::after),
  .register-card :deep(.accordion::before),
  .register-card :deep(.accordion::after),
  .register-card :deep(.accordion-item::before),
  .register-card :deep(.accordion-item::after) {
    background: transparent !important;
  }

  .register-card :deep(.accordion),
  .register-card :deep(.accordion-item) {
    border-radius: 18px !important;
  }

  .register-card :deep(.accordion-item) {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.055)) !important;
  }

  .register-card :deep(.accordion button),
  .register-card :deep(.accordion-item button),
  .register-card :deep(.accordion__header),
  .register-card :deep(.accordion-item__header) {
    background: transparent !important;
    color: #ffffff !important;
  }

  .register-card :deep(.accordion svg),
  .register-card :deep(.accordion-item svg) {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .register-card__farm,
  .register-card__palms {
    background: transparent !important;
  }

  .register-card :deep(.register-card__secondary.button),
  .register-card :deep(.register-card__ghost.button),
  .register-card :deep(.register-card__danger.button) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    color: #ffffff;
  }

    .register-card__section {
    background: transparent !important;
  }

  .register-card__section :deep(*) {
    background-color: transparent !important;
    box-shadow: none !important;
  }

  .register-card__section :deep([class*="base-styled"]),
  .register-card__section :deep([class*="styled"]),
  .register-card__section :deep([class*="accordion"]),
  .register-card__section :deep([class*="section"]),
  .register-card__section :deep([class*="body"]),
  .register-card__section :deep([class*="content"]),
  .register-card__section :deep([class*="wrapper"]) {
    background:
      linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.10),
        rgba(255, 255, 255, 0.045)
      ) !important;
    border-color: rgba(255, 255, 255, 0.22) !important;
    color: #ffffff !important;
    backdrop-filter: blur(18px) !important;
    -webkit-backdrop-filter: blur(18px) !important;
  }

  .register-card__section :deep([class*="base-styled"]) {
    border-radius: 24px !important;
    overflow: hidden !important;
  }

  .register-card__section :deep([class*="accordion"]) {
    border-radius: 18px !important;
  }

  .register-card__section :deep(button),
  .register-card__section :deep([class*="header"]),
  .register-card__section :deep([class*="title"]) {
    background: transparent !important;
    color: #ffffff !important;
  }

  .register-card__section :deep(label),
  .register-card__section :deep(.form__label),
  .register-card__section :deep([class*="label"]) {
    color: rgba(255, 255, 255, 0.95) !important;
    background: transparent !important;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }

  .register-card__section :deep(input),
  .register-card__section :deep(.form__input) {
    height: 56px !important;
    border-radius: 16px !important;
    background: rgba(255, 255, 255, 0.13) !important;
    border: 1px solid rgba(255, 255, 255, 0.24) !important;
    color: #ffffff !important;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.03),
      0 10px 24px rgba(0, 0, 0, 0.10) !important;
    backdrop-filter: blur(14px) !important;
    -webkit-backdrop-filter: blur(14px) !important;
  }

  .register-card__section :deep(input::placeholder),
  .register-card__section :deep(.form__input::placeholder) {
    color: rgba(255, 255, 255, 0.72) !important;
  }

  .register-card__section :deep(input:focus),
  .register-card__section :deep(input:focus-visible),
  .register-card__section :deep(.form__input:focus),
  .register-card__section :deep(.form__input:focus-visible) {
    background: rgba(255, 255, 255, 0.18) !important;
    border-color: rgba(96, 165, 250, 0.95) !important;
    box-shadow:
      0 0 0 3px rgba(59, 130, 246, 0.28),
      0 12px 26px rgba(0, 0, 0, 0.14) !important;
  }

  .register-card__section :deep(svg) {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .register-card__section :deep(.text-danger),
  .register-card__section :deep([class*="error"]) {
    color: #ff7b7b !important;
    background: transparent !important;
  }
}
</style>