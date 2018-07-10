import React, { Component } from 'react';
import './App.css';
import Items from './ItemsList.js';
import NewEvent from './NewEvent.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    var pathParts = document.location.pathname.toString().replace('/too-many','').split('/');
    var path = pathParts.pop();
    while (pathParts.length>1 && path==='') {
      path = pathParts.pop();
    }
    if (path!=='') fetch('http://localhost:8000/api/events/'+path)
    .then(response => {
        return response.json();
    })
    .then(event => {
        if (event.length>0) {
          this.setState({
            tempIds:1,
            path,
            eventId: event[0].id,
            name: event[0].name,
            description: event[0].description,
            items: event[0].items.concat([{id:'temp0',item:'',name:''}])
          });
        } else {
          this.setState({eventNotFound:true, path});
        }
    });
    if (path==='') this.setState({path});
  }

  render() {
    if (this.state.path==='' || this.state.eventNotFound){
      return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Too Many Watermelons!</h1>
            <h3>Stop! Coordinate and list-en...</h3>
            <p>Keep track of what everybody is brining to avoid double dipping.</p>
          </header>
            <NewEvent path={this.state.path} handler={this.new} />
        </div>
      );
    }
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Too Many Watermelons!</h1>
          <h3>Stop! Coordinate and list-en...</h3>
          <p>Keep track of what everybody is brining to avoid double dipping.</p>
        </header>

        {!(this.state.items)?(
          <div className="App-body">{this.state.eventNotFound?'Event not found!':'Loading...'}</div>
        ):(
          <div className="App-body">
          <h3>{this.state.name}</h3>
          <p>{this.state.description}</p>
          <Items eventId={this.state.eventId} items={this.state.items} />
          </div>
        )}

      </div>
    );
  }
}

export default App;
