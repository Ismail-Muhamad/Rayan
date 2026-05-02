<template>
    <div class="assistants-page">
        <section class="assistants-page__hero">
            <div class="assistants-page__hero-glow"></div>

            <div class="assistants-page__hero-content">
                <span class="assistants-page__eyebrow">لوحة التحكم</span>

                <h1 class="assistants-page__title">إدارة مساعدي الأدمن</h1>

                <p class="assistants-page__subtitle">
                    أضف حسابات متابعة لفريقك، عدّل بياناتهم، فعّل أو أوقف الوصول مؤقتًا،
                    واحذف الحسابات غير المطلوبة من مكان واحد.
                </p>

                <div class="assistants-page__hero-actions">
                    <button type="button" class="assistants-page__native-add-btn" @click="openCreateModal">
                        <BaseIcon name="solar:user-plus-rounded-outline" />
                        إضافة مساعد أدمن
                    </button>

                    <BaseButton color="gray" variant="outline" size="sm" @click="fetchAssistants">
                        <BaseIcon name="solar:refresh-outline" />
                        تحديث
                    </BaseButton>
                </div>
            </div>

            <div class="assistants-page__stats">
                <article class="assistants-page__stat">
                    <span>إجمالي المساعدين</span>
                    <strong>{{ assistants.length }}</strong>
                </article>

                <article class="assistants-page__stat assistants-page__stat--active">
                    <span>نشط</span>
                    <strong>{{ activeCount }}</strong>
                </article>

                <article class="assistants-page__stat assistants-page__stat--paused">
                    <span>موقوف مؤقتًا</span>
                    <strong>{{ suspendedCount }}</strong>
                </article>
            </div>
        </section>

        <section class="assistants-page__toolbar">
            <div class="assistants-page__search">
                <BaseIcon name="solar:magnifer-outline" />
                <input v-model="searchTerm" type="search"
                    placeholder="ابحث بالاسم أو اسم المستخدم أو رقم الواتساب..." />
            </div>

            <div class="assistants-page__filter">
                <button type="button" :class="{ 'is-active': statusFilter === 'all' }" @click="statusFilter = 'all'">
                    الكل
                </button>

                <button type="button" :class="{ 'is-active': statusFilter === 'active' }"
                    @click="statusFilter = 'active'">
                    نشط
                </button>

                <button type="button" :class="{ 'is-active': statusFilter === 'suspended' }"
                    @click="statusFilter = 'suspended'">
                    موقوف
                </button>
            </div>
        </section>

        <section class="assistants-page__content">
            <BaseLoader v-if="isLoading" />

            <div v-else-if="filteredAssistants.length" class="assistants-page__grid">
                <article v-for="assistant in filteredAssistants" :key="assistant.id" class="assistants-page__card">
                    <div class="assistants-page__card-top">
                        <div class="assistants-page__identity">
                            <div class="assistants-page__avatar">
                                {{ getInitials(assistant.name) }}
                            </div>

                            <div>
                                <h3>{{ assistant.name || "-" }}</h3>
                                <p>{{ assistant.email || "-" }}</p>
                            </div>
                        </div>

                        <span :class="[
                            'assistants-page__status',
                            assistant.status === 'active'
                                ? 'assistants-page__status--active'
                                : 'assistants-page__status--suspended',
                        ]">
                            {{ assistant.status === "active" ? "نشط" : "موقوف مؤقتًا" }}
                        </span>
                    </div>

                    <div class="assistants-page__info">
                        <div class="assistants-page__info-box">
                            <span>رقم الواتساب</span>

                            <a v-if="assistant.whatsapp_number"
                                :href="`https://wa.me/${normalizeWhatsAppForLink(assistant.whatsapp_number)}`"
                                target="_blank" rel="noopener">
                                {{ assistant.whatsapp_number }}
                            </a>

                            <strong v-else>-</strong>
                        </div>

                        <div class="assistants-page__info-box">
                            <span>تاريخ الإنشاء</span>
                            <strong>{{ formatDate(assistant.created_at) }}</strong>
                        </div>
                    </div>

                    <div class="assistants-page__card-actions">
                        <BaseButton color="blue" variant="outline" size="sm" @click="openEditModal(assistant)">
                            <BaseIcon name="solar:pen-2-outline" />
                            تعديل
                        </BaseButton>

                        <BaseButton v-if="assistant.status === 'active'" color="orange" variant="outline" size="sm"
                            @click="changeAssistantStatus(assistant, 'suspended')">
                            <BaseIcon name="solar:pause-circle-outline" />
                            إيقاف مؤقت
                        </BaseButton>

                        <BaseButton v-else color="green" variant="outline" size="sm"
                            @click="changeAssistantStatus(assistant, 'active')">
                            <BaseIcon name="solar:play-circle-outline" />
                            تفعيل
                        </BaseButton>

                        <BaseButton color="red" variant="outline" size="sm" @click="openDeleteModal(assistant)">
                            <BaseIcon name="solar:trash-bin-trash-outline" />
                            حذف
                        </BaseButton>
                    </div>
                </article>
            </div>

            <div v-else class="assistants-page__empty">
                <div class="assistants-page__empty-icon">
                    <BaseIcon name="solar:users-group-rounded-outline" />
                </div>

                <h3>لا يوجد مساعدين أدمن حتى الآن</h3>
                <p>ابدأ بإضافة أول مساعد أدمن لفريق المتابعة من الزر بالأعلى.</p>

                <button type="button" class="assistants-page__native-add-btn" @click="openCreateModal">
                    إضافة مساعد أدمن
                </button>
            </div>
        </section>

        <div v-if="isFormModalOpen" class="assistants-page__modal-backdrop" @click.self="closeFormModal">
            <div class="assistants-page__modal">
                <div class="assistants-page__modal-head">
                    <div>
                        <span>{{ isEditing ? "تعديل بيانات" : "حساب جديد" }}</span>
                        <h2>{{ isEditing ? "تعديل مساعد أدمن" : "إضافة مساعد أدمن" }}</h2>
                    </div>

                    <button type="button" @click="closeFormModal">
                        <BaseIcon name="mdi:close" />
                    </button>
                </div>

                <form class="assistants-page__form" @submit.prevent="submitAssistantForm">
                    <div class="assistants-page__form-grid">
                        <div class="assistants-page__field">
                            <BaseInput v-model="form.name" label="الاسم" placeholder="مثال: موظف متابعة 1" required />
                        </div>

                        <div class="assistants-page__field">
                            <BaseInput v-model="form.email" label="اسم المستخدم"
                                placeholder="مثال: followup1@rayaan.cloud" required />
                        </div>

                        <div class="assistants-page__field">
                            <BaseInput v-model="form.whatsapp_number" label="رقم واتساب" placeholder="مثال: 01000000001"
                                required />
                        </div>

                        <div class="assistants-page__field">
                            <BaseInput v-model="form.password"
                                :label="isEditing ? 'كلمة المرور الجديدة - اختياري' : 'كلمة المرور'"
                                :placeholder="isEditing ? 'اتركها فارغة لو مش عايز تغيرها' : 'اكتب كلمة المرور'"
                                type="password" :required="!isEditing" />
                        </div>
                    </div>

                    <div class="assistants-page__modal-actions">
                        <button type="button" class="assistants-page__cancel-btn" @click="closeFormModal">
                            إلغاء
                        </button>

                        <button type="submit" class="assistants-page__submit-btn" :disabled="isSubmitting">
                            <span v-if="isSubmitting">جاري الحفظ...</span>
                            <span v-else>
                                {{ isEditing ? "حفظ التعديلات" : "إضافة المساعد" }}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="isDeleteModalOpen" class="assistants-page__modal-backdrop" @click.self="closeDeleteModal">
            <div class="assistants-page__confirm">
                <div class="assistants-page__confirm-icon">
                    <BaseIcon name="solar:trash-bin-trash-bold" />
                </div>

                <h2>حذف مساعد الأدمن؟</h2>

                <p>
                    هل أنت متأكد إنك عايز تحذف
                    <strong>{{ selectedAssistant?.name }}</strong>؟
                    الإجراء ده لا يمكن التراجع عنه.
                </p>

                <div class="assistants-page__modal-actions">
                    <BaseButton color="gray" variant="outline" size="sm" @click="closeDeleteModal">
                        إلغاء
                    </BaseButton>

                    <BaseButton color="red" size="sm" :loading="isSubmitting" @click="deleteAssistant">
                        حذف
                    </BaseButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";
import UsersServices from "@/services/users.services";

const { locale } = useI18n();

const assistants = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);

const searchTerm = ref("");
const statusFilter = ref("all");

const isFormModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const selectedAssistant = ref(null);

const form = ref({
    name: "",
    email: "",
    password: "",
    whatsapp_number: "",
});

const activeCount = computed(() => {
    return assistants.value.filter((item) => item.status === "active").length;
});

const suspendedCount = computed(() => {
    return assistants.value.filter((item) => item.status === "suspended").length;
});

const filteredAssistants = computed(() => {
    const keyword = searchTerm.value.trim().toLowerCase();

    return assistants.value.filter((assistant) => {
        const matchesStatus =
            statusFilter.value === "all" || assistant.status === statusFilter.value;

        const text = [
            assistant.name,
            assistant.email,
            assistant.whatsapp_number,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return matchesStatus && (!keyword || text.includes(keyword));
    });
});

onMounted(() => {
    fetchAssistants();
});

const fetchAssistants = async () => {
    isLoading.value = true;

    try {
        const response = await UsersServices.get({
            role: "admin_assistant",
            per_page: 1000,
        });

        assistants.value = response?.data?.data || response?.data || [];
    } catch (error) {
        console.error("Failed to fetch admin assistants:", error);
        toast.error("فشل تحميل مساعدي الأدمن.");
    } finally {
        isLoading.value = false;
    }
};

const openCreateModal = () => {
    console.log("openCreateModal clicked");

    isEditing.value = false;
    selectedAssistant.value = null;

    form.value = {
        name: "",
        email: "",
        password: "",
        whatsapp_number: "",
    };

    isFormModalOpen.value = true;
};

const openEditModal = (assistant) => {
    isEditing.value = true;
    selectedAssistant.value = assistant;

    form.value = {
        name: assistant.name || "",
        email: assistant.email || "",
        password: "",
        whatsapp_number: assistant.whatsapp_number || "",
    };

    isFormModalOpen.value = true;
};

const closeFormModal = () => {
    isFormModalOpen.value = false;
    isEditing.value = false;
    selectedAssistant.value = null;
};

const openDeleteModal = (assistant) => {
    selectedAssistant.value = assistant;
    isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
    selectedAssistant.value = null;
    isDeleteModalOpen.value = false;
};

const validateForm = () => {
    if (!form.value.name.trim()) {
        toast.warning("اكتب اسم المساعد.");
        return false;
    }

    if (!form.value.email.trim()) {
        toast.warning("اكتب اسم المستخدم.");
        return false;
    }

    if (!form.value.whatsapp_number.trim()) {
        toast.warning("اكتب رقم الواتساب.");
        return false;
    }

    if (!isEditing.value && !form.value.password.trim()) {
        toast.warning("اكتب كلمة المرور.");
        return false;
    }

    return true;
};

const submitAssistantForm = async () => {
    console.log("submitAssistantForm clicked", form.value);

    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
        const payload = {
            name: form.value.name,
            email: form.value.email,
            whatsapp_number: form.value.whatsapp_number,
            role: "admin_assistant",
            status: selectedAssistant.value?.status || "active",
        };

        if (form.value.password) {
            payload.password = form.value.password;
        }

        if (isEditing.value && selectedAssistant.value?.id) {
            await UsersServices.update(selectedAssistant.value.id, payload);
            toast.success("تم تعديل مساعد الأدمن بنجاح.");
        } else {
            await UsersServices.create(payload);
            toast.success("تم إضافة مساعد الأدمن بنجاح.");
        }

        closeFormModal();
        await fetchAssistants();
    } catch (error) {
        console.error("Failed to save admin assistant:", error);
        toast.error("فشل حفظ مساعد الأدمن. راجع إعدادات الباك إند.");
    } finally {
        isSubmitting.value = false;
    }
};

const changeAssistantStatus = async (assistant, status) => {
    isSubmitting.value = true;

    try {
        await UsersServices.update(assistant.id, {
            status,
        });

        toast.success(
            status === "active"
                ? "تم تفعيل مساعد الأدمن."
                : "تم إيقاف مساعد الأدمن مؤقتًا.",
        );

        await fetchAssistants();
    } catch (error) {
        console.error("Failed to update assistant status:", error);
        toast.error("فشل تغيير حالة مساعد الأدمن.");
    } finally {
        isSubmitting.value = false;
    }
};

const deleteAssistant = async () => {
    if (!selectedAssistant.value?.id) return;

    isSubmitting.value = true;

    try {
        await UsersServices.delete(selectedAssistant.value.id);

        toast.success("تم حذف مساعد الأدمن بنجاح.");

        closeDeleteModal();
        await fetchAssistants();
    } catch (error) {
        console.error("Failed to delete assistant:", error);
        toast.error("فشل حذف مساعد الأدمن.");
    } finally {
        isSubmitting.value = false;
    }
};

const getInitials = (name) => {
    if (!name) return "?";

    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
};

const normalizeWhatsAppForLink = (phone) => {
    const digits = String(phone || "").replace(/\D+/g, "");

    if (!digits) return "";

    if (digits.startsWith("20")) return digits;

    if (digits.startsWith("0")) return `20${digits.slice(1)}`;

    return `20${digits}`;
};

const formatDate = (date) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat(
        locale.value === "ar" ? "ar-EG" : "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        },
    ).format(new Date(date));
};
</script>

<style lang="scss" scoped>
.assistants-page {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 4px;
    background:
        radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 28%),
        linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);

    &__hero {
        position: relative;
        overflow: hidden;
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 22px;
        padding: 26px;
        border-radius: 30px;
        color: white;
        background:
            radial-gradient(circle at top right, rgba(125, 211, 252, 0.35), transparent 32%),
            radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.36), transparent 30%),
            linear-gradient(135deg, #06172f 0%, #0f2f5f 48%, #0b63c7 100%);
        box-shadow: 0 24px 65px rgba(15, 47, 95, 0.24);
    }

    &__hero-glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
            linear-gradient(120deg, rgba(255, 255, 255, 0.12), transparent 32%),
            radial-gradient(circle at 75% 18%, rgba(255, 255, 255, 0.14), transparent 18%);
    }

    &__hero-content,
    &__stats {
        position: relative;
        z-index: 1;
    }

    &__eyebrow {
        display: inline-flex;
        align-items: center;
        width: fit-content;
        margin-bottom: 12px;
        padding: 8px 13px;
        border-radius: 999px;
        color: rgba(255, 255, 255, 0.82);
        background-color: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.18);
        font-size: 1.15rem;
        font-weight: 800;
    }

    &__title {
        margin: 0;
        font-size: clamp(3rem, 5vw, 5rem);
        font-weight: 950;
        line-height: 1.12;
        letter-spacing: -0.5px;
    }

    &__subtitle {
        max-width: 760px;
        margin: 14px 0 0;
        color: rgba(255, 255, 255, 0.82);
        font-size: 1.45rem;
        line-height: 1.9;
    }

    &__hero-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 22px;
    }

    &__stats {
        display: grid;
        gap: 12px;
    }

    &__stat {
        padding: 18px;
        border-radius: 22px;
        background-color: rgba(255, 255, 255, 0.13);
        border: 1px solid rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(16px);

        span {
            display: block;
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.16rem;
            font-weight: 800;
            margin-bottom: 7px;
        }

        strong {
            display: block;
            color: white;
            font-size: 2.45rem;
            font-weight: 950;
        }

        &--active {
            background-color: rgba(34, 197, 94, 0.14);
        }

        &--paused {
            background-color: rgba(245, 158, 11, 0.14);
        }
    }

    &__toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 14px;
        border-radius: 24px;
        background-color: rgba(255, 255, 255, 0.94);
        border: 1px solid var(--blue-100);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
    }

    &__search {
        flex: 1;
        min-height: 48px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 14px;
        border-radius: 18px;
        background: #f8fbff;
        border: 1px solid var(--blue-100);
        color: var(--blue-700);

        input {
            flex: 1;
            width: 100%;
            border: 0;
            outline: 0;
            background: transparent;
            color: var(--gray-900);
            font-size: 1.25rem;
            font-weight: 700;

            &::placeholder {
                color: var(--gray-400);
            }
        }
    }

    &__filter {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px;
        border-radius: 18px;
        background: #eef5ff;

        button {
            border: 0;
            outline: 0;
            cursor: pointer;
            padding: 9px 14px;
            border-radius: 14px;
            background: transparent;
            color: var(--blue-700);
            font-size: 1.1rem;
            font-weight: 900;

            &.is-active {
                background: white;
                color: var(--blue-800);
                box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
            }
        }
    }

    &__content {
        min-height: 320px;
        padding: 16px;
        border-radius: 26px;
        background-color: rgba(255, 255, 255, 0.94);
        border: 1px solid var(--blue-100);
        box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
        gap: 16px;
    }

    &__card {
        position: relative;
        overflow: hidden;
        padding: 18px;
        border-radius: 24px;
        background:
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
            linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
        border: 1px solid var(--blue-100);
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.05);
    }

    &__card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
    }

    &__identity {
        display: flex;
        align-items: center;
        gap: 12px;

        h3 {
            margin: 0;
            color: var(--gray-950);
            font-size: 1.58rem;
            font-weight: 950;
        }

        p {
            margin: 5px 0 0;
            color: var(--blue-700);
            font-size: 1.12rem;
            font-weight: 800;
        }
    }

    &__avatar {
        width: 54px;
        height: 54px;
        flex-shrink: 0;
        display: grid;
        place-items: center;
        border-radius: 18px;
        color: white;
        font-size: 1.4rem;
        font-weight: 950;
        background: linear-gradient(135deg, var(--blue-700), var(--blue-400));
        box-shadow: 0 12px 22px rgba(37, 99, 235, 0.18);
    }

    &__status {
        display: inline-flex;
        align-items: center;
        white-space: nowrap;
        padding: 8px 12px;
        border-radius: 999px;
        font-size: 1.05rem;
        font-weight: 900;

        &--active {
            color: #15803d;
            background: #dcfce7;
            border: 1px solid #bbf7d0;
        }

        &--suspended {
            color: #b45309;
            background: #fff7ed;
            border: 1px solid #fed7aa;
        }
    }

    &__info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
    }

    &__info-box {
        padding: 14px;
        border-radius: 18px;
        background: white;
        border: 1px solid #e7f0ff;

        span {
            display: block;
            margin-bottom: 6px;
            color: var(--gray-500);
            font-size: 1.05rem;
            font-weight: 800;
        }

        strong,
        a {
            color: var(--gray-900);
            font-size: 1.22rem;
            font-weight: 900;
            text-decoration: none;
            word-break: break-word;
        }

        a {
            color: var(--blue-700);

            &:hover {
                text-decoration: underline;
            }
        }
    }

    &__card-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    &__empty {
        min-height: 320px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        text-align: center;

        h3 {
            margin: 0;
            color: var(--gray-950);
            font-size: 2rem;
            font-weight: 950;
        }

        p {
            max-width: 420px;
            margin: 0;
            color: var(--gray-500);
            font-size: 1.35rem;
            line-height: 1.8;
        }
    }

    &__empty-icon,
    &__confirm-icon {
        width: 72px;
        height: 72px;
        display: grid;
        place-items: center;
        border-radius: 24px;
        color: var(--blue-700);
        background: linear-gradient(135deg, var(--blue-100), var(--sky-50));
        font-size: 3rem;
    }

    &__modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1000;
        padding: 18px;
        display: grid;
        place-items: center;
        background-color: rgba(2, 8, 23, 0.52);
        backdrop-filter: blur(8px);
    }

    &__modal,
    &__confirm {
        width: min(680px, 100%);
        border-radius: 28px;
        background:
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 30%),
            white;
        box-shadow: 0 30px 90px rgba(2, 8, 23, 0.28);
        border: 1px solid rgba(255, 255, 255, 0.7);
    }

    &__modal {
        padding: 22px;
    }

    &__modal-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 18px;

        span {
            display: block;
            color: var(--blue-700);
            font-size: 1.15rem;
            font-weight: 900;
            margin-bottom: 5px;
        }

        h2 {
            margin: 0;
            color: var(--gray-950);
            font-size: 2rem;
            font-weight: 950;
        }

        button {
            width: 42px;
            height: 42px;
            border: 0;
            outline: 0;
            cursor: pointer;
            display: grid;
            place-items: center;
            border-radius: 14px;
            color: var(--gray-600);
            background: var(--gray-100);
            font-size: 1.5rem;
        }
    }

    &__form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }

    &__field {
        padding: 14px;
        border-radius: 18px;
        background: #f8fbff;
        border: 1px solid var(--blue-100);
    }

    &__modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 18px;
    }

    &__confirm {
        max-width: 520px;
        padding: 24px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;

        h2 {
            margin: 14px 0 0;
            color: var(--gray-950);
            font-size: 2rem;
            font-weight: 950;
        }

        p {
            max-width: 420px;
            margin: 10px 0 0;
            color: var(--gray-500);
            font-size: 1.35rem;
            line-height: 1.8;

            strong {
                color: var(--gray-950);
            }
        }
    }
}

:deep(.assistants-page__field .base-input) {
    width: 100%;
}

:deep(input) {
    border-radius: 14px !important;
}

@media (max-width: 900px) {
    .assistants-page {
        gap: 14px;

        &__hero {
            grid-template-columns: 1fr;
            padding: 20px;
            border-radius: 26px;
        }

        &__stats {
            grid-template-columns: repeat(3, 1fr);
        }

        &__toolbar {
            flex-direction: column;
            align-items: stretch;
        }

        &__filter {
            justify-content: center;
        }

        &__info,
        &__form-grid {
            grid-template-columns: 1fr;
        }
    }
}

@media (max-width: 560px) {
    .assistants-page {
        &__title {
            font-size: 3rem;
        }

        &__subtitle {
            font-size: 1.25rem;
        }

        &__stats {
            grid-template-columns: 1fr;
        }

        &__grid {
            grid-template-columns: 1fr;
        }

        &__card-top {
            flex-direction: column;
            align-items: stretch;
        }

        &__card-actions {
            :deep(button) {
                flex: 1;
            }
        }

        &__modal-backdrop {
            align-items: end;
            padding: 10px;
        }

        &__modal,
        &__confirm {
            border-radius: 26px 26px 18px 18px;
        }
    }
}

.assistants-page__native-add-btn {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border: 0;
    outline: 0;
    cursor: pointer;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
    color: #fff;
    font-size: 1.18rem;
    font-weight: 900;
    box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
    transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 30px rgba(37, 99, 235, 0.24);
    }
}

.assistants-page__submit-btn,
.assistants-page__cancel-btn {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 18px;
    border-radius: 12px;
    font-size: 1.15rem;
    font-weight: 900;
    cursor: pointer;
    transition: 0.18s ease;
}

.assistants-page__submit-btn {
    border: 0;
    color: #fff;
    background: linear-gradient(135deg, var(--blue-700), var(--blue-500));
    box-shadow: 0 10px 22px rgba(37, 99, 235, 0.2);

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
}

.assistants-page__cancel-btn {
    color: var(--gray-700);
    background: #fff;
    border: 1px solid var(--gray-200);
}
</style>