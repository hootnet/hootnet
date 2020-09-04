import React, { Component } from 'react';
import { json } from 'overmind'
import { useApp } from './loop'

class App extends Component {
    constructor(props) {
        super();
        this.oState = props.overmind.state
        this.actions = props.overmind.actions
        this.effects = props.overmind.effects
        this.state = {
            title: "test"
        };
    }

    componentDidMount() {
        
    }
    
    render() {        
        return (
            <div>
                Looper Test
            </div>
        );
    }
}

const WrapApp = () => {
    const { state, actions, effects } = useApp()

    return <div>
        <App overmind={ { state, actions, effects, currentWindow: state.currentWindow } } />
    </div>

}


export default WrapApp;