<template>
  <BasePageWrapper titleKey="farms.add.title" subtitleKey="farms.add.subtitle" iconName="solar:buildings-3-outline">
    <div class="farm-builder">
      <section class="farm-builder__hero">
        <div class="farm-builder__hero-copy">
          <span class="farm-builder__eyebrow">{{ t('farms.add.title') }}</span>
          <h2 class="farm-builder__title">
            {{ farmForm.name || t('auth.register.form.labels.farm_name') }}
          </h2>
          <p class="farm-builder__text">{{ t('farms.form.builder_text') }}</p>
        </div>

        <div class="farm-builder__hero-actions">
          <BaseButton
            color="gray"
            variant="outline"
            size="sm"
            @click="router.push({ name: 'farms_list' })"
          >
            <BaseIcon name="solar:arrow-right-outline" :width="18" :height="18" />
            الرجوع لقائمة المزارع
          </BaseButton>
        </div>

        <div class="farm-builder__stats">
          <article class="farm-builder__stat-card">
            <span class="farm-builder__stat-label">{{ t('farms.show.stats.palm_types') }}</span>
            <strong class="farm-builder__stat-value">{{ farmForm.palm_types.length }}</strong>
          </article>
          <article class="farm-builder__stat-card">
            <span class="farm-builder__stat-label">{{ t('farms.show.stats.total_trees') }}</span>
            <strong class="farm-builder__stat-value">{{ totalTrees }}</strong>
          </article>
        </div>
      </section>

      <div class="farm-builder__content">
        <BaseStyledSection :label="t('farms.form.sections.basic_info')"
          :description="t('farms.form.sections.basic_info_text')">
          <div class="farm-builder__grid farm-builder__grid--info">
            <div class="farm-builder__control">
              <BaseInput v-model="farmForm.name" :label="t('auth.register.form.labels.farm_name')"
                :placeholder="t('auth.register.form.placeholders.farm_name')" :error="v$.farmForm.name.$error"
                :error-text="getFieldErrorMessage(v$.farmForm.name)" required />
            </div>
            <div class="farm-builder__control">
              <BaseInput v-model="farmForm.location" :label="t('auth.register.form.labels.farm_location')"
                :placeholder="t('auth.register.form.placeholders.farm_location')" :error="v$.farmForm.location.$error"
                :error-text="getFieldErrorMessage(v$.farmForm.location)" required />
            </div>
          </div>
        </BaseStyledSection>

        <BaseStyledSection :label="t('farms.form.sections.palm_types')"
          :description="t('farms.form.sections.palm_types_text')">
          <div class="farm-builder__stack">
            <ValidateEach v-for="(palm, palmIndex) in farmForm.palm_types" :key="palmIndex" :state="palm"
              :rules="palmTypeRules">
              <template #default="{ v: palmV }">
                <article class="farm-builder__palm-card">
                  <div class="farm-builder__palm-head">
                    <div>
                      <span class="farm-builder__palm-index">#{{ palmIndex + 1 }}</span>
                      <h3 class="farm-builder__palm-title">
                        {{
                          t('auth.register.form.labels.palm_type_info', {
                            number: palmIndex + 1,
                          })
                        }}
                      </h3>
                    </div>

                    <BaseButton v-if="farmForm.palm_types.length > 1" color="red" variant="outline" size="sm"
                      @click="removePalmType(palmIndex)">
                      <BaseIcon name="mdi:minus" :width="16" :height="16" />
                      {{ t('auth.register.actions.remove_palm_type') }}
                    </BaseButton>
                  </div>

                  <div class="farm-builder__grid farm-builder__grid--palm">
                    <div class="farm-builder__control">
                      <BaseInput v-model="palmV.name.$model" :label="t('auth.register.form.labels.palm_type_name')"
                        :placeholder="t('auth.register.form.placeholders.palm_type_name')"
                        :error="isFieldHasError(palmV.name)" :error-text="getFieldErrorMessage(palmV.name)" required />
                    </div>
                    <div class="farm-builder__control">
                      <BaseInput v-model="palmV.number_of_trees.$model"
                        :label="t('auth.register.form.labels.palm_type_number_of_trees')"
                        :placeholder="t('auth.register.form.placeholders.palm_type_number_of_trees')"
                        :error="isFieldHasError(palmV.number_of_trees)"
                        :error-text="getFieldErrorMessage(palmV.number_of_trees)" required />
                    </div>
                    <div class="farm-builder__control">
                      <BaseInput v-model="palmV.palm_age.$model" :label="t('auth.register.form.labels.palm_age')"
                        :placeholder="t('auth.register.form.placeholders.palm_age')"
                        :error="isFieldHasError(palmV.palm_age)" :error-text="getFieldErrorMessage(palmV.palm_age)"
                        required />
                    </div>
                  </div>
                </article>
              </template>
            </ValidateEach>

            <div class="farm-builder__add-row">
              <BaseButton variant="outline" size="sm" @click="addPalmType">
                <BaseIcon name="mdi:plus" :width="16" :height="16" />
                {{ t('auth.register.actions.add_palm_type') }}
              </BaseButton>
            </div>
          </div>
        </BaseStyledSection>

        <div class="farm-builder__actions">
          <BaseButton class="farm-builder__action farm-builder__action--back" color="gray" variant="outline" size="sm"
            @click="router.push({ name: 'farms_list' })">
            {{ t('farms.actions.cancel') }}
          </BaseButton>
          <BaseButton size="sm" :loading="farmsUiFlags.isCreating" @click="submitForm">
            <BaseIcon name="solar:diskette-outline" />
            {{ t('farms.actions.submit') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useVuelidate } from '@vuelidate/core';
import {
  required,
  minLength,
  integer,
  minValue,
  helpers,
} from '@vuelidate/validators';
import { ValidateEach } from '@vuelidate/components';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useFarmsStore } from '@/stores/farms.store';
import { useValidation } from '@/composables/useValidation';

const farmsStore = useFarmsStore();
const router = useRouter();
const { t } = useI18n();
const { getFieldErrorMessage, isFieldHasError } = useValidation();

const farmForm = ref({
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

const palmTypeRules = {
  name: { required, minLength: minLength(2) },
  number_of_trees: { required, integer, minValue: minValue(1) },
  palm_age: { required, integer, minValue: minValue(1) },
};

const rules = {
  farmForm: {
    name: { required, minLength: minLength(2) },
    location: { required, minLength: minLength(2) },
    palm_types: {
      required,
      minLength: minLength(1),
      $each: helpers.forEach(palmTypeRules),
    },
  },
};

const v$ = useVuelidate(rules, { farmForm });
const { uiFlags: farmsUiFlags } = storeToRefs(farmsStore);

const totalTrees = computed(() => {
  return farmForm.value.palm_types.reduce(
    (sum, palm) => sum + Number(palm?.number_of_trees || 0),
    0,
  );
});

const submitForm = async () => {
  v$.value.$validate();
  if (v$.value.$invalid) return;

  const response = await farmsStore.createRecord(farmForm.value);

  if (response?.isCreated) {
    router.push({ name: 'farms_list' });
  }
};

const addPalmType = () => {
  farmForm.value.palm_types.push({
    name: null,
    number_of_trees: null,
    palm_age: null,
  });
};

const removePalmType = (palmIndex) => {
  farmForm.value.palm_types.splice(palmIndex, 1);
};
</script>

<style lang="scss" scoped>
.farm-builder {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding: 24px;
    border-radius: 24px;
    border: 1px solid var(--blue-100);
    background:
      linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(255, 255, 255, 0.98)),
      var(--white);
    box-shadow: 0 20px 40px rgba(30, 64, 175, 0.08);
  }

  &__eyebrow {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 999px;
    background-color: var(--blue-100);
    color: var(--blue-800);
    font-size: 1.25rem;
    font-weight: 700;
    margin-block-end: 12px;
  }

  &__title {
    font-size: clamp(2.4rem, 3vw, 3.3rem);
    font-weight: 800;
    color: var(--gray-950);
    margin-block-end: 8px;
  }

  &__text {
    color: var(--gray-600);
    font-size: 1.5rem;
    line-height: 1.8;
    max-width: 620px;
  }

  &__hero-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(140px, 1fr));
    gap: 12px;
    width: min(100%, 360px);
  }

  &__stat-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border-radius: 18px;
    background-color: var(--white);
    border: 1px solid var(--gray-200);
  }

  &__stat-label {
    color: var(--gray-500);
    font-size: 1.25rem;
    font-weight: 700;
  }

  &__stat-value {
    color: var(--gray-950);
    font-size: 2rem;
    font-weight: 800;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__grid {
    display: grid;
    gap: 16px;

    &--info {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    &--palm {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
  }

  &__palm-card {
    padding: 18px;
    border-radius: 20px;
    border: 1px solid var(--gray-200);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98));
    box-shadow: 0 12px 30px rgba(17, 24, 39, 0.05);
  }

  &__palm-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-block-end: 16px;
  }

  &__palm-index {
    display: inline-flex;
    padding: 4px 10px;
    border-radius: 999px;
    background-color: var(--blue-100);
    color: var(--blue-800);
    font-size: 1.2rem;
    font-weight: 700;
    margin-block-end: 8px;
  }

  &__palm-title {
    font-size: 1.7rem;
    font-weight: 800;
    color: var(--gray-900);
  }

  &__add-row,
  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__add-row {
    justify-content: center;
    padding-top: 4px;
  }

  &__actions {
    justify-content: flex-end;
    padding: 16px 18px;
    border-radius: 20px;
    background-color: var(--white);
    border: 1px solid var(--gray-200);
    position: sticky;
    bottom: 0;
    z-index: 5;
    box-shadow: 0 -8px 30px rgba(17, 24, 39, 0.06);
  }

  &__action {
    &--back {
      margin-inline-end: auto;
    }
  }
}

@media (max-width: 900px) {
  .farm-builder {
    &__hero {
      flex-direction: column;
      align-items: stretch;
    }

    &__hero-actions {
      width: 100%;
      justify-content: flex-start;
    }

    &__stats {
      width: 100%;
    }

    &__actions {
      flex-wrap: wrap;
    }
  }
}
</style>
