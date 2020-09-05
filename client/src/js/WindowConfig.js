import React from 'react';
import { ToastContainer } from 'react-toastify';
import MainWindow from './MainWindow';
import CascadeWindow from './CascadeWindow';
import ControlRoomWindow from './ControlRoomWindow';
import DirectorPage from './DirectorPage';
import { useApp } from './app';
import StreamRecorderDemo from './components/StreamRecorderDemo'
import TestPage from "./components/TestPage";
import Video from "./components/Video";




const WindowConfig = ({ startCallHandler }) => {
  const { state, actions } = useApp();

  const currentWindow = (startCallHandler) => {
    let testWindow = state.currentWindow
    if (state.testWindow) testWindow = state.testWindow
    switch (testWindow) {
      // switch ('main') {
      case 'main':
      case 'chat':
        return (
          <MainWindow
            clientId={ state.attrs.id }
            startCall={ startCallHandler }
          />
        );
      case 'cascade':
        return <CascadeWindow />;
      case 'control':
        return <ControlRoomWindow />;
      case 'director':
        return <DirectorPage />;
      case 'video':
        return <Video />
      case 'testpage':
        return <TestPage />
      default:
        return null;
    }
  };

  return (
    <div>
      <ToastContainer />
      { state.componentStatus.recorderDemo === "show" ? <StreamRecorderDemo /> : null }
      { currentWindow() }

    </div>

  );
};
export default WindowConfig;
