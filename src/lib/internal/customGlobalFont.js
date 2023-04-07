import React from "react"
import { Text, TextInput } from 'react-native'
import wrap from 'lodash.wrap'
import styles from '../../common/styles';

let _applyed = false
export default class GlobalFont {
    static applyGlobal(fontFamily) {
        if (_applyed) { return }
        Text.render = wrap(Text.render, function (func, ...args) {
            let originText = func.apply(this, args);
            let overWriteStyles = {};
            if (originText.props && originText.props.style && originText.props.style.fontWeight && ( parseInt(originText.props.style.fontWeight) >= 500 || originText.props.style.fontWeight === "bold")){
                overWriteStyles = styles.bold;
            }
            else if (originText.props && originText.props.style && originText.props.style.fontStyle && (originText.props.style.fontStyle==="italic")){
                overWriteStyles = styles.italic;
            }
            return React.cloneElement(originText, {
                style: [
                    {fontFamily: 'Roboto'},
                    originText.props.style,
                    overWriteStyles,
                ]
            })
        })
        TextInput.render = wrap(TextInput.render, function (func, ...args) {
          let originTextInput = func.apply(this, args)
          let overWriteStyles = {};
            if (originTextInput.props && originTextInput.props.style && originTextInput.props.style.fontWeight && ( parseInt(originTextInput.props.style.fontWeight) >= 500 || originTextInput.props.style.fontWeight === "bold")){
                overWriteStyles = styles.bold;
            }
            else if (originTextInput.props && originTextInput.props.style && originTextInput.props.style.fontStyle && (originTextInput.props.style.fontStyle==="italic")){
                overWriteStyles = styles.italic;
            }
          return React.cloneElement(originTextInput, {
            style: [
                {fontFamily: 'Roboto'},
                originText.props.style,
                overWriteStyles,
            ]
          })
        })
        _applyed = true
  }
}
