/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import type {PropsWithChildren} from 'react';
import {
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
// import {
//   RTCPeerConnection,
//   RTCIceCandidate,
//   RTCSessionDescription,
//   RTCView,
//   MediaStream,
//   MediaStreamTrack,
//   mediaDevices,
//   registerGlobals
// } from 'react-native-webrtc';

var WebRTC = require('react-native-webrtc');
import { MediaStreamTrack} from 'react-native-webrtc';

var {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
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

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };


  // const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
  // const pcNewtype = new RTCPeerConnection(configuration);
  // let isFront = true;

  // console.log (" mediaDevicesmediaDevicesmediaDevices ======================================================= ", pcNewtype);
  // console.log (" mediaDevicesmediaDevicesmediaDevices ======================================================= ", mediaDevices ? 'its her 1!!!!!! ': 'NOOOOOOOOOOO god NOOOOOOO')
  // mediaDevices?.enumerateDevices().then(sourceInfos => {
  //   console.log(sourceInfos);
  //   let videoSourceId;
  //   for (let i = 0; i < sourceInfos.length; i++) {
  //     const sourceInfo = sourceInfos[i];
  //     if(sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "back")) {
  //       videoSourceId = sourceInfo.deviceId;
  //     }
  //   }
  // });
  // mediaDevices?.getUserMedia({
  //   audio: true,
  //   video: {
  //     mandatory: {
  //       minWidth: 500, // Provide your own width, height and frame rate here
  //       minHeight: 300,
  //       minFrameRate: 30
  //     },
  //     facingMode: (isFront ? "user" : "environment"),
  //     optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
  //   }
  // })
  // .then(stream => {
  //   // Got stream!
  //   console.log("CAiught it !!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  //   setWebrtc(stream);
  // })
  // .catch(error => {
  //   // Log error
  // });


  // pcNewtype.createOffer().then(desc => {
  //   pcNewtype.setLocalDescription(desc).then(() => {
  //     // Send pc.localDescription to peer
  //     console.log("THE OFFER IS CREATED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ",desc)

  //   });
  // });
  
  // pcNewtype.onicecandidate = function (event) {
  //   // send event.candidate to peer
  //   console.log("THE ICE CANDIDATE IS CREATED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ",event)
  // };


  var configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
var pc = new RTCPeerConnection(configuration);

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
  }, logError);
});

pc.createOffer(function(desc) {
  pc.setLocalDescription(desc, function () {
    // Send pc.localDescription to peer
  }, function(e) {});
}, function(e) {});

pc.onicecandidate = function (event) {
  // send event.candidate to peer
};
  




  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            // backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
            {webrtc ?? <RTCView
             style={{ backgroundColor: 'blue', width: '100%', height: '500%'}}
            streamURL={webrtc?.toURL()}/> }
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
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






// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

















// import React from 'react';
// import {View, SafeAreaView, Button, StyleSheet} from 'react-native';

// import {RTCPeerConnection, RTCView, mediaDevices, MediaStreamTrack} from 'react-native-webrtc';

// export default function App() {
//   const [localStream, setLocalStream] = React.useState();
//   const [remoteStream, setRemoteStream] = React.useState();
//   const [cachedLocalPC, setCachedLocalPC] = React.useState();
//   const [cachedRemotePC, setCachedRemotePC] = React.useState();

//   const [isMuted, setIsMuted] = React.useState(false);

//   const startLocalStream = async () => {
//     // isFront will determine if the initial camera should face user or environment
//     const isFront = true;
//     const devices = await mediaDevices?.enumerateDevices();


//     // MediaStreamTrack.getSources
//     const facing = isFront ? 'front' : 'environment';
//     const videoSourceId = devices?.find(device => device.kind === 'videoinput' && device.facing === facing);
//     const facingMode = isFront ? 'user' : 'environment';
//     const constraints = {
//       audio: true,
//       video: {
//         mandatory: {
//           minWidth: 500, // Provide your own width, height and frame rate here
//           minHeight: 300,
//           minFrameRate: 30,
//         },
//         facingMode,
//         optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
//       },
//     };
//     const newStream = await mediaDevices?.getUserMedia(constraints);
//     setLocalStream(newStream);
//   };

//   const startCall = async () => {
//     // You'll most likely need to use a STUN server at least. Look into TURN and decide if that's necessary for your project
//     const configuration = {iceServers: [{url: 'stun:stun.l.google.com:19302'}]};
//     const localPC = new RTCPeerConnection(configuration);
//     const remotePC = new RTCPeerConnection(configuration);

//     // could also use "addEventListener" for these callbacks, but you'd need to handle removing them as well
//     localPC.onicecandidate = e => {
//       try {
//         console.log('localPC icecandidate:', e.candidate);
//         if (e.candidate) {
//           remotePC.addIceCandidate(e.candidate);
//         }
//       } catch (err) {
//         console.error(`Error adding remotePC iceCandidate: ${err}`);
//       }
//     };
//     remotePC.onicecandidate = e => {
//       try {
//         console.log('remotePC icecandidate:', e.candidate);
//         if (e.candidate) {
//           localPC.addIceCandidate(e.candidate);
//         }
//       } catch (err) {
//         console.error(`Error adding localPC iceCandidate: ${err}`);
//       }
//     };
//     remotePC.onaddstream = e => {
//       console.log('remotePC tracking with ', e);
//       if (e.stream && remoteStream !== e.stream) {
//         console.log('RemotePC received the stream', e.stream);
//         setRemoteStream(e.stream);
//       }
//     };

//     // AddTrack not supported yet, so have to use old school addStream instead
//     // newStream.getTracks().forEach(track => localPC.addTrack(track, newStream));
//     localPC.addStream(localStream);
//     try {
//       const offer = await localPC.createOffer();
//       console.log('Offer from localPC, setLocalDescription');
//       await localPC.setLocalDescription(offer);
//       console.log('remotePC, setRemoteDescription');
//       await remotePC.setRemoteDescription(localPC.localDescription);
//       console.log('RemotePC, createAnswer');
//       const answer = await remotePC.createAnswer();
//       console.log(`Answer from remotePC: ${answer.sdp}`);
//       console.log('remotePC, setLocalDescription');
//       await remotePC.setLocalDescription(answer);
//       console.log('localPC, setRemoteDescription');
//       await localPC.setRemoteDescription(remotePC.localDescription);
//     } catch (err) {
//       console.error(err);
//     }
//     setCachedLocalPC(localPC);
//     setCachedRemotePC(remotePC);
//   };

//   const switchCamera = () => {
//     localStream.getVideoTracks().forEach(track => track._switchCamera());
//   };

//   // Mutes the local's outgoing audio
//   const toggleMute = () => {
//     if (!remoteStream) return;
//     localStream.getAudioTracks().forEach(track => {
//       console.log(track.enabled ? 'muting' : 'unmuting', ' local track', track);
//       track.enabled = !track.enabled;
//       setIsMuted(!track.enabled);
//     });
//   };

//   const closeStreams = () => {
//     if (cachedLocalPC) {
//       cachedLocalPC.removeStream(localStream);
//       cachedLocalPC.close();
//     }
//     if (cachedRemotePC) {
//       cachedRemotePC.removeStream(remoteStream);
//       cachedRemotePC.close();
//     }
//     setLocalStream();
//     setRemoteStream();
//     setCachedRemotePC();
//     setCachedLocalPC();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {!localStream && <Button title="Click to start stream" onPress={startLocalStream} />}
//       {localStream && <Button title="Click to start call" onPress={startCall} disabled={!!remoteStream} />}

//       {localStream && (
//         <View style={styles.toggleButtons}>
//           <Button title="Switch camera" onPress={switchCamera} />
//           <Button title={`${isMuted ? 'Unmute' : 'Mute'} stream`} onPress={toggleMute} disabled={!remoteStream} />
//         </View>
//       )}

//       <View style={styles.rtcview}>
//         {localStream && <RTCView style={styles.rtc} streamURL={localStream.toURL()} />}
//       </View>
//       <View style={styles.rtcview}>
//         {remoteStream && <RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}
//       </View>
//       <Button title="Click to stop call" onPress={closeStreams} disabled={!remoteStream} />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#313131',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     height: '100%',
//   },
//   text: {
//     fontSize: 30,
//   },
//   rtcview: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '40%',
//     width: '80%',
//     backgroundColor: 'black',
//   },
//   rtc: {
//     width: '80%',
//     height: '100%',
//   },
//   toggleButtons: {
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
// });





// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------






