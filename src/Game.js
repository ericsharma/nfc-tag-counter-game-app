import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import NfcManager, {NfcEvents, Ndef} from 'react-native-nfc-manager';
import AndroidPrompt from './AndroidPrompt';
import WriteNdefScreen from './WriteNdefScreen';
function Game(props) {
  const [start, setStart] = React.useState(null);
  const [duration, setDuration] = React.useState(0);
  const androidPromptRef = React.useRef();

  React.useEffect(() => {
    let count = 5;
    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
      if (tag.ndefMessage && tag.ndefMessage.length > 0) {
        const ndefRecord = tag.ndefMessage[0];
        if (ndefRecord.tnf === Ndef.TNF_WELL_KNOWN) {
          if (ndefRecord.type.every((b, i) => b === Ndef.RTD_BYTES_URI[i])) {
            uri = Ndef.uri.decodePayload(ndefRecord.payload);

            console.log(uri);
          }
        }
      }
      console.warn(JSON.stringify(tag));
      count--;

      if (Platform.OS === 'android') {
        androidPromptRef.current.setHintText(`${count}...`);
      } else {
        NfcManager.setAlertMessageIOS(`${count}...`);
      }

      if (count <= 0) {
        NfcManager.unregisterTagEvent().catch(() => 0);
        setDuration(new Date().getTime() - start.getTime());

        if (Platform.OS === 'android') {
          androidPromptRef.current.setVisible(false);
        }
      }
    });

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    };
  }, [start]);

  async function scanTag() {
    await NfcManager.registerTagEvent();
    if (Platform.OS === 'android') {
      androidPromptRef.current.setVisible(true);
    }
    setStart(new Date());
    setDuration(0);
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView />

      <Text style={styles.label}>NFC Game</Text>
      <WriteNdefScreen />

      <TouchableOpacity onPress={scanTag}>
        <View style={styles.btn}>
          <Text style={styles.playLabel}>PLAY!</Text>
        </View>
      </TouchableOpacity>

      <AndroidPrompt
        ref={androidPromptRef}
        onCancelPress={() => {
          NfcManager.unregisterTagEvent().catch(() => 0);
        }}
      />

      <SafeAreaView />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DA1F2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 40,
    color: 'white',
    marginBottom: 10,
  },
  minLabel: {
    fontSize: 32,
    color: '#ccc',
    textAlign: 'center',
  },
  playLabel: {
    fontSize: 28,
    color: 'black',
    textAlign: 'center',
  },
  btn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Game;
