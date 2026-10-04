import { IPC } from '@shared/constants/ipc-channels'
import { handle } from '../../shared/ipc-handler'
import type { AuthService } from './auth.service'
import type { CambiarPasswordInput, LoginInput } from '@shared/types/requests'

export function registerAuthIpc(service: AuthService): void {
  handle(IPC.auth.login, (input: LoginInput) => service.login(input), 'public')
  handle(IPC.auth.logout, () => {
    service.logout()
    return true
  }, 'public')
  handle(IPC.auth.me, () => service.me(), 'public')
  handle(IPC.auth.cambiarPassword, (input: CambiarPasswordInput) => service.cambiarPassword(input), 'session-setup')
}
