<script lang="ts">
    import { defineComponent } from 'vue'
    export default defineComponent({})
</script>

<template>
<div class="h-full max-w-full">
    <div class="w-80 h-full bg-blue-900 text-white p-4 flex flex-col">
        
        <div class="flex items-center gap-4">
            <img src="/logo.png" alt="Logo" class="w-10">
            <h2 class="text-xl font-bold">តោះទៅ! <span>Cambodia</span></h2>
        </div>
        <ul class="mt-20 flex flex-col flex-1">
            <h1 class="font-bold text-xl mb-5">Menu</h1>
            <li class="p-4 hover:bg-blue-950 cursor-pointer rounded-lg">Dashboard</li>
            <li class="p-4 hover:bg-blue-950 cursor-pointer rounded-lg">Products</li>
            <li class="p-4 hover:bg-blue-950 cursor-pointer rounded-lg">Orders</li>
            <li class="p-4 hover:bg-blue-950 cursor-pointer rounded-lg">Customers</li>
            <li class="p-4 hover:bg-blue-950 cursor-pointer rounded-lg">Reports</li>
            <li class="p-4 hover:bg-blue-950 cursor-pointer rounded-lg mt-auto">Settings</li>
        </ul>
        
    </div>
</div>
</template>