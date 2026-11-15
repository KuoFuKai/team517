// Android already uses expo-notifications / FCM. These adapters exist only for
// iOS APNs→FCM registration; do not replace the proven Android native stack.
module.exports={dependencies:{
 '@react-native-firebase/app':{platforms:{android:null}},
 '@react-native-firebase/messaging':{platforms:{android:null}},
}};
