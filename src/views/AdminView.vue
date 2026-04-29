<template>
    <div class="flex h-screen">
        <div class="h-full">
            <AdminSideBar />
        </div>
        <main class="admin-content w-full">
            <router-view />
        </main>
    </div>
</template>
            
            
<script lang="ts">
    import { defineComponent } from 'vue'
    import AdminSideBar from '../components/Admin_SideBar.vue'
    export default defineComponent({ components: { AdminSideBar } }) 
</script>