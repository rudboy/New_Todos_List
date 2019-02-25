import React from "react";
import axios from "axios"; // const axios = require('axios');

const styleFix = {
  fontSize: "24px",
  boxShadow: "0 -1px 0 #ededed",
  overflow: "hidden",
  backgroundColor: "white",
  borderRadius: "5px",
  listStyleType: "none"
};
const toto = {
  paddingLeft: "45px"
};

class handleDone extends React.Component {
  render() {
    return (
      <li
        key={this.props.key}
        className={this.props.isDone ? "completed" : ""}
        style={styleFix}
      >
        <div className="view">
          <label style={toto}>{this.props.text}</label>
          <button className="destroy" />
        </div>
      </li>
    );
  }
}

export default handleDone;
