import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import { useApp } from './app'
import { useQueryState } from "use-location-state";
import UserList from './UserList'

import MediaSelector from "./MediaSelector";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { makeStyles } from "@material-ui/core/styles";
import { H1, H3 } from './Typography';

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
      width: "25ch"
    },
    button: {
      padding: "4px"
    }
  }
}));
function MainWindow() {
  const classes = useStyles();

  const { state, actions } = useApp();
  const [roomID, setRoomID] = useQueryState("room", "main");
  // const [room, setRoom] = useQueryState('room', 'main');
  // const [control, setControl] = useQueryState('control', 'director');
  const [controlValue, setControlValue] = useQueryState('role', 'member');
  const [userID, setUserID] = useState(state.attrs.name || '');
  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  // const callWithVideo = (video) => {
  //   const config = { audio: true, video };
  //   return () => roomID && startCall(true, roomID, config);
  // };

  const userIdIsValid = () => {
    return !!userID
  }

  const controlValueIsValid = () => {
    return !!controlValue
  }

  const roomIsValid = () => {
    return !!roomID
  }

  return (
    <div className="bg-wite">
      <div style={ { textAlign: 'center', width: '100%' } }>
        <H1> HootNet </H1>
        <H3> make music together </H3>
        <form className={ classes.root } noValidate autoComplete="off">
          <div className="m-4  w-full">

            <div>
              <div className=" w-full p-10">
                <TextField
                  id="outlined-name"
                  label="Room"
                  value={ roomID }
                  onChange={ (event) => setRoomID(event.target.value) }
                  variant="outlined"
                />
                <br />

                <TextField
                  id="outlined-name"
                  label="Name"
                  error={ !userIdIsValid() }
                  helperText={ !userIdIsValid() ? "You must enter a Name" : "" }
                  value={ userID }
                  onChange={ (event) => setUserID(event.target.value) }
                  variant="outlined"
                />

                <br />
                <TextField
                  id="outlined-name"
                  label="Control"
                  value={ controlValue }
                  onChange={ (event) => setControlValue(event.target.value) }
                  variant="outlined"
                />
                <br />
                <div className="inline m-2">
                  <Button
                    type="Button"
                    variant="contained"
                    disabled={ !userIdIsValid() || !controlValueIsValid() || !roomIsValid() }
                    color="primary"
                    onClick={ () => actions.register({ roomID, controlValue, userID }) }
                  >
                    Register
                         </Button>
                </div>
                <div className="inline m-2">
                  <Button
                    type="Button"
                    variant="contained"
                    color="primary"
                    onClick={ actions.startTheCascade }
                  >
                    Cascade
              </Button>
                  <Button
                    type="Button"
                    variant="contained"
                    color="secondary"
                    onClick={ actions.doDemo }
                  >
                    Demo
               </Button>
                  <Button
                    type="Button"
                    variant="contained"
                    color="secondary"
                    onClick={ actions.toggleRecorder }
                  >
                    RECORDER
              </Button>
                  <Button
                    style={ { background: "green" } }
                    className="bg-green-600 text-black p-2"
                    // type="Button"
                    variant="contained"
                    onClick={ actions.openWindow }
                  >
                    Open
              </Button>

                </div>
                <br />
                <br />
                <br />

                <div className="inline m-2">
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={ state.attrs.roomStatus === "joined" }
                    onClick={ actions.joinRoom }
                  >
                    Join
              </Button>
                </div>
                <div className="inline m-2">
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={ state.attrs.roomStatus !== "joined" }
                    onClick={ actions.leaveRoom }
                  >
                    Leave
              </Button>
                </div>
                <div className="inline m-2">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={ actions.changeMedia }
                  >
                    Change
              </Button>
                </div>
                <div className="m-2"></div>
                { state.changeMedia ? <MediaSelector /> : <UserList /> }
              </div>

            </div>

          </div>
        </form>
      </div>

    </div >

  );
}

export default MainWindow;

