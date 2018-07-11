import React, { Component } from 'react';
import './App.css';
import Items from './ItemsList.js';
import NewEvent from './NewEvent.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.componentDidMount, false);
    var path = document.location.hash.toString().replace('#','');
    if (path) fetch('//watermelon.jasonverber.com/public/api/events/'+path)
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
            <h1 className="App-title"><a href="./">Too Many Watermelons!</a></h1>
            <h3>Stop! Coordinate and list-en...</h3>
            <p>Keep track of what everybody is bringing to avoid double dipping.</p>
          </header>
            <NewEvent path={this.state.path} handler={this.new} />
        </div>
      );
    }
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title"><a href="./">Too Many Watermelons!</a></h1>
          <h3>Stop! Coordinate and list-en...</h3>
          <p>Keep track of what everybody is bringing to avoid double dipping.</p>
        </header>

        {!(this.state.items)?(
          <div className="App-body">{this.state.eventNotFound?'Event not found!':'Loading...'}</div>
        ):(
          <div className="App-body">
          <h3>{this.state.name}</h3>
          <p>{this.state.description}</p>
          <Items eventId={this.state.eventId} items={this.state.items} />
          <p><a id="createYourOwn" href="./">Create your own event!</a></p>
          </div>
        )}

      </div>
    );
  }
}

export default App;
