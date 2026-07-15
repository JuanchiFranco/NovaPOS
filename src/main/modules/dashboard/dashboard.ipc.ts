import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { DashboardService } from './dashboard.service'

export function registerDashboardIpc(service: DashboardService): void {
  handle(IPC.dashboard.resumen, () => service.resumen())
}
