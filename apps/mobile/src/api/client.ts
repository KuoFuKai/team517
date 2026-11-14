import { auth } from '../auth/firebase';
import { config } from '../config';
import { createTransport } from './transport';
import { createCareApi } from './service';
import { createTaskApi } from './tasks';
import { createAiApi } from './ai';
import { createMarketplaceApi } from './marketplace';
import { createPushApi } from './push';

const request = createTransport({
  baseUrl: config.apiUrl,
  getToken: async () => auth.currentUser?.getIdToken(),
});
export const { registerDeviceToken, getDeviceToken, disableDeviceToken, getNotification } = createPushApi(request);
const api = createCareApi(request);

export const { getCurrentUser, initializeUser, listCareContexts, createCareContext, getCareContext } = api;
export const { createTaskDraft, updateTaskDraft, publishTask, getTask, listTasks, cancelTask, listLocations, createLocation } = createTaskApi(request);
export const { generateTaskSuggestion, improveTaskSuggestion, summarizeTask } = createAiApi(request);
export const { discoverTasks, getDiscoveredTask, offerHelp, withdrawOffer, getMyOffer, listOffers, selectOffer, getAssignment, updateRolePreference } = createMarketplaceApi(request);

import { createAssignmentApi } from './assignments';
export const { getMyOffers, getMyAssignments, getExecutionDetails, confirmAssignment, declineAssignment, cancelAssignment, startTask, requestCompletion, confirmCompletion, disputeCompletion } = createAssignmentApi(request);

import { createSupportApi } from './support';
export const { getCalendar, getNotifications, markNotificationRead, markAllNotificationsRead, submitReview, getHelperReviews, getHelperRatingSummary, getTaskTimeline, getVerificationStatus, getAssignmentPublicTask } = createSupportApi(request);

import { createCommunityApi } from './community';
export const { getCommunityFeed, getCommunityPost, createCommunityPost, commentOnPost, listComments, likePost, unlikePost, sharePost, createResource, getResource, saveResource, unsaveResource, getSavedResources } = createCommunityApi(request);

import { createMessagingApi } from './messaging';
export const { listConversations, getOrCreateConversation, getConversation, listMessages, sendMessage, markConversationRead, startTaskConversation, listMessagingMembers } = createMessagingApi(request);

import { createPointApi } from './points';
export const { getPointAccount } = createPointApi(request);
