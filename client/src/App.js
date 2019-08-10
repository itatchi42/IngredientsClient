// src >> App.js

import React, { Component } from 'react';
import CreatePost from './containers/CreatePost';
import PostList from './containers/PostList';

import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const stylesApp = {
  marginTop: 40
}

class App extends Component {
  render() {
    return (
      <div className="container">
        <div className="row" style={ stylesApp }>
          <div className="col-md-6">
            <CreatePost />
          </div>
          <div className="col-md-6">
            <PostList />
          </div>
        </div>
      </div>
    );
  }
}

export default App;


//References: https://appdividend.com/2018/06/14/how-to-connect-react-and-redux-with-example/