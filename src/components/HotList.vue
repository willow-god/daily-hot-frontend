<template>
  <n-card
    :header-style="{ padding: '16px' }"
    :content-style="{ padding: 0 }"
    :footer-style="{ padding: '16px' }"
    :id="`hot-list-${hotData.name}`"
    class="hot-list"
    :class="{ 'is-error': loadingError }"
    hoverable
    @click="toList"
  >
    <template #header>
      <n-space class="title" justify="space-between">
        <div class="name">
          <n-avatar
            class="ico"
            :src="`/logo/${hotData.name}.png`"
            fallback-src="/ico/icon_error.png"
          />
          <n-text class="name-text">{{ hotData.label }}</n-text>
        </div>
        <n-text v-if="hotListData?.type" class="subtitle" :depth="2">
          {{ hotListData.type }}
        </n-text>
        <n-skeleton v-else-if="!loadingError" width="60px" text round />
        <n-text v-else class="subtitle error-subtitle">跳过中</n-text>
      </n-space>
    </template>
    <n-scrollbar class="news-list" ref="scrollbarRef">
      <Transition name="fade" mode="out-in">
        <div v-if="loadingError" class="error">
          <n-result
            size="small"
            status="500"
            title="加载失败"
            description="3 秒后自动跳过该来源"
          />
          <n-button
            size="small"
            secondary
            strong
            @click.stop="getHotListsData(hotData.name)"
          >
            <template #icon>
              <n-icon :component="Refresh" />
            </template>
            重试
          </n-button>
        </div>
        <div v-else-if="!hotListData || listLoading" class="loading">
          <n-skeleton text round :repeat="10" height="20px" />
        </div>
        <div v-else class="lists" :id="hotData.name + 'Lists'">
          <div
            class="item"
            v-for="(item, index) in hotListData.data.slice(0, 15)"
            :key="item.url || item.mobileUrl || item.title"
          >
            <n-text
              class="num"
              :class="
                index === 0
                  ? 'one'
                  : index === 1
                  ? 'two'
                  : index === 2
                  ? 'three'
                  : null
              "
              :depth="2"
              >{{ index + 1 }}</n-text
            >
            <n-text
              :style="{ fontSize: store.listFontSize + 'px' }"
              class="text"
              @click.stop="jumpLink(item)"
            >
              {{ item.title }}
            </n-text>
          </div>
        </div>
      </Transition>
    </n-scrollbar>
    <template #footer>
      <Transition name="fade" mode="out-in">
        <template v-if="loadingError">
          <div class="message error-message">
            <n-text class="time" :depth="3">连接异常，正在移出队列</n-text>
          </div>
        </template>
        <template v-else-if="!hotListData">
          <div class="loading footer-loading">
            <n-skeleton text round />
          </div>
        </template>
        <template v-else>
          <div class="message">
            <n-text class="time" :depth="3" v-if="updateTime">
              {{ updateTime }}
            </n-text>
            <n-text class="time" :depth="3" v-else> 获取失败 </n-text>
            <n-space class="controls">
              <n-popover v-if="hotListData.data.length > 15">
                <template #trigger>
                  <n-button
                    size="tiny"
                    secondary
                    strong
                    @click.stop="toList"
                  >
                    <template #icon>
                      <n-icon :component="More" />
                    </template>
                  </n-button>
                </template>
                查看更多
              </n-popover>
              <n-popover>
                <template #trigger>
                  <n-button
                    size="tiny"
                    secondary
                    strong
                    @click.stop="getNewData"
                  >
                    <template #icon>
                      <n-icon :component="Refresh" />
                    </template>
                  </n-button>
                </template>
                获取最新
              </n-popover>
            </n-space>
          </div>
        </template>
      </Transition>
    </template>
  </n-card>
</template>

<script setup>
import { Refresh, More } from "@icon-park/vue-next";
import { getHotLists } from "@/api";
import { formatTime } from "@/utils/getTime";
import { mainStore } from "@/store";
import { useRouter } from "vue-router";

const router = useRouter();
const store = mainStore();
const emit = defineEmits(["load-failed"]);
const props = defineProps({
  hotData: {
    type: Object,
    default: () => ({}),
  },
});

const updateTime = ref(null);
const lastClickTime = ref(
  Number(localStorage.getItem(`${props.hotData.name}Btn`) || 0)
);
const hotListData = ref(null);
const scrollbarRef = ref(null);
const listLoading = ref(false);
const loadingError = ref(false);

let hideFailedCardTimer = null;
let observer = null;

const clearFailedCardTimer = () => {
  if (hideFailedCardTimer) {
    clearTimeout(hideFailedCardTimer);
    hideFailedCardTimer = null;
  }
};

const scheduleFailedCardHide = () => {
  clearFailedCardTimer();
  hideFailedCardTimer = setTimeout(() => {
    emit("load-failed", props.hotData.name);
  }, 3000);
};

const handleLoadFailure = (message) => {
  listLoading.value = false;
  loadingError.value = true;
  $message.error(message);
  scheduleFailedCardHide();
};

const getHotListsData = async (name, isNew = false) => {
  try {
    clearFailedCardTimer();
    loadingError.value = false;
    const item = store.newsArr.find((item) => item.name === name);

    if (!item) {
      handleLoadFailure("榜单配置不存在，请刷新后重试");
      return;
    }

    const result = await getHotLists(item.name, isNew, item.params);

    if (result.code === 200) {
      listLoading.value = false;
      hotListData.value = result;
      if (scrollbarRef.value) {
        scrollbarRef.value.scrollTo({ position: "top", behavior: "smooth" });
      }
    } else {
      handleLoadFailure(result.title + result.message);
    }
  } catch (error) {
    handleLoadFailure("热榜加载失败，请稍后重试");
  }
};

const getNewData = () => {
  const now = Date.now();
  if (now - lastClickTime.value > 60000) {
    listLoading.value = true;
    getHotListsData(props.hotData.name, true);
    lastClickTime.value = now;
    localStorage.setItem(`${props.hotData.name}Btn`, now);
  } else {
    $message.info("请稍后再刷新");
  }
};

const jumpLink = (data) => {
  const url = window.innerWidth > 680 ? data.url : data.mobileUrl || data.url;
  if (!url) return $message.error("链接不存在");
  if (store.linkOpenType === "open") {
    window.open(url, "_blank");
  } else if (store.linkOpenType === "href") {
    window.location.href = url;
  }
};

const toList = () => {
  if (props.hotData.name) {
    router.push({
      path: "/list",
      query: {
        type: props.hotData.name,
      },
    });
  } else {
    $message.error("数据出错，请重试");
  }
};

const checkListShow = () => {
  const typeName = props.hotData.name;
  const listDom = document.getElementById("hot-list-" + typeName);

  if (!listDom) return;

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        getHotListsData(props.hotData.name);
        observer.unobserve(entry.target);
      }
    });
  });
  observer.observe(listDom);
};

watch(
  () => store.timeData,
  () => {
    if (hotListData.value) {
      updateTime.value = formatTime(hotListData.value.updateTime);
    }
  }
);

onMounted(() => {
  checkListShow();
});

onBeforeUnmount(() => {
  clearFailedCardTimer();
  observer?.disconnect();
});
</script>

<style lang="scss" scoped>
.hot-list {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--hot-card-border);
  background: var(--hot-card-bg);
  box-shadow: var(--hot-card-shadow);
  color: var(--hot-card-text);
  transition:
    background-color 0.24s ease,
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s ease;
  cursor: pointer;

  :deep(.n-text) {
    color: var(--hot-card-text);
  }

  &:hover {
    border-color: var(--hot-card-border-hover);
    background: var(--hot-card-bg-hover);
    box-shadow: var(--hot-card-shadow-hover);
    transform: translateY(-4px);
  }

  &.is-error {
    border-color: var(--hot-card-border-hover);
    background: var(--hot-card-bg-hover);
  }

  .title {
    display: flex;
    align-items: center;
    font-size: 16px;
    height: 26px;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -14px;
      height: 1px;
      background: var(--hot-row-border-hover);
    }

    .name {
      display: flex;
      align-items: center;
      min-width: 0;

      .n-avatar {
        background-color: transparent;
        width: 24px;
        height: 24px;
        margin-right: 10px;
        filter: saturate(0.88) contrast(1.04);
      }

      .name-text {
        color: var(--hot-card-text);
        font-weight: 700;
        letter-spacing: 0;
        line-height: 1;
      }
    }

    .subtitle {
      color: var(--hot-card-subtext);
      margin-left: auto;
      font-size: 12px;
      white-space: nowrap;
    }

    .error-subtitle {
      color: var(--hot-card-subtext);
    }
  }

  .message {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    font-size: 12px;
    height: 24px;

    .time {
      color: var(--hot-card-subtext);
      padding: 0;
    }
  }

  .error-message {
    align-items: center;
  }

  :deep(.news-list) {
    height: 300px;

    .n-scrollbar-rail {
      right: 3px;
      width: 6px;
    }

    .n-scrollbar-rail__scrollbar {
      border-radius: 999px;
      background-color: var(--hot-scrollbar);
    }

    .n-scrollbar-rail__scrollbar:hover {
      background-color: var(--hot-scrollbar-hover);
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 18px 0 16px;

      .n-result {
        --n-title-font-size: 18px;
      }

      .n-button {
        margin-top: 12px;
        border-radius: 10px;
      }
    }

    .loading {
      display: flex;
      flex-direction: column;
      height: 300px;
      justify-content: space-between;
      padding: 0 18px 0 16px;
      box-sizing: border-box;
    }
  }

  .lists {
    padding: 10px 18px 0 16px;

    .item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      padding: 5px 8px;
      min-height: 30px;
      border-radius: 10px;
      transition:
        box-shadow 0.24s ease,
        background-color 0.24s ease,
        transform 0.24s ease;
      cursor: pointer;

      &:nth-last-of-type(1) {
        margin-bottom: 0;
      }

      &:hover {
        background: var(--hot-row-bg-hover);
        box-shadow:
          inset 0 0 0 1px var(--hot-row-border-hover),
          0 8px 18px rgba(0, 0, 0, 0.06);
        transform: translateX(2px);
      }

      &:hover .num {
        background-color: var(--hot-muted-bg);
      }

      .num {
        color: var(--hot-card-text);
        width: 26px;
        height: 26px;
        min-width: 26px;
        margin-right: 10px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--hot-muted-bg);
        border-radius: 9px;
        font-variant-numeric: tabular-nums;
        transition:
          background-color 0.24s ease,
          transform 0.24s ease;

        &.one {
          background-color: var(--hot-muted-bg);
        }

        &.two {
          background-color: var(--hot-muted-bg);
        }

        &.three {
          background-color: var(--hot-muted-bg);
        }
      }

      .text {
        position: relative;
        display: inline-block;
        width: 100%;
        line-height: 1.55;
        color: var(--hot-card-text);
        transition:
          color 0.24s ease,
          transform 0.24s ease;

        @media (min-width: 768px) {
          &:hover {
            transform: translateX(2px);
          }
        }

        @media (max-width: 768px) {
          &:active {
            transform: translateX(1px);
          }
        }
      }
    }
  }

  :deep(.n-card-header) {
    .loading {
      height: 26px;
    }
  }

  :deep(.n-card__footer) {
    .footer-loading {
      height: 24px;
    }
  }
}
</style>
