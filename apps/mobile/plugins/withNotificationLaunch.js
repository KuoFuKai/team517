const { withMainActivity } = require('expo/config-plugins');

module.exports = function withNotificationLaunch(config) {
  return withMainActivity(config, addNotificationLaunchHandlers);
};

function addNotificationLaunchHandlers(result) {
    const marker = '// Preserve notification intents before the development launcher redirects.';
    if (result.modResults.contents.includes(marker)) return result;
    if (result.modResults.language !== 'kt' || !result.modResults.contents.includes('super.onCreate(null)')) {
      throw new Error('Notification launch integration requires the SDK 55 Kotlin MainActivity template.');
    }
    const activityClass = 'class MainActivity : ReactActivity() {';
    if (!result.modResults.contents.includes(activityClass) || result.modResults.contents.includes('override fun onNewIntent')) {
      throw new Error('Notification launch integration could not find MainActivity.');
    }
    const handlers = `${marker}
  private fun captureNotificationIntent(launchIntent: android.content.Intent?) {
    launchIntent?.extras?.let { extras ->
      if (extras.containsKey("notificationResponse") || extras.containsKey("textInputNotificationResponse")) {
        runCatching {
          expo.modules.notifications.service.NotificationsService.getNotificationResponseFromBroadcastIntent(launchIntent)
        }.onSuccess { response ->
          expo.modules.notifications.notifications.NotificationManager.onNotificationResponseReceived(response)
        }
      } else if (extras.containsKey("google.message_id")) {
        expo.modules.notifications.notifications.NotificationManager.onNotificationResponseFromExtras(extras)
      }
    }
  }

  override fun onNewIntent(intent: android.content.Intent) {
    captureNotificationIntent(intent)
    super.onNewIntent(intent)
  }
`;
    result.modResults.contents = result.modResults.contents
      .replace(activityClass, activityClass + '\n  ' + handlers)
      .replace('super.onCreate(null)', 'captureNotificationIntent(intent)\n    super.onCreate(null)');
    return result;
}

module.exports.addNotificationLaunchHandlers = addNotificationLaunchHandlers;
