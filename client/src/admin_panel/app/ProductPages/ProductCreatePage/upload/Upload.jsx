import React, { Component } from "react";
import Dropzone from "./Dropzone";
import { connect } from 'react-redux';
import { setCurrentProductInfo } from '../../../../../redux/Item/item.action';
import "./Upload.css";

const uniqid = require('uniqid');

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false
    };
  }

  onFileAdded = (file) => {
    this.setState({ file: file });
    this.uploadFiles(file);
  }

  uploadFiles = async (file) => {
    this.setState({ uploadProgress: {}, uploading: true });
    const promises = [];
    promises.push(this.sendRequest(file));
    try {
      await Promise.all(promises);

      this.setState({ successfullUploaded: true, uploading: false });
    } catch (e) {
      // Not Production ready! Do some error handling here instead...
      this.setState({ successfullUploaded: true, uploading: false });
    }
  }

  sendRequest = (file) => {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      let file_ext = file.name.split('.').pop();
      let filename = uniqid('IMG_') + '.' + file_ext;

      req.upload.addEventListener("progress", event => {
        // console.log((event.loaded / event.total) * 100, '%');
      });

      // req.upload.addEventListener("load", event => {
      //   // console.log('Done. 100%');
      //   this.props.setCurrentProductInfo({image: '/img/uploads/' + filename});
      // });

      req.upload.addEventListener("error", event => {
        // console.log(req.response);
      });

      const formData = new FormData();
  
      formData.append("file", file, filename);

      req.open("POST", "/api/upload");
      req.send(formData);
    });
  }

  render() {
    return (
      <div className="Upload">
        <span className="Title">Upload Image</span>
        <div className="Content">
          <div>
            <Dropzone
              onFileAdded={this.onFileAdded}
              disabled={this.state.uploading && this.state.successfullUploaded}
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = {
  setCurrentProductInfo
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Upload);
