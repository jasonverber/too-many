import React, { Component } from 'react';
import { RIEInput, RIETextArea } from 'riek';
import _ from 'lodash';
import NewEventItem from './NewEventItem.js'

class NewEvent extends Component {
  constructor(props) {
    super(props);
    this.state={};
    this.updateEvent = this.updateEvent.bind(this);
    this.updateRow = this.updateRow.bind(this);
    this.persist = this.persist.bind(this);
  }

  componentDidMount() {
    this.setState({items:[{id:'temp0',item:'',req:true}], tempIds:1, event:{path:this.props.path},path:this.props.path});
    if (!this.props.path) this.makeSlug();
  }

  async persist(event){
    event = this.state.event;
    fetch( 'http://localhost:8000/api/events/' + (event.id?event.id:''), {
        method:(event.id?'put':'post'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    })
    .then(response => {
      return response.json();
    })
    .then(json => {
      if (!event.id) {
        event.id=json.id;
        this.persistCallback(event);
      }
    });
  }

  persistCallback(event){
      this.setState(event);
  }

  makeSlug(length=8) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    fetch('http://localhost:8000/api/events/'+text)
      .then(response => {
          return response.json();
      })
      .then(events => {
          if (events.length===0) {
            let event = this.state.event;
            event.path=text;
            this.setState(event,this.persist);
          } else {
            this.makeSlug(length);
          }
      });
  }

  updateEvent(obj){
    var event = Object.assign(this.state.event, obj);
    this.setState(event);
    this.persist(event);
  }

  updateRow(obj){
    var items = this.state.items;
    var tempIds = this.state.tempIds+1;
    if (items[items.length-1].item!=='') items.push({id:'temp'+tempIds, item:'', req:true});
    this.setState({items, tempIds});
  }

  render() {
    var rows = this.state.items ? this.state.items.map(i=><NewEventItem key={i.id} item={i} handler={this.updateRow} eventId={this.state.event?this.state.event.id:null} persistEvent={this.persist} />) : '';
    return (
      <div className="App-body">
      {(this.props.path!=='')?(
        <div><h2>Event not found!</h2>
        <h3>Create a new one?</h3></div>
      ):(
        <h3>New Event</h3>
      )}
      <p><RIEInput
        key='name'
        className={'editable'+((this.state.event && this.state.event.name)?'':'New')}
        classEditing='editing'
        value={(this.state.event && this.state.event.name)? this.state.event.name:'Name of event'}
        change={this.updateEvent}
        propName='name'
        validate={_.isString}
        defaultProps={{tabIndex:0}}
        editProps={{tabIndex:0}} /></p>
        <p><RIETextArea
          key='description'
          className={'editable'+((this.state.event && this.state.event.description)?'':'New')}
          classEditing='editing'
          value={(this.state.event && this.state.event.description) ? this.state.description:'Brief description of event'}
          change={this.updateEvent}
          propName='description'
          validate={_.isString}
          defaultProps={{tabIndex:0}}
          editProps={{tabIndex:0}} /></p>
          <p>It would be great if somebody could bring...<br /><em>(One item per line.)</em></p>
        <ul>{rows}</ul>
        {this.state.event&&this.state.event.id?(
          <p>Once you have finished, send this link to all your guests:<br /><a href={this.state.event.path}>{document.location.host+'/'+this.state.event.path}</a></p>
        ):(<span></span>) }
      </div>
    );
  }
}

export default NewEvent;
