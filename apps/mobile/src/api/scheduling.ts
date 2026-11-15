import type {RescheduleTaskRequest,ReschedulePreviewDto,RescheduleTaskResponse,AssignmentDto} from '@team517/contracts';
import type {ApiRequest} from './transport';
export function createSchedulingApi(request:ApiRequest){return {
 previewReschedule:(id:string,body:RescheduleTaskRequest)=>request<ReschedulePreviewDto>('/tasks/'+encodeURIComponent(id)+'/reschedule/preview',body),
 rescheduleTask:(id:string,body:RescheduleTaskRequest)=>request<RescheduleTaskResponse>('/tasks/'+encodeURIComponent(id)+'/reschedule',body),
 reconfirmSchedule:(id:string,expectedRevision:number)=>request<AssignmentDto>('/assignments/'+encodeURIComponent(id)+'/reconfirm-schedule',{expectedRevision}),
};}
