import React, { Component } from "react";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    const { size } = this.props;
    this.state = {
      letters: Array.from({ length: size.cols * size.rows }, () => ""),
      across: true,
      indexCurrent: 0
    };
  }

  cells = [];

  getIndexNext = (index, adder) => {
    const { grid } = this.props;
    const indexNext = index + adder;

    if (grid[indexNext]) {
      if (grid[indexNext] === ".") {
        return this.getIndexNext(indexNext, adder);
      }
      return indexNext;
    }

    return index;
  };

  goUp = () => {
    return this.setState(state => ({
      across: false,
      indexCurrent: this.getIndexNext(state.indexCurrent, -this.props.size.rows)
    }));
  };

  goRight = () => {
    return this.setState(state => ({
      across: true,
      indexCurrent: this.getIndexNext(state.indexCurrent, 1)
    }));
  };

  goDown = () => {
    return this.setState(state => ({
      across: false,
      indexCurrent: this.getIndexNext(state.indexCurrent, this.props.size.rows)
    }));
  };

  goLeft = () => {
    return this.setState(state => ({
      across: true,
      indexCurrent: this.getIndexNext(state.indexCurrent, -1)
    }));
  };

  componentDidMount() {
    window.addEventListener("keydown", event => {
      switch (event.key) {
        case "ArrowUp": {
          return this.goUp();
        }
        case "ArrowRight": {
          return this.goRight();
        }
        case "ArrowDown": {
          return this.goDown();
        }
        case "ArrowLeft": {
          return this.goLeft();
        }
        case "Tab": {
          event.preventDefault();
          if (this.state.across) {
            return event.shiftKey ? this.goLeft() : this.goRight();
          }
          return event.shiftKey ? this.goUp() : this.goDown();
        }
        default: {
          return;
        }
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.indexCurrent !== this.state.indexCurrent) {
      this.cells[this.state.indexCurrent] &&
        this.cells[this.state.indexCurrent].focus();
    }
  }

  render() {
    const { size, grid, gridnums } = this.props;
    console.log(this.props, this.state);
    return (
      <div
        className="App"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh"
        }}
      >
        <div
          className="App"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid black",
            margin: "auto"
          }}
        >
          {Array.from({ length: size.rows }, (_, i) => {
            return (
              <div style={{ display: "flex" }} key={i}>
                {Array.from({ length: size.cols }, (_, j) => {
                  const index = i * size.rows + j;
                  const letter = grid[index];
                  const number = gridnums[index];
                  const isBlack = letter === ".";
                  return (
                    <div
                      key={index}
                      style={{
                        width: "25px",
                        height: "25px",
                        backgroundColor: isBlack ? "black" : "white",
                        border: "1px solid black",
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      {number > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "0px",
                            left: "2px",
                            fontSize: "7px"
                          }}
                        >
                          {number}
                        </span>
                      )}
                      {!isBlack && (
                        <input
                          value={this.state.letters[index] || ""}
                          ref={el => (this.cells[index] = el)}
                          onFocus={() => this.setState({ indexCurrent: index })}
                          onChange={event => {
                            const { value } = event.currentTarget;
                            const valueSingle = value[value.length - 1];
                            this.setState(
                              state => {
                                return {
                                  letters: [
                                    ...state.letters.slice(0, index),
                                    valueSingle,
                                    ...state.letters.slice(index + 1)
                                  ]
                                };
                              },
                              () => {
                                if (this.state.across) {
                                  return this.goRight();
                                }
                                return this.goDown();
                              }
                            );
                          }}
                          style={{
                            position: "absolute",
                            appearance: "none",
                            border: 0,
                            outline: 0,
                            width: "100%",
                            height: "100%",
                            background: "transparent",
                            textAlign: "center"
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default App;
