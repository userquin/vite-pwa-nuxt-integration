<script setup lang="ts">
import { type RegisterSWOptions, useRegisterSW } from 'virtual:pwa-register/vue'

const props = withDefaults(defineProps<{
  immediate?: RegisterSWOptions['immediate']
  onNeedRefresh?: RegisterSWOptions['onNeedRefresh']
  onOfflineReady?: RegisterSWOptions['onOfflineReady']
  /**
   * Called only if `onRegisteredSW` is not provided.
   *
   * @deprecated Use `onRegisteredSW` instead.
   * @param registration The service worker registration if available.
   */
  onRegistered?: RegisterSWOptions['onRegistered']
  /**
   * Called once the service worker is registered (requires version `0.12.8+`).
   *
   * @param swScriptUrl The service worker script url.
   * @param registration The service worker registration if available.
   */
  onRegisteredSw?: RegisterSWOptions['onRegisteredSW']
  onRegisterError?: RegisterSWOptions['onRegisterError']
}>(), {
  immediate: true,
})

const { onRegisteredSw, ...rest } = props
const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
  ...rest, onRegisteredSW: onRegisteredSw,
})
const cancelPWAPrompt = () => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <template v-if="needRefresh || offlineReady">
    <slot v-bind="{ cancelPWAPrompt, needRefresh, offlineReady, updateServiceWorker }" />
  </template>
</template>
