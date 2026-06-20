<template>
  <div class="flex min-h-screen bg-slate-100">
    <AdminSideBar />
    <main class="admin-content flex-1 p-6 md:p-8 overflow-auto">
      <router-view />
    </main>
    <AdminToast />
  </div>
</template>
            
            
<script lang="ts">
import { defineComponent } from 'vue'
import AdminSideBar from '../components/Admin_SideBar.vue'
import AdminToast from '../components/AdminToast.vue'
z
export default defineComponent({
  components: { AdminSideBar, AdminToast },
})
</script>