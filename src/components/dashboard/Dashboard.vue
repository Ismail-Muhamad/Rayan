<template>
  <BasePageWrapper titleKey="dashboard.title" subtitleKey="dashboard.subtitle" iconName="solar:clipboard-list-outline">
    <div class="dashboard">
      <section class="dashboard__hero">
        <div class="dashboard__hero-content">
          <p class="dashboard__eyebrow">
            {{ t("dashboard.title") }}
          </p>

          <h2 class="dashboard__hero-title">
            لوحة المتابعة الرئيسية
          </h2>

          <p class="dashboard__hero-text">
            مرحباً بك في لوحة التحكم، هنا يمكنك متابعة أحدث رسائل العملاء والطلبات المعلقة التي تحتاج إلى تفعيل.
          </p>
        </div>

        <div class="dashboard__hero-stats">
          <div class="dashboard__stat-card">
            <div class="dashboard__stat-icon">
              <BaseIcon name="solar:users-group-two-rounded-bold-duotone" width="28" height="28" />
            </div>
            <div class="dashboard__stat-info">
              <span class="dashboard__stat-label">طلبات معلّقة</span>
              <strong class="dashboard__stat-value">
                {{ pendingUsersList.length }}
              </strong>
            </div>
          </div>

          <div class="dashboard__stat-card">
            <div class="dashboard__stat-icon">
              <BaseIcon name="solar:letter-bold-duotone" width="28" height="28" />
            </div>
            <div class="dashboard__stat-info">
              <span class="dashboard__stat-label">إجمالي الرسائل</span>
              <strong class="dashboard__stat-value">
                {{ requestsMeta?.total || 0 }}
              </strong>
            </div>
          </div>

          <div class="dashboard__stat-card dashboard__stat-card--highlight">
            <div class="dashboard__stat-icon dashboard__stat-icon--red">
              <BaseIcon name="solar:bell-bing-bold-duotone" width="28" height="28" />
            </div>
            <div class="dashboard__stat-info">
              <span class="dashboard__stat-label">رسائل جديدة</span>
              <strong class="dashboard__stat-value">
                {{ unreadRequestsCount }}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Messages Section -->
      <section class="dashboard__cards-shell">
        <div class="dashboard__section-head">
          <div class="dashboard__section-title-wrapper">
            <h3 class="dashboard__section-title">أحدث الرسائل</h3>
            <span class="dashboard__section-count">
              {{ recentRequests.length }} من {{ requestsMeta?.total || 0 }}
            </span>
          </div>
          <BaseButton color="blue" variant="outline" @click="$router.push({ name: 'requests_index' })">
            عرض جميع الرسائل
          </BaseButton>
        </div>

        <div v-if="recentRequests.length" class="dashboard__messages-grid">
          <article v-for="item in recentRequests" :key="item.id" class="dashboard__message-card" :class="{ 'dashboard__message-card--unread': !item.is_read }" @click="openDetailsModal(item)">
            <div class="dashboard__message-header">
              <div class="dashboard__user">
                <div class="dashboard__avatar">
                  {{ getInitials(item.user_name) }}
                </div>
                <div class="dashboard__user-info">
                  <strong class="dashboard__user-name">
                    {{ item.user_name }}
                    <span v-if="!item.is_read" class="dashboard__unread-dot"></span>
                  </strong>
                  <span class="dashboard__card-date">{{ item.created_at }}</span>
                </div>
              </div>
              <span class="dashboard__badge">{{ item.service }}</span>
            </div>

            <div class="dashboard__message-body">
              <p class="dashboard__message-text">{{ truncateText(item.message, 30) }}</p>
            </div>

            <div class="dashboard__card-hint">
              <span v-if="!item.is_read" class="dashboard__status-new">رسالة جديدة</span>
              <span v-else>انقر لعرض التفاصيل</span>
              <BaseIcon name="solar:arrow-right-line-duotone" />
            </div>
          </article>
        </div>
        <div v-else class="dashboard__empty">
          <BaseIcon name="solar:inbox-line-duotone" width="60" height="60" />
          <p>لا توجد رسائل حالياً</p>
        </div>
      </section>

      <!-- Pending Users Section -->
      <section class="dashboard__cards-shell">
        <div class="dashboard__section-head">
          <div class="dashboard__section-title-wrapper">
            <h3 class="dashboard__section-title">طلبات التسجيل المعلقة</h3>
            <span class="dashboard__section-count">
              {{ pendingUsersList.length }}
            </span>
          </div>
        </div>

        <div v-if="pendingUsersList.length" class="dashboard__cards">
          <article v-for="item in pendingUsersList" :key="item.id" class="dashboard__request-card">
            <div class="dashboard__request-top">
              <div class="dashboard__user">
                <div class="dashboard__avatar dashboard__avatar--pending">
                  {{ getInitials(item.name) }}
                </div>

                <div class="dashboard__user-info">
                  <strong class="dashboard__user-name">
                    {{ item.name }}
                  </strong>
                  <span class="dashboard__card-date">
                    {{ item.created_at }}
                  </span>
                </div>
              </div>

              <span class="dashboard__status-badge">
                في انتظار التفعيل
              </span>
            </div>

            <div class="dashboard__request-grid">
              <div class="dashboard__info-box">
                <span class="dashboard__info-label">البريد الإلكتروني</span>
                <span class="dashboard__email">{{ item.email || "-" }}</span>
              </div>

              <div class="dashboard__info-box">
                <span class="dashboard__info-label">واتساب</span>
                <a class="dashboard__link" :href="`https://wa.me/20${item.whatsapp_number}`" target="_blank"
                  rel="noopener">
                  {{ item.whatsapp_number || "-" }}
                </a>
              </div>
            </div>

            <div class="dashboard__farms-box">
              <div class="dashboard__info-head">
                <span class="dashboard__info-label">المزارع المسجلة</span>
                <span class="dashboard__mini-badge">
                  {{ item.farms.length }}
                </span>
              </div>

              <div v-if="item.farms.length" class="dashboard__farms-list">
                <div v-for="farm in item.farms" :key="farm.id" class="dashboard__farm-card">
                  <div class="dashboard__farm-head">
                    <div>
                      <strong class="dashboard__farm-title">
                        {{ farm.name || "-" }}
                      </strong>
                      <p class="dashboard__farm-location">
                        {{ farm.location || "-" }}
                      </p>
                    </div>

                    <span class="dashboard__mini-badge">
                      {{ farm.palm_types?.length || 0 }} نوع
                    </span>
                  </div>

                  <div v-if="farm.palm_types && farm.palm_types.length" class="dashboard__palm-types">
                    <div v-for="(palm, index) in farm.palm_types" :key="`${farm.id}-${index}`"
                      class="dashboard__palm-card">
                      <span class="dashboard__palm-name">
                        {{ palm.name || "-" }}
                      </span>

                      <div class="dashboard__palm-meta">
                        <span>الأشجار: {{ palm.number_of_trees || 0 }}</span>
                        <span>العمر: {{ palm.palm_age || "-" }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-else class="dashboard__empty-inline">
                    لا توجد أنواع نخيل
                  </div>
                </div>
              </div>

              <div v-else class="dashboard__empty-inline">
                لا توجد مزارع مرتبطة بهذا العميل حالياً
              </div>
            </div>

            <div class="dashboard__card-actions">
              <BaseButton size="sm" color="green" @click="openStatusModal(item, 'active')">
                قبول الحساب
              </BaseButton>

              <BaseButton size="sm" color="red" variant="outline" @click="openStatusModal(item, 'rejected')">
                رفض الحساب
              </BaseButton>
            </div>
          </article>
        </div>

        <div v-else class="dashboard__empty">
          لا توجد طلبات تسجيل معلقة حالياً
        </div>
      </section>

      <UsersChangeStatusModal ref="changeStatusModalRef" @success="handleStatusChanged" />

      <!-- Request Details Modal -->
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
              <span class="dashboard__badge">{{ selectedRequest.service }}</span>
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
                :disabled="requestsUiFlags.isDeleting"
              >
                إلغاء
              </BaseButton>
              <BaseButton
                color="red"
                @click="confirmDelete"
                :isLoading="requestsUiFlags.isDeleting"
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
import FarmsServices from "@/services/farms.services";
import { useUsersStore } from "@/stores/users.store";
import { useRequestsStore } from "@/stores/requests.store";
import UsersChangeStatusModal from "@/components/users/UsersChangeStatusModal.vue";

import { toast } from "vue-sonner";
import WhatsAppTemplatesServices from "@/services/whatsappTemplates.services";

const usersStore = useUsersStore();
const requestsStore = useRequestsStore();

const { t, locale } = useI18n();

const changeStatusModalRef = ref(null);
const pendingUsersFarmsMap = ref({});
const isFetchingPendingUsersFarms = ref(false);

const {
  records: requestsRecords,
  meta: requestsMeta,
  uiFlags: requestsUiFlags,
} = storeToRefs(requestsStore);

const { records: usersRecords } = storeToRefs(usersStore);

const detailsModalRef = ref(null);
const deleteModalRef = ref(null);
const selectedRequest = ref(null);
const requestToDelete = ref(null);

const recentRequests = computed(() => {
  return (requestsRecords.value || []).slice(0, 5).map((record) => {
    // If undefined, default to true (read). Otherwise, check if it equals 1 or true.
    const isRead = record.is_read === undefined 
      ? true 
      : (record.is_read == 1 || record.is_read === true);
      
    return {
      ...record,
      is_read: isRead,
      created_at: formatDate(record.created_at),
      service: t(`dashboard.SERVICES.${record.service}`),
    };
  });
});

const unreadRequestsCount = computed(() => {
  // If the backend doesn't send unread_count, we calculate from current records
  // Ideally, backend should pass meta.unread_count for the true total.
  if (requestsMeta.value?.unread_count !== undefined) {
    return requestsMeta.value.unread_count;
  }
  return (requestsRecords.value || []).filter((r) => r.is_read == 0 || r.is_read === false).length;
});

const pendingUsersList = computed(() => {
  const users = usersRecords.value || [];

  return users
    .filter((user) => user.role === "farm_owner" && user.status === "pending")
    .map((user) => {
      const userFarms = pendingUsersFarmsMap.value[user.id] || [];

      return {
        ...user,
        created_at: formatDate(user.created_at),
        farms: userFarms,
        farms_count: userFarms.length,
      };
    });
});

onMounted(async () => {
  await refetchDashboardData();
});

const fetchRequests = async () => {
  await requestsStore.fetchRecords({
    page: 1,
    per_page: 5,
  });
};

const fetchPendingUsers = async () => {
  await usersStore.fetchRecords({
    page: 1,
    role: "farm_owner",
    status: "pending",
  });
};

const fetchFarmsForPendingUsers = async () => {
  const users = usersRecords.value || [];

  if (!users.length) {
    pendingUsersFarmsMap.value = {};
    return;
  }

  isFetchingPendingUsersFarms.value = true;

  try {
    const results = await Promise.all(
      users.map(async (user) => {
        try {
          const response = await FarmsServices.get({
            owner_id: user.id,
            per_page: 100,
          });

          return {
            userId: user.id,
            farms: response?.data?.data || response?.data || [],
          };
        } catch (error) {
          return {
            userId: user.id,
            farms: [],
          };
        }
      }),
    );

    pendingUsersFarmsMap.value = results.reduce((acc, item) => {
      acc[item.userId] = item.farms;
      return acc;
    }, {});
  } finally {
    isFetchingPendingUsersFarms.value = false;
  }
};

const refetchDashboardData = async () => {
  await fetchRequests();
  await fetchPendingUsers();
  await fetchFarmsForPendingUsers();
};

const selectedStatusUser = ref(null);
const selectedStatusAction = ref(null);

const openStatusModal = (user, action) => {
  selectedStatusUser.value = user;
  selectedStatusAction.value = action;

  changeStatusModalRef.value.openModal(user, action);
};

// Requests UI actions
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
      const recordInStore = requestsRecords.value.find(r => r.id === item.id);
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
    await refetchDashboardData();
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

const getRequestCustomerName = (request) => {
  return (
    request?.name ||
    request?.customer_name ||
    request?.user?.name ||
    request?.farm_owner?.name ||
    "عميلنا العزيز"
  );
};

const getRequestWhatsAppNumber = (request) => {
  return (
    request?.whatsapp_number ||
    request?.whatsapp ||
    request?.phone_number ||
    request?.phone ||
    request?.mobile ||
    request?.user?.whatsapp_number ||
    request?.user?.phone ||
    ""
  );
};

const sendAccountApprovedWhatsAppMessage = async (request) => {
  const whatsappNumber = getRequestWhatsAppNumber(request);

  if (!whatsappNumber) {
    toast.warning("تم قبول الحساب، لكن لا يوجد رقم واتساب للعميل.");
    return;
  }

  await WhatsAppTemplatesServices.sendAccountApproved({
    to: whatsappNumber,
    customer_name: getRequestCustomerName(request),
  });
};

const handleStatusChanged = async () => {
  const user = selectedStatusUser.value;
  const action = selectedStatusAction.value;

  if (user && action === "active") {
    try {
      await sendAccountApprovedWhatsAppMessage(user);
      toast.success("تم قبول الحساب وإرسال رسالة واتساب للعميل.");
    } catch (error) {
      console.error("Failed to send account approved WhatsApp message:", error);
      toast.warning("تم قبول الحساب، لكن فشل إرسال رسالة الواتساب.");
    }
  }

  selectedStatusUser.value = null;
  selectedStatusAction.value = null;

  await refetchDashboardData();
};
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px;
  background: transparent;

  &__hero {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    padding: 32px 40px;
    border-radius: 28px;
    background: linear-gradient(135deg, var(--blue-800) 0%, var(--blue-500) 100%);
    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.2);

    &::before {
      content: "";
      position: absolute;
      top: -100px;
      right: -100px;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%);
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -100px;
      left: -80px;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%);
    }
  }

  &__hero-content,
  &__hero-stats {
    position: relative;
    z-index: 1;
  }

  &__hero-content {
    max-width: 600px;
  }

  &__eyebrow {
    margin: 0 0 10px;
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.85);
  }

  &__hero-title {
    margin: 0 0 16px;
    font-size: clamp(2.4rem, 3vw, 3.2rem);
    font-weight: 800;
    line-height: 1.2;
    color: var(--white);
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  &__hero-text {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.9);
  }

  &__hero-stats {
    display: flex;
    gap: 16px;
  }

  &__stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 180px;
    padding: 20px 24px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(12px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0,0,0,0.05);
    transition: transform 0.3s ease, background 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      background: rgba(255, 255, 255, 0.2);
    }

    &--highlight {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  }

  &__stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;

    &--red {
      background: rgba(239, 68, 68, 0.8);
      color: #fff;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  }

  &__stat-info {
    display: flex;
    flex-direction: column;
  }

  &__stat-label {
    margin-bottom: 4px;
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  &__stat-value {
    font-size: 2.2rem;
    font-weight: 800;
    color: var(--white);
    line-height: 1;
  }

  &__cards-shell {
    padding: 24px;
    border-radius: 24px;
    border: 1px solid rgba(59, 130, 246, 0.1);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__section-title-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__section-title {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--blue-900);
  }

  &__section-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 12px;
    border-radius: 999px;
    background: var(--blue-50);
    border: 1px solid var(--blue-100);
    color: var(--blue-700);
    font-size: 1.1rem;
    font-weight: 800;
  }

  &__messages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  &__message-card {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-radius: 20px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(37, 99, 235, 0.08);
      border-color: var(--blue-300);
      background: #fbfdff;
    }

    &--unread {
      background: #eff6ff;
      border-color: #93c5fd;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.3), inset 0 0 0 1px #bfdbfe;

      .dashboard__message-text {
        font-weight: 700;
        color: var(--slate-900);
      }
    }
  }

  &__message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__unread-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    box-shadow: 0 0 0 3px #fee2e2;
  }

  &__message-body {
    flex-grow: 1;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #e2e8f0;
  }

  &__message-text {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.6;
    color: var(--slate-700);
    font-style: italic;
  }

  &__card-hint {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.1rem;
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

  &__cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
  }

  &__request-card {
    padding: 24px;
    border-radius: 24px;
    border: 1px solid rgba(59, 130, 246, 0.1);
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
    display: flex;
    flex-direction: column;
    gap: 20px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 16px 32px rgba(37, 99, 235, 0.08);
      border-color: var(--blue-200);
    }
  }

  &__request-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 14px;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--blue-700);
    background: var(--blue-50);
    border: 1px solid var(--blue-100);

    &--pending {
      color: #b54708;
      background: #fff7ed;
      border-color: #fed7aa;
    }
  }

  &__user-info {
    display: flex;
    flex-direction: column;
  }

  &__user-name {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1.4rem;
    font-weight: 800;
    color: var(--slate-900);
  }

  &__card-date {
    margin-top: 2px;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--slate-500);
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--blue-600);
    transition: 0.2s ease;

    &:hover {
      color: var(--blue-800);
    }

    &--whatsapp {
      color: #16a34a;
      &:hover { color: #15803d; }
    }
  }

  &__email {
    font-size: 1.2rem;
    color: var(--slate-700);
    word-break: break-word;
  }

  &__badge,
  &__status-badge,
  &__mini-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 700;
    white-space: nowrap;
  }

  &__badge,
  &__mini-badge {
    color: var(--blue-700);
    background: var(--blue-50);
  }

  &__status-badge {
    color: #b54708;
    background: #fff7ed;
  }

  &__actions,
  &__card-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: auto;
  }

  &__request-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  &__info-box,
  &__farms-box {
    padding: 16px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.08);
  }

  &__info-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__info-label {
    display: block;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--slate-500);
    margin-bottom: 4px;
  }

  &__farms-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__farm-card {
    padding: 14px;
    border-radius: 12px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
  }

  &__farm-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  &__farm-title {
    display: block;
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--slate-800);
  }

  &__farm-location {
    margin: 4px 0 0;
    font-size: 1.05rem;
    color: var(--slate-500);
  }

  &__palm-types {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__palm-card {
    padding: 10px;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
  }

  &__palm-name {
    display: block;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--slate-700);
    margin-bottom: 4px;
  }

  &__palm-meta {
    display: flex;
    gap: 12px;
    font-size: 1rem;
    color: var(--slate-500);
  }

  &__empty,
  &__empty-inline {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 30px;
    border-radius: 20px;
    text-align: center;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--slate-400);
    background: #f8fafc;
    border: 2px dashed #e2e8f0;
  }

  &__empty-inline {
    padding: 16px;
    font-size: 1.1rem;
    border-radius: 12px;
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

@media (max-width: 992px) {
  .dashboard {
    &__hero {
      flex-direction: column;
      align-items: flex-start;
    }

    &__hero-stats {
      width: 100%;
      flex-wrap: wrap;
    }

    &__stat-card {
      flex: 1;
    }

    &__request-top,
    &__farm-head {
      flex-direction: column;
      align-items: stretch;
    }

    &__request-grid {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 576px) {
  .dashboard {
    &__hero {
      padding: 24px;
      border-radius: 20px;
    }

    &__hero-title {
      font-size: 2rem;
    }

    &__stat-card {
      min-width: 100%;
    }

    &__cards-shell {
      padding: 16px;
      border-radius: 20px;
    }

    &__section-head {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }

    &__messages-grid,
    &__cards {
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