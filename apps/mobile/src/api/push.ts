import type { DeviceTokenDto, RegisterDeviceTokenRequest, DisableDeviceTokenRequest, NotificationDto } from '@team517/contracts';
import type { ApiRequest } from './transport';
export function createPushApi(request: ApiRequest) {
  return {
    registerDeviceToken: (body: RegisterDeviceTokenRequest) => request<DeviceTokenDto>('/me/device-tokens', body),
    getDeviceToken: (id: string) => request<DeviceTokenDto>('/me/device-tokens/' + encodeURIComponent(id)),
    disableDeviceToken: (id: string, body: DisableDeviceTokenRequest) => request<{ disabled: boolean }>('/me/device-tokens/' + encodeURIComponent(id) + '/disable', body),
    getNotification: (id: string) => request<NotificationDto>('/notifications/' + encodeURIComponent(id)),
  };
}
