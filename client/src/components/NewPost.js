// NewPost.js

import React from 'react';
import debounce from 'lodash';



class NewPost extends React.Component {
  state = {
    title: '',
    body: ''
  };


  

  //TODO: Optimize s.t. I only fetch after user stops typing for x milliseconds
  handleInputChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
    var ingredientName = e.target.value;
    console.log('http://localhost:3000/fuzzy-search/' + ingredientName)
    fetch('http://localhost:3000/fuzzy-search/' + ingredientName)
    .then(response => response.text())
    .then(text => {
      if (text.length) {
        var jsonResp = JSON.parse(text);
        console.log(jsonResp["text"]);
        //console.log(JSON.stringify(jsonResp["tags"]));
        var bodyArr = [];
        for (var i in jsonResp["tags"]) {
          bodyArr.push(Object.keys(jsonResp["tags"][i])
            .toString()
            .toLowerCase()
            .replace('_', ' '));
        }
        this.setState({
          title: ingredientName,
          body: bodyArr.join(', ')
        });
      }
    })
    .catch(error => {
      return error;
    });
  };


  handleSubmit = e => {
    e.preventDefault();
    if (this.state.title.trim() && this.state.body.trim()) {
      this.props.onAddPost(this.state);
      this.handleReset();
    }
  };
  handleReset = () => {
    this.setState({
      title: '',
      body: ''
    });
  };

  render() {
    return (
      <div>
          <form onSubmit={ this.handleSubmit }>
          <div className="form-group">
              <input
              type="text"
              placeholder="Ingredient key"
              className="form-control"
              name="title"
              onChange={ this.handleInputChange }
              value={ this.state.title }
            />
          </div>
          <div className="form-group">
            <textarea
              readOnly = "readonly"
              cols="19"
              rows="8"
              placeholder="Results"
              className="form-control"
              name="body"
              value={ this.state.body }>
            </textarea>
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">Search Ingredient</button>
          </div>
          Search History:
        </form>
      </div>
    );
  }
}

export default NewPost;