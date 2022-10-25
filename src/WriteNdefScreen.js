import React from 'react';
import {View, StyleSheet, SafeAreaView, Platform} from 'react-native';
import {Button, TextInput, Chip} from 'react-native-paper';
import NfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';
import AndroidPrompt from './AndroidPrompt';

function WriteNdefScreen(props) {
  const [selectedLinkType, setSelectedLinkType] = React.useState('');
  const [value, setValue] = React.useState('');
  const androidPromptRef = React.useRef();

  async function writeNdef() {
    const bytes = Ndef.encodeMessage([Ndef.textRecord(value)]);
    console.warn(bytes);

    try {
      if (Platform.OS === 'android') {
        androidPromptRef.current.setVisible(true);
      }
      await NfcManager.requestTechnology(NfcTech.Ndef);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
    } catch (ex) {
      // bypass
    } finally {
      NfcManager.cancelTechnologyRequest();
      if (Platform.OS === 'android') {
        androidPromptRef.current.setVisible(false);
      }
    }
  }

  return (
    <View style={styles.wrapper}>
      <SafeAreaView />
      <View style={[styles.pad]}>
        <View style={styles.linkType}>
          {['TEXT'].map((linkType) => (
            <Chip
              key={linkType}
              style={styles.chip}
              selected={linkType === selectedLinkType}
              onPress={() => setSelectedLinkType(linkType)}>
              {linkType}
            </Chip>
          ))}
        </View>
        <TextInput
          label="Message"
          value={value}
          onChangeText={setValue}
          autoCapitalize={false}
        />
        <Button style={[styles.bottom, styles.bgLight]} onPress={writeNdef}>
          WRITE
        </Button>
      </View>

      {/* <View style={[styles.bottom, styles.bgLight]}>
        <Button onPress={writeNdef}>WRITE</Button>
      </View> */}
      <SafeAreaView style={styles.bgLight} />
      <AndroidPrompt
        ref={androidPromptRef}
        onCancelPress={() => {
          NfcManager.cancelTechnologyRequest();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  pad: {
    padding: 20,
  },
  chip: {
    marginRight: 10,
    marginBottom: 10,
  },
  linkType: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bottom: {
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  bgLight: {
    backgroundColor: 'lightblue',
  },
});

export default WriteNdefScreen;
