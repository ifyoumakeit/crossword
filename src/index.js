import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Crossword from "./Crossword";
import * as serviceWorker from "./serviceWorker";

fetch(
  "https://raw.githubusercontent.com/doshea/nyt_crosswords/master/2012/09/12.json"
)
  .then(resp => resp.json())
  .then(data =>
    ReactDOM.render(<Crossword {...data} />, document.getElementById("root"))
  );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
