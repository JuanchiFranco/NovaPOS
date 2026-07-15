import type { ElectronAPI } from '@electron-toolkit/preload'
import type { InventarioAPI } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: InventarioAPI
  }
}
