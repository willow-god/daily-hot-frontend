<template>
  <n-card
    :header-style="{ padding: '16px' }"
    :content-style="{ padding: '0 16px' }"
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
  border-radius: 8px;
  border: 1px solid rgba(32, 31, 28, 0.1);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(250, 247, 240, 0.8)),
    radial-gradient(circle at 12% 10%, rgba(255, 255, 255, 0.9), transparent 34%),
    repeating-linear-gradient(
      0deg,
      rgba(36, 34, 30, 0.018) 0,
      rgba(36, 34, 30, 0.018) 1px,
      transparent 1px,
      transparent 18px
    );
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    inset 0 -1px 0 rgba(38, 36, 31, 0.035),
    0 16px 34px rgba(34, 32, 28, 0.08);
  transition:
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    transform 0.28s ease,
    background-color 0.28s ease;
  cursor: pointer;

  &:hover {
    border-color: rgba(44, 112, 103, 0.28);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.95),
      inset 0 -1px 0 rgba(38, 36, 31, 0.04),
      0 22px 52px rgba(34, 32, 28, 0.13);
    transform: translateY(-4px);
  }

  &.is-error {
    border-color: rgba(177, 65, 65, 0.24);
    background:
      linear-gradient(180deg, rgba(255, 250, 247, 0.98), rgba(250, 244, 238, 0.82)),
      repeating-linear-gradient(
        0deg,
        rgba(177, 65, 65, 0.045) 0,
        rgba(177, 65, 65, 0.045) 1px,
        transparent 1px,
        transparent 18px
      );
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
      background: linear-gradient(
        90deg,
        rgba(32, 31, 28, 0.14),
        rgba(32, 31, 28, 0.04) 62%,
        transparent
      );
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
        font-weight: 700;
        letter-spacing: 0;
        line-height: 1;
      }
    }

    .subtitle {
      margin-left: auto;
      font-size: 12px;
      white-space: nowrap;
    }

    .error-subtitle {
      color: #b7353e;
    }
  }

  .message {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    font-size: 12px;
    height: 24px;

    .time {
      padding: 0;
    }
  }

  .error-message {
    align-items: center;
  }

  :deep(.news-list) {
    height: 300px;

    .n-scrollbar-rail {
      right: 0;
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 0 0;

      .n-result {
        --n-title-font-size: 18px;
      }

      .n-button {
        margin-top: 12px;
        border-radius: 6px;
      }
    }

    .loading {
      display: flex;
      flex-direction: column;
      height: 300px;
      justify-content: space-between;
    }
  }

  .lists {
    padding: 8px 6px 0 0;

    .item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      padding: 5px 7px 5px 2px;
      min-height: 30px;
      border-radius: 6px;
      transition:
        box-shadow 0.24s ease,
        background-color 0.24s ease,
        transform 0.24s ease;
      cursor: pointer;

      &:nth-last-of-type(1) {
        margin-bottom: 0;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.62);
        box-shadow:
          inset 0 0 0 1px rgba(38, 36, 31, 0.06),
          0 8px 18px rgba(38, 36, 31, 0.055);
        transform: translateX(2px);
      }

      &:hover .num {
        background-color: rgba(32, 31, 28, 0.12);
      }

      .num {
        width: 26px;
        height: 26px;
        min-width: 26px;
        margin-right: 10px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(32, 31, 28, 0.075);
        border-radius: 6px;
        font-variant-numeric: tabular-nums;
        transition:
          background-color 0.24s ease,
          transform 0.24s ease;

        &.one {
          background-color: #b7353e;
          color: #fff;
        }

        &.two {
          background-color: #8f6b2d;
          color: #fff;
        }

        &.three {
          background-color: #2f756b;
          color: #fff;
        }
      }

      .text {
        position: relative;
        display: inline-block;
        width: 100%;
        line-height: 1.55;
        color: rgba(29, 28, 25, 0.92);
        transition:
          color 0.24s ease,
          transform 0.24s ease;

        @media (min-width: 768px) {
          &:hover {
            color: #164f49;
            transform: translateX(2px);
          }
        }

        @media (max-width: 768px) {
          &:active {
            color: #d83942;
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
