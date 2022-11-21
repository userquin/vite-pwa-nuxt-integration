import { addComponent, createResolver, defineNuxtModule, extendWebpackConfig } from '@nuxt/kit'
import type { VitePluginPWAAPI } from 'vite-plugin-pwa'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'
import type { VitePWANuxtOptions } from './types'
import { configurePWAOptions } from './config'

export * from './types'

export default defineNuxtModule<VitePWANuxtOptions>({
  meta: {
    name: '@vite-pwa/nuxt',
    configKey: 'pwa',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: nuxt => ({
    base: nuxt.options.app.baseURL,
    scope: nuxt.options.app.baseURL,
  }),
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    // Transpile components for virtual modules
    const runtimeDir = resolver.resolve('./runtime')
    nuxt.options.build.transpile.push(runtimeDir)

    let vitePwaClientPlugin: Plugin | undefined
    const resolveVitePluginPWAAPI = (): VitePluginPWAAPI | undefined => {
      return vitePwaClientPlugin?.api
    }

    nuxt.hook('vite:extend', ({ config }) => {
      const plugin = config.plugins?.find(p => p && typeof p === 'object' && 'name' in p && p.name === 'vite-plugin-pwa')
      if (plugin)
        throw new Error('Remove vite-plugin-pwa plugin from Vite Plugins entry in Nuxt config file!')
    })
    nuxt.hook('vite:extendConfig', (viteInlineConfig, { isClient }) => {
      viteInlineConfig.plugins = viteInlineConfig.plugins || []
      const plugin = viteInlineConfig.plugins.find(p => p && typeof p === 'object' && 'name' in p && p.name === 'vite-plugin-pwa')
      if (plugin)
        throw new Error('Remove vite-plugin-pwa plugin from Vite Plugins entry in Nuxt config file!')

      configurePWAOptions(options, nuxt)
      const plugins = VitePWA(options)
      viteInlineConfig.plugins.push(plugins)
      if (isClient)
        vitePwaClientPlugin = plugins.find(p => p.name === 'vite-plugin-pwa') as Plugin
    })
    if (nuxt.options.dev) {
      const webManifest = `${nuxt.options.app.baseURL}${options.devOptions?.webManifestUrl ?? options.manifestFilename ?? 'manifest.webmanifest'}`
      const devSw = `${nuxt.options.app.baseURL}dev-sw.js?dev-sw`
      const workbox = `${nuxt.options.app.baseURL}workbox-`
      nuxt.hooks.hook('vite:serverCreated', (viteServer, { isClient }) => {
        if (isClient) {
          viteServer.middlewares.stack.push({
            route: webManifest,
            // @ts-expect-error just ignore
            handle: (_req, _res, next) => {
              next()
            },
          })
          viteServer.middlewares.stack.push({
            route: devSw,
            // @ts-expect-error just ignore
            handle: (_req, _res, next) => {
              next()
            },
          })
          if (!options.strategies || options.strategies === 'generateSW') {
            viteServer.middlewares.stack.push({
              route: workbox,
              // @ts-expect-error just ignore
              handle: (_req, _res, next) => {
                next()
              },
            })
          }
        }
      })
    }
    extendWebpackConfig(() => {
      throw new Error('Webpack is not supported: @vite-pwa/nuxt module can only be used with Vite!')
    })
    nuxt.hook('close', async () => {
      if (nuxt.options.dev) {
        // todo: cleanup dev-dist folder
        // eslint-disable-next-line no-console
        console.log(resolver.resolve('dev-dist'))
      }
      else {
        await resolveVitePluginPWAAPI()?.generateSW()
      }
    })

    // Add components
    await Promise.all([
      addComponent({
        name: 'VitePwaManifest',
        filePath: resolver.resolve('./runtime/VitePwaManifest'),
      }),
      addComponent({
        name: 'VitePwaRegisterSw',
        filePath: resolver.resolve('./runtime/VitePwaRegisterSw'),
      }),
    ])
  },
})
