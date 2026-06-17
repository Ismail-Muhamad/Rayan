<template>
  <div class="farm-tasks-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="page-title">مهام زراعية</h2>
    </div>
    <div class="card p-4">
      <p class="text-muted text-center py-5">لا توجد مهام زراعية حتى الآن.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "FarmTasks",
};
</script>

<style scoped>
.farm-tasks-page {
  padding: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}
</style>
