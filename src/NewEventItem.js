import React, { Component } from 'react';
import { RIEInput } from 'riek';
import _ from 'lodash';

class NewEventItem extends Component {
  constructor(props) {
    super(props);
    this.state={};

    this.update = this.update.bind(this);
  }

  componentDidMount(){
      this.setState(this.props);
  }

  async update(itemUpdate){
    let item = this.state.item;
    item.item = itemUpdate.item;
    if (!this.props.eventId) {
      await this.props.persistEvent();
    }
    item.event_id = this.props.eventId;
    var method = (item.id.toString().indexOf('temp')===-1) ? 'put' : 'post';
    fetch( 'http://localhost:8000/api/items/' + (method==='put' ? item.id : ''), {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })
      .then(response => {
        return response.json();
      })
      .then(json => {
        console.log(json);
        item.id=json.id;
        this.props.handler();
      });
    this.setState({item});
  }

  render() {
    var item = this.state.item;
    if (!item) return (<li><span className='editableItemNew'>{'\u00A0'}</span></li>);
    return (
      <li>
        <RIEInput
          key={'item'+item.id}
          className={'editableItem'+(!item.item?'New':'')+(item.mark?' mark':'')}
          classEditing='editing'
          value={!item.item?"Ice? Chips? Paper plates?":item.item}
          change={this.update}
          propName='item'
          validate={_.isString}
          defaultProps={{tabIndex:0}}
          editProps={{tabIndex:0}} />
      </li>
    );
  }
}

export default NewEventItem;
