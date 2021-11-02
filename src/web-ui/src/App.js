import React, { useEffect, useRef, useState } from "react";
// import ImageUploader from 'react-images-upload';
import ReactFileReader from 'react-file-reader';
import { AmplifyAuthenticator, AmplifySignIn } from "@aws-amplify/ui-react";
import { onAuthUIStateChange } from "@aws-amplify/ui-components";
import Webcam from "react-webcam";
import { Col, Row } from "react-bootstrap";

import gateway from "./utils/gateway";

import CameraHelp from "./components/CameraHelp";
import EngagementSummary from "./components/EngagementsSummary";
import Header from "./components/Header";
import SettingsHelp from "./components/SettingsHelp";

const App = () => {
  const [authState, setAuthState] = useState(undefined);
  const [readyToStream, setReadyToStream] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [imageSrc, setImageSrc] = useState(undefined);
  const iterating = useRef(false);
  const webcam = useRef(undefined);

  const addUser = (params) => gateway.addUser(params);

  const getSnapshot = () => {
    const image = webcam.current.getScreenshot();
    const b64Encoded = image.split(",")[1];

    gateway.processImage(b64Encoded).then((response) => {
      if (response) setTestResults(response);
      if (iterating.current) setTimeout(getSnapshot, 300);
      else setTestResults([]);
    });
  };

  const setupWebcam = (instance) => {
    webcam.current = instance;

    const checkIfReady = () => {
      if (
        webcam.current &&
        webcam.current.state &&
        webcam.current.state.hasUserMedia
      ) {
        setReadyToStream(true);
      } else setTimeout(checkIfReady, 250);
    };

    checkIfReady();
  };

  const toggleRekognition = () => {
    iterating.current = !iterating.current;

    if (iterating.current) {
      getSnapshot();
    } else setTestResults([]);
  };

  const takeScreenshot = () => {
    const image = webcam.current.getScreenshot();
    const b64Encoded = image.split(",")[1];

    console.log(b64Encoded);

    gateway.processImage(b64Encoded).then((response) => {
      if (response) setTestResults(response);
    });
  }

  const imageUpload = (picture) => {
    var reader = new FileReader();
    reader.readAsDataURL(picture.fileList[0]);
    reader.onloadend = function (e) {
      console.log(reader.result);
      setImageSrc(reader.result);
    };

    const image = picture.base64[0];
    const b64Encoded = image.split(",")[1];
    gateway.processImage(b64Encoded).then((response) => {
      if (response) setTestResults(response);
    });
  }

//   const getBase64 = (file, cb) => {
//     let reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = function () {
//         cb(reader.result)
//     };
//     reader.onerror = function (error) {
//         console.log('Error: ', error);
//     };
// }

  useEffect(() => {
    return onAuthUIStateChange((s) => setAuthState(s));
  }, []);

  const signedIn = authState === "signedin";

  return (
    <div className="App">
      <Header
        addUser={addUser}
        readyToStream={readyToStream}
        signedIn={signedIn}
        toggleRekognition={toggleRekognition}
        takeScreenshot={takeScreenshot}
      />
      {signedIn ? (
        <>
          <SettingsHelp show={!window.rekognitionSettings} />
          <CameraHelp show={!readyToStream} />
          <Row>
            <Col md={8} sm={6}>
              {/* <Webcam
                ref={setupWebcam}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 640,
                  facingMode: "user",
                }}
                style={{ width: "100%", marginTop: "10px" }}
              /> */}
              {/* <ImageUploader
                withIcon={true}
                buttonText='Choose images'
                //onChange={this.onDrop}
                imgExtension={['.jpg', '.gif', '.png', '.gif']}
                maxFileSize={5242880}
              /> */}
              <img className="image-preview" src={imageSrc} />
              <ReactFileReader fileTypes={[".jpg",".png"]} base64={true} multipleFiles={true} handleFiles={imageUpload}>
                <button className='btn'>Upload</button>
              </ReactFileReader>
            </Col>
            <Col md={4} sm={6}>
              <EngagementSummary testResults={testResults} />
            </Col>
          </Row>
        </>
      ) : (
        <div className="amplify-auth-container">
          <AmplifyAuthenticator usernameAlias="email">
            <AmplifySignIn
              slot="sign-in"
              usernameAlias="email"
              formFields={[
                {
                  type: "email",
                  label: "Username *",
                  placeholder: "Enter your username",
                  required: true,
                  inputProps: { autoComplete: "off" },
                },
                {
                  type: "password",
                  label: "Password *",
                  placeholder: "Enter your password",
                  required: true,
                  inputProps: { autoComplete: "off" },
                },
              ]}
            >
              <div slot="secondary-footer-content"></div>
            </AmplifySignIn>
          </AmplifyAuthenticator>
        </div>
      )}
    </div>
  );
};

export default App;
