<template>
  <BasePageWrapper titleKey="كل الرسأل" subtitleKey="هنا هتلقي كل الرسأل الي اتبعتت من الموقع التعريفي" iconName="solar:letter-bold-duotone">
    <div class="requests-page">
      <div class="requests-page__header">
        <h2 class="requests-page__title">إدارة الرسائل والطلبات</h2>
        <div class="requests-page__actions">
          <BaseSearchInput
            v-model="searchQuery"
            placeholder="ابحث برقم الهاتف أو الاسم..."
            @update:model-value="handleSearch"
          />
        </div>
      </div>

      <div class="requests-page__content">
        <BaseLoader v-if="uiFlags.isFetchingList" />

        <template v-else>
          <div v-if="requestsList.length" class="requests-page__grid">
            <article v-for="item in requestsList" :key="item.id" class="requests-page__card" :class="{ 'requests-page__card--unread': !item.is_read }" @click="openDetailsModal(item)">
              <div class="requests-page__card-header">
                <div class="requests-page__user">
                  <div class="requests-page__avatar">
                    {{ getInitials(item.user_name) }}
                  </div>
                  <div class="requests-page__user-info">
                    <strong class="requests-page__user-name">
                      {{ item.user_name }}
                      <span v-if="!item.is_read" class="requests-page__unread-dot"></span>
                    </strong>
                    <span class="requests-page__date">{{ item.created_at }}</span>
                  </div>
                </div>
                <span class="requests-page__badge">{{ item.service }}</span>
              </div>

              <div class="requests-page__card-body">
                <p class="requests-page__message">{{ truncateText(item.message, 30) }}</p>
              </div>

              <div class="requests-page__card-hint">
                <span v-if="!item.is_read" class="requests-page__status-new">رسالة جديدة</span>
                <span v-else>انقر لعرض التفاصيل</span>
                <BaseIcon name="solar:arrow-right-line-duotone" />
              </div>
            </article>
          </div>

          <div v-else class="requests-page__empty">
            <BaseIcon name="solar:inbox-line-duotone" width="60" height="60" />
            <p>لا توجد رسائل مطابقة لبحثك</p>
          </div>

          <div class="requests-page__pagination" v-if="meta.total > meta.perPage">
            <BasePagination
              :meta="meta"
              @pageChange="handlePageChange"
            />
          </div>
        </template>
      </div>

      <!-- Details Modal -->
      <BaseModal
        ref="detailsModalRef"
        title="تفاصيل الرسالة"
        size="md"
      >
        <template #content>
          <div class="details-modal" v-if="selectedRequest">
            <div class="details-modal__header">
              <div class="details-modal__user">
                <div class="details-modal__avatar">
                  {{ getInitials(selectedRequest.user_name) }}
                </div>
                <div>
                  <h3 class="details-modal__name">{{ selectedRequest.user_name }}</h3>
                  <span class="details-modal__date">{{ selectedRequest.created_at }}</span>
                </div>
              </div>
              <span class="requests-page__badge">{{ selectedRequest.service }}</span>
            </div>

            <div class="details-modal__content">
              <h4 class="details-modal__label">محتوى الرسالة</h4>
              <div class="details-modal__message-box">
                {{ selectedRequest.message || "لا توجد رسالة مرفقة" }}
              </div>
            </div>

            <div class="details-modal__actions-grid">
              <a v-if="selectedRequest.whatsapp_number" :href="`https://wa.me/20${selectedRequest.whatsapp_number}`" target="_blank" class="details-modal__action-btn details-modal__action-btn--whatsapp">
                <BaseIcon name="logos:whatsapp-icon" width="24" height="24" />
                <span>مراسلة واتساب</span>
              </a>
              
              <a v-if="selectedRequest.phone_number" :href="`tel:${selectedRequest.phone_number}`" class="details-modal__action-btn details-modal__action-btn--phone">
                <BaseIcon name="solar:phone-calling-bold-duotone" width="24" height="24" />
                <span>اتصال هاتفي</span>
              </a>

              <button v-if="selectedRequest.phone_number" @click="copyPhone(selectedRequest.phone_number)" class="details-modal__action-btn details-modal__action-btn--copy">
                <BaseIcon name="solar:copy-bold-duotone" width="24" height="24" />
                <span>نسخ الرقم</span>
              </button>

              <button @click="openDeleteConfirm(selectedRequest)" class="details-modal__action-btn details-modal__action-btn--delete">
                <BaseIcon name="solar:trash-bin-trash-bold-duotone" width="24" height="24" />
                <span>حذف الرسالة</span>
              </button>
            </div>
          </div>
        </template>
      </BaseModal>

      <!-- Delete Confirmation Modal -->
      <BaseModal
        ref="deleteModalRef"
        title="تأكيد الحذف"
        size="sm"
      >
        <template #content>
          <div class="delete-confirm">
            <div class="delete-confirm__icon">
              <BaseIcon name="solar:danger-triangle-bold-duotone" width="40" height="40" />
            </div>
            <h3 class="delete-confirm__title">هل أنت متأكد من حذف هذه الرسالة؟</h3>
            <p class="delete-confirm__text">
              لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </p>

            <div class="delete-confirm__actions">
              <BaseButton
                color="gray"
                variant="outline"
                @click="closeDeleteModal"
                :disabled="uiFlags.isDeleting"
              >
                إلغاء
              </BaseButton>
              <BaseButton
                color="red"
                @click="confirmDelete"
                :isLoading="uiFlags.isDeleting"
              >
                تأكيد الحذف
              </BaseButton>
            </div>
          </div>
        </template>
      </BaseModal>
    </div>
  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRequestsStore } from "@/stores/requests.store";
import { debounceHelper } from "@/helpers/debounceHelper";
import BasePagination from "@/components/shared/Table/BasePagination.vue";
import { toast } from "vue-sonner";

const requestsStore = useRequestsStore();
const { t, locale } = useI18n();

const { records, meta, uiFlags } = storeToRefs(requestsStore);

const searchQuery = ref("");
const detailsModalRef = ref(null);
const deleteModalRef = ref(null);
const selectedRequest = ref(null);
const requestToDelete = ref(null);

const requestsList = computed(() => {
  return (records.value || []).map((record) => {
    const isRead = record.is_read === undefined 
      ? true 
      : (record.is_read == 1 || record.is_read === true);

    return {
      ...record,
      // Provide a default of true just in case backend doesn't send it yet,
      // but usually we rely on what the backend sends.
      is_read: isRead,
      created_at: formatDate(record.created_at),
      service: t(`dashboard.SERVICES.${record.service}`),
    };
  });
});

onMounted(() => {
  fetchRequests(1);
});

const fetchRequests = async (page = 1, keyword = undefined) => {
  await requestsStore.fetchRecords({
    page,
    name: keyword || undefined,
  });
};

const handlePageChange = async (page) => {
  await fetchRequests(page, searchQuery.value);
};

const handleSearch = debounceHelper(async (query) => {
  await fetchRequests(1, query);
}, 500);

const truncateText = (text, length) => {
  if (!text) return "لا توجد رسالة مرفقة";
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const openDetailsModal = async (item) => {
  selectedRequest.value = item;
  detailsModalRef.value?.open();
  
  // Mark as read if not already read
  if (!item.is_read) {
    try {
      await requestsStore.updateRecord(item.id, { is_read: 1 }, { withToast: false });
      // Optimistically update the record locally
      const recordInStore = records.value.find(r => r.id === item.id);
      if (recordInStore) recordInStore.is_read = 1;
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  }
};

const openDeleteConfirm = (item) => {
  requestToDelete.value = item;
  deleteModalRef.value?.open();
};

const closeDeleteModal = () => {
  deleteModalRef.value?.close();
  requestToDelete.value = null;
};

const confirmDelete = async () => {
  if (!requestToDelete.value) return;

  const result = await requestsStore.deleteRecord(requestToDelete.value.id, {
    toastKey: "تم حذف الرسالة بنجاح",
  });

  if (result.isDeleted) {
    deleteModalRef.value?.close();
    detailsModalRef.value?.close();
    requestToDelete.value = null;
    selectedRequest.value = null;
  }
};

const copyPhone = async (phone) => {
  try {
    await navigator.clipboard.writeText(phone);
    toast.success("تم نسخ رقم الهاتف بنجاح");
  } catch (err) {
    toast.error("فشل نسخ الرقم");
  }
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat(
    locale.value === "ar" ? "ar-EG" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(new Date(date));
};

const getInitials = (name) => {
  if (!name) return "?";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};
</script>

<style lang="scss" scoped>
.requests-page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #f8fafc;
  min-height: 100%;
  border-radius: 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__title {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__actions {
    width: 100%;
    max-width: 350px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  &__card {
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-radius: 20px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(37, 99, 235, 0.08);
      border-color: var(--blue-300);
      background: #fbfdff;
    }

    &--unread {
      background: #eff6ff;
      border-color: #93c5fd;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.3), inset 0 0 0 1px #bfdbfe;

      .requests-page__message {
        font-weight: 700;
        color: var(--slate-900);
      }
    }
  }

  &__card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__avatar {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 12px;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--blue-700);
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
  }

  &__user-info {
    display: flex;
    flex-direction: column;
  }

  &__user-name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__unread-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 0 3px #fee2e2;
  }

  &__date {
    margin-top: 4px;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--slate-500);
  }

  &__badge {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--blue-700);
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
  }

  &__card-body {
    flex-grow: 1;
    margin-bottom: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #e2e8f0;
  }

  &__message {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.7;
    color: var(--slate-700);
    font-style: italic;
  }

  &__card-hint {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--blue-600);
    padding-top: 12px;
    border-top: 1px solid #f1f5f9;
  }

  &__status-new {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 1.05rem;
    font-weight: 800;
    color: #166534;
    background: #dcfce7;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px 20px;
    color: var(--slate-400);

    p {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 700;
    }
  }

  &__pagination {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }
}

.details-modal {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    margin-bottom: 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__avatar {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--white);
    background: linear-gradient(135deg, var(--blue-600) 0%, var(--blue-400) 100%);
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
  }

  &__name {
    margin: 0 0 4px;
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__date {
    font-size: 1.15rem;
    color: var(--slate-500);
  }

  &__content {
    margin-bottom: 30px;
  }

  &__label {
    margin: 0 0 10px;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--slate-700);
  }

  &__message-box {
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    font-size: 1.35rem;
    line-height: 1.8;
    color: var(--slate-800);
    white-space: pre-wrap;
  }

  &__actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  &__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px;
    border-radius: 14px;
    border: none;
    font-size: 1.25rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;

    &--whatsapp {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #d1fae5;
      &:hover { background: #d1fae5; transform: translateY(-2px); }
    }

    &--phone {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #dbeafe;
      &:hover { background: #dbeafe; transform: translateY(-2px); }
    }

    &--copy {
      background: #f8fafc;
      color: #475569;
      border: 1px solid #e2e8f0;
      &:hover { background: #f1f5f9; transform: translateY(-2px); }
    }

    &--delete {
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fee2e2;
      &:hover { background: #fee2e2; transform: translateY(-2px); }
    }
  }
}

.delete-confirm {
  text-align: center;
  padding: 10px;

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #fef2f2;
    color: #ef4444;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0 0 12px;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__text {
    margin: 0 0 24px;
    font-size: 1.25rem;
    color: var(--slate-600);
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: center;

    > * {
      min-width: 120px;
    }
  }
}

@media (max-width: 768px) {
  .requests-page {
    &__header {
      flex-direction: column;
      align-items: stretch;
    }

    &__actions {
      max-width: none;
    }

    &__grid {
      grid-template-columns: 1fr;
    }
  }

  .details-modal {
    &__actions-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
