---
layout: post
title:  "Creating a To Do list app with React and Solid"
date:   2020-02-05 16:30:00+0100
categories: dev
author: "Herminio García González"
lang: en
name: todo-list-react-solid
---

These days I was preparing the [Software Architecture](https://arquisoft.github.io/) course that we will be starting in a few weeks. So, I decided to create a small to-do list app with React and Solid to get in touch with these technologies that we will be using in the course. While I was making the prototype I realised that this prototype alongside the creation process could be a very interesting starting guide for my students and also for everyone that would like to start seeing a small example working. The app consist of a small web interface with and input box, a list of tasks and two button to manage Solid persistence. The final look can be seen in the image below.

![To-do list app interface overview](https://herminiogarcia.com/images/todo-list-overview.png)

## Requirements
So, first of all, let's see what the requirements are for this application:
1. A user should be able to insert a new task.
2. A user should be able to see the inserted tasks.
3. A user should be able to remove a task.
4. A user should be able to login into his/her Solid POD.
5. A user should be able to save inserted task into his/her Solid POD.
6. A user should be able to recover the persisted tasks from his/her Solid POD.

## Prerequisites
Although this tutorial is intended as an introductory text, there are some things that you need to check/know to follow:
- Javascript knowledge (preferably in its version 6).
- A Solid POD. You can get one from a provider or just install your own one (see <https://solid.inrupt.com/get-a-solid-pod>).
- NPM installed.

## Building React components without persistence
I am going to divide this tutorial in two parts: the creation of the React component and the inclusion of the persistence logic with Solid inside the React component. This way, we avoid to mix concepts and the understading and development process are made easier.

The first step is to create a React project with the [Create React App](https://reactjs.org/docs/create-a-new-react-app.html#create-react-app) which will create a working skeleton for us. Open your favorite terminal and type the following commands:

```
npx create-react-app todo-list
cd todo-list
npm start
```

You will have created a minimal application in React with a welcome page. For now on, we will be creating the React components for our to-do list app. If this notion of components sound weird to you I encourage you to follow first the [React tutorial](https://reactjs.org/tutorial/tutorial.html) which will give you the basic notions of React.

So, let's go, open the `App.js` file located in `src` directory. We are going to change the `App` function component to render our own app. We change the `h1` title and include a reference to our future main component `TodoList`. See the code below:

```javascript
function App() {
  return (
    <div className="App">
      <header>
          <h1>ToDo List</h1>
      </header>
      <TodoList />
    </div>
  );
}
```

The `App` function component will call the `TodoList` to render its content. Therefore, here, we must think about what concerns should be included in this component. It is common in React to take up the state of a child to the parent. So the parent can take control over the state and pass to all its childrens. In this example, we will be following this phylosophy and declare the tasks in the `TodoList` component constructor. Apart from this, we want to render an input box to add new tasks and a the list of tasks that we have added. If you take a look to the code below you will see that we have declared a constructor which initialises the state with an empty Array of tasks. In the render function we added a `div` tag with two component calls: `InputTask` and `TaskList` which will render the input text area and the list of tasks that we will add.

```javascript
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
    }
  }

  render() {
    return (
      <div className="App-content">
        <InputTask />
        <TaskList />
      </div>
    );
  }
}
```

Therefore, now it is turn for the `InputTask` and `TaskList` components. These two components will render the text area where the user can input its tasks and the list of persisted task, respectively. So the skeleton code (without event handling) for the `InputTask` can be seen in the snippet below. The `InputTask` defines a constructor with an attribute in its state, this is the value of the input box. As you can see this value is taken in the render function to show the current value. However, the changes with this code are not actually reflected in the app (we will see how to do that later). The rest of the code is a submit button which will handle the addition of new tasks.

```javascript
class InputTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
    }
  }

  render() {
    return (
      <form>
        <input type="text" name="task" value={this.state.value} />
        <input type="submit" value="+" />
      </form>
    );
  } 
}
```

In the case of the `TaskList` component we make use of a functional component because we are only going to render a view. In this case we will receive a list of tasks in the props object (later we will see how this is done) and iterator over it to produce a list of values. Next to each value we will render a button which will serve to delete the current task.

```javascript
function TaskList(props) {
  return (
    props.tasks.map(t => {
      return (
        <li key={t}>
          {t}<button>-</button>
        </li>
      );
    })
  );
}
```

### Handling state and events
As we saw earlier, it is common in React that the parent manages the state of its children components. Therefore, we are going to delegate this reponsability to the `TodoList` component. To achieve this, we are going to define two functions: one to add new tasks (`handleNewTasks`) and other to delete a task (`handleDeleteTask`). The code can be seen in the snippet below. One particularity of these functions is that both of them make a copy of the state in order to change making use of [React inmutability guideline](https://reactjs.org/tutorial/tutorial.html#why-immutability-is-important). Then this two functions are passed to the `InputTask` and `TodoList` components via their props objects.

```javascript
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
    }
  }

  handleNewTask(task) {
    if(task === "") {
      alert("Empty task not allowed!");
      return;
    }
    const tasks = this.state.tasks.concat(task);
    this.setState({tasks});
  }

  handleDeleteTask(task) {
    const tasks = this.state.tasks.slice();
    tasks.splice(tasks.indexOf(task), 1);
    this.setState({tasks});
  }

  render() {
    return (
      <div className="App-content">
        <InputTask addNewTask={(task) => this.handleNewTask(task)}/>
        <TaskList tasks={this.state.tasks} deleteTask={(task) => this.handleDeleteTask(task)}/>
      </div>
    );
  }
}
```
Now that we have passed the two functions to handle the state of the tasks, we must call them inside each component. In the case of the `InputTask` component we want that every change that is performed in the text input is reflected in the state of the component. This is performed using the `onChange` event of the `input` tag. Whenever this event is fired we want to change the inner state. Therefore, we define the `handleChange` function that will update the state with the value of the input area. However, we also want to propagate this value to the parent component (`TodoList`). Therefore, when the user fires the submit event we must send this information upper component. This is achieved through the `handleSubmit` function that will call the passed function `addNewTask`. In the code below you can see this process implemented. Note that the `e.preventDefault()` call in the `handleSubmit` function prevents the browser to send the `POST` request to the server. Moreover, the `this` context must be binded in both functions because otherwhise the application will not be able to resolve the `this` reference when calling form the event source.

```javascript
class InputTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    this.props.addNewTask(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="task" value={this.state.value} onChange={this.handleChange} />
        <input type="submit" value="+" />
      </form>
    );
  }
}
```

In the case of `TaskList` component, we only have to handle the deletion process. Thus, we will link the `onClick` event with the `deleteTask` function. See the code below.

```javascript
function TaskList(props) {
  return (
    props.tasks.map(t => {
      return (
        <li key={t}>
          {t}<button onClick={() => props.deleteTask(t)}>-</button>
        </li>
      );
    })
  );
}
```

At this point, we should have the application running correctly but without Solid persistence. From now on, we will see how to include persistence functions using the Solid ecosystem for this purpouse.

## Including Solid
First of all, we need to include two libraries to our project: [solid-auth-client](https://github.com/solid/solid-auth-client) and [solid-query-ldflex](https://github.com/solid/query-ldflex). Solid-auth-client helps us to login into a Solid POD and solid-query-ldflex encapsulates the access to the RDF resources.

RDF what? Well, don't be afraid. RDF stands for Resources Definition Framework and it is a specification used to model data in graphs. It is used in the Semantic Web community as one of the foundations technologies and it is used in Solid to persist data. However, it is not essential for you to be an expert on this topic to complete this tutorial. This is the reason why we are using the solid-query-ldflex library which encapsulates the handling of these graphs.

So, we need two functions to handle the persistence, one to save and one to query, `saveSolidTasks` and `loadSolidTasks`, respectively. In the code below we have the two functions plus the `getCurrentSession` function which handles the login from Solid (using the solid-auth-library). The `getCurrentSession` will display a popup to request the Solid provider and the credentials. The `saveSolidTasks` function firstly removes the old tasks persisted in the user Solid POD and then adds the new ones. Notice that we are using the `todo/todo.ttl#todo` path which will create a directory called "todo" and a file inside it called "todo.ttl". The "#todo" will select the "todo" subject inside the RDF file. In the case of the `loadSolidTasks` function it we will query the content of the `schema:itemListElement` predicate. This is the same as applying the SPARQL query in the snippet below.

```javascript
async function loadSolidTasks() {
  let session = await getCurrentSession();
  let url = session.webId.replace("profile/card#me", "todo/todo.ttl#todo");
  let todo = data[url];
  const tasks = [];
  for await (const task of todo.schema_itemListElement) {
    tasks.push(task.toString());
  }
  return Array.from(tasks.values());
}

async function saveSolidTasks(tasks, oldTasks) {
  let session = await getCurrentSession();
  let url = session.webId.replace("profile/card#me", "todo/todo.ttl#todo");
  let todo = data[url];
  for(const t of oldTasks) {
    await todo["schema:itemListElement"].delete(t.toString());
  }
  for(const t of tasks) {
    await todo["schema:itemListElement"].add(t.toString());
  }
  alert("Saved to your Solid POD");
}

async function getCurrentSession() {
  let session = await auth.currentSession();
  let popupUri = 'https://solid.community/common/popup.html';
  if(!session) {
    session = await auth.popupLogin({ popupUri });
  }
  return session;
}
```

```sparql
PREFIX : <#>
PREFIX schema: <http://schema.org/>

SELECT ?o WHERE {
  :todo schema:itemListElement ?o .
}
```

Now we have to connect these functions to the components. The first component to edit is the `TodoList` one which has to handle the event creation and the event deletion. In addition we need two buttons to load the items and to delete them. This implies the creation of a new component, `SolidStorage`, which renders two buttons and links their events to the handling functions in the `TodoList` component (see the code below).

```javascript
class SolidStorage extends React.Component {
  render() {
    return (
      <div>
        <button onClick={() => this.props.loadFromSolid()}>Load from Solid</button>
        <button onClick={() => this.props.saveToSolid()}>Save to Solid</button>
      </div>
    );
  }
}
```

Then, we must render this component inside the `render` function of the `TodoList` component and pass to the `props` object the two handling functions: `loadFromSolid` and `saveToSolid`. Notice that both functions are `async` (so they do not block the UI thread) and that they `await` to get the result of the `loadSolidTasks`. In the case of not awaiting it would result in strange behaviour. See the snippet below to get the full code of the `TodoList` component.

```javascript
class TodoList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
    }
  }

  handleNewTask(task) {
    if(task === "") {
      alert("Empty task not allowed!");
      return;
    }
    const tasks = this.state.tasks.concat(task);
    this.setState({tasks});
  }

  handleDeleteTask(task) {
    const tasks = this.state.tasks.slice();
    tasks.splice(tasks.indexOf(task), 1);
    this.setState({tasks});
  }

  async loadFromSolid() {
    let tasks = await loadSolidTasks();
    this.setState({tasks});
  }

  async saveToSolid() {
    let oldTasks = await loadSolidTasks();
    saveSolidTasks(this.state.tasks, oldTasks);
  }

  render() {
    return (
      <div className="App-content">
        <InputTask addNewTask={(task) => this.handleNewTask(task)}/>
        <TaskList tasks={this.state.tasks} deleteTask={(task) => this.handleDeleteTask(task)}/>
        <SolidStorage loadFromSolid={() => this.loadFromSolid()} saveToSolid={() => this.saveToSolid()}/>
      </div>
    );
  }
}
```

At this point you should be able to get the app running like the one [here](https://herminiogarcia.com/solid-react-todo-list/). With this app you should be able to manage your tasks list and use Solid as a descentralised persistence layer. Remember that you can take a look to the full code on [Github](https://github.com/herminiogg/solid-react-todo-list). 

I hope you found this tutorial useful.