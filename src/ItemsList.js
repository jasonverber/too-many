import React, { Component } from 'react';
import { RIEInput } from 'riek';
import _ from 'lodash';

class Item extends Component {
  constructor(props) {
    super(props);
    this.updateItem = this.updateItem.bind(this);
  }

  componentDidMount(){
    this.setState(this.props);
  }

  updateItem(obj) {
    var item = Object.assign(this.state.item, obj);
    if (obj.name==='' && item.item) item.item='';
    this.setState({item:item},()=>{
      this.state.updatedItem(item);
    })
  }

  render() {
    var item = this.props.item;
    return (
      <li key={item.id}>
      {(item.done || item.req) ? (
        <span className={((item.req&&item.name)?'haveItem':(item.req?'neededItem':'item'))+(item.mark?' mark':'')}>{item.item?item.item:'\u00A0'}</span>
      ) : (
        <RIEInput
          key={'item'+item.id}
          className={'editableItem'+(!item.item?'New':'')+(item.mark?' mark':'')}
          classEditing='editing'
          value={!item.item?'Bringing anything?':item.item}
          change={this.updateItem}
          propName='item'
          validate={_.isString}
          defaultProps={{tabIndex:0}}
          editProps={{tabIndex:0}} />
      )}
      {(item.done) ? (
        <span className='editable'>{item.name}</span>
      ) : (
        <RIEInput
          key={'name'+item.id}
          className={'editable'+(!item.name?'New':'')+((item.mark&&item.name)?' mark':'')}
          classEditing='editing'
          value={!item.name?'Add your name...':item.name}
          change={this.updateItem}
          propName='name'
          validate={_.isString}
          defaultProps={{tabIndex:0,id:item.id}}
          editProps={{tabIndex:0}} />
      )}
      </li>
    );
  }
}

class Items extends Component {
  constructor(props){
    super(props);

    this.updatedItem = this.updatedItem.bind(this);
  }

  componentDidMount() {
    var state = Object.assign({tempIds:1}, this.props);
    this.setState(state);
  }

  updatedItem(item){
    var items = this.state.items;
    var tempIds = this.state.tempIds;
    var reqItem, nonReqItem, dbItem;

    //Unmark all rows.
    items.forEach(o=>{o.mark=false});

    //If the updated row is a requested item entered again, fill in the correct line, mark it, and clear the duplicate row.
    if (item.item && item.name && (reqItem=items.find(o=>o.item && o.req && !o.done && o.id!==item.id && o.item.toLowerCase()===item.item.toLowerCase()))){
          reqItem.mark=true;
          reqItem.name=item.name;
          item.name='';
          item.item='';
    }

    //If the updated row is a requested item and there's an unfinished row started with a requested item, clear the duplicate row.
    if (item.req && item.item && item.name && (nonReqItem=items.find(o=>o.item && !o.req && !o.done && o.id!==item.id && o.item.toLowerCase()===item.item.toLowerCase()))){
          nonReqItem.name='';
          nonReqItem.item='';
    }

    //If the updated row is blank, remove it.
    if (!item.item && !item.name) {
      items.splice(items.findIndex(o=>o.id===item.id),1);
    }

    //If the updated row is a duplicate item, mark it.
    if (item.item && items.find(o=>o.item && o.id!== item.id && o.item.toLowerCase()===item.item.toLowerCase())){
      items.forEach(o=>{if (o.item && o.item.toLowerCase()===item.item.toLowerCase()) o.mark=true;});
    }

    //If there are no blank rows, add one.
    if (items[items.length-1].name || items[items.length-1].req) {
      tempIds++;
      items.push({id:'temp'+tempIds,name:'',item:''});
    }

    //If the updated item has a name associated with it, or is a requested item, insert or update as appropriate. Then setState.
    if (item && (item.name || item.req)) {
      dbItem = Object.assign({},item);
      dbItem.event_id = this.state.eventId;
      dbItem.done = (dbItem.name) ? true : false;
      var method = item.id.toString().indexOf('temp')===-1 ? 'put' : 'post';
      fetch( 'http://localhost:8000/api/items/' + (method==='put'?item.id:''), {
          method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dbItem)
        })
        .then(response => {
          return response.json();
        })
        .then(json => {
          item.id=json.id;
          this.persistCallback({items,tempIds});
        });
      //If the updated item has no name and no item associated with it then it should simply be deleted. Then setState.
    } else if (item && !item.name && !item.item && item.id.toString().indexOf('temp')===-1) {
      fetch( 'http://localhost:8000/api/items/' + item.id, {
          method:'delete'
      })
      .then(response => {
        this.persistCallback({items,tempIds});
      });
    }

    //If a requested item was updated, we also need to handle that.
    if (reqItem) {
      dbItem = Object.assign({},reqItem);
      dbItem.event_id = this.state.eventId;
      dbItem.done = (dbItem.name) ? true : false;
      fetch( 'http://localhost:8000/api/items/' + dbItem.id, {
          method:'put',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(dbItem)
        })
        .then(response => {
          return response.json();
        })
        .then(json => {
          this.persistCallback({items,tempIds});
        });
    }
    this.setState({items,tempIds});
  }

  persistCallback(state) {
    this.setState(state);
    return;
  }

  render() {
    var rows = this.props.items.map(i=><Item key={i.id} item={i} updatedItem={this.updatedItem} />);
    return (
      <ul>{rows}</ul>
    );
  }
}

export default Items;
