import React from "react";
import { useApp } from "../app";

const Template = (props) => {
  const { state, actions } = useApp()
  // React.useEffect(() => { }, [])
  return (
    <React.Fragment>
      <div>This is the test page</div>
    </React.Fragment>
  );
};




export default Template;
