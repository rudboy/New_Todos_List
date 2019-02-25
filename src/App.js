import React, { Component } from "react";
import "./App.css";
import axios from "axios"; // const axios = require('axios');
import { TransitionMotion, spring, presets } from "react-motion";
import {
  SortableContainer,
  SortableElement,
  arrayMove
} from "react-sortable-hoc";

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

class App extends Component {
  state = {
    todos: [],
    value: "",
    selected: "all",
    select_all: false
  };
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState(({ todos }) => ({
      todos: arrayMove(todos, oldIndex, newIndex)
    }));
  };

  //recuperation de la frappe clavier
  handleChange = event => {
    const value = event.target.value;
    this.setState({ value });
  };
  //envoie de la tache sur la base de donnee et recuperation de toute les tache pour mettre a jour le tableau
  handleSubmit = async event => {
    event.preventDefault(); // Pour empêcher le navigateur de changer de page
    try {
      await axios.get(
        "https://todo-list-server.herokuapp.com/create_list?text=" +
          this.state.value +
          "&key=t" +
          Date.now()
      );
      this.getTotheServer();
    } catch (error) {
      console.log(error);
    }
  };
  //recuperer toutes tache de la base de donnée
  getTotheServer = async () => {
    try {
      // On charge les données ici
      const response = await axios.get(
        "https://todo-list-server.herokuapp.com/all_list"
      );
      let newtab = [];
      for (let i = 0; i <= response.data.length - 1; i++) {
        let newItem = {
          id: response.data[i]._id,
          key: response.data[i].key,
          data: { text: response.data[i].text, isDone: response.data[i].isDone }
        };
        newtab.push(newItem);
      }
      //console.log(newtab);
      this.setState({
        todos: newtab,
        value: ""
      });
    } catch (error) {
      console.log(error);
    }
  };
  //afficher toutes les taches faites
  handleDone = async (onkey, index) => {
    console.log(onkey, index);
    try {
      const response = await axios.get(
        "https://todo-list-server.herokuapp.com/update?id=" +
          this.state.todos[index].id +
          "&isDone=" +
          (this.state.todos[index].data.isDone === true ? false : true)
      );

      if (response.data === "modification ok") {
        this.setState({
          todos: this.state.todos.map(todo => {
            const {
              id,
              key,
              data: { text, isDone }
            } = todo;
            return key === onkey
              ? { id: id, key: key, data: { text: text, isDone: !isDone } }
              : todo;
          })
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  //barre toutes les taches
  handleToggleAll = async () => {
    if (this.state.select_all === false) {
      for (let i = 0; i <= this.state.todos.length - 1; i++) {
        await axios.get(
          "https://todo-list-server.herokuapp.com/update?id=" +
            this.state.todos[i].id +
            "&isDone=" +
            true
        );
        this.state.todos[i].data.isDone = true;
      }
      this.setState({ select_all: true });
    } else {
      for (let i = 0; i <= this.state.todos.length - 1; i++) {
        await axios.get(
          "https://todo-list-server.herokuapp.com/update?id=" +
            this.state.todos[i].id +
            "&isDone=" +
            false
        );
        this.state.todos[i].data.isDone = false;
      }
      this.setState({ select_all: false });
    }
    this.setState({ todos: this.state.todos });
    // const allNotDone = this.state.todos.every(({ data }) => data.isDone);
    // this.setState({
    //   todos: this.state.todos.map(({ key, data: { text, isDone } }) => ({
    //     key: key,
    //     data: { text: text, isDone: !allNotDone }
    //   }))
    // });
  };
  handleSelect = selected => {
    this.setState({ selected });
  };
  //supprimer toute les taches faite
  handleClearCompleted = async () => {
    try {
      let res;
      for (let i = 0; i <= this.state.todos.length - 1; i++) {
        if (this.state.todos[i].data.isDone === true) {
          res = await axios.get(
            "https://todo-list-server.herokuapp.com/delete?id=" +
              this.state.todos[i].id
          );
          console.log(res.data);
          // if (res.data === "Delete okay") {
          //   this.state.todos.splice(i, 1);
          //   this.setState({ todos: this.state.todos });
          //}
        }
      }
      if (res.data === "Delete okay") {
        this.setState({
          todos: this.state.todos.filter(({ data }) => !data.isDone)
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  //suprimer une tache
  handleDestroy = async index => {
    try {
      let res = await axios.get(
        "https://todo-list-server.herokuapp.com/delete?id=" +
          this.state.todos[index].id
      );
      console.log(res.data);
      if (res.data === "Delete okay") {
        this.state.todos.splice(index, 1);
        this.setState({ todos: this.state.todos });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // actual animation-related logic
  getDefaultStyles = () => {
    return this.state.todos.map(todo => ({
      ...todo,
      style: { height: 0, opacity: 1 }
    }));
  };
  //mettre la permiere lettre en majuscule
  getStyles = () => {
    const { todos, value, selected } = this.state;
    return todos
      .filter(({ data: { isDone, text } }) => {
        return (
          text.toUpperCase().indexOf(value.toUpperCase()) >= 0 &&
          ((selected === "completed" && isDone) ||
            (selected === "active" && !isDone) ||
            selected === "all")
        );
      })
      .map((todo, i) => {
        return {
          ...todo,
          style: {
            height: spring(60, presets.gentle),
            opacity: spring(1, presets.gentle)
          }
        };
      });
  };

  willEnter() {
    return {
      height: 0,
      opacity: 1
    };
  }

  willLeave() {
    return {
      height: spring(0),
      opacity: spring(0)
    };
  }
  //tier le tableau todos pour mettre les taches effectuez en dernier
  trier = tab => {
    tab.sort(function(x, y) {
      return x.data.isDone - y.data.isDone;
    });
    //console.log(tab);
  };

  render() {
    // const SortableItem = SortableElement(
    //   ({ key, style, index, text, isDone, id }) => (
    //     <li key={key} className={isDone ? "completed" : ""} style={styleFix}>
    //       <div className="view" onClick={() => this.handleDone(isDone, id)}>
    //         <label style={toto}>{text}</label>
    //         <button
    //           className="destroy"
    //           onClick={this.handleDestroy.bind(null, index)}
    //         />
    //       </div>
    //     </li>
    //   )
    // );

    // const SortableList = SortableContainer(({ styles }) => {
    //   console.log(styles);
    //   return (
    //     <ul className="todo-list">
    //       {styles.map(({ key, style, data: { isDone, text }, id }, index) => (
    //         <SortableItem
    //           key={key}
    //           style={style}
    //           index={index}
    //           text={text}
    //           isDone={isDone}
    //           id={id}
    //         />
    //       ))}
    //     </ul>
    //   );
    // });
    const { todos, value, selected } = this.state;
    const itemsLeft = todos.filter(({ data: { isDone } }) => !isDone).length;
    this.trier(this.state.todos);
    return (
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>
          <form onSubmit={this.handleSubmit}>
            <input
              autoFocus={true}
              className="new-todo"
              placeholder="Entrer une tache à faire"
              value={value}
              onChange={this.handleChange}
            />
          </form>
        </header>
        <section className="main">
          <input
            className="toggle-all"
            type="checkbox"
            checked={itemsLeft === 0}
            style={{ display: todos.length === 0 ? "none" : "inline" }}
            onChange={this.handleToggleAll}
          />
          <TransitionMotion
            defaultStyles={this.getDefaultStyles()}
            styles={this.getStyles()}
            willLeave={this.willLeave}
            willEnter={this.willEnter}
          >
            {styles => (
              <ul className="todo-list">
                {styles.map(({ key, style, data: { isDone, text } }, index) => (
                  <li
                    key={index}
                    style={style}
                    className={isDone ? "completed" : ""}
                  >
                    <div
                      className="view"
                      onClick={this.handleDone.bind(null, key, index)}
                    >
                      <label>{text}</label>
                      <button
                        className="destroy"
                        onClick={this.handleDestroy.bind(null, index)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TransitionMotion>
          {/* <SortableList
            styles={this.getStyles()}
            //styles={this.state.todos}
            onSortEnd={this.onSortEnd}
          /> */}
        </section>
        <footer className="footer">
          <span className="todo-count">
            <strong>{itemsLeft}</strong> {itemsLeft === 1 ? "tache" : "taches"}{" "}
            restante
          </span>
          <ul className="filters">
            <li>
              <a
                className={selected === "all" ? "selected" : ""}
                onClick={this.handleSelect.bind(null, "all")}
              >
                Toutes
              </a>
            </li>
            <li>
              <a
                className={selected === "active" ? "selected" : ""}
                onClick={this.handleSelect.bind(null, "active")}
              >
                En Cours
              </a>
            </li>
            <li>
              <a
                className={selected === "completed" ? "selected" : ""}
                onClick={this.handleSelect.bind(null, "completed")}
              >
                Terminer
              </a>
            </li>
          </ul>
          <button
            className="clear-completed"
            onClick={this.handleClearCompleted}
          >
            Clear Terminer
          </button>
        </footer>
      </section>
    );
  }
  //recuperer les taches de la base de donne

  componentDidMount = async () => {
    try {
      // On charge les données ici
      const response = await axios.get(
        "https://todo-list-server.herokuapp.com/all_list"
      );

      for (let i = 0; i <= response.data.length - 1; i++) {
        let newItem = {
          id: response.data[i]._id,
          key: response.data[i].key,
          data: { text: response.data[i].text, isDone: response.data[i].isDone }
        };
        //console.log(newItem);
        this.state.todos.push(newItem);
      }
      this.setState({
        todos: this.state.todos
      });
      //console.log(this.state.todos);

      // Un nouveau render sera déclenché
    } catch (error) {}
  };
}

export default App;
