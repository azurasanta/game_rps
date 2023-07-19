import React, { Component } from "react";
import "./AvatarDropzone.css";
import Avatar from "../../../components/Avatar";
import { alertModal } from "../ConfirmAlerts";
import { Button } from '@material-ui/core';


class Dropzone extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hightlight: false,
    };
    this.fileInputRef = React.createRef();
  }

  openFileDialog = () => {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  }

  previewImage = (file) => {
    if (!file) return;

    let reader = new FileReader();

    reader.onloadend = () => {
      this.props.setImageFilename(reader.result);
    }

    reader.readAsDataURL(file)
  }

  onFileAdded = (evt) => {
    if (this.props.disabled) return;
    const file = evt.target.files[0];

    if (file.size > 3145728 * 1.2) {//file size > 3MB
      alertModal(this.props.darkMode, "THIS ONE IS UGLY, TRY ANOTHER");
      return;
    }

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
        className={`AvatarDropzone ${this.state.hightlight ? "AvatarHighlight" : ""}`}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
      >
        <input ref={this.fileInputRef} className="AvatarFileInput" type="file" accept="image/x-png,image/gif,image/jpeg, image/jpg, image/heic" onChange={this.onFileAdded} />
        <Avatar className="AvatarPreviewPanel" alt="" src={this.props.imageUrl} darkMode={this.props.darkMode} />
        <div className="AvatarControlPanel">
          <div className="AvatarButtonPanel">
            <Button style={{marginRight: "5px"}} onClick={(e)=>{this.props.setImageFilename("")}}>Remove Photo</Button>
            <Button onClick={this.openFileDialog}>Upload Photo</Button>
          </div>
          <p className="mt-1">CHOOSE SOMETHING SEXY</p>
        </div>
      </div>
    );
  }
}

export default Dropzone;
