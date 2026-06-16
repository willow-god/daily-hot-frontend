<template>
  <Provider>
    <n-layout
      embedded
      :native-scrollbar="false"
      :class="[
        store.headerFixed ? 'fixed' : null,
        store.siteTheme === 'dark' ? 'theme-dark' : 'theme-light',
      ]"
    >
      <div class="site-background" aria-hidden="true">
        <div class="site-background__image"></div>
        <div class="site-background__mask"></div>
      </div>
      <div class="site-content">
        <n-back-top :visibility-height="2" @update:show="backTopChange" />
        <Header :class="headerShow ? 'show' : null" />
        <main>
          <router-view v-slot="{ Component }">
            <keep-alive>
              <transition name="scale" mode="out-in">
                <component :is="Component" />
              </transition>
            </keep-alive>
          </router-view>
        </main>
        <Footer />
      </div>
    </n-layout>
  </Provider>
</template>

<script setup>
import { mainStore } from "@/store";
import Provider from "@/components/Provider.vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const store = mainStore();

// 顶栏显隐
const headerShow = ref(false);

// 回顶按钮显隐
const backTopChange = (val) => {
  headerShow.value = val;
};

onMounted(() => {
  store.checkNewsUpdate();
  // 写入默认
  nextTick(() => {
    if (store.newsArr.length === 0) {
      store.newsArr = store.defaultNewsArr;
    }
  });
});
</script>

<style lang="scss" scoped>
.n-layout {
  height: 100%;
  position: relative;
  background-color: var(--site-bg-color);
  color: var(--site-text-color);

  &.theme-light {
    --site-bg-color: #f6f6f4;
    --site-bg-overlay: rgba(255, 255, 255, 0.82);
    --site-text-color: #171717;
    --hot-card-text: #111111;
    --hot-card-subtext: #4f4f4f;
    --hot-card-bg: rgba(255, 255, 255, 0.7);
    --hot-card-bg-hover: rgba(255, 255, 255, 0.8);
    --hot-card-border: rgba(255, 255, 255, 0.72);
    --hot-card-border-hover: rgba(20, 20, 20, 0.28);
    --hot-card-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
    --hot-card-shadow-hover: 0 24px 64px rgba(0, 0, 0, 0.24);
    --hot-row-bg-hover: rgba(0, 0, 0, 0.055);
    --hot-row-border-hover: rgba(0, 0, 0, 0.1);
    --hot-muted-bg: rgba(0, 0, 0, 0.07);
    --hot-scrollbar: rgba(0, 0, 0, 0.34);
    --hot-scrollbar-hover: rgba(0, 0, 0, 0.52);
  }

  &.theme-dark {
    --site-bg-color: #090909;
    --site-bg-overlay: rgba(0, 0, 0, 0.58);
    --site-text-color: #f3f3f3;
    --hot-card-text: #f7f7f7;
    --hot-card-subtext: #c9c9c9;
    --hot-card-bg: rgba(0, 0, 0, 0.56);
    --hot-card-bg-hover: rgba(0, 0, 0, 0.66);
    --hot-card-border: rgba(255, 255, 255, 0.14);
    --hot-card-border-hover: rgba(255, 255, 255, 0.36);
    --hot-card-shadow: 0 18px 54px rgba(0, 0, 0, 0.46);
    --hot-card-shadow-hover: 0 26px 72px rgba(0, 0, 0, 0.62);
    --hot-row-bg-hover: rgba(255, 255, 255, 0.08);
    --hot-row-border-hover: rgba(255, 255, 255, 0.12);
    --hot-muted-bg: rgba(255, 255, 255, 0.1);
    --hot-scrollbar: rgba(255, 255, 255, 0.34);
    --hot-scrollbar-hover: rgba(255, 255, 255, 0.56);
  }

  .site-background {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;

    &__image,
    &__mask {
      position: absolute;
      inset: 0;
    }

    &__image {
      background-image: url("https://bing.liushen.fun/api/daily");
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      filter: blur(16px);
      transform: scale(1.08);
    }

    &__mask {
      background: var(--site-bg-overlay);
    }
  }

  .site-content {
    position: relative;
    z-index: 1;
    min-height: 100%;
  }

  &.fixed {
    .header {
      width: 100%;
      margin: 0;
      position: fixed;
      z-index: 10;
      top: 0;
      left: 0;
      box-sizing: border-box;
      &.show {
        height: 70px;
        border-bottom: 1px solid var(--n-border-color);
        background-color: var(--n-color);
        :deep(section) {
          .logo {
            img {
              width: 40px;
              height: 40px;
            }
            .name {
              span {
                &:nth-of-type(1) {
                  font-size: 18px;
                }
              }
            }
          }
        }
      }
    }
    main {
      padding: 118px 5vw 0 5vw;
    }
  }
  :deep(.n-scrollbar-rail) {
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 3;
  }
  main {
    padding: 0 5vw;
    max-width: 1800px;
    margin: 0 auto;
    min-height: calc(100vh - 238px);
  }
}

// 路由跳转动画
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
