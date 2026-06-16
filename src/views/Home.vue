<template>
  <div class="home">
    <n-grid
      v-if="visibleNewsArr.length"
      cols="1 560:2 800:3 1100:4 1500:5"
      :x-gap="24"
      :y-gap="24"
    >
      <n-grid-item
        class="news-card"
        v-for="(item, index) in visibleNewsArr"
        :key="item.name"
        :style="{ animationDelay: index / 10 + 0.2 + 's' }"
      >
        <HotList :hotData="item" @load-failed="hideFailedCard" />
      </n-grid-item>
    </n-grid>
    <div class="error" v-else>
      <n-divider dashed class="tip"> 此处暂无内容 </n-divider>
      <n-space justify="center">
        <n-button size="large" secondary strong @click="reset">
          出错了？点击重置
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import HotList from "@/components/HotList.vue";

const store = mainStore();
const hiddenFailedNames = ref(new Set());

const visibleNewsArr = computed(() =>
  store.newsArr.filter(
    (item) => item.show && !hiddenFailedNames.value.has(item.name)
  )
);

const hideFailedCard = (name) => {
  hiddenFailedNames.value = new Set([...hiddenFailedNames.value, name]);
};

const reset = () => {
  $dialog.warning({
    title: "重置站点",
    content:
      "确认重置站点？你的自定义数据将会恢复为默认状态。（当设置页面能正常进入并显示时请不要执行此操作。）",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      if ($timeInterval) clearInterval($timeInterval);
      localStorage.clear();
      location.reload();
    },
  });
};
</script>

<style lang="scss" scoped>
.home {
  position: relative;

  .news-card {
    opacity: 0;
    transform: translateY(20px);
    animation: cardShow 0.45s forwards cubic-bezier(0.22, 1, 0.36, 1);
  }

  .tip {
    font-size: 22px;
  }
}

@keyframes cardShow {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
