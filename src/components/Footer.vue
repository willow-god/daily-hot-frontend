<template>
  <footer>
    <div class="copyright">
      Own By 
      <n-text 
        class="own-by"
        :depth="3"
         @click="jumpLink('https://www.liushen.fun/')">LiuShen</n-text>
       | Built By 
      <n-text 
        class="built-by"
        :depth="3"
        @click="jumpLink('https://github.com/willow-god')"
      >willow-god</n-text>
      | Contact Me By
      <n-text 
        class="built-by"
        :depth="3"
        @click="jumpLink('mailto:01@liushen.fun')"
      >Email</n-text>
    </div>
    <div class="copyright">
      <n-text class="description" v-html="packageJson.description" />
      <n-text
        class="author"
        :depth="3"
        v-html="packageJson.author"
        @click="jumpLink(packageJson.github)"
      />
    </div>
    <div class="copyright">
      <n-text
      v-if="gongan"
      :depth="3"
      class="icp"
      v-html="gongan"
      @click="jumpLink('https://beian.mps.gov.cn/#/query/webSearch?code=61011602000637')"
    />
     | 
     <n-text
      v-if="icp"
      :depth="3"
      class="icp"
      v-html="icp"
      @click="jumpLink('https://beian.miit.gov.cn/')"
    />
    </div>
  </footer>
</template>

<script setup>
import packageJson from "@/../package.json";

const icp = ref(import.meta.env.VITE_ICP ? import.meta.env.VITE_ICP : null);

const gongan = ref(import.meta.env.VITE_GONGAN? import.meta.env.VITE_GONGAN : null);

// 链接跳转
const jumpLink = (url) => {
  window.open(url);
};
</script>

<style lang="scss" scoped>
footer {
  height: 100px;
  padding: 0 5vw;
  max-width: 1800px;
  margin: 20px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .copyright {
    margin-bottom: 4px;
    .description {
      &::after {
        content: "@ License By";
        margin: 0 6px;
      }
    }
  }
  .author {
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
  .icp {
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
}
</style>
