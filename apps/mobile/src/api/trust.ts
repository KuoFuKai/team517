import type { HelperTrustProfileDto } from '@team517/contracts';
import type { ApiRequest } from './transport';
export function createTrustApi(request:ApiRequest){return {getHelperTrustProfile:(id:string,taskId?:string)=>request<HelperTrustProfileDto>('/helpers/'+encodeURIComponent(id)+'/profile'+(taskId ? '?taskId='+encodeURIComponent(taskId) : ''))};}
