<template>
<<<<<<< HEAD

    <NavBar />
=======
>>>>>>> f77cbab (Fixed debug for progress2)
    <div class="container max-w-full">
        <router-view />
    </div>
</template>

<script lang="ts">
    import NavBar from '../components/NavBar.vue';
    import Footer from '../components/Footer.vue';
    import { defineComponent } from 'vue';

    export default defineComponent({
        components: {
            NavBar,
            Footer
        }
    });

</script>