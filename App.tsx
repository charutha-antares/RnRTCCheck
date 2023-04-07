/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
    PlatformColor,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
var WebRTC = require('react-native-webrtc');

var {
  RTCPeerConnection,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} = WebRTC;

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
	const isDarkMode = useColorScheme() === 'dark';
	const [webrtc, setWebrtc] = useState(null);

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
	};

	var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
	var pc = new RTCPeerConnection(configuration);

	useEffect(() => {
		let isFront = true;
		MediaStreamTrack.getSources(sourceInfos => {
			console.log(sourceInfos);
			let videoSourceId;
			for (let i = 0; i < sourceInfos.length; i++) {
				const sourceInfo = sourceInfos[i];
				if(sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
					videoSourceId = sourceInfo.id;
				}
			}
			getUserMedia({
				audio: true,
				video: {
					mandatory: {
						minWidth: 500, // Provide your own width, height and frame rate here
						minHeight: 300,
						minFrameRate: 30
					},
					facingMode: (isFront ? "user" : "environment"),
					optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
				}
				}, function (stream) {
					console.log('dddd', stream);
					// callback(stream);
					setWebrtc(stream)
			}, function (err) {
					console.error(err);
			});
		});
		}, []);

	return (
		<SafeAreaView style={backgroundStyle}>
			<StatusBar
				barStyle={isDarkMode ? 'light-content' : 'dark-content'}
				backgroundColor={backgroundStyle.backgroundColor}
			/>
			<View style={{ height: 400, width: 400, backgroundColor: 'red' }} >
				{ webrtc ?
					<RTCView style={{ height: '100%', width: '100%' }} streamURL={webrtc.toURL()}/>
					: <Text> nope! </Text>
				}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
