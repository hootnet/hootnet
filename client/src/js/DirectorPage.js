import React from "react";
// import { useQueryState } from 'use-location-state';

import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

// import { ControlledEditor } from "@monaco-editor/react";
import CodeMirror from "react-codemirror";
import "codemirror/lib/codemirror.css";
import { useApp } from "./app";

let cm = null; //codemirror intance
let count = 0;
let CodeEditor = () => {
    const { state, actions } = useApp();
    const cmRef = React.useRef(null);
    const [code, setCode] = React.useState(state.directorText);
    React.useEffect(() => {
        if (cmRef && cmRef.current) {
            cm = cmRef.current.getCodeMirror();
            window.xcm = cm;
            updateCode(cm.getValue());
        }
    }, [cmRef]);

    const options = {
        lineNumbers: true
    };

    const END_LINE = "======END======";
    let markLine = []; //array of lines to mark

    const logError = (lineNo, text, errormessage, pos) => {
        markLine.push(lineNo + 1);
        return text + "\n   ERROR " + errormessage;
    };
    const updateCode = (value) => {
        const linesArray = value.split("\n");
        const pos = cm.getCursor();
        const newLines = linesArray.map((text, lineNo) => {
            if (lineNo === linesArray.length - 2 && text === END_LINE) return "";
            if (lineNo === linesArray.length - 1) return END_LINE;
            if (text.match(/\s*ERROR /)) return "KILL";

            if (text.match(/^BAD/)) {
                return logError(lineNo, text, "you cannot have a bad word");
            } else {
                try {
                    eval(text); //eslint-disable-line
                } catch (e) {
                    console.log("error");
                    return logError(lineNo, text, e.toString());
                }
            }
            return text; // + "/nERROR " + count;
        });
        // console.log(newLines,newLines.filter((x) => x))
        const result = newLines.filter((x) => x !== "KILL").join("\n");
        value = result;
        actions.editor.set(value);

        // console.log(result);
        count++;
        if (cm && count < 50) {
            cm.setValue(result);
            cm.setCursor(pos);
        }
        if (markLine[0]) {
            const lineNo = markLine[0];
            cm.markText(
                { line: lineNo, ch: 0 },
                { line: lineNo },
                { css: "color: red" }
            );
        }
        // setCode(value);
    };
    return (
        <CodeMirror
            ref={ cmRef }
            value={ code }
            onChange={ updateCode }
            options={ options }
        />
    );
};

function CE() {
    const { state, actions } = useApp();
    const [initialContents] = React.useState(state.directorText);
    const handleEditorChange = (ev, value) => {
        // console.log("intial", state.directorText)

        // let error = true;
        const newLines = value.split("\n").map((text, lineNo) => {
            // if (text.match(/^ERROR/)) return null;
            // if(text.match(/^foo/)) return text + "\nERROR FOO"
            return text; // + "/nERROR " + count;
        });
        console.log(
            newLines,
            newLines.filter((x) => x)
        );
        const result = newLines.filter((x) => x).join("\n");
        actions.editor.set(result);
        const result2 = value.split("\n").join("\n");
        const result3 = result2.split("\n").join("\n");
        const lines = (text) => text.split("\n").length;
        console.log(lines(value), lines(result), lines(result2));
        console.log("handled  " + count++);
        return value; // value.split("\n").join("\n");

        // return value.includes(BAD_WORD) && !value.includes(WARNING_MESSAGE)
        //   ? value.replace(BAD_WORD, BAD_WORD + WARNING_MESSAGE)
        //   : value.includes(WARNING_MESSAGE) && !value.includes(BAD_WORD)
        //   ? value.replace(WARNING_MESSAGE, "")
        //   : value;
    };

    return (
        <ControlledEditor
            height="30vh"
            value={ initialContents }
            onChange={ handleEditorChange }
        // language="javascript"
        />
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        "& > *": {
            margin: theme.spacing(1)
        }
    }
}));

const DirectorPage = () => {
    const classes = useStyles();
    const runCode = () => {
        const value = getValue();
        // values(split )
    };
    // const [room, setRoom] = useQueryState('room', 'main');
    // const [control, setControl] = useQueryState('control', 'director');
    // const { editor, setEditor } = React.useState(null);

    const code = `Noel:getDevices
Jess:getDevices
Noel=>CR
Jess=>CR
CR=>Audience
  `;

    return (
        <React.Fragment>
            <div className={ classes.root }>
                <Button onClick={ runCode } variant="contained" color="primary">
                    { " " }
          Run{ " " }
                </Button>
                <CodeEditor />
                {/* <CE /> */ }
                {/* <Editor height="30vh" value={code} editorDidMount={didMount} />; */ }
            </div>
        </React.Fragment>
    );
};

export default DirectorPage;
