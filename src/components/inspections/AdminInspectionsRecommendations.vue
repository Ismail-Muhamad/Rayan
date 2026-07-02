<template>
  <BasePageWrapper
    titleKey="التوصيات والمعاينات الفنية"
    subtitleKey="Technical Inspections & Recommendations"
    iconName="solar:document-medicine-outline"
  >
    <section class="ir-page" dir="rtl">

      <!-- ═══════════════════════════════════ HERO ═══ -->
      <div class="ir-hero">
        <div class="ir-hero__glow ir-hero__glow--a"></div>
        <div class="ir-hero__glow ir-hero__glow--b"></div>

        <div class="ir-hero__content">
          <div class="ir-hero__badge">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <circle cx="4" cy="4" r="4" fill="#818cf8"/>
            </svg>
            إدارة المعاينات الشهرية
          </div>
          <h1>التوصيات <span class="ir-hero__accent">&amp;</span> المعاينات الفنية</h1>
          <p>أضف وعدّل واحذف المعاينات الفنية والتوصيات لكل مزرعة وكل شهر.</p>

          <div class="ir-hero__chips">
            <div class="ir-hero__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{{ totalUsers }} مستخدم</span>
            </div>
            <div class="ir-hero__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>{{ totalFarms }} مزرعة</span>
            </div>
            <div class="ir-hero__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              <span>{{ totalInspections }} سجل</span>
            </div>
          </div>
        </div>

        <div class="ir-hero__stats">
          <div class="ir-stat">
            <div class="ir-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <span class="ir-stat__label">العملاء</span>
              <strong class="ir-stat__value">{{ totalUsers }}</strong>
            </div>
          </div>
          <div class="ir-stat">
            <div class="ir-stat__icon ir-stat__icon--green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <span class="ir-stat__label">المزارع</span>
              <strong class="ir-stat__value">{{ totalFarms }}</strong>
            </div>
          </div>
          <div class="ir-stat">
            <div class="ir-stat__icon ir-stat__icon--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div>
              <span class="ir-stat__label">السجلات</span>
              <strong class="ir-stat__value">{{ totalInspections }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════ TOOLBAR ═══ -->
      <div class="ir-toolbar">
        <div class="ir-toolbar__search">
          <svg class="ir-toolbar__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="search"
            type="text"
            autocomplete="off"
            placeholder="ابحث باسم المستخدم أو المزرعة أو التوصية…"
          />
          <button v-if="search" class="ir-toolbar__clear" type="button" @click="search = ''">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <button class="ir-add-btn" type="button" @click="openAddModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          إضافة معاينة
        </button>
      </div>

      <!-- ═══════════════════════════════════ LOADING ═══ -->
      <div v-if="loading" class="ir-state">
        <div class="ir-spinner"></div>
        <p>جاري تحميل البيانات…</p>
      </div>

      <!-- ═══════════════════════════════════ ERROR ═══ -->
      <div v-else-if="errorMessage" class="ir-state ir-state--error">
        <div class="ir-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>حدث خطأ أثناء التحميل</h3>
        <p>{{ errorMessage }}</p>
        <button type="button" @click="loadData">حاول مرة أخرى</button>
      </div>

      <!-- ═══════════════════════════════════ EMPTY ═══ -->
      <div v-else-if="filteredUserGroups.length === 0" class="ir-state ir-state--empty">
        <div class="ir-state__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h3>لا توجد نتائج</h3>
        <p>{{ search ? 'لا يوجد ما يطابق بحثك.' : 'لا توجد معاينات مسجلة بعد.' }}</p>
        <button type="button" @click="openAddModal()">إضافة أول معاينة</button>
      </div>

      <!-- ═══════════════════════════════════ USER GROUPS ═══ -->
      <div v-else class="ir-users-grid">
        <article
          v-for="userGroup in filteredUserGroups"
          :key="userGroup.userId"
          class="ir-user-card"
        >
          <!-- User Card Header -->
          <header class="ir-user-card__header" @click="toggleUserCollapse(userGroup.userId)">
            <div class="ir-user-card__avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v1h20v-1c0-3.3-6.7-5-10-5z"/>
              </svg>
            </div>
            <div class="ir-user-card__info">
              <h2>{{ userGroup.userName }}</h2>
              <div class="ir-user-card__meta">
                <span v-if="userGroup.phone" class="ir-user-card__meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.29h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 5.72 5.72l1.4-1.4a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {{ userGroup.phone }}
                </span>
                <span class="ir-user-card__farms-count">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  {{ userGroup.farms.length }} مزرعة
                </span>
              </div>
            </div>
            <div class="ir-user-card__header-actions">
              <button
                class="ir-user-card__add-btn"
                type="button"
                @click.stop="openAddModal(userGroup.userId)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                إضافة
              </button>
              
              <button class="ir-user-card__toggle-btn" type="button">
                <svg :class="{ 'is-collapsed': collapsedUsers.has(userGroup.userId) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 15l-6-6-6 6"/>
                </svg>
              </button>
            </div>
          </header>

          <!-- Farms inside user card -->
          <div v-show="!collapsedUsers.has(userGroup.userId)" class="ir-farms-inside">
            <div
              v-for="farmGroup in userGroup.farms"
              :key="farmGroup.farmId"
              class="ir-farm-block"
            >
              <!-- Farm Block Header -->
              <div class="ir-farm-block__header">
                <div class="ir-farm-block__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <div class="ir-farm-block__info">
                  <span class="ir-farm-block__label">مزرعة</span>
                  <h3>{{ farmGroup.farmName }}</h3>
                </div>
                <div class="ir-farm-block__badge">
                  {{ farmGroup.inspections.length }}
                  <span>سجل</span>
                </div>
              </div>

              <!-- Preview records (max 2) -->
              <div v-if="farmGroup.inspections.length > 0" class="ir-preview-records">
                <div
                  v-for="record in farmGroup.inspections.slice(0, 2)"
                  :key="record.id"
                  class="ir-preview-record"
                >
                  <div class="ir-preview-record__head">
                    <div class="ir-preview-record__date">
                      <span class="ir-preview-record__month">{{ getMonthName(record.month) }}</span>
                      <span class="ir-preview-record__year">{{ record.year }}</span>
                    </div>
                    <div class="ir-preview-record__actions">
                      <button class="ir-act-btn ir-act-btn--edit" type="button" title="تعديل" @click="openEditModal(record, userGroup.userId)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button class="ir-act-btn ir-act-btn--delete" type="button" title="حذف" @click="openDeleteModal(record)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div class="ir-preview-record__body">
                    <div v-if="record.technical_inspection" class="ir-preview-record__field">
                      <span class="ir-preview-record__field-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                        المعاينة الفنية
                      </span>
                      <div class="ir-thought-bubble-container">
                        <p class="ir-preview-record__field-text ir-preview-record__field-text--clamp1">{{ record.technical_inspection }}</p>
                        <div class="ir-thought-bubble">
                          {{ record.technical_inspection }}
                          <div class="ir-bubble-tail-1"></div>
                          <div class="ir-bubble-tail-2"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="ir-preview-record__divider" v-if="record.technical_inspection && record.technical_recommendations"></div>

                    <div v-if="record.technical_recommendations" class="ir-preview-record__field">
                      <span class="ir-preview-record__field-label">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        التوصيات الفنية
                      </span>
                      <div class="ir-thought-bubble-container">
                        <p class="ir-preview-record__field-text ir-preview-record__field-text--clamp1">{{ record.technical_recommendations }}</p>
                        <div class="ir-thought-bubble">
                          {{ record.technical_recommendations }}
                          <div class="ir-bubble-tail-1"></div>
                          <div class="ir-bubble-tail-2"></div>
                        </div>
                      </div>
                    </div>
                    
                    <p v-if="!record.technical_inspection && !record.technical_recommendations" class="ir-preview-record__empty">
                      لا يوجد محتوى مسجل.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Footer: show more button -->
              <div class="ir-farm-block__footer">
                <button
                  v-if="farmGroup.inspections.length > 2"
                  class="ir-show-more-btn"
                  type="button"
                  @click="goToFarmDetails(userGroup, farmGroup)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  عرض كل السجلات
                  <span class="ir-show-more-btn__count">{{ farmGroup.inspections.length }}</span>
                  <svg class="ir-show-more-btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>

                <button
                  class="ir-farm-add-btn"
                  type="button"
                  @click="openAddModal(userGroup.userId, farmGroup.farmId)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  إضافة معاينة لهذه المزرعة
                </button>
              </div>
            </div>

            <!-- No farms message -->
            <div v-if="userGroup.farms.length === 0" class="ir-no-farms">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              <span>لا توجد مزارع بها معاينات لهذا المستخدم</span>
            </div>
          </div>
        </article>
      </div>

    </section>

    <!-- ═══════════════════════════════════ ADD/EDIT MODAL ═══ -->
    <Teleport to="body">
      <Transition name="ir-fade">
        <div v-if="showFormModal" class="ir-backdrop" @click.self="closeFormModal">
          <Transition name="ir-scale">
            <div v-if="showFormModal" class="ir-modal">

              <div class="ir-modal__header">
                <div class="ir-modal__header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <h2>{{ isEditing ? 'تعديل المعاينة' : 'إضافة معاينة جديدة' }}</h2>
                  <p>{{ isEditing ? 'عدّل البيانات ثم احفظ' : 'اختر المستخدم والمزرعة ثم أدخل البيانات' }}</p>
                </div>
                <button class="ir-modal__close" type="button" @click="closeFormModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="ir-modal__body">

                <!-- Step 1: User Select -->
                <div class="ir-form-group">
                  <label class="ir-form-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    المستخدم (العميل)
                    <span class="ir-required">*</span>
                  </label>
                  <select
                    v-model="form.user_id"
                    class="ir-form-select"
                    :disabled="isEditing"
                    @change="form.farm_id = ''"
                  >
                    <option value="">اختر المستخدم…</option>
                    <option v-for="u in allUsers" :key="u.id" :value="u.id">
                      {{ u.name || u.full_name || `مستخدم #${u.id}` }}
                      {{ u.phone ? `— ${u.phone}` : '' }}
                    </option>
                  </select>
                  <span v-if="formErrors.user_id" class="ir-form-error">{{ formErrors.user_id }}</span>
                </div>

                <!-- Step 2: Farm Select (filtered by user) -->
                <div class="ir-form-group">
                  <label class="ir-form-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    المزرعة
                    <span class="ir-required">*</span>
                  </label>
                  <select
                    v-model="form.farm_id"
                    class="ir-form-select"
                    :disabled="isEditing || !form.user_id"
                  >
                    <option value="">{{ form.user_id ? 'اختر المزرعة…' : 'اختر مستخدماً أولاً' }}</option>
                    <option v-for="f in farmsForSelectedUser" :key="f.id" :value="f.id">
                      {{ f.name || f.farm_name || `مزرعة #${f.id}` }}
                    </option>
                  </select>
                  <span v-if="formErrors.farm_id" class="ir-form-error">{{ formErrors.farm_id }}</span>
                </div>

                <!-- Year & Month -->
                <div class="ir-form-row">
                  <div class="ir-form-group">
                    <label class="ir-form-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      السنة <span class="ir-required">*</span>
                    </label>
                    <select v-model="form.year" class="ir-form-select">
                      <option value="">اختر السنة</option>
                      <option v-for="y in yearsList" :key="y" :value="y">{{ y }}</option>
                    </select>
                    <span v-if="formErrors.year" class="ir-form-error">{{ formErrors.year }}</span>
                  </div>

                  <div class="ir-form-group">
                    <label class="ir-form-label">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10H3M16 2v4M8 2v4"/>
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                      </svg>
                      الشهر <span class="ir-required">*</span>
                    </label>
                    <select v-model="form.month" class="ir-form-select">
                      <option value="">اختر الشهر</option>
                      <option v-for="m in monthsList" :key="m.value" :value="m.value">{{ m.label }}</option>
                    </select>
                    <span v-if="formErrors.month" class="ir-form-error">{{ formErrors.month }}</span>
                  </div>
                </div>

                <!-- Technical Inspection -->
                <div class="ir-form-group">
                  <label class="ir-form-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    المعاينة الفنية
                  </label>
                  <textarea
                    v-model="form.technical_inspection"
                    class="ir-form-textarea"
                    placeholder="اكتب نتائج المعاينة الفنية هنا…"
                    rows="4"
                  ></textarea>
                </div>

                <!-- Technical Recommendations -->
                <div class="ir-form-group">
                  <label class="ir-form-label">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    التوصيات الفنية
                  </label>
                  <textarea
                    v-model="form.technical_recommendations"
                    class="ir-form-textarea"
                    placeholder="اكتب التوصيات الفنية هنا…"
                    rows="4"
                  ></textarea>
                </div>

              </div>

              <div class="ir-modal__footer">
                <button class="ir-btn ir-btn--ghost" type="button" @click="closeFormModal">إلغاء</button>
                <button class="ir-btn ir-btn--primary" type="button" :disabled="saving" @click="submitForm">
                  <span v-if="saving" class="ir-btn-spin"></span>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {{ saving ? 'جاري الحفظ…' : (isEditing ? 'حفظ التعديلات' : 'إضافة المعاينة') }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ═══════════════════════════════════ DELETE MODAL ═══ -->
    <Teleport to="body">
      <Transition name="ir-fade">
        <div v-if="showDeleteModal" class="ir-backdrop" @click.self="closeDeleteModal">
          <Transition name="ir-scale">
            <div v-if="showDeleteModal" class="ir-modal ir-modal--sm">

              <div class="ir-modal__header ir-modal__header--danger">
                <div class="ir-modal__header-icon ir-modal__header-icon--danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </div>
                <div>
                  <h2>تأكيد الحذف</h2>
                  <p>هذا الإجراء لا يمكن التراجع عنه</p>
                </div>
                <button class="ir-modal__close" type="button" @click="closeDeleteModal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div class="ir-modal__body">
                <div class="ir-delete-body">
                  <div class="ir-delete-body__warn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <p>
                    هل أنت متأكد من حذف معاينة
                    <strong>{{ getMonthName(deleteTarget?.month) }} {{ deleteTarget?.year }}</strong>؟
                  </p>
                </div>
              </div>

              <div class="ir-modal__footer">
                <button class="ir-btn ir-btn--ghost" type="button" @click="closeDeleteModal">إلغاء</button>
                <button class="ir-btn ir-btn--danger" type="button" :disabled="deleting" @click="confirmDelete">
                  <span v-if="deleting" class="ir-btn-spin"></span>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  {{ deleting ? 'جاري الحذف…' : 'نعم، احذف' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </BasePageWrapper>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import axiosClient from "@/api/axiosClient";
import { toast } from "vue-sonner";

const router = useRouter();

// ══════════════════════════════════════ STATE ══
const loading   = ref(false);
const saving    = ref(false);
const deleting  = ref(false);
const errorMessage = ref("");
const search    = ref("");

const collapsedUsers = ref(new Set());

const allUsers       = ref([]);
const allFarms       = ref([]);
const allInspections = ref([]);

const showFormModal   = ref(false);
const showDeleteModal = ref(false);
const isEditing       = ref(false);
const deleteTarget    = ref(null);

const form = reactive({
  id: null,
  user_id: "",
  farm_id: "",
  year:  new Date().getFullYear(),
  month: new Date().getMonth(),
  technical_inspection:      "",
  technical_recommendations: "",
});

const formErrors = reactive({
  user_id: "",
  farm_id: "",
  year:    "",
  month:   "",
});

// ══════════════════════════════════════ CONSTANTS ══
const monthsList = [
  { value: 0,  label: "يناير"  },
  { value: 1,  label: "فبراير" },
  { value: 2,  label: "مارس"   },
  { value: 3,  label: "أبريل"  },
  { value: 4,  label: "مايو"   },
  { value: 5,  label: "يونيو"  },
  { value: 6,  label: "يوليو"  },
  { value: 7,  label: "أغسطس"  },
  { value: 8,  label: "سبتمبر" },
  { value: 9,  label: "أكتوبر" },
  { value: 10, label: "نوفمبر" },
  { value: 11, label: "ديسمبر" },
];

const yearsList = computed(() => {
  const now = new Date().getFullYear();
  const arr = [];
  for (let y = now + 1; y >= 2020; y--) arr.push(y);
  return arr;
});

// ══════════════════════════════════════ COMPUTED ══
const totalUsers       = computed(() => allUsers.value.length);
const totalFarms       = computed(() => allFarms.value.length);
const totalInspections = computed(() => allInspections.value.length);

/** farms belonging to currently selected user in the form */
const farmsForSelectedUser = computed(() => {
  if (!form.user_id) return [];
  return allFarms.value.filter(
    (f) => String(f.user_id || f.owner_id || f.client_id || "") === String(form.user_id)
  );
});

/**
 * Build hierarchical: users → farms → inspections
 * Filtered by search term
 */
const filteredUserGroups = computed(() => {
  const term = normalizeSearch(search.value);

  // Build lookup maps
  const farmMap = {};
  allFarms.value.forEach((f) => { farmMap[f.id] = f; });

  const userMap = {};
  allUsers.value.forEach((u) => { userMap[u.id] = u; });

  // Group inspections by user → farm
  const userGroups = {};

  allInspections.value.forEach((record) => {
    const farm  = farmMap[record.farm_id];
    if (!farm) return;

    const userId   = farm.user_id || farm.owner_id || farm.client_id;
    if (!userId) return;

    const user     = userMap[userId];
    const userName = user ? (user.name || user.full_name || `مستخدم #${userId}`) : `مستخدم #${userId}`;
    const farmName = farm.name || farm.farm_name || `مزرعة #${farm.id}`;

    // Search filter
    if (term) {
      const text = normalizeSearch(
        [userName, farmName, record.technical_inspection || "", record.technical_recommendations || ""].join(" ")
      );
      if (!text.includes(term)) return;
    }

    if (!userGroups[userId]) {
      userGroups[userId] = {
        userId,
        userName,
        phone: user?.phone || user?.mobile || "",
        farms: {},
      };
    }

    const farmKey = record.farm_id;
    if (!userGroups[userId].farms[farmKey]) {
      userGroups[userId].farms[farmKey] = {
        farmId:      farm.id,
        farmName,
        inspections: [],
      };
    }

    userGroups[userId].farms[farmKey].inspections.push(record);
  });

  // Convert to array and sort
  return Object.values(userGroups)
    .map((ug) => ({
      ...ug,
      farms: Object.values(ug.farms).sort((a, b) =>
        a.farmName.localeCompare(b.farmName, "ar")
      ),
    }))
    .sort((a, b) => a.userName.localeCompare(b.userName, "ar"));
});

// ══════════════════════════════════════ LIFECYCLE ══
onMounted(loadData);

// ══════════════════════════════════════ DATA ══
function toggleUserCollapse(userId) {
  const newSet = new Set(collapsedUsers.value);
  if (newSet.has(userId)) {
    newSet.delete(userId);
  } else {
    newSet.add(userId);
  }
  collapsedUsers.value = newSet;
}

async function loadData() {
  loading.value   = true;
  errorMessage.value = "";

  try {
    const [usersRes, farmsRes, inspRes] = await Promise.all([
      axiosClient.get("/users",                { params: { per_page: 1000, role: "farm_owner" } }),
      axiosClient.get("/farms",                { params: { per_page: 1000 } }),
      axiosClient.get("/monthly-inspections",  { params: { per_page: 1000 } }),
    ]);

    allUsers.value       = extractArray(usersRes?.data);
    allFarms.value       = extractArray(farmsRes?.data);
    allInspections.value = extractArray(inspRes?.data);
  } catch (err) {
    console.error(err);
    errorMessage.value = err?.response?.data?.message || err?.message || "فشل تحميل البيانات.";
  } finally {
    loading.value = false;
  }
}

function extractArray(payload) {
  if (Array.isArray(payload))           return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data))     return payload.data;
  return [];
}

// ══════════════════════════════════════ HELPERS ══
function getMonthName(idx) {
  const m = monthsList.find((x) => x.value === Number(idx));
  return m ? m.label : `شهر ${idx}`;
}

function normalizeSearch(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();
}

// ══════════════════════════════════════ NAVIGATION ══
function goToFarmDetails(userGroup, farmGroup) {
  const data = {
    userId:    userGroup.userId,
    userName:  userGroup.userName,
    farmId:    farmGroup.farmId,
    farmName:  farmGroup.farmName,
    inspections: farmGroup.inspections,
  };
  localStorage.setItem("ir_farm_details", JSON.stringify(data));
  router.push({ name: "inspections_farm_details", params: { farmId: farmGroup.farmId } });
}

// ══════════════════════════════════════ FORM MODAL ══
function openAddModal(preUserId = "", preFarmId = "") {
  isEditing.value = false;
  Object.assign(form, {
    id:    null,
    user_id: preUserId  ? String(preUserId)  : "",
    farm_id: preFarmId  ? String(preFarmId)  : "",
    year:  new Date().getFullYear(),
    month: new Date().getMonth(),
    technical_inspection:      "",
    technical_recommendations: "",
  });
  clearErrors();
  showFormModal.value = true;
}

function openEditModal(record, userId = "") {
  isEditing.value = true;
  Object.assign(form, {
    id:    record.id,
    user_id: String(userId || ""),
    farm_id: String(record.farm_id || ""),
    year:  record.year,
    month: record.month,
    technical_inspection:      record.technical_inspection      || "",
    technical_recommendations: record.technical_recommendations || "",
  });
  clearErrors();
  showFormModal.value = true;
}

function closeFormModal()   { showFormModal.value = false; }

function clearErrors() {
  formErrors.user_id = "";
  formErrors.farm_id = "";
  formErrors.year    = "";
  formErrors.month   = "";
}

function validateForm() {
  clearErrors();
  let ok = true;
  if (!form.user_id) { formErrors.user_id = "يرجى اختيار المستخدم.";  ok = false; }
  if (!form.farm_id) { formErrors.farm_id = "يرجى اختيار المزرعة.";   ok = false; }
  if (!form.year)    { formErrors.year    = "يرجى اختيار السنة.";       ok = false; }
  if (form.month === "" || form.month === null || form.month === undefined) {
    formErrors.month = "يرجى اختيار الشهر.";
    ok = false;
  }
  return ok;
}

async function submitForm() {
  if (!validateForm()) return;
  saving.value = true;

  const payload = {
    farm_id:                   Number(form.farm_id),
    year:                      Number(form.year),
    month:                     Number(form.month),
    technical_inspection:      form.technical_inspection      || null,
    technical_recommendations: form.technical_recommendations || null,
  };

  try {
    if (isEditing.value) {
      const res     = await axiosClient.put(`/monthly-inspections/${form.id}`, payload);
      const updated = res?.data?.data || res?.data || payload;
      const idx     = allInspections.value.findIndex((r) => r.id === form.id);
      if (idx !== -1) allInspections.value[idx] = { ...allInspections.value[idx], ...updated };
      toast.success("تم تحديث المعاينة بنجاح ✅");
    } else {
      const res     = await axiosClient.post("/monthly-inspections", payload);
      const created = res?.data?.data || res?.data;
      if (created) allInspections.value.push(created);
      toast.success("تم إضافة المعاينة بنجاح ✅");
    }
    closeFormModal();
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      Object.values(err?.response?.data?.errors || {})?.[0]?.[0] ||
      err?.message || "حدث خطأ أثناء الحفظ.";
    toast.error(msg);
  } finally {
    saving.value = false;
  }
}

// ══════════════════════════════════════ DELETE MODAL ══
function openDeleteModal(record)   { deleteTarget.value = record; showDeleteModal.value = true; }
function closeDeleteModal()        { showDeleteModal.value = false; deleteTarget.value = null; }

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await axiosClient.delete(`/monthly-inspections/${deleteTarget.value.id}`);
    allInspections.value = allInspections.value.filter((r) => r.id !== deleteTarget.value.id);
    toast.success("تم حذف المعاينة بنجاح 🗑️");
    closeDeleteModal();
  } catch (err) {
    toast.error(err?.response?.data?.message || err?.message || "حدث خطأ أثناء الحذف.");
  } finally {
    deleting.value = false;
  }
}
</script>

<style lang="scss" scoped>
/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
.ir-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  direction: rtl;
}

/* ════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════ */
.ir-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 28px;
  padding: 38px;
  border-radius: 32px;
  background: linear-gradient(135deg, #0b1529 0%, #111d42 48%, #0d2438 100%);
  color: #fff;
  box-shadow: 0 28px 60px rgba(11, 21, 41, 0.28);
}

.ir-hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;

  &--a {
    width: 300px;
    height: 300px;
    background: rgba(99, 102, 241, 0.22);
    top: -80px;
    right: -60px;
  }

  &--b {
    width: 250px;
    height: 250px;
    background: rgba(16, 185, 129, 0.14);
    bottom: -80px;
    left: 30%;
  }
}

.ir-hero__content { position: relative; z-index: 1; }

.ir-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #c7d2fe;
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 20px;

  svg { width: 8px; height: 8px; }
}

.ir-hero__content h1 {
  margin: 0 0 14px;
  font-size: clamp(34px, 3.5vw, 54px);
  font-weight: 950;
  line-height: 1.1;
  letter-spacing: -0.5px;
}

.ir-hero__accent { color: #818cf8; }

.ir-hero__content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.9;
}

.ir-hero__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.ir-hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e0e7ff;
  font-size: 14px;
  font-weight: 900;

  svg { width: 16px; height: 16px; opacity: 0.8; }
}

/* Stats */
.ir-hero__stats {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}

.ir-stat {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  transition: background 0.2s ease;

  &:hover { background: rgba(255, 255, 255, 0.12); }
}

.ir-stat__icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.25);

  svg { width: 22px; height: 22px; stroke: #a5b4fc; }

  &--green  { background: rgba(16, 185, 129, 0.2); svg { stroke: #6ee7b7; } }
  &--amber  { background: rgba(245, 158, 11, 0.2); svg { stroke: #fcd34d; } }
}

.ir-stat__label {
  display: block;
  color: rgba(255, 255, 255, 0.62);
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 4px;
}

.ir-stat__value {
  display: block;
  color: #fff;
  font-size: 34px;
  font-weight: 950;
  line-height: 1;
}

/* ════════════════════════════════════════════════════
   TOOLBAR
════════════════════════════════════════════════════ */
.ir-toolbar {
  display: flex;
  gap: 14px;
  align-items: center;
}

.ir-toolbar__search {
  flex: 1;
  min-height: 62px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);

  input {
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: #0f172a;
    font-size: 16px;
    font-weight: 800;

    &::placeholder { color: #94a3b8; font-weight: 700; }
  }
}

.ir-toolbar__search-icon {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  stroke: #94a3b8;
}

.ir-toolbar__clear {
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  display: grid;
  place-items: center;

  svg { width: 16px; height: 16px; stroke: #94a3b8; }

  &:hover svg { stroke: #ef4444; }
}

.ir-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 62px;
  padding: 0 30px;
  border: 0;
  border-radius: 20px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  font-size: 15px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.32);
  transition: 0.22s ease;
  white-space: nowrap;

  svg { width: 18px; height: 18px; }

  &:hover { transform: translateY(-2px); box-shadow: 0 16px 36px rgba(99, 102, 241, 0.4); }
}

/* ════════════════════════════════════════════════════
   STATE VIEWS
════════════════════════════════════════════════════ */
.ir-state {
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px;
  border-radius: 28px;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
  gap: 14px;

  &__icon {
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: 22px;
    background: #f1f5f9;

    svg { width: 38px; height: 38px; stroke: #94a3b8; }
  }

  h3 {
    margin: 0;
    color: #0f172a;
    font-size: 26px;
    font-weight: 950;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 16px;
    font-weight: 800;
  }

  button {
    margin-top: 6px;
    border: 0;
    padding: 14px 24px;
    border-radius: 14px;
    background: #6366f1;
    color: #fff;
    font-size: 15px;
    font-weight: 950;
    cursor: pointer;
    transition: 0.2s ease;

    &:hover { background: #4f46e5; transform: translateY(-2px); }
  }

  &--error .ir-state__icon { background: #fef2f2; svg { stroke: #ef4444; } }
  &--error button           { background: #ef4444; &:hover { background: #dc2626; } }
}

.ir-spinner {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid #e0e7ff;
  border-top-color: #6366f1;
  animation: ir-spin 0.9s linear infinite;
}

/* ════════════════════════════════════════════════════
   USER CARDS GRID
════════════════════════════════════════════════════ */
.ir-users-grid {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ────── User Card */
.ir-user-card {
  border-radius: 30px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.07);
  /* Removed overflow: hidden so tooltips can break out */
  position: relative;
  z-index: 1;
  transition: z-index 0s;
}

.ir-user-card:hover {
  z-index: 5; /* Bring to front when hovering so tooltips don't go under other cards */
}

.ir-user-card__header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 26px 30px;
  background: linear-gradient(135deg, #f8faff 0%, #fff 100%);
  border-bottom: 1px solid #e8edf5;
  border-radius: 30px 30px 0 0; /* Match parent radius */
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%);
  }
}

.ir-user-card__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ir-user-card__toggle-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  color: #475569;
  transition: 0.2s ease;

  svg { 
    width: 20px; 
    height: 20px; 
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  svg.is-collapsed {
    transform: rotate(180deg);
  }

  &:hover { background: #e2e8f0; color: #0f172a; }
}

.ir-user-card__avatar {
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: linear-gradient(135deg, #4338ca, #6366f1);
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.28);

  svg { width: 30px; height: 30px; fill: #fff; }
}

.ir-user-card__info {
  flex: 1;
  min-width: 0;

  h2 {
    margin: 0 0 8px;
    color: #0f172a;
    font-size: 24px;
    font-weight: 950;
    line-height: 1.25;
  }
}

.ir-user-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ir-user-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  font-weight: 900;
  border: 1px solid #e2e8f0;

  svg { width: 13px; height: 13px; stroke: #94a3b8; }
}

.ir-user-card__farms-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 13px;
  font-weight: 900;
  border: 1px solid #c7d2fe;

  svg { width: 13px; height: 13px; stroke: #6366f1; }
}

.ir-user-card__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #4338ca, #6366f1);
  color: #fff;
  font-size: 14px;
  font-weight: 950;
  border: 0;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(99, 102, 241, 0.24);
  transition: 0.2s ease;
  white-space: nowrap;

  svg { width: 16px; height: 16px; }

  &:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(99, 102, 241, 0.32); }
}

/* ────── Farms inside user card */
.ir-farms-inside {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  padding: 22px 28px 28px;
  background: #f8fafc;
}

.ir-no-farms {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 800;

  svg { width: 18px; height: 18px; stroke: #cbd5e1; }
}

/* ────── Farm Block */
.ir-farm-block {
  display: flex;
  flex-direction: column;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #dbe3ee;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  /* Removed overflow: hidden */
  position: relative;
  z-index: 1;
  transition: box-shadow 0.25s ease, transform 0.25s ease, z-index 0s;

  &:hover { 
    box-shadow: 0 20px 46px rgba(15, 23, 42, 0.1); 
    transform: translateY(-2px); 
    z-index: 5; /* Bring farm block to front on hover */
  }
}

.ir-farm-block__header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #f0f9ff, #fff);
  border-bottom: 1px solid #e0f2fe;
  border-radius: 22px 22px 0 0;
}

.ir-farm-block__icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: linear-gradient(135deg, #0369a1, #0ea5e9);
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.22);

  svg { width: 22px; height: 22px; stroke: #fff; }
}

.ir-farm-block__info { flex: 1; min-width: 0; }

.ir-farm-block__label {
  display: block;
  color: #0ea5e9;
  font-size: 12px;
  font-weight: 950;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ir-farm-block__info h3 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 950;
  line-height: 1.3;
}

.ir-farm-block__badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  min-height: 58px;
  padding: 8px;
  border-radius: 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  font-size: 24px;
  font-weight: 950;
  line-height: 1;

  span { font-size: 11px; font-weight: 950; color: #0ea5e9; margin-top: 2px; }
}

/* ────── Preview records */
.ir-preview-records {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 18px;
  background: #f8fafc;
  flex: 1;
}

.ir-preview-record {
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
  position: relative;
  z-index: 1;
  transition: z-index 0s;
  
  &:hover {
    z-index: 10;
  }
}

.ir-preview-record__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 18px;
  background: #fcfcfd;
  border-bottom: 1px solid #f1f5f9;
  border-radius: 16px 16px 0 0;
}

.ir-preview-record__date { display: flex; align-items: center; gap: 8px; }

.ir-preview-record__month {
  padding: 6px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #fff;
  font-size: 13px;
  font-weight: 950;
}

.ir-preview-record__year {
  padding: 6px 12px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
}

.ir-preview-record__actions { display: flex; gap: 6px; }

.ir-act-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.18s ease;

  svg { width: 14px; height: 14px; }

  &--edit {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    svg { stroke: #3b82f6; }
    &:hover { background: #dbeafe; transform: scale(1.1); }
  }

  &--delete {
    background: #fef2f2;
    border: 1px solid #fecaca;
    svg { stroke: #ef4444; }
    &:hover { background: #fee2e2; transform: scale(1.1); }
  }
}

.ir-preview-record__body {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ir-preview-record__field {}

.ir-preview-record__field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
  margin-bottom: 8px;

  svg { width: 16px; height: 16px; stroke: #6366f1; }
}

.ir-preview-record__field-text {
  margin: 0;
  color: #475569;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.7;

  &--clamp1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Thought Bubble Tooltip */
.ir-thought-bubble-container {
  position: relative;
}

.ir-thought-bubble {
  position: absolute;
  bottom: 100%;
  right: 15px; /* Aligned with text roughly */
  transform: translateY(10px) scale(0.95);
  transform-origin: bottom right;
  margin-bottom: 25px; /* space for tail */
  width: max-content;
  max-width: 360px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.4);
  padding: 14px 20px;
  border-radius: 20px;
  color: #f8fafc;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.6;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 999;
  white-space: pre-wrap;
  word-break: break-word;
}

.ir-bubble-tail-1 {
  position: absolute;
  bottom: -10px;
  right: 20px;
  width: 14px;
  height: 14px;
  background: #1e293b;
  border-radius: 50%;
  box-shadow: 0 4px 6px rgba(15, 23, 42, 0.1);
}

.ir-bubble-tail-2 {
  position: absolute;
  bottom: -20px;
  right: 28px;
  width: 7px;
  height: 7px;
  background: #0f172a;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.1);
}

.ir-thought-bubble-container:hover .ir-thought-bubble {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.ir-preview-record__divider {
  height: 1px;
  background: #e2e8f0;
  margin: 6px 0;
  border-radius: 1px;
}

.ir-preview-record__empty {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 800;
  text-align: center;
  padding: 8px 0;
}

/* ────── Farm Block Footer */
.ir-farm-block__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 14px 18px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
  border-radius: 0 0 22px 22px;
}

.ir-show-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #fff;
  font-size: 13px;
  font-weight: 950;
  border: 0;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.2);
  transition: 0.2s ease;

  svg { width: 15px; height: 15px; stroke: #94a3b8; }

  &__count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 8px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    font-size: 12px;
    font-weight: 950;
  }

  &__arrow { width: 14px !important; height: 14px !important; stroke: #a5b4fc !important; }

  &:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.28); }
}

.ir-farm-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  background: #f0f9ff;
  color: #0369a1;
  font-size: 13px;
  font-weight: 950;
  border: 1px solid #bae6fd;
  cursor: pointer;
  transition: 0.18s ease;

  svg { width: 14px; height: 14px; }

  &:hover { background: #e0f2fe; transform: translateY(-1px); }
}

/* ════════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════════ */
.ir-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  padding: 20px;
}

.ir-modal {
  width: 100%;
  max-width: 680px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 26px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 40px 80px rgba(15, 23, 42, 0.24);
  overflow: hidden;

  &--sm { max-width: 460px; }
}

.ir-modal__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 26px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #f8fafc, #fff);

  &--danger {
    background: linear-gradient(135deg, #fef2f2, #fff);
    border-bottom-color: #fecaca;
  }

  h2 { margin: 0; color: #0f172a; font-size: 20px; font-weight: 950; }
  p  { margin: 4px 0 0; color: #64748b; font-size: 13px; font-weight: 800; }
}

.ir-modal__header-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #eef2ff;

  svg { width: 22px; height: 22px; stroke: #6366f1; }

  &--danger { background: #fef2f2; svg { stroke: #ef4444; } }
}

.ir-modal__close {
  margin-right: auto;
  margin-left: 0;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: #f1f5f9;
  cursor: pointer;
  transition: 0.15s ease;

  svg { width: 15px; height: 15px; stroke: #64748b; }

  &:hover { background: #e2e8f0; svg { stroke: #0f172a; } }
}

.ir-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ir-modal__footer {
  padding: 18px 26px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

/* ────── Form */
.ir-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.ir-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ir-form-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;

  svg { width: 15px; height: 15px; stroke: #64748b; flex: 0 0 15px; }
}

.ir-required { color: #ef4444; }

.ir-form-select,
.ir-form-textarea {
  padding: 13px 16px;
  border-radius: 14px;
  border: 1.5px solid #dbe3ee;
  background: #f8fafc;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  font-family: inherit;
  direction: rtl;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    background: #fff;
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
}

.ir-form-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.7;
}

.ir-form-error {
  color: #ef4444;
  font-size: 12px;
  font-weight: 900;
}

/* ────── Buttons */
.ir-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 13px;
  font-size: 14px;
  font-weight: 950;
  border: 0;
  cursor: pointer;
  transition: 0.2s ease;

  svg { width: 16px; height: 16px; }

  &--primary {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    box-shadow: 0 10px 22px rgba(99, 102, 241, 0.28);
    svg { stroke: rgba(255,255,255,0.85); }

    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(99, 102, 241, 0.36); }
    &:disabled { opacity: 0.65; cursor: not-allowed; }
  }

  &--danger {
    background: linear-gradient(135deg, #dc2626, #ef4444);
    color: #fff;
    box-shadow: 0 10px 22px rgba(239, 68, 68, 0.26);
    svg { stroke: rgba(255,255,255,0.85); }

    &:hover:not(:disabled) { transform: translateY(-2px); }
    &:disabled { opacity: 0.65; cursor: not-allowed; }
  }

  &--ghost {
    background: #f1f5f9;
    color: #475569;
    &:hover { background: #e2e8f0; }
  }
}

.ir-btn-spin {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  animation: ir-spin 0.8s linear infinite;
}

/* ────── Delete body */
.ir-delete-body {
  text-align: center;
  padding: 10px 0;

  &__warn {
    width: 72px;
    height: 72px;
    margin: 0 auto 18px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: #fffbeb;
    border: 2px solid #fde68a;

    svg { width: 34px; height: 34px; stroke: #d97706; }
  }

  p {
    color: #0f172a;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.8;
    margin: 0;
    strong { color: #4f46e5; }
  }
}

/* ════════════════════════════════════════════════════
   ANIMATIONS
════════════════════════════════════════════════════ */
@keyframes ir-spin {
  to { transform: rotate(360deg); }
}

.ir-fade-enter-active,
.ir-fade-leave-active { transition: opacity 0.3s ease; }
.ir-fade-enter-from,
.ir-fade-leave-to     { opacity: 0; }

.ir-scale-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.ir-scale-leave-active { transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1); }
.ir-scale-enter-from,
.ir-scale-leave-to    { opacity: 0; transform: scale(0.96) translateY(8px); }

/* ════════════════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════════════════ */
@media (max-width: 1100px) {
  .ir-hero { grid-template-columns: 1fr; }
  .ir-hero__stats { flex-direction: row; }
  .ir-stat { flex: 1; }
}

@media (max-width: 860px) {
  .ir-farms-inside { grid-template-columns: 1fr; }
  .ir-form-row     { grid-template-columns: 1fr; }
}

@media (max-width: 680px) {
  .ir-hero { padding: 24px; border-radius: 24px; }
  .ir-hero__content h1 { font-size: 32px; }
  .ir-hero__stats { flex-direction: column; }

  .ir-toolbar { flex-direction: column; align-items: stretch; }
  .ir-add-btn { justify-content: center; }

  .ir-user-card__header { flex-wrap: wrap; }
  .ir-farms-inside { padding: 14px 16px; gap: 14px; }
}
</style>
