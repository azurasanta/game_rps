import React, { Component } from "react";
import CloudUpload from '@material-ui/icons/CloudUpload';
import { connect } from 'react-redux';
import { setCurrentProductInfo } from '../../../../../redux/Item/item.action';
import "./Dropzone.css";

class Dropzone extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hightlight: false,
      imagePreviewUrl: ''
    };
    this.fileInputRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    return {
      imagePreviewUrl: props.imagePreviewUrl,
    };
  }

  openFileDialog = () => {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  }

  previewImage = (file) => {
    if (!file) return;

    let reader = new FileReader();

    reader.onloadend = () => {
      this.props.setCurrentProductInfo({
        image: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  onFileAdded = (evt) => {
    if (this.props.disabled) return;
    const file = evt.target.files[0];

    this.previewImage(file);

    if (this.props.onFileAdded) {
      this.props.onFileAdded(file);
    }
  }

  onDragOver = (event) => {
    event.preventDefault();
    if (this.props.disabed) return;
    this.setState({ hightlight: true });
  }

  onDragLeave = (event) => {
    this.setState({ hightlight: false });
  }

  onDrop = (event) => {
    event.preventDefault();
    if (this.props.disabed) return;
      const file = event.dataTransfer.files[0];
    if (this.props.onFileAdded) {
      this.props.onFileAdded(file);
    }
    this.previewImage(file);
    this.setState({ hightlight: false });
  }

  render() {
    return (
      <div
        className={`Dropzone ${this.state.hightlight ? "Highlight" : ""}`}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.openFileDialog}
        style={{ cursor: this.props.disabled ? "default" : "pointer" }}
      >
        <input
          ref={this.fileInputRef}
          className="FileInput"
          type="file"
          accept="image/x-png,image/gif,image/jpeg"
          onChange={this.onFileAdded}
        />
        <CloudUpload />
        <span>Upload Image</span>
        {this.state.imagePreviewUrl ? <img className="PreviewPanel" alt="" src={this.state.imagePreviewUrl} /> : null}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  imagePreviewUrl: state.itemReducer.image
});

const mapDispatchToProps = {
  setCurrentProductInfo
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dropzone);
