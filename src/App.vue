<script setup>
import navBar from "./components/navBar.vue"
import navBar2 from "./components/navBar2.vue"
import Header from "./components/header.vue"
import Footer from "./components/footer.vue"

</script>

<template>
  <div class="app-wrapper">
    <Header />
    <navBar2 />
    <!-- <navBar/> -->
    <RouterView />
    <Footer />
    <!-- <bottomBar/> -->
  </div>
</template>

<style scoped lang="scss">
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
