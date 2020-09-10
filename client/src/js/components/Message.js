import React from "react";
import { useApp } from "../app";
import { H3 } from "../Typography"
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
const Box = ({ contents }) => {
  const [style, setStyle] = React.useState("flex")
  const hideMessage = () => {
    console.log("Stule hidden")
    setStyle("hidden")
  }
  return (
    <React.Fragment>

      {
        contents.filter((c) => c !== null)
          .map((el, index) => {
            return (<div className={ style } key={ index }>
              { el }
              <IconButton aria-label="delete" onClick={ hideMessage } color="primary">
                <CancelIcon className="bg-red text-blue-500" fontSize="large" />
              </IconButton>
              {/* <div className="flex-none text-black border-black border w-8">X</div> */ }
            </div>)
          })
      }
    </React.Fragment>

  )
}
const Message = ({ error, warning, message }) => {
  const { state, actions } = useApp()
  // React.useEffect(() => { }, [])
  message = state._message.text
  return (
    <React.Fragment>
      <Box contents={
        [error ? <H3 key="error" className="flex-auto bg-red-800 text-white border-black border-2 rounded" >{ error }</H3> : null
          , warning ? <H3 key="warning" className="flex-auto bg-yellow-300 text-gray-800 border-black border-2 rounded" >{ warning }</H3> : null
          , message ? <H3 key="message" className="flex-auto text-blue-900 border-black border-2 rounded">{ message }</H3> : null]
      } />
    </React.Fragment>
  );
};




export default Message;
