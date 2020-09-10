import React from 'react';
import Typography from '@material-ui/core/Typography';
// import { CurrentModule } from '../CurrentModule';

export const H1 = (props = {}) => {
  return (
    <Typography color={ props.className ? undefined : "primary" } align="center" variant="h1" { ...props }>
      { props.children }
    </Typography>
  );
};

export const H2 = (props = {}) => {
  return (
    <Typography color={ props.className ? undefined : "primary" } align="center" variant="h2" { ...props }>
      { props.children }
    </Typography>
  );
};
export const H3 = (props = {}) => {
  return (
    <Typography color={ props.className ? undefined : "primary" } align="center" variant="h3" { ...props }>
      { props.children }
    </Typography>
  );
};
function Test() {
  return <H1>Typography </H1>;
}
// CurrentModule(Test);
//Modified to push